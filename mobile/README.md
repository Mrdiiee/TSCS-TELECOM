# TSCS Telekom Android

Aplikasi Android TSCS Telekom menggunakan frontend TSCS yang sudah berjalan di Vercel, sehingga website dan aplikasi berbagi konten serta backend yang sama.

## Development

```bash
cd mobile
npm install
npx expo start
```

## APK untuk pengujian

```npx eas build --platform android --profile preview```

## Google Play

```npx eas build --platform android --profile production```

Build production menghasilkan Android App Bundle (AAB) untuk distribusi melalui Google Play.

## Catatan

- URL utama aplikasi: https://tscs-telecom.vercel.app
- Package Android: id.tscstelekom.app
- Versi awal: 1.0.0
