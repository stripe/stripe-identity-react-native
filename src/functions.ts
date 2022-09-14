import StripeIdentityReactNative from './StripeIdentitySdk';
import type {
  IdentityVerificationSheetOptions,
  IdentityVerificationSheetResult,
} from './types';

export async function presentIdentityVerificationSheet(
  options: IdentityVerificationSheetOptions
): Promise<IdentityVerificationSheetResult> {
  await StripeIdentityReactNative.initIdentityVerificationSheet(options);
  return await StripeIdentityReactNative.presentIdentityVerificationSheet();
}
