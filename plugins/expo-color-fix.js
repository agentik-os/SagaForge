const { withDangerousMod, withXcodeProject } = require("expo/config-plugins");
const fs = require("fs");
const path = require("path");

const EXPO_COLORS_SWIFT = `// Color extension for Expo Dev Menu/Launcher
// This file fixes missing Color extensions in Expo SDK 53
// Bug: expo-dev-menu and expo-dev-launcher use these colors but they are not defined

import SwiftUI

extension Color {
  // Primary background
  static var expoSystemBackground: Color {
    return Color(UIColor.systemBackground)
  }

  // Secondary background (slightly darker/lighter depending on mode)
  static var expoSecondarySystemBackground: Color {
    return Color(UIColor.secondarySystemBackground)
  }

  // Grouped background (for table views etc.)
  static var expoSystemGroupedBackground: Color {
    return Color(UIColor.systemGroupedBackground)
  }

  // Secondary grouped background
  static var expoSecondarySystemGroupedBackground: Color {
    return Color(UIColor.secondarySystemGroupedBackground)
  }

  // System gray color
  static var expoSystemGray: Color {
    return Color(UIColor.systemGray)
  }

  // System gray 6 (lightest gray in light mode, darkest in dark mode)
  static var expoSystemGray6: Color {
    return Color(UIColor.systemGray6)
  }
}
`;

const withExpoColorFix = (config) => {
  return withDangerousMod(config, [
    "ios",
    async (config) => {
      const projectRoot = config.modRequest.projectRoot;
      const iosPath = path.join(projectRoot, "ios");
      const appName = config.modRequest.projectName || config.name;
      const appPath = path.join(iosPath, appName.replace(/[^a-zA-Z0-9]/g, ""));

      // Try multiple possible locations
      const possiblePaths = [
        path.join(appPath, "ExpoColors.swift"),
        path.join(iosPath, "ExpoColors.swift"),
        path.join(iosPath, appName, "ExpoColors.swift"),
      ];

      // Wait for iOS folder to be created (by other plugins/prebuild)
      if (fs.existsSync(iosPath)) {
        // Create in the app folder if it exists, otherwise in ios root
        let targetPath = possiblePaths[1]; // default to ios root
        for (const p of possiblePaths) {
          const dir = path.dirname(p);
          if (fs.existsSync(dir)) {
            targetPath = p;
            break;
          }
        }

        fs.writeFileSync(targetPath, EXPO_COLORS_SWIFT);
        console.log(\`✅ Created ExpoColors.swift at \${targetPath}\`);
      }

      return config;
    },
  ]);
};

module.exports = withExpoColorFix;
