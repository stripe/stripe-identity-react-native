// hooks
export {
  useStripeIdentity,
  Props as UseStripeIdentityProps,
} from './hooks/useStripeIdentity';

// functions
export { init, present } from './functions';

// components
export {
  StripeIdentityProvider,
  Props as StripeIdentityProviderProps,
} from './components/StripeIdentityProvider';

// types
export type { Options, IdentityStatus } from './types';
