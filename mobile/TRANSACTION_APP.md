# TSCS Telekom Mobile — Transaction Platform

Versi ini mengubah aplikasi dari company profile menjadi marketplace transaksi TSCS.

## Alur pelanggan
Rumah/Bisnis → Promo → Paket Populer → Cek Ketersediaan → Detail Paket → Prabayar/Pascabayar → Checkout → Pesanan → Tagihan → Akun.

## Backend
Supabase dipakai untuk Auth, Database, Storage/asset metadata, dan Realtime-ready architecture. Set environment:
- EXPO_PUBLIC_SUPABASE_URL
- EXPO_PUBLIC_SUPABASE_ANON_KEY

Schema awal ada di `supabase/tscs_transaction_schema.sql`.

## Catatan
Payment UI sudah menyiapkan QRIS, Virtual Account, dan E-Wallet, tetapi transaksi uang nyata belum boleh dianggap aktif sampai payment gateway TSCS dikonfigurasi. Jangan menguji pembayaran nyata dengan data produksi sebelum gateway dan webhook disiapkan.
