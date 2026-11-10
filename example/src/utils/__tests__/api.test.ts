import {
  AllowedTypes,
  PhoneOtpCheckTypes,
  VerificationSessionOptions,
  VerificationType,
} from '../../types';
import { getTestCredentials } from '../api';

const baseOptions: VerificationSessionOptions = {
  useTestMode: false,
  verificationType: VerificationType.DOCUMENT,
  requireMatchingSelfie: false,
  requireIdNumber: false,
  allowedTypes: {
    [AllowedTypes.DRIVING_LICENSE]: true,
    [AllowedTypes.ID_CARD]: true,
    [AllowedTypes.PASSPORT]: true,
  },
  requireLiveCapture: false,
  requireAddress: false,
  phoneFallbackToDocument: false,
  phoneOtpCheckType: PhoneOtpCheckTypes.ATTEMPT,
};

const fetchMock = jest.fn();
const originalFetch = globalThis.fetch;

describe('getTestCredentials', () => {
  beforeAll(() => {
    globalThis.fetch = fetchMock as unknown as typeof fetch;
  });

  afterAll(() => {
    globalThis.fetch = originalFetch;
  });

  beforeEach(() => {
    fetchMock.mockReset();
    fetchMock.mockResolvedValue({
      json: jest.fn().mockResolvedValue({
        id: 'vs_123',
        ephemeral_key_secret: 'ek_123',
      }),
    });
  });

  it('creates a live-mode Verification Session by default', async () => {
    await getTestCredentials(baseOptions);

    expect(fetchMock).toHaveBeenCalledWith(
      'https://stripe-mobile-identity-verification-playground.stripedemos.com/verification-sessions',
      expect.any(Object),
    );
  });

  it('creates a test-mode Verification Session when enabled', async () => {
    await getTestCredentials({ ...baseOptions, useTestMode: true });

    expect(fetchMock).toHaveBeenCalledWith(
      'https://stripe-mobile-identity-verification-playground.stripedemos.com/test/verification-sessions',
      expect.any(Object),
    );
  });

  it.each([VerificationType.DOCUMENT, VerificationType.PHONE])(
    'omits the opt-in address parameter when disabled for %s',
    async verificationType => {
      await getTestCredentials({
        ...baseOptions,
        verificationType,
        phoneFallbackToDocument: true,
        useTestMode: true,
      });

      const request = JSON.parse(fetchMock.mock.calls[0][1].body);
      expect(request.options.document).not.toHaveProperty('require_address');
      expect(request.options.document.allowed_types).toEqual([
        AllowedTypes.DRIVING_LICENSE,
        AllowedTypes.ID_CARD,
        AllowedTypes.PASSPORT,
      ]);
    },
  );

  it('preserves the address option when explicitly enabled', async () => {
    await getTestCredentials({ ...baseOptions, requireAddress: true });

    const request = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(request.options.document.require_address).toBe(true);
  });
});
