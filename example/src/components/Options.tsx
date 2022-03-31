import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AllowedTypes, VerificationSessionOptions } from '../types';
import { Option } from './Option';

type OptionsProps = {
  options: VerificationSessionOptions;
  setOptions(options: VerificationSessionOptions): void;
};

export function Options({ options, setOptions }: OptionsProps) {
  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.label}>Allowed Types:</Text>
        <View style={styles.section}>
          <Option
            title="Driving License"
            value={options.allowedTypes[AllowedTypes.DRIVING_LICENSE]}
            onChange={(value) =>
              setOptions({
                ...options,
                allowedTypes: {
                  ...options.allowedTypes,
                  [AllowedTypes.DRIVING_LICENSE]: value,
                },
              })
            }
          />
          <Option
            title="Passport"
            value={options.allowedTypes[AllowedTypes.PASSPORT]}
            onChange={(value) =>
              setOptions({
                ...options,
                allowedTypes: {
                  ...options.allowedTypes,
                  [AllowedTypes.PASSPORT]: value,
                },
              })
            }
          />
          <Option
            title="ID Card"
            value={options.allowedTypes[AllowedTypes.ID_CARD]}
            onChange={(value) =>
              setOptions({
                ...options,
                allowedTypes: {
                  ...options.allowedTypes,
                  [AllowedTypes.ID_CARD]: value,
                },
              })
            }
          />
        </View>
      </View>
      <Option
        title="Require ID Number"
        value={options.requireIdNumber}
        onChange={(value) => setOptions({ ...options, requireIdNumber: value })}
      />
      <Option
        title="Require Live Capture"
        value={options.requireLiveCapture}
        onChange={(value) =>
          setOptions({ ...options, requireLiveCapture: value })
        }
      />
      <Option
        title="Require Matching Selfie"
        value={options.requireMatchingSelfie}
        onChange={(value) =>
          setOptions({ ...options, requireMatchingSelfie: value })
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 10,
    paddingVertical: 20,
  },
  label: {
    fontSize: 18,
    marginBottom: 10,
  },
  section: {
    marginLeft: 10,
  },
});
