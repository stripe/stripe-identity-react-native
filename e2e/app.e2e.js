/* eslint-env detox/detox, jest */

describe('Identity', () => {
  it('Verify', async () => {
    await device.launchApp({
      newInstance: true,
      permissions: { camera: 'YES' },
    });

    await device.reloadReactNative();

    const button = element(by.id('verify-btn'));
    await waitFor(button).toBeVisible();
    await button.tap();

    const loadingSpinner = element(by.id('loading-spinner'));

    await expect(loadingSpinner).toNotExist();
    await expect(button).toNotExist();
  });
});
