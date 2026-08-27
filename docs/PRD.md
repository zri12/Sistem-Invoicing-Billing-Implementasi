# PRD — Sistem Invoicing dan Billing

## 1. Ringkasan Produk
Sistem Invoicing dan Billing adalah aplikasi web internal PT. Ruang Kreasi Aplikasi untuk mengelola invoice, billing, pembayaran, pemasukan, pengeluaran, serta laporan transaksi sederhana dalam satu sistem.

Judul KP:
**Rancang Bangun Sistem Invoicing dan Billing Berbasis Web pada PT. Ruang Kreasi Aplikasi**

## 2. Tujuan
- Mengelola pembuatan dan riwayat invoice.
- Membuat nomor invoice otomatis dan unik.
- Mengelola billing berdasarkan invoice yang diterbitkan.
- Mendukung pembayaran bertahap.
- Menghitung total pembayaran dan sisa tagihan.
- Menghubungkan pembayaran invoice dengan pemasukan.
- Mencatat pemasukan non-invoice dan pengeluaran.
- Menyediakan laporan debit, kredit, dan saldo dalam konteks buku kas sederhana.
- Menghasilkan invoice PDF.
- Memberikan hak akses sesuai role.

## 3. Pengguna
### Admin / Finance
Operasional penuh:
- Master data.
- Invoice.
- Billing.
- Pembayaran.
- Pemasukan.
- Pengeluaran.
- Laporan.
- Pengaturan perusahaan/invoice.
- Pengguna dan hak akses.

### Pimpinan / Manager
Utamanya read-only:
- Dashboard.
- Master data yang diizinkan.
- Invoice/detail/preview.
- Billing.
- Pembayaran.
- Pemasukan.
- Pengeluaran.
- Laporan.
- Data perusahaan.

Approval invoice bersifat opsional dan hanya diimplementasikan jika dikonfirmasi perusahaan.

## 4. Modul
1. Authentication.
2. Dashboard.
3. Klien.
4. Vendor.
5. Produk & Layanan.
6. Rekening.
7. Invoice.
8. Billing.
9. Pembayaran.
10. Pemasukan.
11. Pengeluaran.
12. Laporan.
13. Data Perusahaan.
14. Template Invoice.
15. Penomoran Invoice.
16. Pengguna & Hak Akses.

## 5. Scope Utama
### Invoice
- Create, edit, detail, preview.
- Multiple item.
- Subtotal, diskon, total.
- Nomor otomatis.
- Status dokumen: Draft, Diterbitkan, Dibatalkan.
- PDF/cetak.

### Billing
- Hanya invoice berstatus Diterbitkan.
- Menampilkan total invoice, total pembayaran, sisa tagihan, jatuh tempo, status.

### Pembayaran
- Satu invoice dapat memiliki beberapa pembayaran.
- Pembayaran tidak boleh melebihi sisa tagihan.
- Pembayaran invoice otomatis menjadi pemasukan terkait.

### Pemasukan
- Pemasukan dari invoice berasal dari payment.
- Pemasukan manual hanya untuk transaksi non-invoice.

### Pengeluaran
Field minimum:
- Tanggal.
- Nominal.
- Vendor opsional.
- Kategori.
- Keterangan.
- Rekening sumber.
- Jenis transaksi.
- Rekening tujuan jika transfer.
- Bukti transaksi.
- Catatan.

Jenis transaksi:
- Cash.
- QRIS.
- Credit.
- Transfer.

Jika `Transfer`, rekening tujuan wajib diisi.

### Laporan
- Debit & Kredit.
- Invoice.
- Pembayaran.
- Pemasukan.
- Pengeluaran.
- Filter periode dan filter relevan per modul.

## 6. Non-Scope
- Client portal.
- Payment gateway.
- Integrasi bank otomatis.
- Full accounting/double-entry accounting.
- Jurnal umum.
- Buku besar.
- Neraca.
- Inventory/stok.
- Payroll.
- Mobile app native.
- Editor invoice drag-and-drop bebas.

## 7. Platform
- Web internal.
- Prioritas desktop/laptop.
- Tetap usable pada resolusi lebih kecil.

## 8. Acceptance Flow Utama
### Invoice
Login -> Buat Invoice -> Isi Data -> Simpan/Terbitkan -> Detail -> Preview/PDF.

### Payment
Invoice Diterbitkan -> Billing -> Catat Pembayaran -> Total Bayar berubah -> Sisa Tagihan berubah -> Status berubah -> Pemasukan tercatat.

### Expense
Tambah Pengeluaran -> Pilih Jenis Transaksi -> Jika Transfer isi Rekening Tujuan -> Simpan -> Masuk laporan.

## 9. Catatan Referensi Visual
Prototype final menjadi referensi UI/UX, bukan source of truth business logic.
Invoice PDF mengikuti contoh invoice resmi, logo DEVSPACE, background invoice, font, cap, dan tanda tangan yang diberikan perusahaan.
