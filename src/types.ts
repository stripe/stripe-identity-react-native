import type { ImageResolvedAssetSource } from 'react-native';

export type IdentityVerificationSheetOptions = {
  sessionId: string;
  ephemeralKeySecret: string;
  brandLogo: ImageResolvedAssetSource;
};

export type IdentityVerificationSheetStatus = 'FlowCompleted' | 'FlowCanceled' | 'FlowFailed';

export type IdentityVerificationSheetResult = {
  status: IdentityVerificationSheetStatus;
  error?: StripeError
};

export type InitIdentityVerificationSheet = (options: IdentityVerificationSheetOptions) => void;

export type PresentIdentityVerificationSheet = () => Promise<IdentityVerificationSheetResult>;

type ErrorType =
  | 'api_connection_error'
  | 'api_error'
  | 'authentication_error'
  | 'card_error'
  | 'idempotency_error'
  | 'invalid_request_error'
  | 'rate_limit_error';


export type StripeError = {
  code: IdentityVerificationSheetStatus;
  message: string;
  localizedMessage?: string;
  declineCode?: string;
  stripeErrorCode?: string;
  type?: ErrorType;
}