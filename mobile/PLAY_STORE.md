# TSCS Telekom — Play Store Readiness

## App identity
- App name: TSCS Telekom
- Package: `id.tscstelekom.app`
- Version: `1.0.0`
- Android versionCode: `1`
- Production artifact: Android App Bundle (`.aab`)
- Privacy Policy: https://tscs-telecom.vercel.app/privacy

## Already configured
- Expo SDK 57 / React Native 0.86
- Production EAS profile uses `app-bundle`
- Android package identifier
- Versioning
- Dark splash background
- Native screens for Home, Services, Network, and Contact
- No custom Android permissions added

## Before first Play Store submission
1. Build the production AAB with EAS.
2. Add the final 512x512 Play Store listing icon.
3. Add Android launcher/adaptive icon assets.
4. Prepare phone screenshots for the Play Store listing.
5. Complete the Play Console Data Safety form.
6. Complete store listing title, short description, full description, category, and contact details.
7. Configure Google Play App Signing on the first release.
8. Test the release build on physical Android devices.
9. Upload the AAB to a testing track before production release.

## Build
```bash
cd mobile
npm install
npx expo-doctor
eas build --platform android --profile production
```

The EAS build output is the `.aab` file uploaded to Google Play Console.
