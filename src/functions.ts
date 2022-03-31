import StripeIdentityReactNative from './StripeIdentitySdk';
import type {
  IdentityVerificationSheetOptions,
  IdentityVerificationSheetResult,
} from './types';

export function presentIdentityVerificationSheet(
  options: IdentityVerificationSheetOptions
): Promise<IdentityVerificationSheetResult> {
  StripeIdentityReactNative.initIdentityVerificationSheet(options);
  return StripeIdentityReactNative.presentIdentityVerificationSheet();
}
