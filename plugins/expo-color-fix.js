const { withDangerousMod } = require("expo/config-plugins");
const fs = require("fs");
const path = require("path");

const EXPO_COLORS_SWIFT = `// Color extension for Expo Dev Menu/Launcher
// This file fixes a missing Color extension in Expo SDK 53

import SwiftUI

extension Color {
  static var expoSecondarySystemBackground: Color {
    if #available(iOS 14.0, *) {
      return Color(UIColor.secondarySystemBackground)
    } else {
      return Color(UIColor.systemGray6)
    }
  }

  static var expoSystemGray6: Color {
    if #available(iOS 14.0, *) {
      return Color(UIColor.systemGray6)
    } else {
      return Color(UIColor(red: 0.95, green: 0.95, blue: 0.97, alpha: 1.0))
    }
  }
}
`;

const withExpoColorFix = (config) => {
  return withDangerousMod(config, [
    "ios",
    async (config) => {
      const projectRoot = config.modRequest.projectRoot;

      // Create the Swift file in the iOS project
      const iosPath = path.join(projectRoot, "ios");
      const expoColorsPath = path.join(iosPath, "ExpoColors.swift");

      // Only create if iOS folder exists (after prebuild)
      if (fs.existsSync(iosPath)) {
        fs.writeFileSync(expoColorsPath, EXPO_COLORS_SWIFT);
        console.log("✅ Created ExpoColors.swift with Color extension fix");
      }

      return config;
    },
  ]);
};

module.exports = withExpoColorFix;
