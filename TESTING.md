# Hasil pengujian - 17 November 2026

Catatan: dokumen ini merekam pengujian awal (104 API / 53 browser / 4 filter).
Audit penuh berikutnya dan status regresi terbaru dicatat terpisah dalam
[FULL_SYSTEM_QA_REPORT_2026-11-17.md](FULL_SYSTEM_QA_REPORT_2026-11-17.md).

Status akhir: seluruh pengujian yang dijalankan lulus setelah perbaikan.

| Pengujian | Hasil |
| --- | --- |
| Laravel API, validasi, kebijakan akses, skema dan PDF | 104 tes lulus, 309 assertions |
| Browser untuk admin dan manager | 53 dari 53 skenario lulus |
| Filter rekening dan vendor untuk kedua role | 4 dari 4 pemeriksaan lulus |
| Build frontend | Berhasil |
| Logo, cap dan tanda tangan asli di port 8001 | 3 gambar mengembalikan HTTP 200, image/png |

## Perbaikan

- Membuat `public/storage` yang mengarah ke `storage/app/public`.
- URL file publik memakai `/storage`, sehingga gambar mengikuti host dan port
  halaman, termasuk port 8001.
- Email pengguna yang opsional pada form sekarang juga boleh kosong di database.
  Migration sudah diterapkan pada database aplikasi.
- Menambahkan tombol Terbitkan pada detail draft invoice untuk admin.
- Mendaftarkan route login agar halaman cetak yang kehilangan sesi mengarah ke
  login tanpa error server.
- Memperbaiki perbandingan ID pada filter rekening pemasukan dan vendor pengeluaran.
- Menyesuaikan pilihan reset penomoran dengan kebijakan berurutan yang didukung backend.
- Frontend sudah dibangun ulang.

## Cakupan kedua role

| Area | Admin / Finance | Pimpinan / Manager |
| --- | --- | --- |
| Login, pemulihan sesi saat refresh, logout, halaman terlindungi | Lulus | Lulus |
| Dashboard dan seluruh halaman yang diizinkan | Lulus | Lulus |
| Master data klien, vendor, produk/layanan, rekening | Tambah, edit, cari, status lulus | Baca lulus; larangan menulis diuji API |
| Perusahaan dan gambar | Unggah tiga gambar, simpan, refresh lulus | Baca dan tampilan gambar lulus |
| Template dan penomoran | Baca dan simpan lulus | Baca; larangan menulis diuji API |
| Pengguna | Tambah dan edit, termasuk tanpa email, lulus | Akses ditolak dan route dialihkan |
| Invoice | Draft, edit, terbitkan, batalkan, preview, unduh lulus | Baca, preview, unduh/cetak lulus; create/edit diblokir |
| Pembayaran | Sebagian sampai lunas lulus; validasi kelebihan pembayaran diuji API | Baca lulus; penulisan ditolak API |
| Pemasukan dan pengeluaran | Tambah, edit dan filter lulus | Baca dan filter lulus; penulisan ditolak API |
| Laporan | Lima tab, rentang tanggal dan pencarian lulus | Lima tab, rentang tanggal dan pencarian lulus |
| Dashboard pada viewport 390 x 844 | Tanpa overflow horizontal | Tanpa overflow horizontal |
| JavaScript exception dan HTTP 500 selama putaran browser akhir | Tidak ditemukan | Tidak ditemukan |

File PDF sampel dari kedua role berhasil dibuka dan dirender menjadi gambar.
Tata letak satu halaman, gambar, tabel, total dan area tanda tangan diperiksa visual.

## Lingkungan dan bukti

- Windows, Microsoft Edge headless melalui Playwright.
- Pengujian API memakai SQLite di memori; browser memakai database SQLite terpisah
  `storage/app/browser-testing.sqlite`, server port 8018, dan cookie sesi khusus.
- CSRF tetap aktif pada server browser. Database aplikasi tidak digunakan untuk
  transaksi percobaan. Perbaikan skema email diterapkan melalui migration biasa.
- JSON hasil, screenshot dan PDF sampel tersedia di
  `storage/app/browser-test-results/` pada workspace lokal.
- Cakupan ini adalah pengujian fungsional lokal, pemeriksaan akses kedua role,
  dan sampel tampilan desktop/mobile; tidak mencakup uji beban atau hosting produksi.

## Menjalankan ulang

```powershell
php artisan test
npm run build
powershell -NoProfile -File tests/browser/run.ps1
```

Runner browser memeriksa isolasi database sebelum mengatur ulang data pengujian,
serta menghentikan server pengujiannya ketika selesai. Penjelasan tambahan ada di
`tests/browser/README.md`.
