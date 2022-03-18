import { useState } from 'react';
import { init, present as presentIdentity } from '../functions';
import type { IdentityStatus, Options } from '../types';

export function useStripeIdentity(optionsProvider: () => Promise<Options>) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<IdentityStatus>('Idle');

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
