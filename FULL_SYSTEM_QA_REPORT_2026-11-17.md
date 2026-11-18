# FULL SYSTEM END-TO-END QA REPORT — 17 NOVEMBER 2026

Project: Sistem Invoicing & Billing, PT. Ruang Kreasi Aplikasi.
Tanggal bisnis skenario: 17 November 2026, Asia/Jakarta. Eksekusi pengembangan
dan pengujian berlanjut pada 18 November 2026.

## 1. Overall Status

**BELUM PASS PENUH.** Regresi browser lengkap belum menghasilkan hasil bersih:
satu putaran mencapai pemeriksaan jaringan akhir dengan dua permintaan GET yang
dibatalkan saat navigasi; putaran berikutnya mengalami timeout simpan pengeluaran,
dan pengulangan kasus tersebut lulus. Putaran terakhir dihentikan sebelum selesai.
Penyebab timeout intermiten belum dipastikan. Database aplikasi tidak digunakan
untuk fixture QA.

## 2. Automated Test Summary

Regresi Laravel terbaru: **137 tes / 622 assertions lulus**; build frontend lulus.
Pemeriksaan cetak laporan terpisah lulus untuk lima jenis laporan pada kedua
role, termasuk laporan kosong dan data multipage. Hasil ini belum merupakan
full-system PASS.

## 3. CRUD Coverage

| Modul | Operasi yang diuji | Lifecycle penghapusan |
| --- | --- | --- |
| Klien, vendor, produk/layanan, rekening | Tambah, baca, edit, status, cari/filter, pagination, refresh | Aktif/nonaktif |
| Invoice | Draft, baca, edit, terbitkan, edit published, preview/PDF | Cancel; pembayaran melarang cancel |
| Pembayaran | Catat, baca, sebagian/lunas, validasi, ledger | Tidak tersedia edit/delete |
| Pemasukan | Tambah/edit manual; baca otomatis dari pembayaran | Tidak tersedia delete |
| Pengeluaran | Tambah, baca, edit, bukti, jenis transaksi | Tidak tersedia delete |
| Perusahaan/template/penomoran | Baca dan ubah konfigurasi yang tersedia | Tidak berlaku |
| Pengguna | Tambah, baca, edit, status, validasi | Aktif/nonaktif |
| Billing/dashboard/laporan | Baca, filter, rincian, pembanding keuangan | Tampilan turunan, bukan CRUD mandiri |

Delete tidak termasuk lifecycle module ini; sistem menggunakan status/cancel
sesuai business rule. Tidak ditambahkan fitur delete, sort, atau filter baru
yang tidak tersedia pada desain saat ini.

## 4. Authentication

Login valid/tidak valid, akun nonaktif, sesi setelah refresh, tab baru, logout,
back/forward, dan sesi yang dihapus diuji. CSRF tetap aktif pada browser runner.
Respons sesi dan data keuangan memakai `private, no-store` agar navigasi history
tidak menggunakan hasil autentikasi HTTP cache yang usang.

## 5. Authorization

Admin melakukan mutasi. Manager membaca halaman yang diizinkan. Suite memanggil
endpoint mutasi secara langsung dengan role manager dan menuntut HTTP 403 serta
snapshot database tidak berubah. Guest menuntut 401; URL cetak mengarah ke login.
Pemeriksaan akses manager dan guest lulus pada putaran yang mencapai pemeriksaan
jaringan akhir; keseluruhan putaran tersebut tetap gagal karena dua GET dibatalkan.

## 6. Master Data

Empat modul menggunakan semua field form yang tersedia, termasuk nilai dengan
apostrof, ampersand, slash, dan tanda kurung. Perubahan status pada form kini
dipersistensikan. Riwayat transaksi tetap membaca master yang nonaktif, tetapi
selector transaksi baru hanya menawarkan master aktif. Nama produk pada item
invoice merupakan snapshot dan dipertahankan saat master berubah.

## 7. Invoice Lifecycle

Draft tidak masuk Billing dan tidak membuat pemasukan. Terbitkan mempertahankan
nomor; edit published mempertahankan status dan nomor. Total hasil edit tidak
boleh lebih kecil daripada pembayaran yang sudah tercatat. Item majemuk,
kuantitas, diskon, penambahan/penghapusan baris, validasi field, serta cancel
dicakup. Nomor historis tidak berubah setelah konfigurasi penomoran diganti.

## 8. Billing

Matriks draft, unpaid, partial, paid, overdue, cancelled diuji. Draft/cancelled
tidak ditampilkan di Billing. Jatuh tempo hari ini belum overdue; batas tanggal
menggunakan hari bisnis Asia/Jakarta. Invoice dengan diskon 100% dianggap lunas
tanpa menciptakan pembayaran/pemasukan palsu.

## 9. Payment

Invoice Rp10 juta diuji dengan Rp3 juta + Rp2 juta + Rp5 juta. Rp6 juta ketika
sisa Rp5 juta dan tambahan Rp1 setelah lunas ditolak tanpa perubahan ledger.
Setiap pembayaran menghasilkan tepat satu pemasukan terkait. Kegagalan saat
membuat pemasukan membatalkan pembayaran dalam transaksi database yang sama.
Perbandingan nominal memakai satuan sen; kasus 0,10 + 0,20 tidak gagal akibat
floating point. Dua worker Rp800 ribu melawan Rp1 juta menghasilkan 201 dan 422.

## 10. Income

Pemasukan manual diuji tambah/edit semua field, sumber khusus, refresh, serta
cashbook debit. Pemasukan invoice berasal dari respons atomik pembayaran dan
langsung memperbarui cache SPA. Pemasukan otomatis tidak dapat diedit sebagai
pemasukan manual. Klik cepat dua kali telah diuji menghasilkan satu operasi.

## 11. Expense

Cash, QRIS, Credit, Transfer diuji dengan bukti dan pembanding kredit cashbook.
Transfer wajib memiliki rekening tujuan. Edit Transfer → Cash mengosongkan
tujuan, lalu kembali Transfer mewajibkan tujuan lagi. Vendor/referensi/catatan
opsional dapat benar-benar dikosongkan saat edit. File invalid tidak menambah
transaksi. Klik cepat dua kali telah diuji menghasilkan satu operasi.

## 12. Reports

Lima tab: buku kas, invoice, pembayaran, pemasukan, pengeluaran. Filter tanggal,
rekening, pencarian, pagination, dan rentang tidak valid dicakup. Debit, kredit,
saldo, jumlah baris dibandingkan dengan API dan snapshot database. Tanggal akhir
bersifat inklusif, termasuk representasi DATE SQLite dengan waktu 00:00:00.
Filter vendor yang tersedia diuji oleh suite filter kedua role.

## 13. Dashboard

Bulan Ini, 3 Bulan Terakhir, Tahun Ini dibandingkan dengan database untuk jumlah
invoice, outstanding, pemasukan, pengeluaran, jumlah bulan grafik, dan daftar
invoice terbaru. Tahun Ini kini mulai Januari tahun berjalan. Data pembatas
mencakup Desember tahun sebelumnya, Januari, bulan sebelumnya, dan awal bulan.

## 14. Settings

Perusahaan: semua field, tiga unggahan, byte file melalui HTTP, simpan, edit,
refresh. Template: 17 toggle preview/API/database/refresh. Penomoran: opsi
format yang didukung, nomor baru mengikuti format, nomor lama tetap. Status
17 toggle browser setelah perbaikan helper snapshot: pending full rerun.

## 15. Users

Suite mencakup tambah, email kosong, email/password invalid, username duplikat,
edit nama/username/email/role/status, toggle aktif/nonaktif dan login nonaktif.
Admin tidak dapat menonaktifkan diri atau mengganti dirinya menjadi manager.
Status browser final: pending.

## 16. PDF / Print

Unduhan dibandingkan dengan data invoice saat unduh. PyMuPDF memeriksa A4,
teks lintas halaman, aset, clipping, serta overlap penanda tangan dan merender
setiap halaman ke PNG. Dokumen panjang mengikuti aliran konten; nomor halaman
dinamis. Render pengembangan invoice panjang 3 halaman sudah diperiksa visual.
Pemeriksaan PDF admin/manager final: pending.

## 17. Responsive

Matriks 1920×1080, 1366×768, 1024×768, 768×1024, 390×844 mencakup 17 halaman
admin, sidebar, modal Transfer/Cash, dan login. Status: sedang dijalankan.

## 18. Browser Health

Setiap request dicatat; status negatif yang memang diuji ditandai terpisah.
JavaScript exception, console error, requestfailed, HTTP 500, dan respons gagal
tak terduga harus nol pada regresi final. Hasil final: pending.

## 19. Database Integrity

Pemeriksaan mencakup foreign keys, nomor invoice unik, subtotal/diskon/total,
jumlah pembayaran tidak melebihi total, tepat satu income per payment, kesamaan
tanggal/nominal/rekening/invoice, pemasukan manual tanpa payment/invoice, serta
tujuan pengeluaran sesuai jenis. Pemeriksaan final: pending.

## 20. Bugs Found

Hasil kolom regresi di bawah adalah pemeriksaan pengembangan/affected test.
Semua perbaikan masih menunggu gerbang browser bersih final pada bagian 24.

| ID / prioritas | Modul dan reproduksi | Akar masalah → perbaikan | Regresi |
| --- | --- | --- | --- |
| QA01 / P1 | Master: pilih nonaktif saat tambah/edit; nilai hilang setelah refresh | Payload dan validasi membuang status → empat mapper/request/controller menyimpan status | API data provider empat master; browser CRUD lulus |
| QA02 / P0 | Invoice: bayar Rp8 juta lalu turunkan total menjadi Rp1 juta | Edit tidak membatasi total terhadap ledger → re-read dengan lock, tolak total di bawah pembayaran | `test_invoice_edit_cannot_reduce_total_below_recorded_payments`, lulus |
| QA03 / P1 | Ubah master produk lalu edit header invoice lama | Item dibangun ulang memakai nama master terbaru → ID item mempertahankan snapshot produk yang sama | Regresi snapshot API dan browser riwayat lulus |
| QA04 / P1 | Payment tercatat, daftar pemasukan SPA yang sudah dibuka tetap usang | Store pembayaran tidak menyinkronkan income → API mengembalikan pasangan income atomik, store menduplikasi berdasarkan ID | Golden browser dengan cache pemasukan dipanaskan, lulus |
| QA05 / P1 | Total 0,30 dibayar 0,10 lalu 0,20 ditolak | Perbandingan sisa float → bandingkan integer sen, bulatkan ringkasan | Regresi nominal sen API lulus |
| QA06 / P1 | Ubah status pengguna melalui form edit, refresh kembali aktif | Request/mapper update tidak memuat status → persist status dan validasi proteksi diri pada PUT | API pengguna lulus; browser final pending. Sebelumnya status diabaikan, bukan bypass self-disable yang berhasil |
| QA07 / P1 | Isi sumber manual khusus lalu buka edit; muncul `manual` | Provenance dan field sumber memakai properti sama → pisahkan `source`/`sourceDetail` | Browser manual income seluruh field lulus |
| QA08 / P1 | Kosongkan vendor/referensi/catatan pengeluaran saat edit | Field kosong tidak dikirim melalui FormData → kirim string kosong agar dinormalisasi menjadi null | Browser edit Transfer/Cash/Transfer dan DB lulus |
| QA09 / P1 | Laporan sampai tanggal transaksi tidak memuat transaksi hari terakhir | DATE SQLite berisi waktu dibandingkan dengan string tanggal → gunakan `whereDate` untuk kedua batas | API dan lima tab laporan browser lulus |
| QA10 / P1 | Data di atas 100/200 hilang saat login/refresh | Bootstrap dibatasi dan daftar hanya mengambil satu halaman API → hilangkan batas bootstrap, ikuti seluruh meta pagination | API 105 klien/205 income lulus; volume browser final pending |
| QA11 / P1 | Beberapa worker membuat invoice bersamaan menghasilkan database locked | SQLite tidak memiliki row lock dan transaksi deferred berlomba → IMMEDIATE dengan busy timeout | Empat worker nomor unik dan dua worker pembayaran lulus; log sebelum fix disimpan |
| QA12 / P1 | Transaksi baru mengacu master nonaktif melalui API | Exists rule hanya memeriksa ID → syarat aktif untuk referensi baru; edit invoice historis mengizinkan referensi lama | Regresi API nonaktif dan browser selector/riwayat lulus |
| QA13 / P1 | Invoice diskon penuh ditampilkan belum lunas | Ringkasan mensyaratkan pembayaran positif → total nol dianggap settled tanpa income | Regresi API lulus |
| QA14 / P2 | Ubah/toggle klien/vendor yang memiliki transaksi; hitungan riwayat menjadi nol | Respons mutasi tidak memuat relation count → `loadCount` pada respons | Regresi API history counts lulus |
| QA15 / P2 | ID relasi hasil form string berbeda tipe setelah reload | Model tidak meng-cast FK → integer casts konsisten | Regresi create/reload API lulus; filter browser lulus |
| QA16 / P1 | Sesudah tengah malam Jakarta, backend belum overdue | Pembandingan hari UTC → hari bisnis terkonfigurasi Asia/Jakarta | Regresi UTC 18:00 = Jakarta esok hari lulus |
| QA17 / P2 | Matikan Total; label Total Due atas masih tampak | Flag hanya diterapkan ke ringkasan bawah → kondisi pada kedua lokasi UI/PDF | Regresi template API lulus; 17 toggle browser final pending |
| QA18 / P1 | PDF banyak item/terms panjang menimpa area penanda tangan | Signature fixed terlepas dari tinggi konten → flow untuk dokumen panjang dan tinggi bingkai cukup | PDF 2/3 halaman: teks/aset/overlap dan visual pengembangan lulus |
| QA19 / P2 | PDF halaman kedua masih bernomor 1 | Footer angka literal → page text `{PAGE_NUM}` dari canvas | Render 3 halaman menampilkan 1, 2, 3 |
| QA20 / P1 | Dashboard Tahun Ini ikut memasukkan Desember tahun lalu | Menggunakan rolling 12 bulan → Januari sampai bulan berjalan | Browser selisih Rp20 ribu sebelum fix; pembanding DB sesudah fix lulus |
| QA21 / P2 | Filter rekening pembayaran kosong; Bulan Lalu tidak bekerja | ID number/string dibandingkan strict; cabang periode belum ada → normalisasi ID dan hitung bulan sebelumnya | Browser filter/search/detail lulus |
| QA22 / P2 | Nonaktifkan vendor/rekening; transaksi lama menampilkan `-` | Lookup display memakai koleksi aktif → display seluruh master; selector tetap aktif | Browser history setelah deactivation lulus |
| QA23 / P1 | Klik Simpan pemasukan dua kali cepat menciptakan dua baris; pola sama pada pengeluaran | Tidak ada pengunci proses simpan → guard `saving`, disabled/loading, finally reset | Empat rapid-submit browser (income/expense/invoice/payment) lulus setelah perbaikan |
| QA24 / P1 | Logout lalu Back memunculkan layout admin usang dan request data 401 | Hasil `/me` dapat dipulihkan dari HTTP cache; bfcache juga membawa state lama → `private,no-store` untuk JSON sukses dan revalidasi halaman bfcache | Regresi header API lulus; browser logout/back/forward sesudah fix lulus |
| QA25 / P2 | Lebar 1024: template +72 px; 390: form +336 px, detail +286 px | Grid item mengikuti min-content tabel; header detail terlalu rapat → `min-w-0`, scroll di kontainer, header mobile bertumpuk | Browser 390/768/1024 sesudah fix lulus; matriks final pending |
| QA26 / P2 | PDF dengan satu deskripsi panjang menampilkan header tabel pada halaman sebelumnya | Baris Dompdf dipindahkan sendiri saat ruang tidak cukup → `page-break-inside: avoid` menjaga tabel yang muat satu halaman tetap bersama | Checker gagal pada PDF lama; probe read-only sesudah fix dan render visual lulus; final browser/PDF pending |

Masalah pada harness dipisahkan dari bug produk: normalisasi snapshot sempat
mengenali boolean `show_invoice_date` sebagai DATE; pemeriksaan diperketat ke
string tanggal. Opsi clock Playwright semula tidak sesuai API; kini menggunakan
`setFixedTime` dan assertion tanggal browser. Perbedaan tipe DECIMAL string API
dengan angka database dinormalisasi secara eksplisit. Kegagalan helper tersebut
tidak dihitung sebagai bug aplikasi. Bukti iterasi tersimpan di direktori logs.

## 21. Files Changed

Daftar path lengkap tercatat pada status Git bagian 25. Alasan perubahan:

| Kelompok file | Alasan |
| --- | --- |
| `app/Http/Requests/{Client,Vendor,ProductService,Account}/*Request.php` | Persist pilihan status; presisi harga/nominal |
| Request Invoice/Payment/Income/Expense/User | Presisi dua desimal, referensi master aktif, ID item historis, status pengguna |
| Controller master dan transaksi | Field status, history counts, urutan stabil, batas tanggal inklusif |
| `AuthController.php`, `Concerns/ApiResponses.php` | Bootstrap lengkap; respons keuangan/sesi tidak disimpan HTTP cache |
| `PaymentController.php`, `PaymentResource.php` | Mengembalikan income dari transaksi pembayaran yang sama |
| Model Invoice/InvoiceItem/Payment/Income/Expense | Cast foreign key konsisten |
| `InvoiceService.php` | Lock saat edit, batas total terhadap pembayaran, snapshot item, pembulatan |
| `PaymentService.php`, `BillingService.php`, `ReportService.php` | Sen eksak, status nol, hari bisnis, total dan tanggal laporan |
| `InvoicePdfService.php`, Blade PDF, `InvoiceDocument.vue` | Aset storage sesuai disk, cache terisolasi, nomor halaman, aliran tanda tangan, flag Total |
| `config/{app,database,filesystems,invoice,sanctum}.php`, `.env.example` | Hari bisnis, serialisasi transaksi SQLite, URL/direktori storage, konfigurasi lokal |
| `resources/js/services/*.js`, `stores/payment.js` | Semua halaman API, status, source detail, optional clear, FK/item, income cache |
| `resources/js/app.js` | Revalidasi halaman saat dipulihkan bfcache |
| Dashboard, PaymentList, IncomeList, ExpenseList | Periode/filter/history benar dan proses simpan terkunci |
| InvoiceForm, InvoiceDetail, Template | ID item unik dan kontainer responsif |
| Numbering, routes web, migration email nullable | Perbaikan yang sudah ada sebelum audit penuh; tetap disertakan dan diregresi |
| TestCase, feature tests, `tests/browser/*` | Guard isolasi sebelum reset, pembanding DB/API/UI, concurrency, PDF, kedua role |
| README, TESTING, laporan ini | Instruksi reproduksi, riwayat hasil, bukti dan batas pengujian |

`package-lock.json` sudah berubah sebelum audit dan tidak diedit oleh pekerjaan
QA ini. Tidak dilakukan reset working tree atau deploy selama audit.

## 22. Tests Added

`FullSystemIntegrityTest.php`: 19 metode dengan data provider menjadi 30 kasus
tambahan. Cakupannya meliputi status master, edit invoice setelah pembayaran,
snapshot, ledger atomik/rollback, nominal sen, invalid payload, role, unggahan,
penomoran, tanggal, volume, referensi nonaktif, total nol, FK, dan template.
`AuthTest.php` menambah dua kasus cache dan konsistensi urutan login/refresh.
Total suite naik dari 104 menjadi 137 kasus.

`full-system.cjs` menguji browser nyata dengan snapshot database dari proses PHP
terpisah. `database.php` menyediakan pemeriksaan path, snapshot tanpa rahasia,
volume, dan worker concurrency berbarier. `server.php` mengisolasi tanggal
bisnis. `verify-pdfs.py` memeriksa teks/halaman/gambar/overlap dan menghasilkan
PNG. Smoke/filter lama tetap dijalankan, bukan diganti oleh suite baru.

## 23. Remaining Known Limitations

Uji lokal menggunakan SQLite; MySQL hosting nyata, load/stress besar, browser
lain, layanan email eksternal, dan deployment produksi tidak diuji. Masa
kedaluwarsa sesi diuji dengan sesi/cookie invalid, bukan menunggu
seluruh durasi idle. Dokumen kontrak yang telah dihapus dari checkout dibaca
dari revisi `b88705d^`; tidak dipulihkan atau dijadikan fitur baru.

## 24. Final Commands

Regresi bersih yang masih harus diselesaikan:

```powershell
php artisan test
npm run build
powershell -NoProfile -File tests/browser/run.ps1
```

Runner terakhir mencakup verifikasi PDF. Fokus pengembangan tidak dihitung
sebagai full-system PASS.

## 25. Git Status

Branch `main`, awal `768ed6d`. Working tree sudah dirty sebelum QA; perubahan
pengguna dipertahankan, termasuk `package-lock.json`. Daftar status awal/akhir
tersedia melalui Git. `.env` dan hash seluruh gambar perusahaan asli telah dicek
tetap sama pada pemeriksaan integritas pengembangan.

## 26. Final Classification

**PENDING — pekerjaan masih berjalan; belum dinyatakan A/B/C final.**
