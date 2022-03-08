import React, { useState, useEffect } from 'react';
import { StripeIdentityProvider } from 'stripe-identity-react-native';
import type { Options } from 'stripe-identity-react-native';
import { StyleSheet, Text, Image, View } from 'react-native';
import logo from './assets/RocketRides.png';
import { getTestCredentials } from './utils/api';
import { HomeScreen } from './screens/HomeScreen';

export default function App() {
  const [options, setOptions] = useState<Options | undefined>();

  useEffect(() => {
    (async () => {
      const credentials = await getTestCredentials();
      setOptions({
        sessionId: credentials.id,
        ephemeralKeySecret: credentials.ephemeral_key_secret,
        merchantLogo: Image.resolveAssetSource(logo),
      });
    })();
  }, []);

  if (!options) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }
  return (
    <StripeIdentityProvider
      sessionId={options.sessionId}
      ephemeralKeySecret={options.ephemeralKeySecret}
      merchantLogo={options.merchantLogo}
    >
      <View style={styles.container}>
        <HomeScreen />
      </View>
    </StripeIdentityProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
