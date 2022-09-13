import StripeIdentityReactNative from './StripeIdentitySdk';
import type {
  IdentityVerificationSheetOptions,
  IdentityVerificationSheetResult,
} from './types';

export function presentIdentityVerificationSheet(
  options: IdentityVerificationSheetOptions
): Promise<IdentityVerificationSheetResult> {
  const initVerificationSheet = async () => {
    await StripeIdentityReactNative.initIdentityVerificationSheet(options);
  };
  initVerificationSheet();

  return StripeIdentityReactNative.presentIdentityVerificationSheet();
}
