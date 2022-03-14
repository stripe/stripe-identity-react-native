export enum AllowedTypes {
  DRIVING_LICENSE = 'driving_license',
  PASSPORT = 'passport',
  ID_CARD = 'id_card',
}

export type VerificationSessionOptions = {
  requireMatchingSelfie: boolean;
  requireIdNumber: boolean;
  allowedTypes: Record<AllowedTypes, boolean>;
  requireLiveCapture: boolean;
};
