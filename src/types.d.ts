type Options = {
  sessionId: string;
  ephemeralKeySecret: string;
  merchantLogo: Image;
};

type IdentityStatus = 'Idle' | 'Completed' | 'Canceled' | 'Failed';

type Init = (options: Options) => void;

type Present = () => Promise<{ status: IdentityStatus }>;

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
