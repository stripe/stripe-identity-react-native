import StripeIdentityReactNative from './StripeIdentitySdk';
import type { Options, IdentityStatus } from './types';

export function init(options: Options): void {
  StripeIdentityReactNative.init(options);
}

export function present(): Promise<{ status: IdentityStatus }> {
  return StripeIdentityReactNative.present();
}
