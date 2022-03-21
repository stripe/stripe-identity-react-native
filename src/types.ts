import type { ImageResolvedAssetSource } from 'react-native';

export type Options = {
  sessionId: string;
  ephemeralKeySecret: string;
  merchantLogo: ImageResolvedAssetSource;
};

export type IdentityStatus = 'Idle' | 'Completed' | 'Canceled' | 'Failed';

export type Init = (options: Options) => void;

export type Present = () => Promise<{ status: IdentityStatus }>;
