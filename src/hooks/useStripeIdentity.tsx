import { useState } from 'react';
import { presentIdentityVerificationSheet } from '../functions';
import type {
  IdentityVerificationSheetOptions,
  IdentityVerificationSheetStatus,
  StripeError,
} from '../types';

/**
 * useStripeIdentity hook.
 * This hook gives you an acesss to the present method
 * as well as the verification status and the loading flag
 * This hook takes as an argument optionsProvider method.
 * This method should fetch Identity Credentials and return them along with the brandLogo.
 *
 * @example
 * ```ts
 * const fechOptionsProvider = async () => {
 *    const response = await fetch('http://${YOUR_SERVER_BASE_URL}/create-verification-session');
 *    const { id, ephemeral_key_secret } = await response.json();
 *    return {
 *      sessionId: id,
 *      ephemeralKeySecret: ephemeral_key_secret,
 *      brandLogo: Image.resolveAssetSource(logo),
 *    };
 *  };
 * 
 * const { present, status, loading, error } = useStripeIdentity(fetchOptionsProvider)
 * ```
 
 */
export function useStripeIdentity(
  optionsProvider: () => Promise<IdentityVerificationSheetOptions>
) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<
    IdentityVerificationSheetStatus | undefined
  >();
  const [error, setError] = useState<StripeError | undefined>();

  const present = async () => {
    setLoading(true);
    const options = await optionsProvider();
    setLoading(false);
    const { status: identityStatus, error: identityError } =
      await presentIdentityVerificationSheet(options);
    setStatus(identityStatus);
    setError(identityError);
  };

  return { present, status, loading, error };
}
