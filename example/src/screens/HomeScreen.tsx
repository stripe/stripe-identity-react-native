import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  Image,
  View,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import logo from '../assets/RocketRides.png';
import { getTestCredentials } from '../utils/api';
import { Options } from '../components/Options';
import { Identity } from '../components/Identity';
import {
  AllowedTypes,
  PhoneOtpCheckTypes,
  VerificationSessionOptions,
  VerificationType,
} from '../types';

export function HomeScreen() {
  const [options, setOptions] = useState<VerificationSessionOptions>({
    verificationType: VerificationType.DOCUMENT,
    requireMatchingSelfie: false,
    requireIdNumber: false,
    allowedTypes: {
      [AllowedTypes.DRIVING_LICENSE]: true,
      [AllowedTypes.ID_CARD]: true,
      [AllowedTypes.PASSPORT]: true,
    },
    requireLiveCapture: false,
    requireAddress: false,
    phoneFallbackToDocument: false,
    phoneOtpCheckType: PhoneOtpCheckTypes.ATTEMPT,
  });

  const fetchOptions = useCallback(async () => {
    const credentials = await getTestCredentials(options);
    return {
      sessionId: credentials.id,
      ephemeralKeySecret: credentials.ephemeral_key_secret,
      brandLogo: Image.resolveAssetSource(logo),
    };
  }, [options]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Options options={options} setOptions={setOptions} />
        <View style={styles.divider} />
        <Identity fetchOptions={fetchOptions} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    marginHorizontal: 0,
  },
  divider: {
    borderBottomColor: 'black',
    borderBottomWidth: 1,
  },
});
