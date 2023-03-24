import {
  AllowedTypes,
  VerificationSessionOptions,
  VerificationType,
} from '../types';

const baseURL =
  'https://stripe-mobile-identity-verification-playground.glitch.me';
const verifyEndpoint = '/create-verification-session';

export const getTestCredentials = async (
  options: VerificationSessionOptions
) => {
  try {
    let data;
    if (options.verificationType === VerificationType.DOCUMENT) {
      data = await fetch(baseURL + verifyEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: options.verificationType,
          options: {
            document: {
              require_matching_selfie: options.requireMatchingSelfie,
              require_id_number: options.requireIdNumber,
              require_live_capture: options.requireLiveCapture,
              require_address: options.requireAddress,
              allowed_types: (
                Object.keys(options.allowedTypes) as AllowedTypes[]
              ).filter((key: AllowedTypes) => options.allowedTypes[key]),
            },
          },
        }),
      });
    } else {
      data = await fetch(baseURL + verifyEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: options.verificationType,
        }),
      });
    }
    const json = await data.json();
    return json;
  } catch (e) {
    return {};
  }
};
