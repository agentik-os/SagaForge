# SagaForge

## Overview
Application mobile React Native / Expo pour la création et gestion de sagas narratives. Projet personnel AgentikOS.

## Git Identity
- **Email:** x@agentik-os.com
- **Name:** AgentikOS
- **GitHub:** https://github.com/agentik-os/SagaForge

## Current Status
- ✅ Projet importé depuis VibeCode
- ✅ Repository GitHub créé
- ✅ EAS configuré avec project ID
- 🔄 Build development-simulator en cours
- ⏳ Build development (device) en attente de credentials Apple

## Tech Stack
| Component | Technology | Version |
|-----------|------------|---------|
| **Framework** | Expo | SDK 53 |
| **UI** | React Native | 0.79.6 |
| **Styling** | NativeWind + Tailwind | v3 |
| **Animations** | react-native-reanimated | v3 |
| **Gestures** | react-native-gesture-handler | - |
| **Icons** | lucide-react-native | - |
| **State** | React Query | - |
| **Package Manager** | bun | - |

## Expo / EAS Configuration

### EAS Project
- **Owner:** agentik
- **Project ID:** 678d21f5-1327-4e43-9976-07e20d91f0e1
- **Slug:** sagaforge

### Bundle Identifiers
- **iOS:** com.agentikos.sagaforge
- **Android:** com.agentikos.sagaforge

### Apple Developer
- **Apple ID:** simono.gareth@gmail.com
- **Team ID:** 975755H4ZC

### Build Profiles
| Profile | Distribution | Usage |
|---------|-------------|-------|
| `development` | internal | Device testing avec dev client (requires Apple auth) |
| `development-simulator` | internal | Simulator testing (no Apple auth needed) |
| `preview` | internal | Beta testing |
| `production` | store | App Store release |

## Key Files & Structure
```
src/
├── app/           # Expo Router pages
├── components/    # Reusable UI components
└── lib/           # Utilities (cn.ts, etc.)
```

## Important Notes

### VibeCode Environment Rules (from original CLAUDE.md)
- **DO NOT**: manage git, touch the dev server, or check its state
- User views the app through Vibecode App
- Use URLs from unsplash.com for images
- For Expo SDK packages you don't know, check `/home/hacker/.claude/skills/expo-docs/`

### Building for Device (requires 2FA)
Le build iOS pour device (`development` profile) nécessite une authentification Apple avec 2FA.
Deux options :
1. **Depuis ton terminal local** : Clone le repo et lance `bunx eas build --profile development --platform ios`
2. **Simulator** : Utilise `bunx eas build --profile development-simulator --platform ios` (pas de credentials nécessaires)

## Commands

### Development
```bash
# Start dev server (VPS)
bun start

# Start with tunnel (for remote device)
npx expo start --tunnel --dev-client
```

### Builds
```bash
# iOS Simulator (no Apple credentials)
bunx eas build --profile development-simulator --platform ios

# iOS Device (requires Apple 2FA)
bunx eas build --profile development --platform ios

# Production
bunx eas build --profile production --platform ios
```

### List Builds
```bash
bunx eas build:list --platform ios --limit 5
```

## Current Builds

### Simulator Build (in progress)
- **ID:** 693982e2-650e-4664-bc18-7a4827f4beb8
- **URL:** https://expo.dev/accounts/agentik/projects/sagaforge/builds/693982e2-650e-4664-bc18-7a4827f4beb8

---
*Last updated: 2026-01-07*
