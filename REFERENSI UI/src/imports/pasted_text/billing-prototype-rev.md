Revise the CURRENT existing “Sistem Invoicing & Billing” prototype only.

IMPORTANT — CREDIT-SAVING MODE:
- Do NOT rebuild the application from scratch.
- Do NOT regenerate pages that are already correct.
- Do NOT redesign the visual style.
- Do NOT change colors, typography, sidebar style, topbar style, dashboard layout, cards, spacing system, or global design system unless strictly required for the revisions below.
- Keep all existing pages and components.
- Reuse existing components, tables, forms, modals, drawers, badges, buttons, and layouts.
- Make only the minimum necessary changes.
- Preserve the current modern DEVSPACE UI exactly as much as possible.
- All UI text must remain in Bahasa Indonesia.

The attached requirement document remains the functional source of truth.

ONLY complete these 5 priority revisions:

==================================================
1. COMPLETE PIMPINAN / MANAGER READ-ONLY ACCESS
==================================================

The current Manager navigation is incomplete.

Update the Pimpinan / Manager role so it can VIEW the information allowed by the requirement, while remaining read-only.

Manager must be able to access:

DATA / MASTER DATA
- Data Klien — read only
- Data Vendor — read only
- Produk & Layanan — read only
- Rekening — read only
- Data Perusahaan — read only

MONITORING
- Invoice — read only
- Detail Invoice
- Preview Invoice
- Cetak Invoice
- Billing — read only
- Detail Billing
- Riwayat Pembayaran
- Pembayaran — read only

KEUANGAN
- Pemasukan — read only
- Pengeluaran — read only

LAPORAN
- Laporan — view/filter/print

Keep Manager sidebar simple and organized.

Suggested Manager navigation:

Dashboard

DATA
- Klien
- Vendor
- Produk & Layanan
- Rekening
- Data Perusahaan

MONITORING
- Invoice
- Billing
- Pembayaran

KEUANGAN
- Pemasukan
- Pengeluaran

LAPORAN
- Laporan

IMPORTANT:
Manager is read-only.

For Manager:
- hide Tambah buttons
- hide Edit buttons
- hide Delete / Nonaktifkan actions
- hide Catat Pembayaran
- hide Tambah Pemasukan
- hide Tambah Pengeluaran
- hide settings editing actions
- hide user management
- hide invoice numbering management

Do NOT show disabled operational buttons everywhere.
Prefer hiding actions the Manager cannot use.

Data tables and detail pages should reuse the exact same existing layout as Admin / Finance.

Do not create duplicate Manager-specific page designs.

==================================================
2. COMPLETE ALL REPORT TABS
==================================================

The Laporan page currently has tabs, but some are only placeholders.

Keep the existing Laporan page and current design.

Complete these tabs:

1. Keuangan / Debit & Kredit
2. Invoice
3. Pembayaran
4. Pemasukan
5. Pengeluaran

Do not create separate new report pages.

Use the existing tab system.

--------------------------------
TAB: PEMBAYARAN
--------------------------------

Show a real table with:

- Tanggal
- Nomor Invoice
- Klien
- Metode Pembayaran
- Rekening
- Nomor Referensi
- Nominal

Use realistic dummy data already available in the project when possible.

--------------------------------
TAB: PEMASUKAN
--------------------------------

Show:

- Tanggal
- Sumber
- Kategori
- Keterangan
- Referensi Invoice
- Rekening
- Nominal

--------------------------------
TAB: PENGELUARAN
--------------------------------

Show:

- Tanggal
- Vendor
- Kategori
- Keterangan
- Rekening
- Nominal

--------------------------------
REPORT FILTER
--------------------------------

Preserve the existing filter design.

Filters:
- Tanggal Awal
- Tanggal Akhir
- Rekening
- Terapkan
- Reset

Make the filter state work at prototype level if possible without rebuilding major logic.

At minimum:
- Terapkan should update/filter visible report data
- Reset should restore the default report data

For Debit & Kredit keep:

Debit = uang masuk
Kredit = uang keluar

Saldo Akhir = Saldo Awal + Debit - Kredit

Do NOT add:
- general ledger
- journal
- balance sheet
- full accounting
- complex accounting modules

Keep actions:
- Cetak
- Simpan PDF

Do not add Excel export unless already present.

==================================================
3. FIX PAYMENT → BILLING → INCOME FLOW
==================================================

This is one of the most important flows in the application.

Currently, some “Catat Pembayaran” actions only show a toast or are not connected to the real payment form.

Fix the interaction by reusing the existing payment form/modal already available in Billing.

From:
- Detail Invoice
- Billing Detail
- relevant Invoice action

When Admin / Finance clicks:

“Catat Pembayaran”

open the SAME reusable payment modal/drawer.

Do not create multiple different payment forms.

The form should contain:

- Invoice
- Tanggal Pembayaran
- Nominal
- Metode Pembayaran
- Rekening
- Nomor Referensi
- Bukti Pembayaran
- Catatan

After payment is saved, simulate the following workflow:

Payment saved
→ Total Pembayaran updated
→ Sisa Tagihan recalculated
→ Billing status updated
→ Payment appears in Riwayat Pembayaran
→ Payment is linked as Pemasukan

Use:

Sisa Tagihan = Total Invoice - Total Pembayaran

Status rules:

No payment:
Belum Dibayar

Payment > 0 but less than invoice total:
Dibayar Sebagian

Total payment equals invoice total:
Lunas

Invoice not fully paid after due date:
Jatuh Tempo

Do not allow a normal payment entry to make Sisa Tagihan negative.

IMPORTANT:
Creating an Invoice does NOT create Pemasukan.

Only a recorded payment should become income.

Do NOT require the user to manually enter the same invoice payment again on the Pemasukan page.

==================================================
4. COMPLETE PEMASUKAN AND PENGELUARAN FORMS
==================================================

Do not redesign these pages.

Only complete the missing required fields and logic.

--------------------------------
PEMASUKAN
--------------------------------

Keep the current Pemasukan page and modal.

Manual Tambah Pemasukan is intended for non-invoice income.

Required fields:

- Tanggal
- Kategori
- Sumber
- Keterangan
- Nominal
- Rekening

Add the missing:
REKENING

Use existing account data such as:
- BCA
- bank account
- cash account

If payment comes from an invoice:
- it should already appear automatically as Pemasukan
- it should contain Referensi Invoice
- user should NOT manually enter the same invoice payment again

If the current manual Pemasukan form has “Invoice” as a manual source option, adjust the UX so invoice payments are clearly system-generated / linked from Pembayaran rather than entered twice manually.

Show invoice-linked income in the list using a subtle indicator such as:
“Pembayaran Invoice”
or an invoice reference.

--------------------------------
PENGELUARAN
--------------------------------

Keep the current Pengeluaran page and existing modal/drawer.

Ensure the form includes:

- Tanggal
- Vendor
- Kategori
- Keterangan
- Nominal
- Rekening
- Bukti Transaksi
- Catatan

Add the currently missing:
- Rekening
- Catatan

Rekening represents the source of funds.

Example:
BCA Operasional
Kas Perusahaan

Do not introduce bank API integration.

These are internal financial records only.

==================================================
5. FIX TEMPLATE / PREVIEW INVOICE STAMP AND SIGNATURE
==================================================

Keep the existing invoice design.

Do NOT redesign the invoice document.

The attached company invoice remains the visual reference.

The invoice preview must correctly show:

- DEVSPACE logo
- company identity
- Invoice Name
- Invoice Date
- Due Date
- invoice number
- Bill To
- Total Due
- Item Description
- Price
- Qty
- Total
- Subtotal
- Discount
- Total Due
- Payment Method
- Terms & Condition
- signature
- signer name
- signer position
- company stamp

IMPORTANT:

The current Template Invoice configuration contains options for:
- Cap Perusahaan
- Tanda Tangan

Make both options visually functional in the preview.

If “Tanda Tangan” is enabled:
show a realistic signature image / signature asset area.

If “Cap Perusahaan” is enabled:
show the company stamp image / stamp asset.

The stamp and signature should be separate elements.

Do not use a fake decorative icon as a substitute.

Use the uploaded invoice example as the reference for the placement:
signature and company stamp should appear in the bottom approval area.

Also ensure Data Perusahaan stores / previews:

- Cap Perusahaan
- Tanda Tangan
- Nama Penanda Tangan
- Jabatan

For Admin / Finance:
allow configuration/upload.

For Manager:
show the current image/data only.
Do NOT show upload/dropzone controls.

==================================================
PRESERVE CURRENT UI
==================================================

Do NOT change the current visual design that is already working.

Preserve:

- DEVSPACE branding
- current sidebar
- current aligned topbar
- hidden sidebar scrollbar
- dashboard layout
- current navy/white/gray palette
- current tables
- current cards
- current typography
- current modals/drawers
- current button system
- current spacing system

Do NOT add:
- gradients
- glassmorphism
- large rounded cards
- new visual themes
- new navigation architecture
- new unrelated modules
- public client portal
- payment gateway
- banking integration
- full ERP
- inventory
- payroll
- full accounting

==================================================
FINAL CHECK
==================================================

Before finishing, verify only these items:

1. Manager can access all required view-only pages.
2. Manager cannot perform Admin / Finance operational actions.
3. Laporan Pembayaran is no longer a placeholder.
4. Laporan Pemasukan is no longer a placeholder.
5. Laporan Pengeluaran is no longer a placeholder.
6. Catat Pembayaran opens a real reusable form.
7. Payment updates billing.
8. Payment appears in payment history.
9. Payment is linked to income.
10. Manual Pemasukan contains Rekening.
11. Pengeluaran contains Rekening and Catatan.
12. Invoice preview shows actual stamp and signature elements.
13. Manager sees company stamp/signature only as read-only.
14. Existing UI styling remains unchanged.

Make only these targeted revisions to the existing project.

Do NOT rebuild the entire prototype.
Do NOT redesign completed pages.
Do NOT spend effort changing visual areas that are already correct.