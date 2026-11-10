import { NativeModules } from 'react-native';
import type {
  IdentityVerificationSheetOptions,
  IdentityVerificationSheetResult,
} from '../index';

const options: IdentityVerificationSheetOptions = {
  sessionId: 'vs_test',
  ephemeralKeySecret: 'ek_test',
  brandLogo: {
    uri: 'https://example.com/logo.png',
    width: 32,
    height: 32,
    scale: 1,
  },
};

const nativeModule = {
  initIdentityVerificationSheet: jest.fn(),
  presentIdentityVerificationSheet: jest.fn(),
};
const originalNativeModule = NativeModules.StripeIdentityReactNative;

function loadApi(platform?: 'ios' | 'android') {
  let api!: typeof import('../index');
  jest.isolateModules(() => {
    if (platform) {
      const { Platform } =
        require('react-native') as typeof import('react-native');
      jest.spyOn(Platform, 'select').mockImplementation((specifics) => {
        const values = specifics as Record<string, unknown>;
        return platform === 'ios' ? values.ios : values.default;
      });
    }
    api = require('../index');
  });
  return api;
}

beforeEach(() => {
  nativeModule.initIdentityVerificationSheet
    .mockReset()
    .mockResolvedValue(undefined);
  nativeModule.presentIdentityVerificationSheet.mockReset();
  NativeModules.StripeIdentityReactNative = nativeModule;
});

afterEach(() => {
  jest.restoreAllMocks();
  NativeModules.StripeIdentityReactNative = originalNativeModule;
});

it('waits for native initialization before presenting the verification sheet', async () => {
  let finishInitialization!: () => void;
  nativeModule.initIdentityVerificationSheet.mockReturnValue(
    new Promise<void>((resolve) => {
      finishInitialization = resolve;
    })
  );
  const result: IdentityVerificationSheetResult = { status: 'FlowCompleted' };
  nativeModule.presentIdentityVerificationSheet.mockResolvedValue(result);

  const presentation = loadApi().presentIdentityVerificationSheet(options);

  expect(nativeModule.initIdentityVerificationSheet).toHaveBeenCalledWith(
    options
  );
  expect(nativeModule.presentIdentityVerificationSheet).not.toHaveBeenCalled();

  finishInitialization();

  await expect(presentation).resolves.toBe(result);
  expect(nativeModule.presentIdentityVerificationSheet).toHaveBeenCalledTimes(
    1
  );
});

it.each<IdentityVerificationSheetResult>([
  { status: 'FlowCanceled' },
  {
    status: 'FlowFailed',
    error: { code: 'FlowFailed', message: 'Verification failed' },
  },
])(
  'returns the native $status result, including error details',
  async (result) => {
    nativeModule.presentIdentityVerificationSheet.mockResolvedValue(result);

    await expect(
      loadApi().presentIdentityVerificationSheet(options)
    ).resolves.toBe(result);
  }
);

it('does not present when native initialization rejects', async () => {
  const error = new Error('Invalid verification session');
  nativeModule.initIdentityVerificationSheet.mockRejectedValue(error);

  await expect(
    loadApi().presentIdentityVerificationSheet(options)
  ).rejects.toBe(error);
  expect(nativeModule.presentIdentityVerificationSheet).not.toHaveBeenCalled();
});

it('propagates a native presentation rejection', async () => {
  const error = new Error('Unable to present');
  nativeModule.presentIdentityVerificationSheet.mockRejectedValue(error);

  await expect(
    loadApi().presentIdentityVerificationSheet(options)
  ).rejects.toBe(error);
});

it.each(['ios', 'android'] as const)(
  'reports a missing native module with appropriate %s setup guidance',
  async (platform) => {
    delete NativeModules.StripeIdentityReactNative;

    const presentation =
      loadApi(platform).presentIdentityVerificationSheet(options);

    await expect(presentation).rejects.toThrow(
      "The package 'stripe-identity-react-native' doesn't seem to be linked"
    );
    await expect(presentation).rejects.toThrow('You rebuilt the app');
    if (platform === 'ios') {
      await expect(presentation).rejects.toThrow("You have run 'pod install'");
    } else {
      await expect(presentation).rejects.not.toThrow('pod install');
    }
  }
);
