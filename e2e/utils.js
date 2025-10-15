/* eslint-env detox/detox, jest */
/* eslint-disable no-undef */

export const setupDevice = async () => {
  await device.launchApp({
    newInstance: true,
    permissions: { camera: 'YES' },
  });

  await device.reloadReactNative();
};
export const pressBack = async () => {
  if (device.getPlatform() === 'android') {
    await device.pressBack(); // Android only
  } else {
    await element(by.traits(['button']))
      .atIndex(0)
      .tap();
  }
};

export const getStatusText = async (status) => {
  return element(by.text(`Status: ${status}`));
};
