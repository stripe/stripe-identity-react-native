# The React Native bridge remains a CocoaPod; Stripe's native SDK is resolved
# through React Native's spm_dependency API. These hooks complete that integration:
# guard project UUIDs before RN writes package references, validate/link the pod
# targets afterward, then embed dynamic package frameworks in consuming apps.
# Keep this namespace and hook aliases separate from stripe-react-native's helper.
module StripeIdentitySPM
  POD_NAME = 'stripe-identity-react-native'.freeze
  PACKAGE_URL = 'https://github.com/stripe/stripe-ios-spm.git'.freeze
  BRANCH_OVERRIDE_PACKAGE_URL = 'https://github.com/stripe/stripe-ios.git'.freeze
  PRODUCTS = %w[StripeIdentity].freeze
  MINIMUM_COCOAPODS_VERSION = '1.13'.freeze
  EMBED_PHASE_NAME = '[stripe-identity-react-native] Embed SPM Frameworks'.freeze

  # Xcode does not embed package frameworks linked indirectly through a pod.
  # Archive places them in UninstalledProducts, ordinary builds in PackageFrameworks.
  # Static frameworks must not be embedded; they are already linked into consumers.
  EMBED_SCRIPT = <<~'SCRIPT'.freeze
    set -e
    [ -n "${TARGET_BUILD_DIR:-}" ] || exit 0
    [ -n "${FRAMEWORKS_FOLDER_PATH:-}" ] || exit 0
    DEST="${TARGET_BUILD_DIR}/${FRAMEWORKS_FOLDER_PATH}"
    mkdir -p "$DEST"
    for SEARCH_DIR in "${BUILT_PRODUCTS_DIR}/PackageFrameworks" "${OBJROOT}/UninstalledProducts/${PLATFORM_NAME}"; do
      [ -d "$SEARCH_DIR" ] || continue
      for FRAMEWORK in "$SEARCH_DIR"/Stripe*.framework; do
        [ -d "$FRAMEWORK" ] || continue
        NAME="$(basename "$FRAMEWORK" .framework)"
        BINARY="$FRAMEWORK/$NAME"
        [ -f "$BINARY" ] || continue
        file -b "$BINARY" | grep -q "dynamically linked" || continue
        # No trailing slash: --delete stays inside this framework.
        rsync -a --delete --exclude Headers --exclude PrivateHeaders --exclude Modules "$FRAMEWORK" "$DEST/"
        if [ -n "${EXPANDED_CODE_SIGN_IDENTITY:-}" ] && [ "${CODE_SIGNING_ALLOWED:-NO}" = "YES" ]; then
          codesign --force --sign "$EXPANDED_CODE_SIGN_IDENTITY" --preserve-metadata=identifier,entitlements "$DEST/$NAME.framework"
        fi
      done
    done
  SCRIPT

  class << self
    def activate!(spec, version:)
      if defined?($StripeDisableSPM) && $StripeDisableSPM == true
        raise Pod::PlainInformative, "[#{POD_NAME}] $StripeDisableSPM is no longer supported. Remove it from your Podfile and use `use_frameworks! :linkage => :dynamic` for Swift Package Manager"
      end
      unless respond_to?(:spm_dependency, true)
        raise Pod::PlainInformative, "[#{POD_NAME}] Swift Package Manager requires React Native 0.75 or newer. Upgrade React Native and require react_native_pods.rb in your Podfile"
      end
      if Gem::Version.new(Pod::VERSION) < Gem::Version.new(MINIMUM_COCOAPODS_VERSION)
        raise Pod::PlainInformative, "[#{POD_NAME}] Swift Package Manager requires CocoaPods #{MINIMUM_COCOAPODS_VERSION} or newer. Update CocoaPods and run `bundle exec pod install`"
      end

      @version = version
      spm_dependency(spec, url: package_url, requirement: requirement, products: PRODUCTS)
    end

    def active?
      !@version.nil?
    end

    def package_url
      override_branch ? BRANCH_OVERRIDE_PACKAGE_URL : PACKAGE_URL
    end

    def requirement
      override_branch ? { kind: 'branch', branch: override_branch } : { kind: 'exactVersion', version: @version }
    end

    # RN keeps the first requirement for a URL and ignores subsequent ones.
    # Inspect every declaration so incompatible versions fail in either load order.
    # RN also looks up native targets by registration name; CocoaPods can suffix
    # target labels when different app targets use different pod configurations.
    def prepare_pods_project(installer)
      targets = identity_targets(installer)
      return if !active? || targets.empty?

      targets.each { |target| verify_dynamic_linkage!(target) }
      declarations = registered_dependencies
      return unless declarations

      declarations.each do |pod_name, dependencies|
        dependencies.each do |dependency|
          next unless stripe_package_url?(dependency[:url])

          verify_requirement!(dependency[:url], dependency[:requirement], pod_name)
        end
      end
      dependencies = declarations[POD_NAME] || @identity_dependencies
      return unless dependencies

      @identity_dependencies = dependencies
      (@registration_names || []).each { |name| declarations.delete(name) unless name == POD_NAME }
      @registration_names = targets.map(&:label).uniq
      @registration_names.each { |name| declarations[name] = dependencies }
      declarations.delete(POD_NAME) unless @registration_names.include?(POD_NAME)
    end

    # Runs after react_native_post_install, before CocoaPods saves Pods.xcodeproj.
    def apply_pods_project(installer)
      targets = identity_targets(installer)
      return if !active? || targets.empty?

      targets.each { |target| verify_dynamic_linkage!(target) }
      project = installer.pods_project
      packages = project.root_object.package_references.select do |ref|
        ref.respond_to?(:repositoryURL) && stripe_package_url?(ref.repositoryURL)
      end
      packages.each { |ref| verify_requirement!(ref.repositoryURL, ref.requirement, 'Pods.xcodeproj') }
      package = packages.find { |ref| ref.repositoryURL == package_url }
      unless package
        raise Pod::Informative, "[#{POD_NAME}] The Stripe Swift package was not added. Call `react_native_post_install` in your Podfile's post_install block"
      end

      targets.each do |pod_target|
        target = project.targets.find { |candidate| candidate.name == pod_target.label }
        raise Pod::Informative, "[#{POD_NAME}] Missing native pod target #{pod_target.label}" unless target

        PRODUCTS.each do |name|
          # RN can replace the package reference on an incremental install while
          # leaving its old product references attached. Xcodeproj's == compares
          # attributes, so equivalent references can still have different UUIDs.
          products = target.package_product_dependencies.select { |ref| ref.product_name == name }
          product = products.find { |ref| ref.package.equal?(package) } || products.first
          unless product
            product = project.new(Xcodeproj::Project::Object::XCSwiftPackageProductDependency)
            product.product_name = name
            target.package_product_dependencies << product
          end
          products.each do |duplicate|
            next if duplicate.equal?(product)

            index = target.package_product_dependencies.index { |ref| ref.equal?(duplicate) }
            target.package_product_dependencies.delete_at(index)
            next unless duplicate.referrers.empty?

            # Xcodeproj removes referrers with == too. Distinguish this product
            # before detaching it so another target's matching product survives.
            duplicate.product_name = nil
            duplicate.package = nil
            duplicate.remove_from_project
          end
          unless product.package.equal?(package)
            # Clear first: Xcodeproj's setter also short-circuits on ==.
            product.package = nil
            product.package = package
          end
        end
      end
    end

    # The user project has already been saved by CocoaPods at post_integrate.
    # Group across aggregates before deciding ownership: one user target can be
    # referenced more than once. Only our own phase is removed or refreshed.
    def apply_user_project(installer)
      projects = {}
      installer.aggregate_targets.each do |aggregate|
        project = aggregate.user_project
        next unless project

        users = projects[project] ||= {}
        consumes_identity = active? && aggregate.pod_targets.any? { |target| target.pod_name == POD_NAME }
        aggregate.user_targets.each do |target|
          next unless target.respond_to?(:symbol_type) && target.symbol_type == :application

          users[target] = users.fetch(target, false) || consumes_identity
        end
      end
      projects.each do |project, users|
        changed = false
        users.each do |target, consumes_identity|
          phases = target.shell_script_build_phases.select { |phase| phase.name == EMBED_PHASE_NAME }
          if !consumes_identity
            phases.each { |phase| remove_phase(target, phase) }
            changed = true unless phases.empty?
            next
          end

          phase = phases.shift
          phases.each { |duplicate| remove_phase(target, duplicate) }
          changed = true unless phases.empty?
          next if phase && phase.shell_script == EMBED_SCRIPT && phase.shell_path == '/bin/sh' && phase.always_out_of_date == '1'

          phase ||= target.new_shell_script_build_phase(EMBED_PHASE_NAME)
          phase.shell_path = '/bin/sh'
          phase.shell_script = EMBED_SCRIPT
          phase.always_out_of_date = '1'
          changed = true
        end
        project.save if changed
      end
    end

    # CocoaPods' deterministic UUID counter can restart below existing objects
    # after loading a cached project. New SPM objects would then overwrite them.
    # This guard composes with the equivalent payments SDK guard.
    def ensure_uuid_counter_safe(installer)
      return unless active?

      project = installer.pods_project
      return unless project

      prefix = project.instance_variable_get(:@uuid_prefix)
      return unless prefix.is_a?(String) && prefix.length >= 6

      pattern = /\A#{Regexp.escape(prefix[0, 6])}([0-9A-Fa-f]{7})0\z/
      indices = project.objects_by_uuid.keys.map { |uuid| match = pattern.match(uuid); match && match[1].to_i(16) }.compact
      return if indices.empty?

      generated = project.instance_variable_get(:@generated_uuids)
      generated = [] unless generated.is_a?(Array)
      max_index = indices.max
      generated << format('%.6s%07X0', prefix, generated.size) while generated.size <= max_index
      project.instance_variable_set(:@generated_uuids, generated)
      project.instance_variable_set(:@available_uuids, [])
    end

    def verify_pods_project_integrity!(installer)
      return unless active?

      project = installer.pods_project
      return unless project

      root = project.root_object
      return if root && project.objects_by_uuid[root.uuid].equal?(root) && root.isa == 'PBXProject'

      raise Pod::Informative, "[#{POD_NAME}] The Pods project failed its integrity check. Delete ios/Pods and rerun `pod install`; report persistent failures at https://github.com/stripe/stripe-identity-react-native/issues"
    end

    def verify_dynamic_linkage!(target)
      return if target.build_as_dynamic_framework?

      raise Pod::Informative, "[#{POD_NAME}] Swift Package Manager requires dynamic frameworks. Add `use_frameworks! :linkage => :dynamic` to your Podfile (for Expo, set `useFrameworks: \"dynamic\"` with expo-build-properties)"
    end

    private

    def identity_targets(installer)
      installer.pod_targets.select { |target| target.pod_name == POD_NAME }
    end

    def remove_phase(target, phase)
      # Array#delete uses Xcodeproj's attribute equality and can remove an
      # identical phase we intend to keep. Detach this exact object first.
      index = target.build_phases.index { |candidate| candidate.equal?(phase) }
      target.build_phases.delete_at(index) if index
      phase.remove_from_project
    end

    def override_branch
      branch = ENV['OVERRIDE_STRIPE_IOS_VERSION_GIT_BRANCH']
      branch unless branch.nil? || branch.empty?
    end

    def registered_dependencies
      return unless defined?(SPM)

      declarations = SPM.instance_variable_get(:@dependencies_by_pod)
      declarations if declarations.is_a?(Hash)
    end

    def stripe_package_url?(url)
      [PACKAGE_URL, BRANCH_OVERRIDE_PACKAGE_URL].include?(url)
    end

    def verify_requirement!(url, actual, source)
      return if url == package_url && actual.transform_keys(&:to_s) == requirement.transform_keys(&:to_s)

      raise Pod::Informative, "[#{POD_NAME}] Conflicting Stripe iOS Swift package requirement from #{source}: #{actual.inspect}. Expected #{requirement.inspect} from #{package_url}. Use compatible stripe-react-native and stripe-identity-react-native releases that pin the same Stripe iOS version"
    end
  end
end

# Use unique aliases, preserve visibility, and hook once even if a podspec is
# evaluated repeatedly. The payments helper may be loaded before or after this.
if defined?(Pod::Installer)
  installer_class = Pod::Installer
  {
    run_podfile_post_install_hooks: :stripe_identity_spm_original_post_install,
    run_podfile_post_integrate_hooks: :stripe_identity_spm_original_post_integrate
  }.each do |method_name, original|
    next if installer_class.method_defined?(original) || installer_class.private_method_defined?(original)
    next unless installer_class.method_defined?(method_name) || installer_class.private_method_defined?(method_name)

    was_private = installer_class.private_method_defined?(method_name)
    installer_class.class_eval do
      alias_method original, method_name
      define_method(method_name) do |*args|
        if method_name == :run_podfile_post_install_hooks
          StripeIdentitySPM.prepare_pods_project(self)
          begin
            StripeIdentitySPM.ensure_uuid_counter_safe(self)
          rescue StandardError => e
            Pod::UI.warn "[#{StripeIdentitySPM::POD_NAME}] Could not guard Pods project UUIDs: #{e.message}"
          end
          result = send(original, *args)
          StripeIdentitySPM.verify_pods_project_integrity!(self)
          StripeIdentitySPM.apply_pods_project(self)
          result
        else
          StripeIdentitySPM.apply_user_project(self)
          send(original, *args)
        end
      end
    end
    installer_class.send(:private, method_name) if was_private
  end
end
