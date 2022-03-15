import React, { useEffect, useState } from 'react';
import { StripeIdentityContext } from './StripeIdentityContext';
import { init } from '../functions';
import type { IdentityStatus, Options } from '../types';

export type Props = {
  children: React.ReactElement | React.ReactElement[];
  /*
   You must set an option provider before calling any Stripe Identity method.
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
  optionsProvider: () => Promise<Options>;
};

/**
 *  StripeTerminalProvider Component
 *
 * @example
 * ```ts
 *  <StripeIdentityProvider optionsProvider={fetchOptions}>
 *    <App />
 *  </StripeIdentityProvider>
 * ```
 * @param __namedParameters Props
 * @returns JSX.Element
 * @category ReactComponents
 */
export function StripeIdentityProvider({ children, optionsProvider }: Props) {
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<IdentityStatus>('Idle');

  useEffect(() => {
    async function _initialize() {
      setLoading(true);
      const options = await optionsProvider();
      setLoading(false);
      init(options);
    }
    _initialize();
  }, [optionsProvider]);

  return (
    <StripeIdentityContext.Provider value={{ setStatus, status, loading }}>
      {children}
    </StripeIdentityContext.Provider>
  );
}
