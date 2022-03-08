import React, { useEffect, useState } from 'react';
import type { ImageResolvedAssetSource } from 'react-native';
import { StripeIdentityContext } from './StripeIdentityContext';
import { init } from '../functions';
import type { IdentityStatus } from '../types';

export type Props = {
  children: React.ReactElement | React.ReactElement[];
  sessionId: string;
  ephemeralKeySecret: string;
  merchantLogo: ImageResolvedAssetSource;
};

export function StripeIdentityProvider({
  children,
  sessionId,
  ephemeralKeySecret,
  merchantLogo,
}: Props) {
  const [status, setStatus] = useState<IdentityStatus>('Idle');

  useEffect(() => {
    init({ sessionId, ephemeralKeySecret, merchantLogo });
  }, [sessionId, ephemeralKeySecret, merchantLogo]);

  return (
    <StripeIdentityContext.Provider value={{ setStatus, status }}>
      {children}
    </StripeIdentityContext.Provider>
  );
}
