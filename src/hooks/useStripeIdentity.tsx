import { useContext } from 'react';
import { StripeIdentityContext } from '../components/StripeIdentityContext';
import { present as presentIdentity } from '../functions';

export type Props = {
  merchantLogo: string;
};

export function useStripeIdentity() {
  const { status, setStatus, loading } = useContext(StripeIdentityContext);

  const present = async () => {
    try {
      const result = await presentIdentity();
      setStatus(result.status);
    } catch (e) {
      setStatus('Failed');
    }
  };

  return { status, present, loading };
}
