import { useContext, useEffect } from 'react';
import { StripeIdentityContext } from '../components/StripeIdentityContext';
import { present } from '../functions';

export type Props = {
  merchantLogo: string;
};

export function useStripeIdentity({ merchantLogo }: Props) {
  const { isLoading, status } = useContext(StripeIdentityContext);

  useEffect(() => {
    console.log(merchantLogo);
  }, [merchantLogo]);

  return { isLoading, status, present };
}
