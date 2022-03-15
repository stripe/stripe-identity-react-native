import { useState } from 'react';
import { init, present as presentIdentity } from '../functions';
import type { IdentityStatus, Options } from '../types';

/**
 * useStripeIdentity hook.
 * This hook gives you an acesss to all available SDK methods
 * as well as the verification status and the loading flag
 *
 * @example
 * ```ts
 * const { status, loading, setStatus } = useStripeIdentity()
 * ```
 * @param optionsProvider () => Promise<Options>
 * You must set an option provider before calling any Stripe Identity method.
   This method should fetch Identity Credentials and return them along with the merchantLogo.
    * @example
    * ```ts
    * const fechOptionsProvider = async () => {
    *   const response = await fetch('http://api_url/create-verification-session');
    *   const { id, ephemeral_key_secret } = await response.json();
    *   return {
    *     sessionId: id,
    *     ephemeralKeySecret: ephemeral_key_secret,
    *     merchantLogo: Image.resolveAssetSource(logo),
    *   };
    * };
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
