/* eslint-env detox/detox, jest */
/* eslint-disable no-undef */

import { getStatusText, pressBack, setupDevice } from './utils';

describe('Identity', () => {
  it('Verify', async () => {
    await setupDevice();

    const identityButton = element(by.id('verify-btn'));
    await waitFor(identityButton).toBeVisible();
    const statusText = await getStatusText('Undefined');
    await expect(statusText).toBeVisible();
    await identityButton.tap();

    const loadingSpinner = element(by.id('loading-spinner'));

    await expect(loadingSpinner).toNotExist();
    await expect(identityButton).toNotExist();
  });
  it('Cancel', async () => {
    await setupDevice();

    const identityButton = element(by.id('verify-btn'));
    await waitFor(identityButton).toBeVisible();
    await identityButton.tap();
    const consentView = await element(
      by.id('StripeIdentity.BiometricConsentView')
    );
    await waitFor(consentView).toBeVisible();
    await pressBack();
    const statusText = await getStatusText('FlowCanceled');
    await expect(statusText).toBeVisible();
  });
});
