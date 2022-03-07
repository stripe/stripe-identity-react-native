import * as React from 'react';
import { init, present } from 'stripe-identity-react-native';
import { StyleSheet, View, Text, Image, Button } from 'react-native';
import logo from './assets/RocketRides.png';

const baseURL =
  'https://stripe-mobile-identity-verification-playground.glitch.me';
const verifyEndpoint = '/create-verification-session';

export default function App() {
  React.useEffect(() => {
    (async () => {
      try {
        const data = await fetch(baseURL + verifyEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ type: 'id_number' }),
        });
        const json = await data.json();
        init({
          sessionId: json.id,
          ephemeralKeySecret: json.ephemeral_key_secret,
          merchantLogo: Image.resolveAssetSource(logo),
        });
      } catch (e) {
        console.log(e);
      }
    })();
  }, []);
  const handlePress = async () => {
    const result = await present();
    console.log(result);
  };
  return (
    <View style={styles.container}>
      <Text>Result</Text>
      <Button title="Press me" onPress={handlePress} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
});
