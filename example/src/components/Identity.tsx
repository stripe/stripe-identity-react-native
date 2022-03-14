import React, { useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Button,
  ActivityIndicator,
} from 'react-native';
import { useStripeIdentity } from 'stripe-identity-react-native';

export function Identity() {
  const { status, present, loading } = useStripeIdentity();

  const handlePress = useCallback(() => {
    present();
  }, [present]);

  const renderContent = useCallback(() => {
    if (loading) {
      return <ActivityIndicator />;
    }

    return (
      <View style={styles.container}>
        <Button title="Verify Identity" onPress={handlePress} />
        <Text>Status: {status}</Text>
      </View>
    );
  }, [loading, status, handlePress]);

  return <View style={styles.container}>{renderContent()}</View>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
