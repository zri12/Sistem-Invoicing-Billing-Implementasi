# CLAUDE.md — Backend Development Guide

> **Project:** Sistem Invoicing & Billing  
> **Judul KP:** *Rancang Bangun Sistem Invoicing dan Billing Berbasis Web pada PT. Ruang Kreasi Aplikasi*  
> **Backend Developer:** Fahmi Nashruddin  
> **Frontend / Project Foundation:** Fazri Lukman Nurrohman  
> **Repository architecture:** satu project Laravel dengan Vue.js di repository yang sama.  
> **Target backend:** Laravel 12 + MySQL, terintegrasi dengan frontend Vue 3 yang sudah tersedia.

---

## 1. Fungsi File Ini

File ini adalah **entry point utama untuk Claude** ketika mengerjakan backend project.

Claude wajib memakai file ini untuk memahami:

- urutan dokumen yang harus dibaca;
- source-of-truth project;
- batas scope backend;
- pembagian tanggung jawab frontend/backend;
- business rule yang tidak boleh dilanggar;
- keputusan yang masih `OPEN`;
- pola arsitektur backend;
- aturan perubahan source;
- urutan pengerjaan backend;
- testing dan definition of done.

File ini **bukan pengganti** `docs/PRD.md`, `docs/BUSINESS_RULES.md`, `docs/DATABASE.md`, atau `docs/API_CONTRACT.md`.

Jika ada informasi lebih rinci di dokumen source-of-truth, gunakan dokumen tersebut.

---

# 2. Kondisi Project Saat Backend Dimulai

## 2.1 Frontend

Frontend Vue sudah tersedia sebagai baseline implementasi. Frontend saat ini masih menggunakan beberapa **frontend demo state** melalui Pinia, antara lain:

- authentication demo;
- users demo;
- master data demo;
- invoice demo;
- payment demo;
- finance demo;
- settings demo.

Tujuan backend adalah menggantikan ownership data tersebut dengan Laravel + MySQL secara bertahap.

### Aturan

Frontend dianggap **baseline/frozen UI**.

Jangan melakukan redesign frontend ketika mengerjakan backend.

Perubahan frontend hanya dilakukan jika:

1. diperlukan untuk integrasi API;
2. kontrak frontend-backend membutuhkan adapter;
3. ditemukan bug integrasi yang tidak dapat diselesaikan pada service/API frontend; atau
4. ada revisi resmi.

Perubahan integration harus minimal dan tidak merusak UI/UX baseline.

---

## 2.2 Backend

Backend bisnis final **belum selesai**.

Laravel project foundation sudah tersedia, tetapi business API, persistence, authorization final, PDF server-side, dan database business schema masih perlu diimplementasikan.

Jangan menganggap data Pinia frontend sebagai database final.

---

## 2.3 Repository dan Archive

Active branch utama adalah `main`.

Historical frontend/reference snapshot disimpan pada Git tag:

`frontend-full-reference-2026-08-28`

Folder reference lama tidak berada pada active `main`.

Runtime asset invoice pada project aktif:

- `public/favicon.ico`
- `public/images/invoice/devspace-invoice-logo.png`
- `public/images/invoice/bg-invoice.png`
- `public/fonts/tamil-sangam-mn.otf`

Jika membutuhkan historical prototype / contoh invoice original, gunakan tag snapshot sebagai **referensi historis saja**. Jangan mengembalikan folder archive ke `main` tanpa kebutuhan yang jelas.

---

# 3. Mandatory Reading Order

Sebelum membuat migration, model, controller, service, request, policy, PDF, atau API baru, baca:

1. `CLAUDE.md`
2. `docs/PRD.md`
3. `docs/BUSINESS_RULES.md`
4. `docs/DATABASE.md`
5. `docs/API_CONTRACT.md`
6. `docs/ARCHITECTURE.md`
7. `docs/DECISIONS.md`
8. `docs/backend/BACKEND_IMPLEMENTATION_PLAN.md`
9. `docs/backend/AUTHORIZATION_MATRIX.md`
10. `docs/backend/FRONTEND_BACKEND_MAPPING.md`
11. `docs/backend/BACKEND_CHECKLIST.md`
12. `docs/TESTING.md`
13. `docs/UI_UX_GUIDE.md` bila task berhubungan dengan output visual/PDF.

Jangan langsung coding sebelum membaca dokumen yang relevan.

---

# 4. Source-of-Truth Priority

Jika ada perbedaan informasi, gunakan prioritas berikut:

1. revisi/kebutuhan perusahaan terbaru yang terdokumentasi;
2. requirement resmi;
3. `docs/PRD.md`;
4. `docs/BUSINESS_RULES.md`;
5. `docs/DATABASE.md`;
6. `docs/API_CONTRACT.md`;
7. `docs/ARCHITECTURE.md`;
8. `docs/DECISIONS.md`;
9. dokumen backend pada `docs/backend/`;
10. frontend Vue saat ini sebagai kontrak integration/UI, bukan business-rule authority;
11. historical UI/reference tag;
12. proposal akademik untuk scope akademik, bukan pengganti requirement teknis.

### Jika masih konflik

Jangan memilih diam-diam.

Lakukan:

1. identifikasi konflik;
2. sebutkan file dan rule yang berbeda;
3. cek source dengan prioritas lebih tinggi;
4. jika belum resolved, tandai `NEEDS DECISION`;
5. jangan membuat perubahan irreversible sebelum keputusan jelas.

---

# 5. Scope Backend

Backend bertanggung jawab atas:

- authentication;
- current user/session;
- authorization;
- master data persistence;
- client history;
- vendor history;
- invoice persistence;
- invoice items;
- invoice calculation final;
- invoice numbering final;
- invoice status transition;
- billing calculation;
- payment validation;
- multiple payment;
- payment -> income;
- manual income;
- expense;
- cashbook/report data;
- company data;
- template settings;
- numbering settings;
- users;
- file handling;
- invoice PDF;
- backend tests;
- DB transaction;
- database constraints;
- validation;
- security.

---

# 6. Non-Scope

Jangan menambahkan tanpa requirement baru:

- client portal;
- payment gateway;
- integrasi bank otomatis;
- full accounting / double-entry accounting;
- jurnal umum;
- buku besar;
- neraca;
- inventory;
- payroll;
- native mobile app;
- invoice editor drag-and-drop;
- workflow approval wajib;
- notification baru;
- third-party integration yang tidak diminta.

---

# 7. Architecture Rule

Target data flow:

```text
User Action
    ↓
Vue Form
    ↓
Frontend Validation
    ↓
HTTP / JSON
    ↓
Laravel Route
    ↓
Authentication
    ↓
Authorization
    ↓
Form Request Validation
    ↓
Controller
    ↓
Service / Business Logic
    ↓
DB Transaction bila diperlukan
    ↓
Eloquent Model
    ↓
MySQL
    ↓
API Resource / JSON Response
    ↓
Frontend Service
    ↓
Pinia / Vue State
    ↓
UI
```

---

# 8. Backend Code Organization

Gunakan struktur jelas:

```text
app/
├── Http/
│   ├── Controllers/
│   │   └── Api/
│   ├── Requests/
│   └── Resources/
├── Models/
├── Policies/
├── Services/
└── Support/              # optional bila memang diperlukan
```

## 8.1 Controller

Controller harus tipis. Controller boleh:

- menerima validated request;
- memanggil Service;
- trigger authorization;
- memilih HTTP response;
- membungkus Resource/response.

Controller **jangan** menjadi tempat perhitungan keuangan kompleks.

## 8.2 Form Request

Validation request ditempatkan pada Form Request.

Contoh:

- `StoreClientRequest`
- `UpdateClientRequest`
- `StoreInvoiceRequest`
- `UpdateInvoiceRequest`
- `StorePaymentRequest`
- `StoreExpenseRequest`

Jangan hanya mengandalkan frontend validation.

## 8.3 Service

Business rule kompleks ditempatkan pada Service.

Contoh kandidat:

- `InvoiceService`
- `InvoiceNumberService`
- `BillingService`
- `PaymentService`
- `FinanceService`
- `ReportService`
- `InvoicePdfService`

Jangan membuat Service sebagai wrapper kosong tanpa alasan.

## 8.4 Policy / Authorization

Authorization final wajib berada di backend.

Frontend `adminOnly`, hidden button, atau read-only state **bukan security boundary**.

Lihat `docs/backend/AUTHORIZATION_MATRIX.md`.

---

# 9. Response Convention

Ikuti `docs/API_CONTRACT.md`.

## Success

```json
{
  "success": true,
  "message": "Data berhasil disimpan",
  "data": {}
}
```

## Validation Error

```json
{
  "success": false,
  "message": "Validasi gagal",
  "errors": {
    "field": ["Pesan error"]
  }
}
```

Jika kontrak perlu berubah:

1. jangan ubah diam-diam;
2. update `docs/API_CONTRACT.md`;
3. update mapping frontend;
4. dokumentasikan alasan.

---

# 10. Naming Convention API

Database/API menggunakan `snake_case`.

Frontend memakai campuran camelCase/Indonesian demo shape.

Gunakan mapping eksplisit.

Contoh:

```text
frontend clientId
↔ API client_id
```

```text
frontend dueDate
↔ API due_date
```

```text
frontend accountId
↔ API payment_account_id / account_id sesuai resource
```

Jangan mengubah schema database hanya supaya sama dengan nama Pinia.

Lihat `docs/backend/FRONTEND_BACKEND_MAPPING.md`.

---

# 11. Critical Financial Rules

## 11.1 Invoice Calculation

Setiap item:

```text
item_total = price × qty
```

Invoice:

```text
subtotal = Σ item_total
discount >= 0
discount <= subtotal
total = subtotal - discount
```

Backend wajib menghitung ulang.

Jangan percaya `subtotal`, `total`, atau `item.total` dari frontend sebagai nilai final.

---

## 11.2 Invoice Status

Document status:

- `draft`
- `published`
- `cancelled`

Rules:

- Draft tidak masuk Billing.
- Cancelled tidak masuk Billing aktif.
- Published masuk Billing.
- Existing invoice number tidak berubah ketika Edit.
- Invoice dengan histori transaksi tidak di-hard-delete sembarangan.

---

## 11.3 Billing

Billing bukan wallet.

```text
remaining = invoice.total - sum(valid payments)
```

`remaining` tidak boleh negatif.

Jangan membuat saldo Billing independen jika hanya derivation dari Invoice + Payment tanpa requirement tambahan.

---

## 11.4 Payment Status Priority

Urutan:

```text
1. paid
2. overdue
3. partial
4. unpaid
```

Pseudo-rule:

```text
if total_payments >= invoice_total:
    paid
else if due_date < today:
    overdue
else if total_payments > 0:
    partial
else:
    unpaid
```

`due_date == today` **bukan overdue**.

Mapping UI:

- `unpaid` -> Belum Dibayar
- `partial` -> Dibayar Sebagian
- `paid` -> Lunas
- `overdue` -> Jatuh Tempo

---

## 11.5 Payment

- Invoice harus Published.
- Amount > 0.
- Multiple payment diperbolehkan.
- Amount tidak boleh > remaining.
- Fully paid invoice tidak menerima payment baru.
- Payment terkait invoice.
- Payment valid menghasilkan Income terkait.

### Overpayment

Jangan clamp:

```text
amount = min(request_amount, remaining)
```

Overpayment harus ditolak.

---

## 11.6 Invoice Publish ≠ Income

```text
Invoice Published
≠ Income
```

Pemasukan invoice terjadi ketika:

```text
Payment recorded
→ Income recorded
```

Jangan membuat income ketika invoice diterbitkan.

---

## 11.7 Payment -> Income Atomicity

Payment dan Income terkait dibuat dalam satu DB transaction.

Konsep:

```text
BEGIN
lock/read invoice + payment state
calculate remaining authoritative
reject overpayment
create payment
create linked income
COMMIT
```

Jika create Income gagal, Payment juga harus rollback.

Pertimbangkan concurrency.

---

## 11.8 Expense

Jenis:

- `cash`
- `qris`
- `credit`
- `transfer`

`source_account_id` = rekening/kas perusahaan yang menjadi sumber dana.

`destination_account`:

- wajib untuk `transfer`;
- nullable untuk jenis lain.

Jika type berubah dari Transfer ke non-Transfer, simpan destination `null`.

---

## 11.9 Reports

Scope laporan adalah buku kas sederhana:

```text
Debit  = uang masuk
Kredit = uang keluar
```

Bukan double-entry accounting.

---

# 12. Database Rules

Ikuti `docs/DATABASE.md`.

General:

- foreign key pada relasi utama;
- amount = decimal, bukan float;
- `invoice_number` unique;
- timestamps konsisten;
- binary file tidak disimpan langsung di DB bila path/metadata cukup;
- transaction untuk flow lintas tabel.

---

# 13. Schema Alignment Gate

`docs/DATABASE.md` masih draft awal. Sebelum migration business final dikunci, audit gap berikut.

## 13.1 Company Fields

Frontend settings memiliki:

- `signingCity`
- `tagline`

Draft `companies` belum mencantumkan keduanya.

Jangan diam-diam menambah/menghapus tanpa alignment.

## 13.2 Account Branch

Frontend Master Data memiliki `cabang`.

Draft `accounts` belum mencantumkan `branch/cabang`.

Butuh alignment.

## 13.3 Opening Balance

`opening_balance` ada pada draft database.

Status: `REVIEW`.

Jangan mengunci perilaku final sebelum keputusan.

## 13.4 Manual Income Source

Database memiliki `source_type`.

Frontend manual income memiliki visible `source`.

Harus ditentukan apakah `source` adalah:

- display detail;
- source_type;
- atau field terpisah.

Jangan tebak.

## 13.5 Invoice Item Snapshot

Frontend menyimpan:

- `productServiceId`
- product display/name
- description
- price
- qty

Draft DB memiliki:

- `product_service_id`
- description
- qty
- price
- total

Jika product name snapshot dibutuhkan untuk histori, dokumentasikan sebelum migration final.

## 13.6 Expense Reference Number

Frontend Expense memiliki `referenceNumber`.

Draft database Expense belum mencantumkan `reference_number`.

Jangan membuang data itu diam-diam.

## 13.7 Invoice Number Format

Current app format awal:

`001/INV/RKA/VIII/26`

Historical official reference pernah menggunakan variasi separator lain.

Parser frontend support `/` dan `-`.

Final separator perlu konfirmasi.

---

# 14. Open Decisions — DO NOT INVENT

## D-007 Invoice Number Reset

Status: `OPEN`

Belum ditentukan:

- monthly;
- yearly;
- continuous.

## D-008 Manager Approval

Status: `OPEN / OPTIONAL`

Jangan membuat approval wajib.

## D-009 Opening Balance

Status: `REVIEW`

## Invoice Number Separator

Status: `NEEDS CONFIRMATION`

## Cancel Invoice After Payment

Dokumen saat ini belum menetapkan rinci bagaimana membatalkan invoice yang sudah memiliki payment.

Jangan membuat refund/reversal/deletion otomatis berdasarkan asumsi.

Jika task menyentuh kasus ini, tandai gap dan minta keputusan.

---

# 15. Authentication

API contract mendefinisikan:

- `POST /api/login`
- `POST /api/logout`
- `GET /api/me`

Mekanisme teknis authentication belum dikunci oleh source docs.

Jangan memasang library/auth stack tambahan tanpa audit dan persetujuan.

Requirements:

- password di-hash;
- inactive user tidak boleh login;
- current user endpoint;
- logout invalidates auth;
- authorization backend wajib.

---

# 16. Roles

Current roles:

- Admin / Finance
- Pimpinan / Manager

Admin/Finance: operasional penuh sesuai scope.

Manager: utamanya read-only pada module monitoring/financial yang diizinkan.

Lihat `docs/backend/AUTHORIZATION_MATRIX.md`.

Jika permission belum jelas, gunakan `NEEDS CONFIRMATION`.

---

# 17. File Upload

File yang mungkin diperlukan:

- payment proof;
- expense proof;
- company logo;
- company stamp;
- signature.

Guidelines:

- validate MIME/type;
- validate size;
- randomize generated filename;
- jangan percaya original filename;
- simpan path/metadata di DB;
- replacement file lama dengan aman;
- jangan expose private file tanpa authorization;
- test upload;
- jangan simpan binary besar di DB.

---

# 18. Invoice PDF

Backend/PDF adalah responsibility Fahmi.

Output harus:

- A4;
- dynamic data;
- official branding;
- logo;
- background;
- company data;
- client;
- items;
- subtotal;
- discount;
- total;
- payment account;
- terms;
- signing city/date bila schema dikunci;
- stamp;
- signature;
- signer;
- footer.

Jangan hard-code rekening, terms, signer, stamp, signature, atau contoh transaksi official.

Historical visual reference tersedia pada snapshot tag.

---

# 19. API Endpoint Baseline

Ikuti `docs/API_CONTRACT.md`.

Summary:

```text
POST /api/login
POST /api/logout
GET  /api/me

GET  /api/dashboard

GET/POST/PUT/PATCH clients
GET/POST/PUT/PATCH vendors
GET/POST/PUT/PATCH products-services
GET/POST/PUT/PATCH accounts

GET/POST/PUT invoices
POST invoice publish
POST invoice cancel
GET invoice preview
GET invoice pdf

GET billing
GET billing detail

GET payments
POST invoice payment
GET invoice payments

GET/POST/PUT incomes
GET/POST/PUT expenses

GET reports/*
GET/PUT company
GET/PUT invoice-template settings
GET/PUT invoice-numbering settings
GET/POST/PUT/PATCH users
```

---

# 20. Implementation Phases

Kerjakan sesuai `docs/backend/BACKEND_IMPLEMENTATION_PLAN.md`:

```text
B0 Backend Preflight & Contract Lock
B1 Database Schema + Models
B2 Authentication + Authorization
B3 Master Data API
B4 Invoice + Numbering
B5 Billing + Payment
B6 Income + Expense
B7 Reports
B8 Company + Template + Upload + PDF
B9 Frontend ↔ Backend Integration
B10 E2E + Production Readiness
```

Jangan lompat ke Payment sebelum Invoice/Billing data model stabil.

---

# 21. Testing Policy

Setiap backend phase harus disertai test.

Tidak cukup test “endpoint 200/201”.

Critical:

- login valid/invalid;
- inactive auth;
- authorization;
- invoice calculation;
- draft/published/cancelled;
- unique numbering;
- multiple payment;
- partial payment;
- overpayment;
- fully paid;
- due today;
- overdue;
- payment -> income;
- publish != income;
- expense transfer destination;
- reports debit/credit;
- PDF dynamic data.

Lihat `docs/TESTING.md`.

---

# 22. Database Transaction & Concurrency

Gunakan DB transaction untuk multi-write.

Payment wajib memperhatikan concurrency.

Race example:

```text
remaining = 1.000.000
Request A pays 800.000
Request B pays 800.000
```

Keduanya tidak boleh lolos berdasarkan remaining lama.

Implementasi harus menghitung authoritative remaining di transaction dan menggunakan strategy locking yang sesuai bila diperlukan.

---

# 23. Validation Ownership

Frontend validation = UX.

Backend validation = authority.

Backend harus mengulang:

- required;
- type;
- range;
- existence;
- status;
- authorization;
- financial calculation.

---

# 24. Historical Integrity

Master data inactive tidak boleh membuat transaksi historis kehilangan data.

Contoh:

- Client inactive;
- Vendor inactive;
- Account inactive.

Historical invoice/payment/expense tetap harus dapat dibaca.

Inactive mencegah pemakaian baru sesuai rule, bukan menghapus histori.

---

# 25. Delete Strategy

Jangan hard-delete record yang sudah digunakan transaksi tanpa requirement.

Prefer status/cancel sesuai domain.

Jangan menambahkan `SoftDeletes` ke semua model otomatis tanpa kebutuhan yang jelas.

---

# 26. Backend Definition of Done

Module belum selesai hanya karena migration/controller tersedia.

Module selesai jika:

- schema benar;
- relation benar;
- validation ada;
- authorization ada;
- business logic ada bila perlu;
- API/response benar;
- critical tests PASS;
- docs/checklist updated;
- frontend mapping dipahami.

---

# 27. Change Control

Jika Claude menemukan kebutuhan perubahan contract:

1. jelaskan masalah;
2. sebutkan affected docs;
3. sebutkan affected frontend/backend;
4. usulkan perubahan;
5. jangan melakukan perubahan besar diam-diam;
6. update source-of-truth bila disetujui.

---

# 28. Git Discipline

Sebelum coding:

```bash
git status
git branch
git log --oneline -10
```

Jangan bekerja jika ada unexplained dirty files.

Task sebaiknya:

- kecil;
- satu concern;
- commit message jelas;
- test/build sebelum commit.

Jangan force push/rewrite history tanpa instruksi eksplisit.

---

# 29. Forbidden Shortcuts

Jangan:

- trust subtotal dari request;
- trust total dari request;
- clamp overpayment;
- membuat payment tanpa income terkait;
- membuat income saat publish;
- membuat Billing saldo independen tanpa alasan;
- hard-code official invoice example;
- hard-code current date;
- hard-code account;
- hard-code role security hanya di frontend;
- menghapus failing test agar build hijau;
- silently resolve `OPEN` decision.

---

# 30. Claude Task Workflow

Untuk setiap task:

## Step 1 — Inspect

Baca relevant docs dan source.

## Step 2 — Restate

Tuliskan singkat:

- target;
- files likely affected;
- business rules;
- open decisions.

## Step 3 — Implement

Buat perubahan minimal.

## Step 4 — Test

Jalankan test terkait.

## Step 5 — Validate

Minimal sesuai scope:

```bash
php artisan route:list
php artisan test
npm run build
```

## Step 6 — Diff Audit

```bash
git status
git diff --stat
git diff
```

## Step 7 — Report

Berikan:

- files changed;
- DB/API change;
- business rules;
- authorization;
- tests;
- decisions;
- blockers.

---

# 31. Backend Task Report Template

```text
# BACKEND TASK REPORT

## Status
PASS / PASS WITH NOTES / BLOCKED

## Scope
...

## Source Documents Read
...

## Files Added
...

## Files Modified
...

## Database
...

## API
...

## Business Rules
...

## Authorization
...

## Tests
...

## Validation
php artisan test:
php artisan route:list:
npm run build:

## Open Decisions
...

## Git Status
...

## Next Recommended Phase
...
```

---

# 32. Final Reminder

Backend harus membuat data/frontend demo menjadi data persisten tanpa mengubah makna bisnis.

Prioritas:

```text
correctness
> data integrity
> security
> API consistency
> maintainability
> speed of implementation
```

Jika requirement belum jelas:

**STOP, document, ask.**

Jangan menebak.
