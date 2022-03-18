import { useState } from 'react';
import { init, present as presentIdentity } from '../functions';
import type { IdentityStatus, Options } from '../types';

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
 *    const response = await fetch('http://api_url/create-verification-session');
 *    const { id, ephemeral_key_secret } = await response.json();
 *    return {
 *      sessionId: id,
 *      ephemeralKeySecret: ephemeral_key_secret,
 *      merchantLogo: Image.resolveAssetSource(logo),
 *    };
 *  };
 * 
 * const { status, resent, loading } = useStripeIdentity(fetchOptionsProvider)
 * ```
 
 */
export function useStripeIdentity(optionsProvider: () => Promise<Options>) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<IdentityStatus | undefined>();

  const present = async () => {
    try {
      setLoading(true);
      const options = await optionsProvider();
      init(options);
      setLoading(false);
      const result = await presentIdentity();
      setStatus(result.status);
    } catch (e) {
      setStatus('Failed');
    }
  };

  return { status, present, loading };
}
