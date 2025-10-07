#!/bin/bash

# Patch react-native-safe-area-context to use react-android
sed -i '' "s/com\.facebook\.react:react-native:+/com.facebook.react:react-android:0.73.9/g" node_modules/react-native-safe-area-context/android/build.gradle

# Patch react-native-screens to use react-android
sed -i '' "s/com\.facebook\.react:react-native:+/com.facebook.react:react-android:0.73.9/g" node_modules/react-native-screens/android/build.gradle

# Patch Kotlin version in react-native-safe-area-context gradle.properties
sed -i '' "s/RNSAC_kotlinVersion=.*/RNSAC_kotlinVersion=1.8.21/g" node_modules/react-native-safe-area-context/android/gradle.properties

# Patch Kotlin version in react-native-screens gradle.properties
if grep -q "RNScreens_kotlinVersion" node_modules/react-native-screens/android/gradle.properties; then
    sed -i '' "s/RNScreens_kotlinVersion=.*/RNScreens_kotlinVersion=1.8.21/g" node_modules/react-native-screens/android/gradle.properties
fi

# Patch JVM target in react-native-safe-area-context build.gradle to match Java 1.8
if ! grep -q "jvmTarget" node_modules/react-native-safe-area-context/android/build.gradle; then
    # Add kotlinOptions with jvmTarget after the android block
    sed -i '' '/^android {/a\
    kotlinOptions {\
        jvmTarget = "1.8"\
    }
' node_modules/react-native-safe-area-context/android/build.gradle
fi

# Patch JVM target in react-native-screens build.gradle to match Java 1.8
if ! grep -q "jvmTarget" node_modules/react-native-screens/android/build.gradle; then
    # Add kotlinOptions with jvmTarget after the android block
    sed -i '' '/^android {/a\
    kotlinOptions {\
        jvmTarget = "1.8"\
    }
' node_modules/react-native-screens/android/build.gradle
fi

echo "Patched React Native dependencies for RN 0.73 compatibility"
