#!/bin/sh

export HOMEBREW_NO_INSTALL_CLEANUP=TRUE
brew install cocoapods
brew install node@16
brew link node@16
brew install yarn

# Install dependencies
yarn
yarn bootstrap

# the sed command from RN cant find the file... so we have to run it ourselves
#sed -i -e  $'s/ && (__IPHONE_OS_VERSION_MIN_REQUIRED < __IPHONE_10_0)//' /Volumes/workspace/repository/ios/Pods/RCT-Folly/folly/portability/Time.h
