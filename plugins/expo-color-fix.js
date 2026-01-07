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

// First plugin: Create the Swift file
const withExpoColorFile = (config) => {
  return withDangerousMod(config, [
    "ios",
    async (config) => {
      const projectRoot = config.modRequest.projectRoot;
      const projectName = config.modRequest.projectName || config.name;
      const sanitizedName = projectName.replace(/[^a-zA-Z0-9]/g, "");
      const iosPath = path.join(projectRoot, "ios");
      const appPath = path.join(iosPath, sanitizedName);

      // Create the file in the app directory
      const targetPath = path.join(appPath, "ExpoColors.swift");

      if (fs.existsSync(appPath)) {
        fs.writeFileSync(targetPath, EXPO_COLORS_SWIFT);
        console.log("✅ Created ExpoColors.swift at " + targetPath);
      } else {
        // Fallback to ios root
        const fallbackPath = path.join(iosPath, "ExpoColors.swift");
        fs.writeFileSync(fallbackPath, EXPO_COLORS_SWIFT);
        console.log("✅ Created ExpoColors.swift at " + fallbackPath);
      }

      return config;
    },
  ]);
};

// Second plugin: Add the Swift file to Xcode project
const withExpoColorXcode = (config) => {
  return withXcodeProject(config, async (config) => {
    const xcodeProject = config.modResults;
    const projectName = config.modRequest.projectName || config.name;
    const sanitizedName = projectName.replace(/[^a-zA-Z0-9]/g, "");

    // Find the main group (app target group)
    const mainGroup = xcodeProject.getFirstProject().firstProject.mainGroup;

    // Get all PBXGroup entries
    const pbxGroupSection = xcodeProject.hash.project.objects["PBXGroup"];

    // Find the app group by name
    let appGroupKey = null;
    for (const key in pbxGroupSection) {
      const group = pbxGroupSection[key];
      if (group && typeof group === "object" && group.name === sanitizedName) {
        appGroupKey = key;
        break;
      }
      // Also check path
      if (group && typeof group === "object" && group.path === sanitizedName) {
        appGroupKey = key;
        break;
      }
    }

    // Add the Swift file to the project
    const filePath = sanitizedName + "/ExpoColors.swift";

    try {
      // Add file reference
      const file = xcodeProject.addSourceFile(
        filePath,
        { target: xcodeProject.getFirstTarget().uuid },
        appGroupKey
      );

      if (file) {
        console.log("✅ Added ExpoColors.swift to Xcode project build phases");
      }
    } catch (e) {
      console.log("⚠️ Could not add file to Xcode project (may already exist): " + e.message);
    }

    return config;
  });
};

// Combined plugin
const withExpoColorFix = (config) => {
  config = withExpoColorFile(config);
  config = withExpoColorXcode(config);
  return config;
};

module.exports = withExpoColorFix;
