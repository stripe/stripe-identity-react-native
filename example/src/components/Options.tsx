import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
  AllowedTypes,
  PhoneOtpCheckTypes,
  VerificationSessionOptions,
  VerificationType,
} from '../types';
import { Option } from './Option';
import { SelectList } from 'react-native-dropdown-select-list';
import RadioGroup from 'react-native-radio-buttons-group';

type OptionsProps = {
  options: VerificationSessionOptions;
  setOptions(options: VerificationSessionOptions): void;
};

export function Options({ options, setOptions }: OptionsProps) {
  const verificationTypeData = [
    { key: VerificationType.DOCUMENT, value: 'Document' },
    { key: VerificationType.ID_NUMBER, value: 'ID Number' },
    { key: VerificationType.ADDRESS, value: 'Address' },
    { key: VerificationType.PHONE, value: 'Phone' },
  ];

  const [phoneOtpCheckOptions] = useState([
    {
      id: PhoneOtpCheckTypes.ATTEMPT, // acts as primary key, should be unique and non-empty string
      label: PhoneOtpCheckTypes.ATTEMPT.valueOf(),
      value: PhoneOtpCheckTypes.ATTEMPT,
      labelStyle: styles.verification_type_label,
    },
    {
      id: PhoneOtpCheckTypes.NONE,
      label: PhoneOtpCheckTypes.NONE.valueOf(),
      value: PhoneOtpCheckTypes.NONE,
      labelStyle: styles.verification_type_label,
    },
    {
      id: PhoneOtpCheckTypes.REQUIRED,
      label: PhoneOtpCheckTypes.REQUIRED.valueOf(),
      value: PhoneOtpCheckTypes.REQUIRED,
      labelStyle: styles.verification_type_label,
    },
  ]);

  function onPressPhoneOtpCheckOption(selectedId: string) {
    let selectedPhoneOtpCheckType = phoneOtpCheckOptions.find((item) => {
      return item.id === selectedId;
    })?.value;

    setOptions({
      ...options,
      phoneOtpCheckType: selectedPhoneOtpCheckType
        ? selectedPhoneOtpCheckType
        : PhoneOtpCheckTypes.ATTEMPT,
    });
  }

  const findItemByKey = (keyToFind: VerificationType) => {
    const foundItem = verificationTypeData.find(
      (item) => item.key === keyToFind
    );
    return foundItem;
  };

  function onSelectVerificationType(value: VerificationType) {
    setOptions({
      ...options,
      verificationType: value,
    });
  }

  const DocumentOptionSection = () => {
    return (
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
  };

  if (options.verificationType === VerificationType.DOCUMENT) {
    return (
      <View style={styles.container}>
        <Text style={styles.label}>Verification Type:</Text>
        <SelectList
          setSelected={onSelectVerificationType}
          data={verificationTypeData}
          save="key"
          defaultOption={findItemByKey(options.verificationType)}
          search={false}
          boxStyles={styles.verification_type_container}
        />
        <DocumentOptionSection />
      </View>
    );
  } else if (options.verificationType === VerificationType.PHONE) {
    return (
      <View style={styles.container}>
        <Text style={styles.label}>Verification Type:</Text>
        <SelectList
          setSelected={onSelectVerificationType}
          data={verificationTypeData}
          save="key"
          defaultOption={findItemByKey(options.verificationType)}
          search={false}
          boxStyles={styles.verification_type_container}
        />
        <Option
          title="Fallback to document"
          value={options.phoneFallbackToDocument}
          onChange={(value) =>
            setOptions({
              ...options,
              phoneFallbackToDocument: value,
            })
          }
        />
        {options.phoneFallbackToDocument ? (
          <View>
            <Text style={styles.label}>OTP Check:</Text>
            <RadioGroup
              radioButtons={phoneOtpCheckOptions}
              selectedId={options.phoneOtpCheckType}
              onPress={onPressPhoneOtpCheckOption}
              layout="row"
              containerStyle={styles.verification_type_container}
            />
            <DocumentOptionSection />
          </View>
        ) : null}
      </View>
    );
  } else {
    return (
      <View style={styles.container}>
        <Text style={styles.label}>Verification Type:</Text>
        <SelectList
          setSelected={onSelectVerificationType}
          data={verificationTypeData}
          save="key"
          defaultOption={findItemByKey(options.verificationType)}
          search={false}
          boxStyles={styles.verification_type_container}
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
