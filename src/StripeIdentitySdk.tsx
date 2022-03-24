import { NativeModules, Platform } from 'react-native';
import type {
  InitIdentityVerificationSheet,
  PresentIdentityVerificationSheet,
} from './types';

const LINKING_ERROR =
  `The package 'stripe-identity-react-native' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo managed workflow\n';

const StripeIdentityReactNative = NativeModules.StripeIdentityReactNative
  ? NativeModules.StripeIdentityReactNative
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    );

type StripeIdentitySdkType = {
  initIdentityVerificationSheet: InitIdentityVerificationSheet;
  presentIdentityVerificationSheet: PresentIdentityVerificationSheet;
};

export default StripeIdentityReactNative as StripeIdentitySdkType;
