import React, { useEffect, useState } from 'react';
import { StripeIdentityContext } from './StripeIdentityContext';
import { init } from '../functions';
import type { IdentityStatus, Options } from '../types';

export type Props = {
  children: React.ReactElement | React.ReactElement[];
  optionsProvider: () => Promise<Options>;
};

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
