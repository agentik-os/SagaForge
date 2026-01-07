// Dynamic Expo configuration
// When EXPO_NO_DEV_CLIENT=1, excludes expo-dev-client plugin to avoid SDK 53 Color extension bug

const isDevClient = process.env.EXPO_NO_DEV_CLIENT !== "1";

const plugins = [
  "expo-router",
  [
    "expo-build-properties",
    {
      ios: {
        deploymentTarget: "15.1",
      },
    },
  ],
];

// Only include expo-dev-client when not disabled
if (isDevClient) {
  plugins.push("expo-dev-client");
  plugins.push("./plugins/expo-color-fix.js");
}

module.exports = {
  expo: {
    name: "SagaForge",
    slug: "sagaforge",
    scheme: "sagaforge",
    owner: "agentik",
    version: "1.0.0",
    orientation: "portrait",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.agentikos.sagaforge",
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
      },
    },
    android: {
      edgeToEdgeEnabled: true,
      package: "com.agentikos.sagaforge",
    },
    plugins: plugins,
    experiments: {
      typedRoutes: true,
    },
    extra: {
      eas: {
        projectId: "678d21f5-1327-4e43-9976-07e20d91f0e1",
      },
      router: {},
    },
  },
};
