# UI_UX_GUIDE.md

## Lokasi Referensi UI
Referensi UI utama berada pada:

`/REFERENSI UI/`

Status: **FINAL UI/UX BASELINE**.

Sebelum membuat atau mengubah halaman frontend, developer/AI agent wajib:
1. Membuka prototype terkait.
2. Mempelajari halaman yang akan diimplementasikan.
3. Mengidentifikasi struktur layout.
4. Mengidentifikasi reusable components.
5. Mengidentifikasi responsive behavior.
6. Mengimplementasikan ulang ke Vue.js.
7. Tidak menyalin business logic dummy React.

## Status Prototype
Status: **UI/UX BASELINE — FROZEN**.

Artinya:
- tidak dilakukan redesign besar;
- perubahan UI hanya berdasarkan revisi perusahaan;
- development berikutnya difokuskan pada implementasi fungsi nyata; dan
- layout, visual hierarchy, component style, serta navigation dipertahankan.

## Referensi Utama
Prototype final pada `/REFERENSI UI/` adalah baseline UI/UX dan flow. Gunakan bersama `docs/REFERENCES.md`; jangan redesign tanpa revisi perusahaan.

## Branding
- Brand: DEVSPACE / PT. Ruang Kreasi Aplikasi.
- UI dominan putih/light gray.
- Navy/blue sebagai primary.
- Merah untuk danger/expense/context tertentu.
- Gunakan logo dan favicon resmi yang sudah diberikan.

## Prinsip
- Clean.
- Modern.
- Corporate.
- Desktop/laptop-first.
- Hindari gradient berlebihan, glassmorphism, neon, card overload, dan elemen dekoratif yang tidak perlu.
- Konsistensi spacing, table, modal, button, badge, typography.

## Sidebar
Harus mendukung:
- Expanded state.
- Collapsed/minimized state.
- Content area melebar saat sidebar collapse.
- Ikon tetap terlihat saat collapsed.
- Tooltip/nama menu dapat muncul saat hover jika dibutuhkan.
- Mobile menggunakan drawer/overlay.

Target umum:
- Expanded sekitar 236–260px.
- Collapsed sekitar 72–80px.

## Modal Pengeluaran
Revisi perusahaan:
- Modal dibuat lebih lebar.
- Field pendek dapat menggunakan 3 kolom pada desktop.
- Responsive: 3 kolom -> 2 kolom -> 1 kolom.

Susunan yang disarankan:
Baris 1:
- Tanggal
- Nominal
- Jenis Transaksi

Baris 2:
- Vendor
- Kategori
- Rekening Sumber

Conditional:
- Rekening Tujuan tampil jika Jenis Transaksi = Transfer.

Field panjang:
- Keterangan
- Bukti Transaksi
- Catatan
tidak harus dipaksa 3 kolom jika mengurangi usability.

## Pengeluaran
Jenis transaksi:
- Cash
- QRIS
- Credit
- Transfer

Jika Transfer:
- tampilkan field Rekening Tujuan.
- field wajib.

Tabel Pengeluaran sebaiknya menampilkan Jenis Transaksi.
Rekening tujuan cukup di detail/edit jika tabel menjadi terlalu lebar.

## Invoice Form
Pertahankan konsep:
- Main form di kiri/tengah.
- Summary di kanan.
- Sidebar collapse membantu memperluas content area.

## Invoice PDF
Invoice PDF final tidak mengikuti style card/dashboard aplikasi. Ikuti contoh dokumen resmi dan asset perusahaan:
- A4.
- Logo DEVSPACE di header.
- Favicon/icon DEVSPACE.
- Background invoice.
- Font invoice yang diberikan.
- Company tagline/contact.
- Invoice metadata.
- Bill To.
- Total Due.
- Item table.
- Subtotal/discount/total.
- Payment method/account.
- Terms & Conditions.
- Date.
- Stamp + signature.
- Signer name/title.
- Footer invoice number + page.

Gunakan asset resmi:
- logo invoice.
- background invoice.
- favicon/icon DEVSPACE.
- font invoice yang diberikan.
- cap dan tanda tangan dari data perusahaan.

Jangan hard-code data perusahaan, rekening, terms, signer, cap, atau signature.

### Official Invoice Asset Mapping
Source asset original berada pada `/ASSETS/`; source tidak diedit atau digunakan langsung sebagai file runtime mutable.

- Favicon — source: `ASSETS/favicon.ico`; runtime target yang digunakan: `public/favicon.ico`.
- Logo Invoice — source: `ASSETS/logo untuk di invoice.png`; digunakan pada invoice preview/PDF.
- Background Invoice — source: `ASSETS/bg-invoice.png`; digunakan pada template invoice PDF.
- Font Invoice — source: `ASSETS/font invoice.zip`; digunakan sebagai referensi typography invoice. Font tidak diekstrak pada tahap ini.
- Example Invoice PDF — source: `ASSETS/contoh invoice.pdf`; digunakan sebagai referensi visual layout.

Lihat `docs/REFERENCES.md` untuk status dan aturan penggunaan asset resmi.
