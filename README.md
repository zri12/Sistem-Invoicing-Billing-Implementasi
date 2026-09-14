# Sistem Invoicing & Billing

Sistem internal PT. Ruang Kreasi Aplikasi untuk mengelola invoice, billing,
pembayaran, pemasukan, pengeluaran, dan laporan kas sederhana.

## Fitur

- Dashboard ringkasan keuangan dan status invoice.
- Master data klien, vendor, produk atau layanan, serta rekening.
- Pembuatan, penerbitan, preview, unduh PDF, dan cetak invoice.
- Pencatatan billing serta pembayaran penuh atau sebagian.
- Pencatatan pemasukan dan pengeluaran.
- Laporan invoice, pembayaran, pemasukan, pengeluaran, dan buku kas.
- Pengaturan profil perusahaan, template invoice, penomoran, dan pengguna.

## Teknologi

- PHP 8.2 dan Laravel 12
- MySQL
- Vue 3, Vue Router, dan Pinia
- Vite dan Tailwind CSS

## Struktur

```text
app/        Aplikasi Laravel
config/     Konfigurasi aplikasi
database/   Migration, factory, dan seeder
public/     Dokumen publik, font, aset invoice, dan hasil build
resources/  Source Vue dan Blade
routes/     Route web dan API
storage/    Cache, log, serta file aplikasi
tests/      Pengujian aplikasi
```

## Menjalankan secara lokal

```bash
composer install
npm install
copy .env.example .env
php artisan key:generate
```

Atur koneksi database pada `.env`, lalu jalankan migration dan build frontend:

```bash
php artisan migrate --seed
npm run build
php artisan serve
```

## Pengujian

```bash
php artisan test
```

## Deployment

Source Laravel ditempatkan pada root aplikasi. Isi folder `public/` harus
menjadi document root domain. Setelah memperbarui source, jalankan `npm run
build` dan salin hasil `public/build/` ke document root.

File `.env`, folder `vendor/`, cache aplikasi, dan file unggahan tidak
disimpan sebagai source repository.
