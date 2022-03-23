import StripeIdentityReactNative from './StripeIdentitySdk';
import type { IdentityVerificationSheetOptions, IdentityVerificationSheetResult } from './types';

export function initIdentityVerificationSheet(options: IdentityVerificationSheetOptions): void {
  StripeIdentityReactNative.init(options);
}

export function presentIdentityVerificationSheet(): Promise<{ result: IdentityVerificationSheetResult }> {
  return StripeIdentityReactNative.present();
}
