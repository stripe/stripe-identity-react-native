export type Options = {
  sessionId: string;
  ephemeralKeySecret: string;
  merchantLogo: ImageResolvedAssetSource;
};

export type IdentityStatus = 'Idle' | 'Completed' | 'Canceled' | 'Failed';

export type Init = (options: Options) => void;

export type Present = () => Promise<{ status: IdentityStatus }>;

type UseStripeIdentity = (options: Options) => {
  present: Present;
  isLoading: boolean;
  status: IdentityStatus;
};

type StripeIdentityProvider = React.Component<{ publishableKey: string }>;

type ExportedElements = {
  init: Init;
  present: Present;
  useStripeIdentity: UseStripeIdentity;
  StripeIdentityProvider: StripeIdentityProvider;
};
