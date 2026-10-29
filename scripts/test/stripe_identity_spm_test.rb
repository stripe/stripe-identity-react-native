# Run after installing example dependencies: ruby scripts/test/stripe_identity_spm_test.rb
require 'minitest/autorun'
require 'cocoapods'
require 'json'
require 'tmpdir'
require 'fileutils'
require 'open3'

ROOT = File.expand_path('../..', __dir__)
RN_SPM_PATH = File.join(ROOT, 'example/node_modules/react-native/scripts/cocoapods/spm.rb')
PAYMENTS_HELPER_PATH = File.join(ROOT, 'example/node_modules/@stripe/stripe-react-native/stripe_spm.rb')
require RN_SPM_PATH

# The same forwarding function provided by react_native_pods.rb, without loading
# unrelated React Native codegen and installation setup into these tests.
def spm_dependency(spec, url:, requirement:, products:)
  SPM.dependency(spec, url: url, requirement: requirement, products: products)
end

# A subprocess exercises the actual installer wrappers in both require orders.
# Replace only CocoaPods' underlying hooks; both Stripe helpers wrap them normally.
if ENV['STRIPE_IDENTITY_SPM_HOOK_ORDER']
  Pod::Installer.class_eval do
    private

    def run_podfile_post_install_hooks
      SPM.apply_on_post_install(self)
      :post_install_result
    end

    def run_podfile_post_integrate_hooks
      :post_integrate_result
    end
  end
  require PAYMENTS_HELPER_PATH if ENV['STRIPE_IDENTITY_SPM_HOOK_ORDER'] == 'payments-first'
end
require File.join(ROOT, 'stripe_identity_spm')
if ENV['STRIPE_IDENTITY_SPM_HOOK_ORDER'] == 'identity-first'
  require PAYMENTS_HELPER_PATH
end

class StripeIdentitySPMTest < Minitest::Test
  VERSION = '26.15.1'.freeze
  PodTarget = Struct.new(:pod_name, :label, :linkage) do
    def build_as_dynamic_framework?; linkage == :dynamic_framework; end
    def build_as_framework?; [:dynamic_framework, :static_framework].include?(linkage); end
    def build_as_dynamic?; [:dynamic_framework, :dynamic_library].include?(linkage); end
    def specs; []; end
  end
  Installer = Struct.new(:pods_project, :pod_targets, :aggregate_targets) do
    def podfile; @podfile ||= Pod::Podfile.new; end
  end
  Aggregate = Struct.new(:pod_targets, :user_project, :user_targets)

  def setup
    @directory = Dir.mktmpdir('stripe-identity-spm-test-')
    @project = Xcodeproj::Project.new(File.join(@directory, 'Pods.xcodeproj'))
    @installer = Installer.new(@project, [], [])
    @previous_override = ENV.delete('OVERRIDE_STRIPE_IOS_VERSION_GIT_BRANCH')
    @previous_disable = $StripeDisableSPM
    @previous_silent = Pod::Config.instance.silent
    Pod::Config.instance.silent = true
    $StripeDisableSPM = false
    [:version, :identity_dependencies, :registration_names].each { |name| StripeIdentitySPM.instance_variable_set("@#{name}", nil) }
    SPM.instance_variable_set(:@dependencies_by_pod, {})
    add_pod(StripeIdentitySPM::POD_NAME)
  end

  def teardown
    ENV['OVERRIDE_STRIPE_IOS_VERSION_GIT_BRANCH'] = @previous_override
    $StripeDisableSPM = @previous_disable
    Pod::Config.instance.silent = @previous_silent
    [:version, :identity_dependencies, :registration_names].each { |name| StripeIdentitySPM.instance_variable_set("@#{name}", nil) }
    SPM.instance_variable_set(:@dependencies_by_pod, {})
    FileUtils.remove_entry(@directory)
  end

  def test_podspec_declares_only_identity_from_spm_and_publishes_helper
    spec = Pod::Specification.from_file(File.join(ROOT, 'stripe-identity-react-native.podspec'))
    declarations = SPM.instance_variable_get(:@dependencies_by_pod).fetch(spec.name)
    assert_equal ['StripeIdentity'], declarations.flat_map { |declaration| declaration[:products] }.uniq
    assert_equal({ kind: 'exactVersion', version: VERSION }, declarations.first[:requirement])
    refute spec.dependencies.any? { |dependency| dependency.name.start_with?('Stripe') }
    files = JSON.parse(File.read(File.join(ROOT, 'package.json'))).fetch('files')
    assert_includes files, 'stripe_identity_spm.rb'
  end

  def test_standalone_identity_uses_one_package_and_product
    activate_identity
    apply_spm
    assert_equal 1, @project.root_object.package_references.length
    package = @project.root_object.package_references.first
    assert_equal StripeIdentitySPM::PACKAGE_URL, package.repositoryURL
    assert_equal({ 'kind' => 'exactVersion', 'version' => VERSION }, package.requirement.transform_keys(&:to_s))
    assert_equal ['StripeIdentity'], identity_target.package_product_dependencies.map(&:product_name)
    assert_same package, identity_target.package_product_dependencies.first.package
  end

  def test_repeated_registration_and_incremental_project_updates_keep_one_identity_product
    2.times { activate_identity }
    2.times { apply_spm }
    assert_equal 1, @project.root_object.package_references.length
    products = identity_target.package_product_dependencies
    assert_equal ['StripeIdentity'], products.map(&:product_name)
    assert_same @project.root_object.package_references.first, products.first.package
  end

  def test_cached_version_upgrade_deduplicates_identity_without_removing_another_targets_product
    assert_cached_upgrade_preserves_foreign_product(shared_product: false)
  end

  def test_cached_release_to_branch_upgrade_preserves_a_shared_foreign_product
    assert_cached_upgrade_preserves_foreign_product(shared_product: true, branch: 'next-identity-release')
  end

  def test_branch_override_uses_full_repository
    ENV['OVERRIDE_STRIPE_IOS_VERSION_GIT_BRANCH'] = 'identity-integration-test'
    activate_identity
    apply_spm
    package = @project.root_object.package_references.first
    assert_equal StripeIdentitySPM::BRANCH_OVERRIDE_PACKAGE_URL, package.repositoryURL
    assert_equal({ 'kind' => 'branch', 'branch' => 'identity-integration-test' }, package.requirement.transform_keys(&:to_s))
  end

  def test_payments_and_identity_share_one_package_in_both_registration_orders
    [:identity_first, :payments_first].each do |order|
      reset_projects
      add_pod('stripe-react-native')
      register_both(order)
      apply_spm
      assert_equal 1, @project.root_object.package_references.length, order.to_s
      identity_package = identity_target.package_product_dependencies.first.package
      payments_target = @project.targets.find { |target| target.name == 'stripe-react-native' }
      assert_same identity_package, payments_target.package_product_dependencies.first.package
      assert_equal ['StripeIdentity'], identity_target.package_product_dependencies.map(&:product_name)
      assert_equal ['Stripe'], payments_target.package_product_dependencies.map(&:product_name)
    end
  end

  def test_mismatched_payments_pin_fails_in_both_registration_orders
    [:identity_first, :payments_first].each do |order|
      reset_projects
      add_pod('stripe-react-native')
      register_both(order, payments_version: '26.14.0')
      error = assert_raises(Pod::Informative, Pod::PlainInformative) { apply_spm }
      assert_match(/version|requirement|pin/i, error.message)
      assert_match(/26\.14\.0/, error.message)
      assert_match(/26\.15\.1/, error.message)
      assert_empty @project.root_object.package_references
    end
  end

  def test_release_and_branch_dependencies_cannot_be_mixed
    add_pod('stripe-react-native')
    register_both(:payments_first)
    ENV['OVERRIDE_STRIPE_IOS_VERSION_GIT_BRANCH'] = 'unreleased-sdk'
    activate_identity
    error = assert_raises(Pod::Informative, Pod::PlainInformative) { apply_spm }
    assert_match(/Conflicting.*requirement/, error.message)
    assert_empty @project.root_object.package_references
  end

  def test_multiple_identity_targets_receive_package_products
    @installer.pod_targets.clear
    identity_target.remove_from_project
    add_pod(StripeIdentitySPM::POD_NAME, label: 'stripe-identity-react-native-AppOne')
    add_pod(StripeIdentitySPM::POD_NAME, label: 'stripe-identity-react-native-AppTwo')
    activate_identity
    apply_spm
    @project.targets.each do |target|
      assert_equal ['StripeIdentity'], target.package_product_dependencies.map(&:product_name)
      assert_same @project.root_object.package_references.first, target.package_product_dependencies.first.package
    end
  end

  def test_static_linkage_has_actionable_error
    [:static_framework, :static_library, :dynamic_library].each do |linkage|
      @installer.pod_targets.first.linkage = linkage
      activate_identity
      error = assert_raises(Pod::Informative, Pod::PlainInformative) { StripeIdentitySPM.prepare_pods_project(@installer) }
      assert_match(/use_frameworks!.*dynamic/, error.message)
    end
  end

  def test_multiple_pod_projects_has_actionable_error_before_react_native_runs
    @installer.podfile.installation_options.generate_multiple_pod_projects = true
    activate_identity
    error = assert_raises(Pod::Informative) { StripeIdentitySPM.prepare_pods_project(@installer) }
    assert_match(/single Pods project/, error.message)
    assert_match(/generate_multiple_pod_projects/, error.message)
    assert_match(/incremental_installation/, error.message)
    assert_empty @project.root_object.package_references

    # Loading the helper must not reject an unrelated project's install options.
    @installer.pod_targets.clear
    assert_nil StripeIdentitySPM.prepare_pods_project(@installer)
  end

  def test_missing_react_native_post_install_has_actionable_error
    activate_identity
    error = assert_raises(Pod::Informative, Pod::PlainInformative) { StripeIdentitySPM.apply_pods_project(@installer) }
    assert_match(/react_native_post_install/, error.message)
  end

  def test_legacy_disable_spm_flag_is_rejected
    $StripeDisableSPM = true
    error = assert_raises(Pod::Informative, Pod::PlainInformative) { activate_identity }
    assert_match(/StripeDisableSPM/, error.message)
    refute StripeIdentitySPM.active?
  end

  def test_old_cocoapods_is_rejected
    with_constant(Pod, :VERSION, '1.12.1') do
      error = assert_raises(Pod::Informative, Pod::PlainInformative) { activate_identity }
      assert_match(/CocoaPods.*1\.13/m, error.message)
      refute StripeIdentitySPM.active?
    end
  end

  def test_missing_react_native_spm_bridge_is_rejected
    bridge = Object.instance_method(:spm_dependency)
    Object.send(:remove_method, :spm_dependency)
    error = assert_raises(Pod::Informative, Pod::PlainInformative) { activate_identity }
    assert_match(/React Native.*0\.75/m, error.message)
    refute StripeIdentitySPM.active?
  ensure
    Object.send(:define_method, :spm_dependency, bridge)
    Object.send(:private, :spm_dependency)
  end

  def test_uuid_guard_prevents_existing_objects_being_overwritten
    @project = Pod::Project.new(File.join(@directory, 'CounterPods.xcodeproj'))
    @installer.pods_project = @project
    activate_identity
    root = @project.root_object
    @project.instance_variable_set(:@generated_uuids, [])
    @project.instance_variable_set(:@available_uuids, [])
    StripeIdentitySPM.ensure_uuid_counter_safe(@installer)
    30.times { @project.new(Xcodeproj::Project::Object::XCRemoteSwiftPackageReference) }
    assert_same root, @project.objects_by_uuid[root.uuid]
    StripeIdentitySPM.verify_pods_project_integrity!(@installer)
  end

  def test_corrupt_project_is_rejected_before_save
    activate_identity
    @project.objects_by_uuid[@project.root_object.uuid] = @project.targets.first
    error = assert_raises(Pod::Informative, Pod::PlainInformative) do
      StripeIdentitySPM.verify_pods_project_integrity!(@installer)
    end
    assert_match(/integrity|corrupt|unopenable/i, error.message)
  end

  def test_embed_phase_is_idempotent_scoped_and_preserves_payments_phase
    activate_identity
    user_project = Xcodeproj::Project.new(File.join(@directory, 'App.xcodeproj'))
    app = user_project.new_target(:application, 'IdentityApp', :ios, '15.0')
    unrelated_app = user_project.new_target(:application, 'UnrelatedApp', :ios, '15.0')
    tests = user_project.new_target(:unit_test_bundle, 'IdentityTests', :ios, '15.0')
    payments_phase = app.new_shell_script_build_phase('[stripe-react-native] Embed SPM Frameworks')
    payments_phase.shell_script = 'echo payments'
    @installer.aggregate_targets = [
      Aggregate.new(@installer.pod_targets, user_project, [app, tests]),
      Aggregate.new([], user_project, [unrelated_app]),
      Aggregate.new(@installer.pod_targets, nil, [])
    ]
    2.times { StripeIdentitySPM.apply_user_project(@installer) }
    phases = app.shell_script_build_phases.select { |phase| phase.name == StripeIdentitySPM::EMBED_PHASE_NAME }
    assert_equal 1, phases.length
    assert_equal StripeIdentitySPM::EMBED_SCRIPT, phases.first.shell_script
    assert_equal '1', phases.first.always_out_of_date
    assert_equal 'echo payments', payments_phase.shell_script
    assert_empty unrelated_app.shell_script_build_phases
    assert_empty tests.shell_script_build_phases
    # Removing Identity from an app removes only Identity's generated phase.
    @installer.aggregate_targets.first.pod_targets = []
    StripeIdentitySPM.apply_user_project(@installer)
    assert_equal [payments_phase], app.shell_script_build_phases
  end

  def test_identical_duplicate_embed_phases_keep_one_attached_phase
    activate_identity
    user_project = Xcodeproj::Project.new(File.join(@directory, 'DuplicatePhases.xcodeproj'))
    app = user_project.new_target(:application, 'IdentityApp', :ios, '15.0')
    @installer.aggregate_targets = [Aggregate.new(@installer.pod_targets, user_project, [app])]
    StripeIdentitySPM.apply_user_project(@installer)
    original = app.shell_script_build_phases.first
    duplicate = app.new_shell_script_build_phase(StripeIdentitySPM::EMBED_PHASE_NAME)
    duplicate.shell_path = original.shell_path
    duplicate.shell_script = original.shell_script
    duplicate.always_out_of_date = original.always_out_of_date
    # Xcodeproj considers these distinct objects equal by their attributes.
    assert_equal original, duplicate
    refute_same original, duplicate

    StripeIdentitySPM.apply_user_project(@installer)
    assert_equal 1, app.shell_script_build_phases.length
    assert_same original, app.shell_script_build_phases.first
    assert_same original, user_project.objects_by_uuid[original.uuid]
    refute user_project.objects_by_uuid.key?(duplicate.uuid)
    # Check the saved project too: an unattached object in memory is insufficient.
    reopened = Xcodeproj::Project.open(user_project.path)
    saved_phases = reopened.targets.first.shell_script_build_phases
    assert_equal 1, saved_phases.length
    assert_equal original.uuid, saved_phases.first.uuid
    assert_equal StripeIdentitySPM::EMBED_SCRIPT, saved_phases.first.shell_script
  end

  def test_embed_script_handles_build_and_archive_locations_without_deleting_other_frameworks
    binary = File.join(@directory, 'dynamic-library')
    stdout, stderr, status = Open3.capture3('xcrun', 'clang', '-dynamiclib', '-x', 'c', '-', '-o', binary,
                                          stdin_data: 'void stripe_identity_test_symbol(void) {}')
    assert status.success?, "clang failed: #{stdout}\n#{stderr}"
    built = File.join(@directory, 'Built Products')
    objects = File.join(@directory, 'Objects')
    destination = File.join(@directory, 'App Build', 'App.app/Frameworks')
    FileUtils.mkdir_p(destination)
    File.write(File.join(destination, 'unrelated-sentinel'), 'keep')
    ['PackageFrameworks', nil].each_with_index do |path, index|
      source = path ? File.join(built, path) : File.join(objects, 'UninstalledProducts/iphoneos')
      framework = File.join(source, "StripeTest#{index}.framework")
      FileUtils.mkdir_p(File.join(framework, 'Headers'))
      FileUtils.mkdir_p(File.join(framework, 'Modules'))
      FileUtils.cp(binary, File.join(framework, "StripeTest#{index}"))
      File.write(File.join(framework, 'resource.txt'), 'resource')
      File.write(File.join(framework, 'Headers/header.h'), 'header')
      File.write(File.join(framework, 'Modules/module.modulemap'), 'module')
      FileUtils.mkdir_p(File.join(destination, "StripeTest#{index}.framework"))
      File.write(File.join(destination, "StripeTest#{index}.framework/stale.txt"), 'stale')
    end
    static_framework = File.join(built, 'PackageFrameworks/StripeStatic.framework')
    unrelated_framework = File.join(built, 'PackageFrameworks/Other.framework')
    FileUtils.mkdir_p([static_framework, unrelated_framework])
    object = File.join(@directory, 'static-library.o')
    _, stderr, status = Open3.capture3('xcrun', 'clang', '-c', '-x', 'c', '-', '-o', object,
                                      stdin_data: 'void stripe_identity_static_symbol(void) {}')
    assert status.success?, "Could not compile static framework fixture: #{stderr}"
    _, stderr, status = Open3.capture3('/usr/bin/ar', '-rc', File.join(static_framework, 'StripeStatic'), object)
    assert status.success?, "Could not create static framework fixture: #{stderr}"
    FileUtils.cp(binary, File.join(unrelated_framework, 'Other'))
    env = {
      'TARGET_BUILD_DIR' => File.join(@directory, 'App Build'),
      'FRAMEWORKS_FOLDER_PATH' => 'App.app/Frameworks',
      'BUILT_PRODUCTS_DIR' => built,
      'OBJROOT' => objects,
      'PLATFORM_NAME' => 'iphoneos',
      'CODE_SIGNING_ALLOWED' => 'NO'
    }
    stdout, stderr, status = Open3.capture3(env, '/bin/sh', '-c', StripeIdentitySPM::EMBED_SCRIPT)
    assert status.success?, "embed script failed: #{stdout}\n#{stderr}"
    2.times do |index|
      framework = File.join(destination, "StripeTest#{index}.framework")
      assert File.file?(File.join(framework, "StripeTest#{index}"))
      assert_equal 'resource', File.read(File.join(framework, 'resource.txt'))
      refute File.exist?(File.join(framework, 'Headers'))
      refute File.exist?(File.join(framework, 'Modules'))
      refute File.exist?(File.join(framework, 'stale.txt'))
    end
    assert_equal 'keep', File.read(File.join(destination, 'unrelated-sentinel'))
    refute File.exist?(File.join(destination, 'StripeStatic.framework'))
    refute File.exist?(File.join(destination, 'Other.framework'))
  end

  unless ENV['STRIPE_IDENTITY_SPM_HOOK_ORDER']
    def test_installer_hooks_compose_with_payments_in_both_require_orders
      ['identity-first', 'payments-first'].each do |order|
        stdout, stderr, status = Open3.capture3(
          { 'STRIPE_IDENTITY_SPM_HOOK_ORDER' => order }, RbConfig.ruby, __FILE__, '--name', 'test_hook_probe'
        )
        assert status.success?, "#{order} installer hooks failed:\n#{stdout}\n#{stderr}"
      end
    end
  else
    def test_hook_probe
      add_pod('stripe-react-native')
      activate_identity
      stripe_spm_activate!(Pod::Specification.new { |spec| spec.name = 'stripe-react-native' }, version: VERSION)
      user_project = Xcodeproj::Project.new(File.join(@directory, 'HookApp.xcodeproj'))
      app = user_project.new_target(:application, 'HookApp', :ios, '15.0')
      @installer.aggregate_targets = [Aggregate.new(@installer.pod_targets, user_project, [app])]
      installer = Pod::Installer.allocate
      [:pods_project, :pod_targets, :aggregate_targets, :podfile].each do |attribute|
        value = @installer.public_send(attribute)
        installer.define_singleton_method(attribute) { value }
      end
      assert Pod::Installer.private_method_defined?(:run_podfile_post_install_hooks)
      assert_equal :post_install_result, installer.send(:run_podfile_post_install_hooks)
      assert_equal :post_integrate_result, installer.send(:run_podfile_post_integrate_hooks)
      assert_equal ['StripeIdentity'], identity_target.package_product_dependencies.map(&:product_name)
      assert_equal 1, @project.root_object.package_references.length
      assert_includes app.shell_script_build_phases.map(&:name), StripeIdentitySPM::EMBED_PHASE_NAME
      assert_includes app.shell_script_build_phases.map(&:name), StripeSPM::EMBED_PHASE_NAME
      # Reloading the helper must not wrap its wrappers and recurse.
      capture_io { load File.join(ROOT, 'stripe_identity_spm.rb') }
      assert_equal :post_integrate_result, installer.send(:run_podfile_post_integrate_hooks)
      assert_equal 2, app.shell_script_build_phases.length
    end
  end

  private

  def assert_cached_upgrade_preserves_foreign_product(shared_product:, branch: nil)
    spec = Pod::Specification.new { |pod| pod.name = StripeIdentitySPM::POD_NAME }
    StripeIdentitySPM.activate!(spec, version: '26.15.0')
    apply_spm
    previous_product = identity_target.package_product_dependencies.first
    previous_package = previous_product.package
    foreign_target = @project.new_target(:framework, 'OtherConsumer', :ios, '15.0')
    foreign_product = if shared_product
                        previous_product
                      else
                        @project.new(Xcodeproj::Project::Object::XCSwiftPackageProductDependency).tap do |product|
                          product.product_name = previous_product.product_name
                          product.package = previous_package
                        end
                      end
    foreign_target.package_product_dependencies << foreign_product
    # Keep the cached Xcode project, but simulate fresh podspec declarations.
    SPM.instance_variable_set(:@dependencies_by_pod, {})
    ENV['OVERRIDE_STRIPE_IOS_VERSION_GIT_BRANCH'] = branch
    activate_identity
    apply_spm

    current_package = @project.root_object.package_references.first
    assert_equal 1, @project.root_object.package_references.length
    expected_requirement = branch ? { 'kind' => 'branch', 'branch' => branch } : { 'kind' => 'exactVersion', 'version' => VERSION }
    assert_equal expected_requirement, current_package.requirement.transform_keys(&:to_s)
    products = identity_target.package_product_dependencies
    assert_equal ['StripeIdentity'], products.map(&:product_name)
    assert_same current_package, products.first.package
    assert_equal 1, foreign_target.package_product_dependencies.length
    assert_same foreign_product, foreign_target.package_product_dependencies.first
    assert_same previous_package, foreign_product.package
    assert_equal 'StripeIdentity', foreign_product.product_name
    assert_same foreign_product, @project.objects_by_uuid[foreign_product.uuid]

    @project.save
    reopened = Xcodeproj::Project.open(@project.path)
    saved_identity = reopened.targets.find { |target| target.name == StripeIdentitySPM::POD_NAME }
    saved_foreign = reopened.targets.find { |target| target.name == 'OtherConsumer' }
    assert_equal 1, saved_identity.package_product_dependencies.length
    assert_equal current_package.uuid, saved_identity.package_product_dependencies.first.package.uuid
    assert_equal [foreign_product.uuid], saved_foreign.package_product_dependencies.map(&:uuid)
    assert_equal previous_package.uuid, saved_foreign.package_product_dependencies.first.package.uuid
  end

  def add_pod(name, label: name)
    @installer.pod_targets << PodTarget.new(name, label, :dynamic_framework)
    @project.new_target(:framework, label, :ios, '15.0')
  end

  def identity_target
    @project.targets.find { |target| target.name == StripeIdentitySPM::POD_NAME }
  end

  def activate_identity
    spec = Pod::Specification.new { |pod| pod.name = StripeIdentitySPM::POD_NAME }
    StripeIdentitySPM.activate!(spec, version: VERSION)
  end

  def register_both(order, payments_version: VERSION)
    payments = lambda do
      spec = Pod::Specification.new { |pod| pod.name = 'stripe-react-native' }
      SPM.dependency(spec, url: StripeIdentitySPM::PACKAGE_URL,
                     requirement: { kind: 'exactVersion', version: payments_version }, products: ['Stripe'])
    end
    order == :identity_first ? [method(:activate_identity), payments].each(&:call) : [payments, method(:activate_identity)].each(&:call)
  end

  def apply_spm
    StripeIdentitySPM.prepare_pods_project(@installer)
    capture_io { SPM.apply_on_post_install(@installer) }
    StripeIdentitySPM.verify_pods_project_integrity!(@installer)
    StripeIdentitySPM.apply_pods_project(@installer)
  end

  def reset_projects
    @project = Xcodeproj::Project.new(File.join(@directory, "Pods-#{rand(1_000_000)}.xcodeproj"))
    @installer = Installer.new(@project, [], [])
    SPM.instance_variable_set(:@dependencies_by_pod, {})
    add_pod(StripeIdentitySPM::POD_NAME)
  end

  def with_constant(owner, name, value)
    original = owner.const_get(name)
    owner.send(:remove_const, name)
    owner.const_set(name, value)
    yield
  ensure
    owner.send(:remove_const, name)
    owner.const_set(name, original)
  end
end
