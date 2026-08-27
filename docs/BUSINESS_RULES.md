# BUSINESS_RULES.md

## 1. Invoice
### Status Dokumen
- `draft`
- `published`
- `cancelled`

Aturan:
- Draft tidak masuk Billing.
- Cancelled tidak masuk Billing aktif.
- Published dapat menjadi Billing.
- Invoice dengan histori transaksi tidak dihapus secara hard delete; gunakan pembatalan sesuai kebutuhan.

## 2. Perhitungan Invoice
Untuk setiap item:
`item_total = price * qty`

Invoice:
`subtotal = sum(item_total)`
`discount >= 0`
`discount <= subtotal`
`total = subtotal - discount`

Backend wajib menghitung ulang nilai final.

## 3. Nomor Invoice
Format awal:
`{SEQUENCE}/INV/RKA/{ROMAN_MONTH}/{YY}`

Contoh:
`001/INV/RKA/VIII/26`

Aturan:
- Unik.
- Create membuat nomor baru.
- Edit mempertahankan nomor invoice.
- Konfigurasi numbering mengikuti pengaturan perusahaan.
- Aturan reset sequence harus mengikuti konfigurasi resmi; jangan diasumsikan jika belum ditetapkan.

## 4. Billing
`remaining = invoice_total - total_payments`

Nilai remaining tidak boleh negatif.

Status pembayaran:
1. Jika `total_payments >= invoice_total` -> `paid`.
2. Jika belum lunas dan tanggal jatuh tempo sudah lewat -> `overdue`.
3. Jika `total_payments > 0` -> `partial`.
4. Selain itu -> `unpaid`.

Mapping UI:
- unpaid = Belum Dibayar
- partial = Dibayar Sebagian
- paid = Lunas
- overdue = Jatuh Tempo

## 5. Pembayaran
- Satu invoice dapat memiliki banyak payment.
- Payment harus > 0.
- Payment tidak boleh melebihi remaining.
- Payment harus terkait invoice.
- Payment invoice yang valid menghasilkan pemasukan terkait.
- Jangan mencatat payment invoice dan income invoice sebagai dua transaksi independen tanpa relasi.

## 6. Pemasukan
Sumber:
- Invoice Payment.
- Manual Non-Invoice Income.

Invoice baru bukan pemasukan.
Pemasukan invoice hanya terjadi setelah payment dicatat.

## 7. Pengeluaran
Jenis transaksi:
- `cash`
- `qris`
- `credit`
- `transfer`

Field `destination_account`:
- Wajib jika `transaction_type = transfer`.
- Nullable untuk jenis transaksi lain.

`source_account_id` adalah rekening/kas perusahaan yang menjadi sumber dana.

## 8. Laporan
Untuk scope sistem:
- Debit = uang masuk.
- Kredit = uang keluar.
- Ini adalah buku kas sederhana, bukan double-entry accounting.

Rumus sederhana:
`ending_balance = opening_balance + debit - credit`

## 9. Role
Admin/Finance:
- Operasional penuh sesuai modul.

Pimpinan/Manager:
- Read-only pada modul monitoring/keuangan yang diizinkan.
- Backend tetap wajib menegakkan authorization, bukan hanya menyembunyikan tombol di frontend.

## 10. Invoice PDF
Data dinamis harus berasal dari database:
- Company.
- Client.
- Invoice.
- Invoice items.
- Account/payment method.
- Terms.
- Logo.
- Stamp.
- Signature.
- Signer name/title.

Jangan hard-code rekening, terms, cap, TTD, atau nama penandatangan dalam template final.
