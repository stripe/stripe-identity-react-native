import StripeIdentityReactNative from './StripeIdentitySdk';

export function init(options: Options): void {
  StripeIdentityReactNative.init(options);
}

export function present(): Promise<{ status: IdentityStatus }> {
  return StripeIdentityReactNative.present();
}
