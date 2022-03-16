const baseURL =
  'https://stripe-mobile-identity-verification-playground.glitch.me';
const verifyEndpoint = '/create-verification-session';

export const getTestCredentials = async () => {
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
            require_matching_selfie: false,
            require_id_number: false,
            allowed_types: ['driving_license', 'passport', 'id_card'],
            require_live_capture: false,
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
