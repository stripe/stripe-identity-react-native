import StripeIdentityReactNative from './StripeIdentitySdk';
import type { IdentityVerificationSheetOptions, IdentityVerificationSheetResult } from './types';

export function initIdentityVerificationSheet(options: IdentityVerificationSheetOptions): void {
  StripeIdentityReactNative.initIdentityVerificationSheet(options);
}

export function presentIdentityVerificationSheet(): Promise<IdentityVerificationSheetResult> {
  return StripeIdentityReactNative.presentIdentityVerificationSheet();
}
