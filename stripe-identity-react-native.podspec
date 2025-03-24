require 'json'

package = JSON.parse(File.read(File.join(__dir__, 'package.json')))

# When stripe_version is updated, also need to update stripe_version in https://github.com/stripe/stripe-react-native/blob/master/stripe-react-native.podspec
stripe_version = '~> 24.8.0'

Pod::Spec.new do |s|
  s.name         = 'stripe-identity-react-native'
  s.version      = package['version']
  s.summary      = package['description']
  s.homepage     = package['homepage']
  s.license      = package['license']
  s.authors      = package['author']

  s.platforms    = { ios: '13.0' }
  s.source       = { git: 'https://github.com/stripe/stripe-identity-react-native.git', tag: s.version.to_s }

  s.source_files = 'ios/**/*.{h,m,mm,swift}'

  s.dependency 'React-Core'
  s.dependency 'StripeIdentity', stripe_version
end
