#!/usr/bin/env node
/**
 * Script to remove expo-dev-client before iOS build
 * This is a workaround for Expo SDK 53 Color extension bug
 * in expo-dev-menu and expo-dev-launcher
 */

const fs = require("fs");
const path = require("path");

console.log("🔧 Removing expo-dev-client to avoid SDK 53 Color bug...");

// Read package.json
const packageJsonPath = path.join(process.cwd(), "package.json");
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

// Remove expo-dev-client from dependencies
if (packageJson.dependencies && packageJson.dependencies["expo-dev-client"]) {
  delete packageJson.dependencies["expo-dev-client"];
  console.log("✅ Removed expo-dev-client from dependencies");
}

// Write back package.json
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + "\n");

// Remove from node_modules if it exists
const packagesToRemove = [
  "expo-dev-client",
  "expo-dev-menu",
  "expo-dev-launcher",
];

for (const pkg of packagesToRemove) {
  const pkgPath = path.join(process.cwd(), "node_modules", pkg);
  if (fs.existsSync(pkgPath)) {
    fs.rmSync(pkgPath, { recursive: true, force: true });
    console.log(`✅ Removed ${pkg} from node_modules`);
  }
}

console.log("✅ expo-dev-client removal complete");
