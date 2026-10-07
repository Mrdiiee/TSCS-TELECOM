# TSCS Telekom Android — Native Mobile UI

Versi ini menggunakan React Native untuk navigasi utama dan layar mobile, sementara halaman detail dan formulir yang sudah ada di website TSCS tetap dapat dibuka dari aplikasi.

## Fitur
- Beranda mobile TSCS
- Bottom navigation: Beranda, Layanan, Jaringan, Kontak
- Kartu layanan native
- Visual jaringan native ringan
- Deep-link ke halaman detail TSCS
- Konsultasi dan email
- Siap dikembangkan menjadi login pelanggan, tiket gangguan, notifikasi, dan dashboard

## Build
npm install
npx expo start
npx eas build --platform android --profile preview
npx eas build --platform android --profile production
