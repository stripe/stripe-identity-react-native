const { execFile } = require('node:child_process');
const path = require('node:path');
const { promisify } = require('node:util');

const run = promisify(execFile);

export const setupDevice = async () => {
  await device.launchApp({
    newInstance: true,
    permissions: { camera: 'YES' },
  });

  const testMode = element(by.id('test-mode-switch'));
  await waitFor(testMode).toBeVisible().withTimeout(15000);
  await testMode.tap();
  await expect(testMode).toHaveToggleValue(true);
  await element(by.id('example-scroll-view')).scrollTo('bottom');
};
export const pressBack = async () => {
  if (device.getPlatform() === 'android') {
    await device.pressBack();
  } else {
    await element(by.text('Cancelled')).tap();
  }
};

export const getStatusText = (status) => element(by.text(`Status: ${status}`));

export const waitForTestModeSheet = async () => {
  if (device.getPlatform() === 'ios') {
    await waitFor(element(by.text("You're currently in testmode")))
      .toBeVisible()
      .withTimeout(30000);
    return;
  }

  // Stripe's Android sheet uses Compose. Detox's Espresso text matcher only
  // sees Android Views, so assert the native accessibility tree with UIAutomator.
  const sdk = process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT;
  const adb = sdk ? path.join(sdk, 'platform-tools', 'adb') : 'adb';
  const hierarchyFile = '/sdcard/identity-testmode.xml';
  const deadline = Date.now() + 30000;
  let lastError;
  try {
    while (Date.now() < deadline) {
      try {
        await run(
          adb,
          ['-s', device.id, 'shell', 'uiautomator', 'dump', hierarchyFile],
          { timeout: 5000 }
        );
        const { stdout } = await run(
          adb,
          ['-s', device.id, 'shell', 'cat', hierarchyFile],
          { timeout: 5000 }
        );
        if (
          stdout.includes('text="You\'re currently in testmode"') &&
          stdout.includes('package="com.stripeidentityexample"')
        ) {
          return;
        }
      } catch (error) {
        lastError = error;
      }
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
    throw new Error(
      `Native test-mode sheet did not appear${lastError ? `: ${lastError.message}` : ''}`
    );
  } finally {
    await run(adb, ['-s', device.id, 'shell', 'rm', '-f', hierarchyFile], {
      timeout: 5000,
    });
  }
};
