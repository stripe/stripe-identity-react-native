# Stripe Identity React Native SDK

Stripe Identity enables online businesses to securely verify the identities of users around the world. Robust identity verification helps prevent fraud, simplify compliance, and increase trust. Stripe will use biometric technology (on images of you and your IDs) and other data sources. With the Stripe Identity React Native SDK, you can confidently verify the authenticity of ID documents from over 33 countries in your React Native application.

> To get access to the Identity React Native SDK, visit the [Identity Settings](https://dashboard.stripe.com/settings/identity) page and click **Enable**.

## Getting started

Get started with our [📚 integration guides](https://stripe.com/docs/identity/verify-identity-documents?platform=react-native) and [example project](#run-the-example-app).

> Updating to a newer version of the SDK? See our [changelog](https://github.com/stripe/stripe-identity-react-native/blob/main/CHANGELOG.md).

## Features

**Simplified security**: We've made it simple for you to securely collect your user's personally identifiable information (PII) such as identity document images. Sensitive PII data is sent directly to Stripe Identity instead of passing through your server. For more information, see our [integration security guide](https://stripe.com/docs/security).

**Automatic document capture**: We automatically capture images of the front and back of government-issued photo ID to ensure a clear and readable image.

**Prebuilt UI**: We provide [`IdentityVerificationSheet`](https://stripe.dev/stripe-ios/stripe-identity/Classes/IdentityVerificationSheet.html), a prebuilt UI that combines all the steps required to collect ID documents, selfies, and ID numbers into a single sheet that displays on top of your app.

**Automated verification**: Stripe Identity's automated verification technology looks for patterns to help determine if an ID document is real or fake and uses distinctive physiological characteristics of faces to match your users' selfies to photos on their ID document. Collected identity information is checked against a global set of databases to confirm that it exists. Learn more about the [verification checks supported by Stripe Identity](https://stripe.com/docs/identity/verification-checks), [accessing verification results](https://stripe.com/docs/identity/access-verification-results), or our integration guide on [handling verification outcomes](https://stripe.com/docs/identity/handle-verification-outcomes).

### Requirements

The SDK uses TypeScript features available in Babel version `7.9.0` and above.
Alternatively use the `plugin-transform-typescript` plugin in your project.

#### Android
- Compatible with Android 6.0 (API level 23) and above.
- Stripe Identity requires the hosting activity to use material theme. To enable material theme:
  - Open your project's `app/src/main/AndroidManifest.xml`.
  - Make sure the `android:theme` applied to the `application` is a child of one of the material themes(e.g `Theme.MaterialComponents.DayNight`).
    > See more details about material theme [here](https://material.io/develop/android/theming/dark).

#### iOS

- Requires React Native 0.75 or later, CocoaPods 1.13 or later, and iOS 15.0 or later. Use an Apple-supported Xcode version that also meets your React Native version's requirements, and a higher deployment target if React Native requires one.
- The React Native bridge is installed through CocoaPods; the Stripe iOS SDK is resolved through Swift Package Manager (SPM). Payments is not required to use Identity.
- Add dynamic frameworks to your app's `ios/Podfile`:

  ```ruby
  use_frameworks! :linkage => :dynamic
  ```

  Keep the standard `react_native_post_install` call in your Podfile's `post_install` block, then run `bundle exec pod install` and rebuild your app. Open the `.xcworkspace` in Xcode so it can resolve the Swift package. No manual Xcode package setup is needed.

  Keep CocoaPods' default project layout: the React Native helper used here to attach Swift packages does not support `generate_multiple_pod_projects: true` or `incremental_installation: true`. Multiple app targets and repeated `pod install` runs are supported.

- Expo apps can configure dynamic frameworks with `expo-build-properties`:

  ```json
  {
    "expo": {
      "plugins": [
        ["expo-build-properties", { "ios": { "useFrameworks": "dynamic" } }]
      ]
    }
  }
  ```

  Regenerate the native iOS project and build a development client; this native SDK is not included in Expo Go. Set your camera description in `ios.infoPlist.NSCameraUsageDescription`.

- Stripe Identity requires access to the device’s camera to capture identity documents. To enable your app to request camera permissions:
  - Open your project’s `Info.plist`.
  - Add the `NSCameraUsageDescription` key.
  - Add a string value that explains to your users why your app requires camera permissions(e.g `This app uses the camera to take a picture of your identity documents.`).

##### Migrating an existing iOS integration

Remove `$StripeDisableSPM = true` from your Podfile and the Payments Expo plugin's `disableSPM` option, if present. Stripe iOS no longer supports CocoaPods resolution. Enable dynamic frameworks as shown above, reinstall pods, and make a clean native build to remove previously compiled Stripe pods.

When using both `@stripe/stripe-identity-react-native` and `@stripe/stripe-react-native`, use releases that pin the same Stripe iOS SDK version. This version pins **26.15.1** and is compatible with Payments **0.84.0**. Both bridges share one Swift package and its common Stripe modules. Conflicting versions fail installation with instructions to align the two packages.

If the app fails at launch with `dyld: Library not loaded: @rpath/Stripe….framework`, rerun `pod install` and verify the app target has a `[stripe-identity-react-native] Embed SPM Frameworks` build phase. That phase embeds and signs dynamically linked Stripe frameworks for normal builds and archives.

## Usage example

Get started with our [📚 integration guides](https://stripe.com/docs/identity/verify-identity-documents?platform=react-native) and [example project](#run-the-example-app), or [📘 browse the SDK reference](https://stripe.dev/stripe-identity-react-native).

To initialize Stripe Identity SDK in your React Native app, use the `useStripeIdentity` hook in the screen where you want to use it.

First you need a server-side endpoint to [create the VerificationSession](https://stripe.com/docs/api/identity/verification_sessions/create) and ephemeral key secret, then you can send a POST request to create verification session:

```ts
const fetchVerificationSessionParams = async () => {
  try {
    const data = await fetch(
      `${YOUR_SERVER_BASE_URL}/create-verification-session`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: {},
      }
    );
    const json = await data.json();
    return json;
  } catch (e) {
    return {};
  }
};
```

Once you get options you can use `useStripeIdentity` passing fetchOptions to it.

```tsx
// HomeScreen.tsx
import { useStripeIdentity } from '@stripe/stripe-identity-react-native';
import logo from './assets/logo.png';

function HomeScreen() {
  const fetchOptions = async () => {
    const response = await fetchVerificationSessionParams();

    return {
      sessionId: response.id,
      ephemeralKeySecret: response.ephemeral_key_secret,
      brandLogo: Image.resolveAssetSource(logo),
    };
  };

  const { status, present, loading } = useStripeIdentity(fetchOptions);

  const handlePress = useCallback(() => {
    present();
  }, [present]);

  const renderButton = useCallback(() => {
    if (loading) {
      return <ActivityIndicator />;
    }
    return <Button title="Verify Identity" onPress={handlePress} />;
  }, [loading, handlePress]);

  return (
    <View>
      <View>{renderButton()}</View>
      <Text>Status: {status}</Text>
    </View>
  );
}
```

Or if you don't want to use `useStripeIdentity` hook, you can also use this method to create your own implementation:

```tsx
// HomeScreen.tsx
import { useState } from 'react';
import { presentIdentityVerificationSheet } from '@stripe/stripe-identity-react-native';
import logo from './assets/logo.png';

function HomeScreen() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<
    IdentityVerificationSheetStatus | undefined
  >();
  const [error, setError] = useState<StripeError | undefined>();

  const fetchOptions = async () => {
    const response = await fetchVerificationSessionParams();

    return {
      sessionId: response.id,
      ephemeralKeySecret: response.ephemeral_key_secret,
      brandLogo: Image.resolveAssetSource(logo),
    };
  };

  const present = async () => {
    setLoading(true);
    const options = await fetchOptions();
    setLoading(false);
    const { status, error } = await presentIdentityVerificationSheet(options);
    setStatus(status);
    setError(error);
  };

  const handlePress = useCallback(() => {
    present();
  }, [present]);

  const renderButton = useCallback(() => {
    if (loading) {
      return <ActivityIndicator />;
    }
    return <Button title="Verify Identity" onPress={handlePress} />;
  }, [loading, handlePress]);

  return (
    <View>
      <View>{renderButton()}</View>
      <Text>Status: {status}</Text>
    </View>
  );
}
```

There are two types available: StripeError and IdentityVerificationSheetStatus, you can import these in your TypeScript project directly from Stripe Identity React Native SDK:

```tsx
import type {
  StripeError,
  IdentityVerificationSheetStatus,
} from '@stripe/stripe-identity-react-native';
```

## Run the example app

### Prerequisites

Make sure you have completed the [React Native Environment Setup](https://reactnative.dev/docs/set-up-your-environment) guide before proceeding.

### Setup

1. Install dependencies from the root folder:
   ```sh
   cd example && yarn
   ```

2. For iOS, install CocoaPods dependencies:
   ```sh
   cd ios
   bundle install
   bundle exec pod install
   cd ..
   ```

### Running the app

From the root folder:
```sh
# For iOS
yarn example ios

# For Android
yarn example android
```

Or from the example folder:
```sh
# For iOS
yarn ios

# For Android
yarn android
```

## Contributing

See the [contributor guidelines](CONTRIBUTING.md) to learn how to contribute to the repository.
