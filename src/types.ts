import type { ImageResolvedAssetSource } from 'react-native';

export type IdentityVerificationSheetOptions = {
  sessionId: string;
  ephemeralKeySecret: string;
  merchantLogo: ImageResolvedAssetSource;
};

export type IdentityVerificationSheetResult = 'FlowCompleted' | 'FlowCanceled' | 'FlowFailed';

export type Init = (options: IdentityVerificationSheetOptions) => void;

export type Present = () => Promise<{ result: IdentityVerificationSheetResult }>;
