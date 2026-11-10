import {
  getStatusText,
  pressBack,
  setupDevice,
  waitForTestModeSheet,
} from './utils';

describe('Identity', () => {
  it('launches the example with a ready verification button', async () => {
    await setupDevice();

    await expect(element(by.id('verify-btn'))).toBeVisible();
    await expect(getStatusText('Undefined')).toBeVisible();
    await expect(element(by.id('loading-spinner'))).not.toExist();
  });
  it('presents a test-mode native sheet and returns cancellation to React Native', async () => {
    await setupDevice();

    await element(by.id('verify-btn')).tap();

    await waitForTestModeSheet();
    await pressBack();
    await waitFor(getStatusText('FlowCanceled'))
      .toBeVisible()
      .withTimeout(10000);
    await expect(element(by.id('verify-btn'))).toBeVisible();
    await expect(element(by.id('loading-spinner'))).not.toExist();
  });
});
