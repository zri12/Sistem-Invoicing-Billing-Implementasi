# TESTING.md

## Strategy
- Backend: feature/integration tests untuk business logic utama.
- Frontend: smoke test dan manual UI acceptance.
- UAT: berdasarkan flow pengguna perusahaan.

## Critical Test Cases

### Authentication
- Login valid.
- Login invalid.
- Logout.
- Manager tidak dapat melakukan operasi Admin.

### Invoice
- Create invoice dengan 1 item.
- Create invoice dengan banyak item.
- Edit mempertahankan invoice number.
- Discount tidak boleh negatif.
- Discount tidak boleh > subtotal.
- Draft tidak masuk Billing.
- Published masuk Billing.
- Cancelled tidak masuk Billing aktif.
- Nomor invoice unik.

### Payment
- Payment > 0.
- Payment sebagian.
- Multiple payment.
- Payment penuh.
- Overpayment ditolak.
- Payment mengubah remaining.
- Payment mengubah status.
- Payment membuat income terkait.

### Overdue
- Belum bayar + due lewat -> overdue.
- Partial + due lewat -> overdue.
- Paid + due lewat -> paid.

### Income
- Invoice baru tidak otomatis income.
- Payment invoice menjadi income.
- Manual income tidak membuat duplicate invoice payment.

### Expense
- Cash tanpa rekening tujuan -> valid.
- QRIS tanpa rekening tujuan -> valid.
- Credit tanpa rekening tujuan -> valid.
- Transfer tanpa rekening tujuan -> invalid.
- Transfer dengan rekening tujuan -> valid.
- Bukti transaksi dapat disimpan jika disediakan.

### Reports
- Debit berasal dari income.
- Kredit berasal dari expense.
- Filter periode bekerja.
- Saldo sesuai formula scope sederhana.

### Invoice PDF
- A4.
- Logo benar.
- Client benar.
- Item benar.
- Total benar.
- Rekening berasal dari data invoice.
- Terms dinamis.
- Cap/TTD sesuai setting.
- Signer sesuai data perusahaan.

## Corrective frontend regression

- Tambah/edit/nonaktifkan Master Data lalu verifikasi pilihan transaksi memakai data yang sama.
- Pengeluaran wajib memiliki rekening sumber; rekening tujuan hanya wajib untuk transfer.
- Edit invoice tidak boleh mengubah status yang sudah ada; pembayaran menolak invoice draft, lunas, dan nominal melebihi sisa.
- Ubah periode Dashboard lalu verifikasi metrik, grafik, status, serta invoice terbaru ikut terfilter.
