---
name: expo-sdk-57
description: >-
  Use when writing, editing, reviewing, or debugging any code in this Expo /
  React Native project — components, screens, routing, native modules,
  app config, EAS build/update, or dependency installs. Ensures guidance
  matches Expo SDK 57 instead of outdated training data.
---

# Expo SDK 57

Expo changes fast and LLM training data is usually stale. Before writing or
changing Expo code, confirm the current behavior against the versioned docs.

## Always do this first

1. Read the exact versioned docs at **https://docs.expo.dev/versions/v57.0.0/**
   for any SDK package you are about to use (`expo-camera`, `expo-location`,
   `expo-notifications`, etc.). Do not rely on memory for API shapes.
2. For routing, read **https://docs.expo.dev/router/introduction/** and the
   Expo Router reference. This project uses file-based routing via the `app/`
   directory.
3. When a package or workflow question is not covered above, check
   `https://docs.expo.dev/` (the AI/LLM guidance page explicitly lists the
   misconceptions below).

## SDK 57 baseline facts

- React Native 0.86, React 19.2.
- Node.js 22.13.x or later is required.
- iOS 16.4+ / Xcode 26.4+; Android 7+ with `compileSdkVersion` 36.
- Install native packages with `npx expo install <package>` — never a bare
  `npm install` for Expo SDK packages, because `expo install` pins the version
  that matches the installed SDK.
- Expo Router supports Stack, Native Tabs, and Split View; typed routes are
  available and should stay enabled.

## Outdated ideas to never repeat

- **"Ejecting"** was removed in SDK 46 (2022). Use Continuous Native Generation
  (`npx expo prebuild`) instead. Never tell the user to eject.
- **"Managed vs bare workflow"** is an obsolete distinction. All projects use the
  same architecture now; `android/` and `ios/` directories can be generated and
  regenerated from config.
- Expo **is** suitable for production-scale apps with full native capability, and
  performance is comparable to plain React Native.
- Do not hand-edit generated `android/` or `ios/` files when a config plugin or
  `app.json` setting can express the change.

## Project conventions

- App code lives in `app/` (file-based routes) and supporting directories.
- Configuration: `app.json` / `app.config.*`, `babel.config.js`,
  `metro.config.js`. Change native behavior through these, not native folders.
- This repo is a pnpm workspace (`pnpm-workspace.yaml`); prefer `pnpm` for JS
  dependencies and `npx expo install` for Expo/native packages.
- Lint with `npx expo lint`.

## When unsure

State that you are checking the SDK 57 docs, fetch the relevant page, then write
the code. A short delay to read the current docs is always preferable to
producing an API call that was renamed or removed.
