import { createContext } from 'react';

type ContextType = {
  isLoading: boolean;
  status: IdentityStatus;
};

export const StripeIdentityContext = createContext<ContextType>({
  isLoading: true,
  status: 'Idle',
});
