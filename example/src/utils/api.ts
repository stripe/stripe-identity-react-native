import type { AllowedTypes, VerificationSessionOptions } from '../types';

const baseURL =
  'https://stripe-mobile-identity-verification-playground.glitch.me';
const verifyEndpoint = '/create-verification-session';

export const getTestCredentials = async (
  options: VerificationSessionOptions
) => {
  try {
    const data = await fetch(baseURL + verifyEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'document',
        options: {
          document: {
            require_matching_selfie: options.requireMatchingSelfie,
            require_id_number: options.requireIdNumber,
            require_live_capture: options.requireLiveCapture,
            allowed_types: (
              Object.keys(options.allowedTypes) as AllowedTypes[]
            ).filter((key: AllowedTypes) => options.allowedTypes[key]),
          },
        },
      }),
    });
    const json = await data.json();
    return json;
  } catch (e) {
    return {};
  }
};
