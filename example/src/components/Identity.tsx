import React, { useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Button,
  ActivityIndicator,
} from 'react-native';
import {
  useStripeIdentity,
  IdentityVerificationSheetOptions,
} from '@stripe/stripe-identity-react-native';

type Props = {
  fetchOptions: () => Promise<IdentityVerificationSheetOptions>;
};

export function Identity({ fetchOptions }: Props) {
  const { status, present, loading } = useStripeIdentity(fetchOptions);

  const handlePress = useCallback(() => {
    present();
  }, [present]);

  const renderButton = useCallback(() => {
    if (loading) {
      return (
        <View testID="loading-spinner">
          <ActivityIndicator />
        </View>
      );
    }
    return (
      <Button
        testID="verify-btn"
        title="Verify Identity"
        onPress={handlePress}
      />
    );
  }, [loading, handlePress]);

  return (
    <View style={styles.container}>
      <View style={styles.buttonContainer}>{renderButton()}</View>
      <Text>Status: {status ?? 'Undefined'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContainer: {
    height: 50,
  },
});
