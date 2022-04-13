import { useState } from 'react';
import { presentIdentityVerificationSheet } from '../functions';
import type {
  IdentityVerificationSheetOptions,
  IdentityVerificationSheetStatus,
  StripeError,
} from '../types';

/**
 * useStripeIdentity hook.
 *
 * This hook provides access to the present method,
 * verification status, and loading flag.
 *
 * @param optionsProvider - An optionsProvider method that fetches the
 * VerificationSession ID, ephemeral key secret, and brandLogo.
 *
 * @example
 * ```ts
 * const fechOptionsProvider = async () => {
 *    const response = await fetch('https://${YOUR_SERVER_BASE_URL}/create-verification-session');
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
