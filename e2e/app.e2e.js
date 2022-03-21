/* eslint-env detox/detox, jest */

describe('Identity', () => {
  it('Verify', async () => {
    await device.launchApp({
      newInstance: true,
      permissions: { camera: 'YES' },
    });

    await device.reloadReactNative();

    const identityButton = element(by.id('verify-btn'));
    await waitFor(identityButton).toBeVisible();
    await identityButton.tap();

    const loadingSpinner = element(by.id('loading-spinner'));

    await expect(loadingSpinner).toNotExist();
    await expect(button).toNotExist();
  });
});
