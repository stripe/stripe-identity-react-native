import React, { useEffect, useState } from 'react';
import { StripeIdentityContext } from './StripeIdentityContext';

export type Props = {
  children: React.ReactElement | React.ReactElement[];
  publishableKey: string;
};

export function StripeIdentityProvider({ children, publishableKey }: Props) {
  const [isLoading, setLoading] = useState(true);
  const [status, setStatus] = useState<IdentityStatus>('Idle');

  useEffect(() => {
    setLoading(true);
    setStatus('Idle');
    console.log(publishableKey);
  }, [publishableKey]);

  return (
    <StripeIdentityContext.Provider value={{ isLoading, status }}>
      {children}
    </StripeIdentityContext.Provider>
  );
}
