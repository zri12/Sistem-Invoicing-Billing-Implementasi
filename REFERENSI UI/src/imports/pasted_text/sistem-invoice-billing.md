Create a complete, coherent, high-fidelity internal web application prototype for **DEVSPACE / PT. Ruang Kreasi Aplikasi** named:

**“Sistem Invoicing & Billing”**

Build the **entire web application in one project and one consistent design system**, not as disconnected individual screens.

---

# 1. SOURCE OF TRUTH AND ATTACHMENTS

There are three attachments provided with this prompt:

1. **The attached requirements document PDF**
2. **The official DEVSPACE / PT. Ruang Kreasi Aplikasi logo**
3. **A full example of the current company invoice**

Use them with the following priority:

### Highest priority: Requirements document

The attached requirements document is the **main source of truth** for:

* system scope
* features
* user roles
* permissions
* workflows
* invoice logic
* billing logic
* payment logic
* income and expense logic
* reports
* acceptance criteria

Do not invent major modules that are not supported by the requirements document.

### Brand logo

Use the attached DEVSPACE logo as the official branding reference.

Do not redesign, distort, recolor, or recreate the logo unnecessarily.

### Invoice image

Use the attached invoice image specifically as the main visual reference for:

* invoice preview
* invoice PDF preview
* invoice print layout
* invoice document structure

The uploaded invoice image is a **reference for the invoice document only**.

Do NOT make the entire admin web interface look like the invoice document.

The web application should be a modern enterprise finance workspace, while the invoice preview should preserve the formal visual character of the attached invoice.

---

# 2. PRODUCT CONTEXT

This is an **internal company web application**, not a public website, client portal, SaaS marketing page, or landing page.

Primary purpose:

* create and manage invoices
* automatically generate invoice numbers
* manage billing
* record invoice payments
* calculate outstanding balances
* record income
* record expenses
* manage clients and vendors
* manage products/services
* manage company bank/cash accounts
* show debit, credit, and running balance reports
* configure invoice information
* generate printable PDF invoices
* manage internal users and role-based access

The application will mainly be used from company computers or laptops.

Design for professional daily office use.

---

# 3. LANGUAGE

Use **Bahasa Indonesia for all visible UI text**.

Examples:

* Dashboard
* Klien
* Vendor
* Produk & Layanan
* Rekening
* Invoice
* Billing
* Pembayaran
* Pemasukan
* Pengeluaran
* Laporan
* Pengaturan
* Tambah Klien
* Buat Invoice
* Simpan Draft
* Preview Invoice
* Catat Pembayaran
* Belum Dibayar
* Dibayar Sebagian
* Lunas
* Jatuh Tempo

Avoid awkward machine-translated Indonesian.

Use short, natural, professional wording appropriate for an internal Indonesian business application.

---

# 4. DESIGN GOAL

The interface must feel:

* modern
* professional
* mature
* clean
* efficient
* trustworthy
* structured
* enterprise-oriented
* finance-oriented
* realistic for actual daily company use

The visual quality should resemble a polished internal finance or enterprise SaaS product.

However, it must **NOT look like a generic AI-generated dashboard**.

Avoid the typical AI dashboard appearance where:

* every section is inside a card
* every card has a large colorful icon
* everything has huge rounded corners
* excessive gradients are used
* random illustrations appear
* oversized headings dominate the page
* excessive empty space exists
* every element floats with heavy shadows

The interface should look intentionally designed by a professional product designer.

---

# 5. BRAND DIRECTION

Use the DEVSPACE logo as the visual reference.

Primary brand direction:

* white
* deep navy / corporate blue
* light neutral gray
* subtle blue accents

Use the red from the DEVSPACE logo only as:

* a small brand accent
* danger action
* overdue state
* destructive action

Do not make red a dominant interface color.

Recommended fallback palette if exact colors cannot be sampled from the logo:

Primary Navy:
`#173B6C`

Primary Hover:
`#102D54`

Secondary Blue:
`#315DA8`

Main Background:
`#F7F8FA`

Surface:
`#FFFFFF`

Primary Text:
`#172033`

Secondary Text:
`#667085`

Border:
`#E2E6EC`

Success:
`#16A34A`

Warning:
`#D97706`

Danger:
`#DC2626`

Brand Accent Red:
`#EF4444`

Prefer approximately:

* 80% neutral white / light gray
* 15% navy / blue
* 5% contextual status colors

---

# 6. TYPOGRAPHY

Use a modern professional sans-serif font.

Preferred:

* Inter

Fallback:

* Geist
* system sans-serif

Typography scale:

Page title:
24px / semibold

Section title:
18–20px / semibold

Card/statistic value:
22–26px / semibold

Table header:
12–13px / medium

Body:
14px

Secondary / helper text:
12–13px

Do not use oversized 36–48px dashboard headings.

Keep information density suitable for enterprise software.

---

# 7. GLOBAL DESIGN TOKENS

Use one consistent system across all pages.

Border radius:

* 6–8px for inputs and buttons
* 8–10px for cards
* avoid 20–30px pill-like containers

Button height:
40px

Input height:
40px

Main sidebar width:
approximately 236–240px

Page content padding:
24–32px

Spacing scale:
4 / 8 / 12 / 16 / 24 / 32

Borders:
thin and subtle

Shadows:
very subtle or none

Use whitespace carefully.

Do not over-space the interface.

---

# 8. ICON STYLE

Use one consistent outline icon family.

Prefer icons visually similar to Lucide.

Icon size:
18–20px

Do not mix:

* filled icons
* emoji
* 3D icons
* colorful icon sets

Icons should support navigation and recognition, not decoration.

---

# 9. MAIN APPLICATION SHELL

Use a consistent application shell:

* fixed left sidebar
* simple topbar/header
* main content area

Sidebar background:
white

Main application background:
very light neutral gray

Use a thin border between sidebar and content.

Do not use a fully dark navy sidebar.

Use navy primarily for:

* active navigation
* primary buttons
* links
* key focus states

---

# 10. SIDEBAR — ADMIN / FINANCE

Top:

DEVSPACE logo

Text underneath:
**Invoicing & Billing**

Navigation structure:

### Dashboard

* Dashboard

### MASTER DATA

* Klien
* Vendor
* Produk & Layanan
* Rekening

### TRANSAKSI

* Invoice
* Billing
* Pembayaran
* Pemasukan
* Pengeluaran

### LAPORAN

* Laporan

### PENGATURAN

* Data Perusahaan
* Template Invoice
* Penomoran Invoice
* Pengguna & Hak Akses

Bottom user section:

* avatar or initial
* user name
* role: Admin / Finance
* Logout

Active navigation:

Use a very light blue background, navy icon, navy text, and a subtle active indicator.

Avoid large colorful navigation blocks.

---

# 11. SIDEBAR — PIMPINAN / MANAGER

Manager should see a simpler navigation.

### Dashboard

* Dashboard

### MONITORING

* Invoice
* Billing
* Pembayaran

### KEUANGAN

* Pemasukan
* Pengeluaran

### LAPORAN

* Laporan

Manager should NOT see operational settings that the role cannot manage.

Manager pages must be mainly read-only.

Do not simply display disabled edit buttons everywhere.

If a role cannot perform an action, hide the action when appropriate.

---

# 12. ROLE MODEL

Support exactly two primary roles:

## Admin / Finance

Operational role.

Can manage:

* clients
* vendors
* products/services
* accounts
* invoices
* billing
* payments
* income
* expenses
* reports
* company data
* invoice templates
* invoice numbering
* users
* access roles
* logo
* bank information
* stamp
* signature

## Pimpinan / Manager

Monitoring role.

Can:

* view dashboard
* view company information
* view clients
* view vendors
* view products/services
* view invoices
* view invoice details
* preview invoices
* print invoices
* view billing
* view payment history
* view income
* view expenses
* view reports
* view debit / credit / balance information

Do not allow Manager to:

* create invoices
* edit invoices
* create payments
* create income
* create expenses
* change numbering settings
* manage users
* edit company configuration

The requirement mentions invoice approval as an optional process.

Do not create a complex approval workflow.

If an approval action is shown, treat it as an optional feature for Manager and keep it visually secondary.

Do not introduce new mandatory workflow states that conflict with the requirement.

---

# 13. RESPONSIVE TARGET

Primary target:
**1440px desktop**

Also keep layout usable around:

* 1366px
* 1280px
* 1024px laptop/tablet landscape

This is a desktop-first internal application.

Do not spend unnecessary design complexity on separate mobile screens.

Do not create a mobile app experience.

---

# 14. COMPLETE SCREEN MAP

Create the complete application with these main screens:

1. Login
2. Dashboard
3. Data Klien
4. Data Vendor
5. Produk & Layanan
6. Rekening
7. Daftar Invoice
8. Buat / Edit Invoice
9. Detail Invoice
10. Preview Invoice / PDF
11. Billing
12. Detail Billing & Riwayat Pembayaran
13. Pembayaran
14. Pemasukan
15. Pengeluaran
16. Laporan
17. Data Perusahaan
18. Template Invoice
19. Penomoran Invoice
20. Pengguna & Hak Akses

Simple create/edit actions for master data may use:

* modal
* drawer
* side panel

Do not create unnecessary separate pages for every CRUD action.

---

# 15. LOGIN SCREEN

Create a professional login screen.

Use:

* DEVSPACE logo
* “Sistem Invoicing & Billing”
* username/email
* password
* show/hide password
* primary “Masuk” button
* error message state

Optional subtle company visual:
use a very faint geometric visual inspired by the invoice background pattern.

Do not make the login page look like a marketing landing page.

Do not use:

* huge illustration
* gradient hero
* abstract 3D graphics

---

# 16. DASHBOARD

Dashboard must clearly reflect the requirements.

Create a compact executive/finance overview.

Primary summary cards:

1. Total Invoice
2. Sisa Tagihan
3. Total Pemasukan
4. Total Pengeluaran

Secondary information can include:

* Nilai Invoice
* Invoice Belum Dibayar
* Invoice Dibayar Sebagian
* Invoice Lunas
* Invoice Jatuh Tempo
* Saldo

Do not create ten oversized cards.

Use a thoughtful hierarchy.

Suggested dashboard structure:

Row 1:
4 main summary cards

Row 2:

* Invoice status summary
* simple Pemasukan vs Pengeluaran chart

Row 3:

* Transaksi Terbaru table
* invoice due soon / overdue information if layout allows

Add period selector:

* Bulan Ini
* custom date range

Charts must be simple, readable, and secondary to data.

Avoid flashy analytics.

---

# 17. DATA KLIEN PAGE

Use a consistent enterprise table pattern.

Page header:

Title:
**Klien**

Description:
short text explaining that client data is used for invoices.

Toolbar:

* search field
* status filter
* “Tambah Klien” primary button

Table columns:

* Nama Klien / Perusahaan
* PIC
* Nomor Telepon
* Email
* Status
* Jumlah Invoice
* Aksi

Actions:

* Detail
* Edit
* Aktifkan / Nonaktifkan
* Riwayat Invoice

Use a three-dot action menu.

Create a clean modal or drawer for Add/Edit Client.

Fields:

* Nama Klien / Perusahaan
* Nama PIC
* Alamat
* Nomor Telepon
* Email
* Catatan
* Status

Clients connected to invoices should conceptually be deactivated rather than permanently deleted.

---

# 18. DATA VENDOR PAGE

Use the same visual system as Clients.

Do NOT redesign the layout.

Fields:

* Nama Vendor
* PIC
* Alamat
* Nomor Telepon
* Email
* Catatan
* Status

Table columns:

* Vendor
* PIC
* Telepon
* Email
* Status
* Jumlah Transaksi
* Aksi

Actions:

* Detail
* Edit
* Aktif / Nonaktif
* Riwayat Transaksi

---

# 19. PRODUK & LAYANAN PAGE

Use table-based management.

Toolbar:

* search
* status
* Tambah Produk / Layanan

Table:

* Nama
* Deskripsi
* Harga Awal
* Satuan
* Status
* Aksi

Add/Edit modal fields:

* Nama Produk / Layanan
* Deskripsi
* Harga Awal
* Satuan
* Status

Products/services are reusable invoice items.

---

# 20. REKENING PAGE

Create a clean account management page.

Use “Rekening” to represent:

* company bank accounts
* company cash accounts

Table:

* Nama Bank / Kas
* Nomor Rekening
* Atas Nama
* Saldo
* Status
* Aksi

Add/Edit fields:

* Nama Bank / Kas
* Nomor Rekening
* Atas Nama
* Saldo Awal
* Status

Do NOT simulate direct bank integration.

These are internal records only.

---

# 21. INVOICE LIST PAGE

This is one of the most important screens.

Header:

**Invoice**

Short description.

Primary action:
**+ Buat Invoice**

Toolbar:

* search invoice
* filter status dokumen
* filter status pembayaran
* date range
* reset filter

Table columns:

* Nomor Invoice
* Nama Invoice
* Klien
* Tanggal
* Jatuh Tempo
* Total
* Status Dokumen
* Status Pembayaran
* Aksi

Document status:

* Draft
* Diterbitkan
* Dibatalkan

Payment status:

* Belum Dibayar
* Dibayar Sebagian
* Lunas
* Jatuh Tempo

Use compact subtle badges.

Suggested colors:

Lunas:
green

Dibayar Sebagian:
amber

Belum Dibayar:
neutral / soft blue

Jatuh Tempo:
red

Draft:
gray

Diterbitkan:
blue

Dibatalkan:
red-gray

Avoid overly colorful pills.

---

# 22. CREATE / EDIT INVOICE PAGE

Create a dedicated full workspace page.

Do NOT create the main invoice form inside a small modal.

Page header:

**Buat Invoice Baru**

Actions:

* Simpan Draft
* Preview
* Simpan / Terbitkan

Use a structured layout.

## Section 1 — Data Klien

* dropdown/select client
* display selected client information

## Section 2 — Informasi Invoice

Fields:

* Nama Invoice
* Nomor Invoice
* Tanggal Invoice
* Tanggal Jatuh Tempo

Invoice number should visually indicate:
**Dibuat otomatis**

## Section 3 — Rincian Item

Table-style editable rows:

* Produk / Layanan
* Deskripsi
* Harga
* Qty
* Total
* Remove action

Button:
**+ Tambah Item**

Support multiple invoice items.

Calculation:

Total Item = Harga × Qty

## Section 4 — Informasi Pembayaran

* Rekening Pembayaran
* Catatan Pembayaran / Terms & Conditions
* Catatan Invoice

## Section 5 — Ringkasan

Use a clean summary area, preferably sticky on larger screens.

Display:

* Subtotal
* Diskon
* Total Due

Avoid excessive card nesting.

---

# 23. INVOICE DETAIL PAGE

Show the complete invoice record.

Header:

Invoice number prominently but not oversized.

Example:
**001/INV/RKA/VIII/26**

Show:

* Nama Invoice
* Klien
* Tanggal Invoice
* Jatuh Tempo
* Status Dokumen
* Status Pembayaran

Sections:

### Informasi Klien

### Rincian Invoice

### Ringkasan Nilai

* subtotal
* discount
* total

### Billing

* total invoice
* total pembayaran
* sisa tagihan

### Riwayat Pembayaran

Actions for Admin / Finance:

* Edit
* Preview
* Cetak PDF
* Catat Pembayaran

Manager:

* Preview
* Cetak PDF
* optional approval if enabled

Do not add audit-history features not supported by the requirement.

---

# 24. INVOICE PREVIEW / PDF SCREEN

Use the attached invoice image as the strongest visual reference.

Create a centered A4 document preview.

The invoice must include:

* DEVSPACE logo
* PT. Ruang Kreasi Aplikasi identity
* tagline / company information if available
* Invoice Name
* Invoice Date
* Due Date
* INVOICE title
* invoice number
* Bill To
* Total Due
* item table
* Item Description
* Price
* Qty
* Total
* Subtotal
* Discount
* Total Due
* Payment Method
* bank/account information
* Terms & Condition
* company signature
* signer name
* signer position
* company stamp

Use the attached sample invoice as a visual reference.

The stamp and signature section at the bottom is important.

Keep the document:

* formal
* clean
* printable
* A4
* white
* professionally aligned

Do not redesign it into a colorful SaaS invoice.

Outside the A4 document, provide a small application toolbar:

* Kembali
* Download PDF
* Print

---

# 25. BILLING LIST PAGE

Billing means:

* invoice total
* payments received
* remaining balance

It is NOT a wallet.

Create summary information:

* Total Tagihan
* Sudah Dibayar
* Sisa Tagihan
* Jatuh Tempo

Table:

* Invoice
* Klien
* Total Tagihan
* Sudah Dibayar
* Sisa Tagihan
* Jatuh Tempo
* Status
* Aksi

Billing statuses:

* Belum Dibayar
* Dibayar Sebagian
* Lunas
* Jatuh Tempo

---

# 26. BILLING DETAIL PAGE

Show a detailed billing summary for one invoice.

Header:

Invoice number
Client
Invoice name

Summary:

* Total Invoice
* Sudah Dibayar
* Sisa Tagihan
* Status Billing

Payment history table:

* Tanggal
* Metode
* Rekening
* Nomor Referensi
* Nominal

Admin / Finance action:
**+ Catat Pembayaran**

Manager:
read-only

---

# 27. PAYMENT LOGIC

Support multiple payments for one invoice.

Formula:

**Sisa Tagihan = Total Invoice - Total Pembayaran**

Example:

Total Invoice:
Rp5.000.000

Pembayaran 1:
Rp2.000.000

Pembayaran 2:
Rp1.500.000

Total Pembayaran:
Rp3.500.000

Sisa Tagihan:
Rp1.500.000

Status:
Dibayar Sebagian

Never allow payment amount to create a negative outstanding balance in normal payment conditions.

---

# 28. PAYMENT PAGE

Create a page showing all recorded payments.

Toolbar:

* search
* period filter
* payment method filter
* account filter

Table:

* Tanggal
* Invoice
* Klien
* Metode
* Referensi
* Rekening
* Nominal
* Aksi

For Admin / Finance, use a modal or drawer:

**Catat Pembayaran**

Fields:

* Invoice
* Tanggal Pembayaran
* Nominal
* Metode Pembayaran
* Rekening
* Nomor Referensi
* Bukti Pembayaran
* Catatan

After payment is saved conceptually:

1. payment is stored
2. total payments update
3. outstanding balance updates
4. billing status updates
5. payment is linked to income

---

# 29. INCOME PAGE

Create an income transaction page.

Header:
**Pemasukan**

Summary:
Total pemasukan for selected period.

Filters:

* date
* category
* account
* source

Table:

* Tanggal
* Sumber
* Kategori
* Keterangan
* Referensi Invoice
* Rekening
* Nominal
* Aksi

Admin / Finance can add other income manually.

Important business logic:

If income comes from an invoice payment, do NOT require the user to enter the same transaction again manually.

Payment and income should conceptually be linked to avoid duplication.

---

# 30. EXPENSE PAGE

Use the same visual pattern as Income.

Header:
**Pengeluaran**

Summary:
Total expenses for selected period.

Filters:

* date
* vendor
* category
* account

Table:

* Tanggal
* Vendor
* Kategori
* Keterangan
* Rekening
* Nominal
* Bukti
* Aksi

Add/Edit drawer:

* Tanggal
* Vendor
* Kategori
* Keterangan
* Nominal
* Rekening
* Bukti Transaksi
* Catatan

Expenses are separate from invoice sales.

---

# 31. REPORT PAGE

Create one comprehensive report page with tabs rather than many disconnected pages.

Tabs:

1. Keuangan / Debit Kredit
2. Invoice
3. Pembayaran
4. Pemasukan
5. Pengeluaran

Default tab:
**Debit & Kredit**

Filters:

* tanggal awal
* tanggal akhir
* rekening
* Terapkan
* Reset

Summary:

* Saldo Awal
* Total Debit
* Total Kredit
* Saldo Akhir

Use the requirement's simple cash-book interpretation:

**Debit = uang masuk**

**Kredit = uang keluar**

This is NOT complete double-entry accounting.

Formula:

**Saldo Akhir = Saldo Awal + Debit - Kredit**

Table:

* Tanggal
* Referensi
* Keterangan
* Debit
* Kredit
* Saldo

Actions:

* Cetak
* Simpan PDF

Do NOT add complex accounting modules such as:

* jurnal umum
* buku besar
* neraca
* chart of accounts
* balance sheet
* profit & loss accounting system

---

# 32. DATA PERUSAHAAN PAGE

Admin / Finance can manage company data.

Fields:

* Logo
* Nama Perusahaan
* Kode Perusahaan
* Alamat
* Nomor Telepon
* Email
* Website

Payment information:

* Bank
* Nomor Rekening
* Atas Nama

Document information:

* Cap Perusahaan
* Tanda Tangan
* Nama Penanda Tangan
* Jabatan

Use upload components for:

* logo
* stamp
* signature

Show current preview of uploaded assets.

---

# 33. TEMPLATE INVOICE PAGE

Do NOT create a Canva-style or drag-and-drop document editor.

Use a structured configuration layout.

Recommended layout:

Left side:
configuration form

Right side:
live A4 invoice preview

Configuration options:

* logo
* company identity
* invoice title
* invoice number display
* invoice date
* due date
* client section
* invoice item section
* subtotal
* discount
* total
* bank information
* payment notes
* terms & conditions
* stamp
* signature
* signer name
* signer position

The right preview should use the attached invoice example as the visual reference.

Keep the customization controlled and consistent.

---

# 34. INVOICE NUMBERING PAGE

Create a clear settings page.

Current format preview:

**001/INV/RKA/VIII/26**

Explain visually:

* 001 = Nomor Urut
* INV = Kode Dokumen
* RKA = Kode Perusahaan
* VIII = Bulan Romawi
* 26 = Tahun

Fields:

* Nomor Awal / sequence
* Kode Dokumen
* Kode Perusahaan
* Format Bulan
* Format Tahun

Show a real-time preview.

The requirements document does not determine whether invoice sequence should reset:

* monthly
* yearly
* or continuously

Therefore do NOT hard-code one as an official business rule.

If a reset setting is shown, default it to:
**Belum Ditentukan**

or show the available options without claiming one is final.

---

# 35. USERS & ACCESS PAGE

Create an internal user management page.

Table:

* Nama
* Username / Email
* Role
* Status
* Aksi

Do not add unsupported user profile fields such as “last login” as a mandatory data requirement.

Available roles:

* Admin / Finance
* Pimpinan / Manager

Add/Edit user modal:

* Nama
* Username / Email
* Password
* Role
* Status

Also include a simple access overview explaining permissions per role.

Do not create a highly complex enterprise RBAC builder.

---

# 36. STATUS DESIGN

Use subtle, compact badges.

Invoice document:

Draft

* neutral gray

Diterbitkan

* soft blue

Dibatalkan

* muted red

Billing:

Belum Dibayar

* neutral / subtle blue

Dibayar Sebagian

* amber

Lunas

* green

Jatuh Tempo

* red

Avoid bright saturated background pills.

---

# 37. GLOBAL TABLE SYSTEM

Use one consistent table design everywhere.

Tables should have:

* clear header
* subtle border
* comfortable row height
* optional hover
* clear numeric alignment
* actions on right
* pagination at bottom
* empty state
* loading state

Currency should be right-aligned.

Use Indonesian Rupiah formatting:

Rp 3.000.000

Dates:

1 Agustus 2026

or compact table format:

01 Agu 2026

---

# 38. GLOBAL FORM SYSTEM

Use labels above fields.

Required fields can show subtle `*`.

Use:

* text input
* select
* date picker
* textarea
* currency input
* file upload

Validation messages should appear near the relevant field.

Avoid huge floating labels or experimental form patterns.

---

# 39. MODALS AND DRAWERS

Use modal/drawer only for relatively simple actions:

* Add Client
* Edit Client
* Add Vendor
* Add Product
* Add Account
* Record Payment
* Add Income
* Add Expense
* Add User
* confirmations

Use full pages for complex workflows such as:

* create invoice
* edit invoice
* invoice detail
* invoice preview
* reports
* template configuration

---

# 40. CONFIRMATIONS

Use confirmation dialogs for meaningful actions such as:

* cancel invoice
* deactivate client
* deactivate vendor
* deactivate user
* remove invoice item
* logout if appropriate

Use natural Indonesian copy.

Example:

**Batalkan Invoice?**

Invoice yang dibatalkan tetap disimpan sebagai riwayat dan tidak dapat digunakan sebagai invoice aktif.

Buttons:

* Kembali
* Batalkan Invoice

---

# 41. EMPTY STATES

Create subtle empty states.

Do not use large AI illustrations.

Example:

**Belum ada invoice**

Invoice yang dibuat akan tampil di halaman ini.

`+ Buat Invoice`

Use small outline icons if needed.

---

# 42. LOADING AND ERROR STATES

Provide visual states for:

* loading table
* saving form
* failed request
* validation error
* no search result
* unauthorized access

Keep states simple and realistic.

---

# 43. TOASTS / FEEDBACK

Use small toast notifications.

Examples:

* Invoice berhasil disimpan.
* Pembayaran berhasil dicatat.
* Data klien berhasil diperbarui.
* Pengeluaran berhasil ditambahkan.
* Perubahan berhasil disimpan.

Avoid oversized success screens.

---

# 44. DUMMY DATA

Populate the prototype with realistic data so every page looks complete.

Use realistic but fictional company data for most dummy records.

For the example invoice preview, use data inspired by the attached invoice:

Invoice:
`001/INV/RKA/VIII/26`

Invoice Name:
`Project Spiritra`

Invoice Date:
`1 Agustus 2026`

Due Date:
`15 Agustus 2026`

Client:
`Graha Indonesia Telekomunika`

Invoice Item:
`Pembayaran Ke-2 Pelunasan Project Spiritra`

Total:
`Rp 3.000.000`

Use the attached invoice reference for bank/payment information if appropriate.

Create additional fictional dummy records for:

* multiple clients
* vendors
* products
* invoices
* payments
* income
* expenses

Include examples of every billing status:

* Belum Dibayar
* Dibayar Sebagian
* Lunas
* Jatuh Tempo

---

# 45. PRIMARY BUSINESS FLOW

The prototype must clearly support this main flow:

Login
→ Dashboard
→ Data Klien / Produk tersedia
→ Buat Invoice
→ Tambah Item
→ Sistem Menghitung Total
→ Nomor Invoice Dibuat
→ Simpan Invoice
→ Preview
→ Cetak PDF
→ Invoice Menjadi Tagihan
→ Pembayaran Diterima
→ Catat Pembayaran
→ Hitung Total Pembayaran
→ Hitung Sisa Tagihan
→ Perbarui Status Billing
→ Pembayaran Terhubung ke Pemasukan
→ Data Masuk ke Laporan

Important:

Creating an invoice does **NOT** immediately increase income.

An invoice becomes a receivable/tagihan.

Income is recorded only when payment has been received and recorded.

---

# 46. EXPENSE FLOW

Use this separate flow:

Login
→ Pengeluaran
→ Tambah Pengeluaran
→ Isi Transaksi
→ Pilih Vendor if applicable
→ Pilih Rekening
→ Masukkan Nominal
→ Simpan
→ Dicatat sebagai uang keluar
→ Masuk sebagai Kredit pada laporan sederhana

---

# 47. REPORT FLOW

Income + expenses feed the finance report.

Income:
Debit

Expenses:
Credit

Then calculate running balance.

Support period filtering.

---

# 48. DO NOT ADD THESE FEATURES

Strictly avoid adding major features outside the scope.

Do NOT add:

* payment gateway
* online payment checkout
* direct banking API
* bank synchronization
* client portal
* public customer login
* inventory
* stock management
* payroll
* HR management
* procurement system
* full ERP
* mobile application
* mobile-first design
* full double-entry accounting
* general journal
* general ledger
* balance sheet
* drag-and-drop invoice designer
* CRM
* project management
* chat
* AI assistant
* unnecessary notifications center
* marketing website
* public landing page

---

# 49. ANTI-AI DESIGN RULES

The final product should NOT feel generated by AI.

Strictly avoid:

* excessive gradient
* glassmorphism
* neon
* giant rounded cards
* 20px+ radius everywhere
* large colorful icon boxes
* repetitive identical statistic cards
* excessive cards inside cards
* floating widgets
* excessive shadows
* huge page headings
* random decorative waves
* random abstract blobs
* overuse of brand red
* marketing-style banners
* fake testimonials
* illustrations unrelated to finance
* excessive empty space
* random colors between pages
* different button styles between pages
* different table styles between pages
* different input styles between pages

The application must feel like **one product designed by one design team**.

---

# 50. CONSISTENCY REQUIREMENTS

Reuse the exact same:

* sidebar
* topbar
* page header
* buttons
* fields
* typography
* spacing
* table
* badge
* dropdown
* modal
* drawer
* pagination
* toast
* confirmation
* empty state
* color tokens
* icon style

Do not create a new visual language for every screen.

---

# 51. PROTOTYPE INTERACTIONS

Make the prototype navigable.

Important interactions:

Login
→ Dashboard

Sidebar items
→ corresponding pages

Dashboard statistic
→ relevant list page where appropriate

Tambah Klien
→ open modal/drawer

Buat Invoice
→ create invoice page

Invoice row
→ invoice detail

Preview
→ invoice preview

Catat Pembayaran
→ payment modal/drawer

Billing row
→ billing detail

Laporan tabs
→ change report content

Profile menu
→ logout

Logout
→ login

Use simple prototype states where full backend behavior is not necessary.

---

# 52. ROLE DEMONSTRATION

Make both roles testable in the prototype.

Support a simple prototype-level role state:

* Admin / Finance
* Pimpinan / Manager

After login, the navigation and available actions should reflect the selected user's role.

Do not duplicate the entire product into two completely separate designs.

Reuse the same system and show role-based differences.

---

# 53. FINAL QUALITY CHECK

Before finalizing the generated application, verify:

* all 20 main screens exist
* sidebar structure is consistent
* both roles are represented
* manager is primarily read-only
* invoice workflow is complete
* billing workflow is complete
* payment history exists
* partial payment is supported
* outstanding balance is visible
* income and payment are linked
* expense is separate from invoice
* debit / credit report follows the requirement
* invoice preview follows the attached reference
* company stamp and signature are visible in invoice preview
* invoice numbering settings exist
* company settings exist
* users and role access exist
* no unsupported major module was added
* colors follow DEVSPACE branding
* interface is desktop-first
* all UI copy is in Bahasa Indonesia
* design looks modern and professional
* design does not look like a generic AI dashboard

---

# 54. FINAL BUILD INSTRUCTION

Now build the **complete high-fidelity DEVSPACE Sistem Invoicing & Billing web application prototype** based on the attached requirement document.

Use the attached requirement PDF as the functional source of truth.

Use the attached DEVSPACE logo as the brand source.

Use the attached invoice image as the invoice document reference.

Generate the full application in one coherent experience.

Prioritize:

1. requirement accuracy
2. role accuracy
3. usability
4. consistency
5. professional modern enterprise appearance
6. realistic finance workflow
7. visual polish

Do not sacrifice functional clarity for decorative visuals.

Do not ask for additional clarification before creating the first complete version.

Create the strongest complete first pass possible using the existing attachments and instructions.
