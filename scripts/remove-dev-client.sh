#!/bin/bash
# Script to remove expo-dev-client before iOS build
# This is a workaround for Expo SDK 53 Color extension bug

echo "🔧 Removing expo-dev-client to avoid SDK 53 Color bug..."

# Remove expo-dev-client from package.json dependencies
if command -v jq &> /dev/null; then
  # Use jq if available
  jq 'del(.dependencies["expo-dev-client"])' package.json > package.json.tmp && mv package.json.tmp package.json
else
  # Fallback to sed
  sed -i '/"expo-dev-client":/d' package.json
fi

# Remove the package from node_modules
rm -rf node_modules/expo-dev-client
rm -rf node_modules/expo-dev-menu
rm -rf node_modules/expo-dev-launcher

echo "✅ expo-dev-client removed successfully"
