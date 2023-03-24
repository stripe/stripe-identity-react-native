import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
  AllowedTypes,
  VerificationSessionOptions,
  VerificationType,
} from '../types';
import { Option } from './Option';
import RadioGroup from 'react-native-radio-buttons-group';
import type { RadioButtonProps } from 'react-native-radio-buttons-group';

type OptionsProps = {
  options: VerificationSessionOptions;
  setOptions(options: VerificationSessionOptions): void;
};

export function Options({ options, setOptions }: OptionsProps) {
  const [verificationTypeRadioButtons] = useState([
    {
      id: VerificationType.DOCUMENT, // acts as primary key, should be unique and non-empty string
      label: 'Document',
      value: VerificationType.DOCUMENT,
      labelStyle: styles.verification_type_label,
      selected: true,
    },
    {
      id: VerificationType.ID_NUMBER,
      label: 'ID Number',
      value: VerificationType.ID_NUMBER,
      labelStyle: styles.verification_type_label,
    },
    {
      id: VerificationType.ADDRESS,
      label: 'Address',
      value: VerificationType.ADDRESS,
      labelStyle: styles.verification_type_label,
    },
  ]);

  function onPressRadioButton(radioButtonsArray: RadioButtonProps[]) {
    let selectedVerificaitonType = radioButtonsArray.find((prop) => {
      return prop.selected;
    })?.value;

    setOptions({
      ...options,
      verificationType:
        selectedVerificaitonType === undefined
          ? VerificationType.DOCUMENT
          : (selectedVerificaitonType as VerificationType),
    });
  }

  if (options.verificationType === VerificationType.DOCUMENT) {
    return (
      <View style={styles.container}>
        <View>
          <Text style={styles.label}>Verification Type:</Text>
          <RadioGroup
            radioButtons={verificationTypeRadioButtons}
            onPress={onPressRadioButton}
            layout="row"
            containerStyle={styles.verification_type_container}
          />
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
          onChange={(value) =>
            setOptions({ ...options, requireIdNumber: value })
          }
        />
        <Option
          title="Require Address"
          value={options.requireAddress}
          onChange={(value) =>
            setOptions({ ...options, requireAddress: value })
          }
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
  } else {
    return (
      <View style={styles.container}>
        <Text style={styles.label}>Verification Type:</Text>
        <RadioGroup
          radioButtons={verificationTypeRadioButtons}
          onPress={onPressRadioButton}
          layout="row"
          containerStyle={styles.verification_type_container}
        />
      </View>
    );
  }
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
  verification_type_container: {
    marginBottom: 10,
  },
  verification_type_label: {
    fontSize: 16,
  },
});
