import React from 'react';
import { StyleSheet, View, Text, Button } from 'react-native';
import { useStripeIdentity } from 'stripe-identity-react-native';

export function HomeScreen() {
  const { status, present } = useStripeIdentity();
  const handlePress = () => {
    present();
  };
  return (
    <View style={styles.container}>
      <Button title="Press me" onPress={handlePress} />
      <Text>Status: {status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
