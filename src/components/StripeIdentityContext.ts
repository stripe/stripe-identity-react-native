import { createContext } from 'react';
import type { IdentityStatus } from '../types';

type ContextType = {
  status: IdentityStatus;
  setStatus(status: IdentityStatus): void;
};

export const StripeIdentityContext = createContext<ContextType>({
  status: 'Idle',
  setStatus: () => {},
});
