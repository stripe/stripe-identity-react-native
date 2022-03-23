import { useState } from 'react';
import { initIdentityVerificationSheet, presentIdentityVerificationSheet } from '../functions';
import type { IdentityVerificationSheetResult, IdentityVerificationSheetOptions } from '../types';

/**
 * useStripeIdentity hook.
 * This hook gives you an acesss to the present method
 * as well as the verification status and the loading flag
 * This hook takes as an argument optionsProvider method.
 * This method should fetch Identity Credentials and return them along with the merchantLogo.
 *
 * @example
 * ```ts
 * const fechOptionsProvider = async () => {
 *    const response = await fetch('http://{{YOUR_SERVER_BASE_URL}}/create-verification-session');
 *    const { id, ephemeral_key_secret } = await response.json();
 *    return {
 *      sessionId: id,
 *      ephemeralKeySecret: ephemeral_key_secret,
 *      merchantLogo: Image.resolveAssetSource(logo),
 *    };
 *  };
 *
 * const { result, present, loading } = useStripeIdentity(fetchOptionsProvider)
 * ```

 */
export function useStripeIdentity(optionsProvider: () => Promise<IdentityVerificationSheetOptions>) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<IdentityVerificationSheetResult | undefined>();

  const present = async () => {
    try {
      setLoading(true);
      const options = await optionsProvider();
      init(options);
      setLoading(false);
      const [result, error] = await presentIdentityVerificationSheet();
      setStatus(result.status);
    } catch (e) {
      // How does the integrator access the error? Should we also return a nullable error from this function?
      setStatus('FlowFailed', e);
    }
  };

  return { status, present, loading };
}
