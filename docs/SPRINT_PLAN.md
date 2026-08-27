# SPRINT_PLAN.md

Dokumen ini mengikuti pendekatan Agile/Scrum yang digunakan pada Proposal KP.

## Sprint 0 — Foundation
### Fazri
- Setup project Laravel.
- Install/config Vue 3, Vite, Tailwind.
- Struktur folder.
- Git baseline.
- Asset/branding.
- Router/layout awal.

### Fahmi
- Review structure.
- Siapkan desain database final bersama Fazri.

Output:
- Project dapat run.
- Struktur final tersedia.
- Baseline di repository.

## Sprint 1 — Auth & Master Data
### Fazri
- Login UI.
- Layout.
- Sidebar + collapse.
- Dashboard shell.
- Klien.
- Vendor.
- Produk & Layanan.
- Rekening.
- Data Perusahaan UI.

### Fahmi
- MySQL.
- Migration dasar.
- User/Auth/Role.
- CRUD clients/vendors/products/accounts/company.

Output:
- Auth dan master data terintegrasi.

## Sprint 2 — Invoice
### Fazri
- Invoice list.
- Create/edit/detail.
- Item form.
- Summary.
- Preview UI.
- Template/numbering UI.

### Fahmi
- Invoice/invoice items schema.
- Invoice CRUD.
- Numbering service.
- Validation.
- Status dokumen.

Output:
- Invoice dapat dibuat, disimpan, diedit, diterbitkan, dilihat.

## Sprint 3 — Billing & Payment
### Fazri
- Billing list/detail.
- Payment modal.
- Payment history.
- Status badge.

### Fahmi
- Billing calculation.
- Payment persistence.
- Partial payment.
- Overdue.
- Payment -> income transaction.

Output:
- Flow invoice -> billing -> payment -> income berjalan.

## Sprint 4 — Finance, Reports, PDF & Finalization
### Fazri
- Pemasukan.
- Pengeluaran.
- Modal 3 kolom.
- Jenis transaksi + rekening tujuan conditional.
- Reports UI.
- Dashboard data integration.
- Settings UI final.

### Fahmi
- Income/Expense.
- Expense transaction type validation.
- Reports queries.
- Dashboard queries.
- Upload files.
- PDF invoice.
- Authorization hardening.

### Bersama
- Integration test.
- UAT.
- Bug fixing.
- Documentation.
- Deployment.

Output:
- Sistem siap diuji perusahaan.
