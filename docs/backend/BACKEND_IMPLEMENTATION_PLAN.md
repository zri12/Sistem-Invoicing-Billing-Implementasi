# BACKEND_IMPLEMENTATION_PLAN.md

> **Project:** Sistem Invoicing & Billing  
> **Backend Owner:** Fahmi Nashruddin  
> **Stack target:** Laravel 12 + MySQL  
> **Frontend:** Vue 3 + Pinia + Vue Router, sudah tersedia sebagai baseline.

---

# 1. Tujuan

Dokumen ini adalah roadmap implementasi backend dari Laravel foundation menuju backend yang terintegrasi penuh.

Phase:

- B0 — Backend Preflight & Contract Lock
- B1 — Database Schema + Models
- B2 — Authentication + Authorization
- B3 — Master Data API
- B4 — Invoice + Numbering
- B5 — Billing + Payment
- B6 — Income + Expense
- B7 — Reports
- B8 — Company + Template + Upload + PDF
- B9 — Frontend ↔ Backend Integration
- B10 — End-to-End & Production Readiness

Backend tidak dianggap selesai hanya karena route/controller tersedia.

---

# 2. Global Definition of Done

Setiap phase dianggap selesai jika:

- sesuai PRD dan Business Rules;
- backend menjadi authoritative source untuk data phase tersebut;
- Form Request validation tersedia;
- authorization tersedia bila diperlukan;
- DB constraint dan relation benar;
- response API konsisten;
- critical test tersedia dan PASS;
- `php artisan test` PASS untuk scope terkait;
- `php artisan route:list` PASS;
- frontend build tetap aman;
- docs/checklist diperbarui;
- Git status bersih setelah commit.

---

# 3. Global Technical Rules

## Controller

Controller tipis.

## Validation

Gunakan Form Request.

## Business Logic

Gunakan Service bila logic melibatkan:

- perhitungan;
- status;
- multi-table write;
- numbering;
- DB transaction;
- report composition.

## Database

- money = DECIMAL;
- foreign key;
- `invoice_number` unique;
- Payment -> Income dalam transaction;
- jangan percaya total frontend.

## Authorization

Backend authorization wajib.

## API

Ikuti `docs/API_CONTRACT.md`.

---

# B0 — Backend Preflight & Contract Lock

## Goal

Mencegah migration/schema dibuat berdasarkan asumsi yang belum dikunci.

## B0.1 Audit Laravel

Periksa:

```text
app/
database/
routes/
config/
tests/
composer.json
.env.example
```

Catat:

- Laravel/PHP version;
- current auth dependencies;
- DB config;
- migrations existing;
- API route state;
- testing setup.

## B0.2 Audit Frontend Integration Points

Periksa:

```text
resources/js/services/api.js
resources/js/stores/auth.js
resources/js/stores/masterData.js
resources/js/stores/invoice.js
resources/js/stores/payment.js
resources/js/stores/finance.js
resources/js/stores/settings.js
resources/js/stores/users.js
```

Demo data bukan source-of-truth database, tetapi field mapping perlu dipahami.

## B0.3 Contract/Schema Gap Register

Sebelum migration final, tandai:

1. `companies.tagline` — frontend ada, DB draft belum ada.
2. `companies.signing_city` — frontend ada, DB draft belum ada.
3. `accounts.branch` — frontend `cabang`, DB draft belum ada.
4. `opening_balance` — REVIEW.
5. manual income visible `source` vs `source_type`.
6. manual income `notes` bila perlu.
7. Expense `referenceNumber` vs DB draft.
8. invoice item product-name snapshot.
9. invoice numbering `digits` vs DB draft.
10. invoice separator final.
11. sequence reset rule — OPEN.
12. Manager approval — OPEN.
13. cancel invoice setelah payment — belum rinci.

Jangan resolve berdasarkan preferensi developer.

## B0.4 API Convention Audit

Pastikan:

- base `/api`;
- JSON success/error shape;
- backend uses snake_case;
- pagination convention bila ditambahkan;
- validation response;
- auth behavior.

## Deliverables

- notes/gap register;
- keputusan yang perlu ditanyakan;
- tidak ada implementation besar.

---

# B1 — Database Schema + Models

## Goal

Membuat schema relational dan Eloquent model sebagai fondasi backend.

## B1.1 Business Tables

Berdasarkan database draft:

```text
users
companies
clients
vendors
products_services
accounts
invoices
invoice_items
payments
incomes
expenses
invoice_number_settings
invoice_template_settings
```

Framework tables Laravel boleh tetap ada bila digunakan.

---

## B1.2 Users

Draft fields:

```text
id
name
username/email
password
role
status
timestamps
```

Checklist design:

- username/email login field dikunci;
- unique constraints;
- password hashed;
- role values sesuai project;
- status values sesuai project.

Current scope role:

```text
admin
manager
```

Current status:

```text
aktif
nonaktif
```

Jangan tambah role diam-diam.

---

## B1.3 Companies

Draft:

```text
id
name
address
phone
email
website
logo_path
stamp_path
signature_path
signer_name
signer_title
timestamps
```

Alignment pending:

```text
tagline
signing_city
code semantics
```

Frontend sekarang menggunakan `tagline`, `signingCity`, dan `code`.

Jangan final migration sebelum alignment.

---

## B1.4 Clients

```text
id
name
pic_name
address
phone
email
notes
status
timestamps
```

Relation:

```text
Client hasMany Invoice
```

Rules:

- name required;
- email nullable + valid;
- status allowed;
- histori tetap readable saat inactive.

---

## B1.5 Vendors

```text
id
name
pic_name
address
phone
email
notes
status
timestamps
```

Relation:

```text
Vendor hasMany Expense
```

Vendor optional on Expense.

---

## B1.6 Products & Services

```text
id
name
description
default_price
unit
status
timestamps
```

`default_price` = DECIMAL.

Invoice item harus menyimpan transaction snapshot, bukan menghitung ulang histori dari current default price.

---

## B1.7 Accounts

Draft:

```text
id
name
account_number
account_holder
opening_balance
status
timestamps
```

Alignment pending:

```text
branch
```

Opening balance:

`REVIEW`.

Relations:

```text
Account hasMany Payment
Account hasMany Income
Account hasMany Expense through source_account_id
```

---

## B1.8 Invoices

```text
id
invoice_number
invoice_name
client_id
invoice_date
due_date
document_status
subtotal
discount
total
payment_account_id
payment_terms
invoice_notes
created_by
timestamps
```

Constraints:

- `invoice_number UNIQUE`;
- FK client;
- FK payment account;
- FK creator;
- date types;
- money = DECIMAL.

`subtotal` dan `total` authoritative dari backend.

---

## B1.9 Invoice Items

```text
id
invoice_id
product_service_id nullable
description
qty
price
total
timestamps
```

Important:

- optional product FK;
- description/price transaction snapshot;
- product name snapshot decision perlu alignment;
- total backend calculated.

---

## B1.10 Payments

```text
id
invoice_id
payment_date
amount
method
account_id
reference_number nullable
proof_path nullable
notes nullable
created_by
timestamps
```

Constraints/relations:

- FK invoice;
- FK account;
- FK creator;
- amount DECIMAL;
- indexes untuk invoice/date/account.

Overpayment tidak dapat diselesaikan hanya dengan DB constraint; Service diperlukan.

---

## B1.11 Incomes

```text
id
income_date
source_type
payment_id nullable
invoice_id nullable
category
description
amount
account_id
created_by
timestamps
```

Payment-derived Income:

```text
payment_id -> payments.id
invoice_id -> invoices.id
```

Pertimbangkan unique `payment_id` bila final relationship tetap 1 payment : 1 income, untuk mencegah duplicate linked income.

Exact source_type values perlu dikunci sebelum enum/check constraint.

---

## B1.12 Expenses

```text
id
expense_date
vendor_id nullable
category
description
amount
source_account_id
transaction_type
destination_account nullable
proof_path nullable
notes nullable
created_by
timestamps
```

Transaction type:

```text
cash
qris
credit
transfer
```

Frontend juga memiliki `referenceNumber`; alignment DB diperlukan.

---

## B1.13 Invoice Number Settings

Draft:

```text
id
sequence_start
document_code
company_code
month_format
year_format
reset_rule
timestamps
```

Frontend juga memiliki `digits`.

Reset semantics masih OPEN.

Need design untuk concurrency-safe sequence.

---

## B1.14 Invoice Template Settings

Draft booleans:

```text
show_logo
show_tagline
show_company_info
show_invoice_number
show_dates
show_client
show_items
show_subtotal
show_discount
show_total
show_account
show_terms
show_stamp
show_signature
show_signer_name
show_signer_title
```

Frontend memiliki beberapa flag lebih granular; align sebelum persistence.

---

## B1.15 Core Relations

```text
User
 ├── invoicesCreated
 ├── paymentsCreated
 ├── incomesCreated
 └── expensesCreated

Client
 └── invoices

Vendor
 └── expenses

ProductService
 └── invoiceItems

Account
 ├── invoicePaymentAccounts
 ├── payments
 ├── incomes
 └── expensesAsSource

Invoice
 ├── client
 ├── items
 ├── payments
 ├── incomes
 └── paymentAccount

Payment
 ├── invoice
 ├── account
 ├── creator
 └── income

Income
 ├── payment
 ├── invoice
 ├── account
 └── creator

Expense
 ├── vendor
 ├── sourceAccount
 └── creator
```

---

## B1.16 Index Review

Evaluate minimal indexes:

```text
invoices.invoice_number UNIQUE
invoices.client_id
invoices.document_status
invoices.invoice_date
invoices.due_date

payments.invoice_id
payments.payment_date
payments.account_id

incomes.payment_id
incomes.invoice_id
incomes.income_date
incomes.account_id

expenses.vendor_id
expenses.source_account_id
expenses.expense_date
expenses.transaction_type
```

Do not over-index tanpa query need.

---

## B1.17 Money Precision

Gunakan DECIMAL, bukan FLOAT/DOUBLE.

Document precision/scale yang dipilih.

---

## B1.18 B1 Tests

- migration runs;
- `migrate:fresh` test env;
- FK relation;
- invoice number unique;
- decimal casts/values;
- nullable vendor/product relation;
- model relation;
- settings seed/single-row strategy bila dibuat.

## B1 Definition of Done

- migrations complete;
- models complete;
- relations complete;
- factories/seeders cukup untuk tests;
- migration fresh PASS;
- tests PASS;
- schema decisions documented.

---

# B2 — Authentication + Authorization

## Goal

Menggantikan frontend demo auth dengan backend authoritative auth.

## B2.1 Auth Contract

```text
POST /api/login
POST /api/logout
GET  /api/me
```

Mekanisme teknis auth harus diaudit/dikonfirmasi dari project; jangan instal package tanpa keputusan.

## B2.2 Login

Validate:

- credential required;
- account exists;
- password valid;
- status aktif.

Inactive rejected.

## B2.3 Current User

Minimal response:

```text
id
name
username/email
role
status
```

Jangan return password/hash.

## B2.4 Logout

Invalidate auth/session sesuai mekanisme final.

## B2.5 Authorization

Implement Policy/Middleware sesuai `AUTHORIZATION_MATRIX.md`.

## B2.6 Tests

- login valid;
- invalid;
- inactive;
- logout;
- `GET /api/me`;
- unauthenticated protected route;
- Admin write;
- Manager forbidden write;
- direct API bypass forbidden.

---

# B3 — Master Data API

## Goal

Mengganti `masterData.js` demo state dengan persistence.

## B3.1 Clients

```text
GET    /api/clients
POST   /api/clients
GET    /api/clients/{id}
PUT    /api/clients/{id}
PATCH  /api/clients/{id}/status
GET    /api/clients/{id}/invoices
```

## B3.2 Vendors

```text
GET    /api/vendors
POST   /api/vendors
GET    /api/vendors/{id}
PUT    /api/vendors/{id}
PATCH  /api/vendors/{id}/status
GET    /api/vendors/{id}/expenses
```

## B3.3 Products Services

```text
GET    /api/products-services
POST   /api/products-services
GET    /api/products-services/{id}
PUT    /api/products-services/{id}
PATCH  /api/products-services/{id}/status
```

## B3.4 Accounts

```text
GET    /api/accounts
POST   /api/accounts
GET    /api/accounts/{id}
PUT    /api/accounts/{id}
PATCH  /api/accounts/{id}/status
```

## B3.5 Active vs Historical

Need support:

- active list for new transaction;
- inactive record still readable for historical transaction.

Do not hide relation solely because status inactive.

## B3.6 Search/Pagination

Jika ditambahkan, standardize query names. Update API contract.

Potential:

```text
?page=
?per_page=
?search=
?status=
```

## B3 Tests

Per master:

- list;
- create;
- detail;
- update;
- status;
- validation;
- Manager authorization;
- historical relation readable.

---

# B4 — Invoice + Numbering

## Goal

Backend owns Invoice persistence, number, calculation, items, status transition.

## B4.1 Endpoints

```text
GET  /api/invoices
POST /api/invoices
GET  /api/invoices/{id}
PUT  /api/invoices/{id}
POST /api/invoices/{id}/publish
POST /api/invoices/{id}/cancel
GET  /api/invoices/{id}/preview
GET  /api/invoices/{id}/pdf
```

PDF may be completed in B8.

## B4.2 Create Invoice

Input concept:

```text
invoice_name
client_id
invoice_date
due_date
payment_account_id
discount
payment_terms
invoice_notes
items[]
```

Backend:

1. validate client/account;
2. validate item;
3. calculate item totals;
4. calculate subtotal;
5. validate discount;
6. calculate total;
7. generate unique invoice number;
8. save header/items transactionally.

## B4.3 Item Rules

```text
product_service_id nullable
description required
price > 0
qty > 0
total calculated
```

## B4.4 Numbering

Requirements:

- unique;
- sequence numeric;
- concurrency-safe;
- existing number immutable;
- month/year settings respected;
- reset policy OPEN.

No fragile `split('/')`.

## B4.5 Number Concurrency

Two simultaneous creates must not receive same number.

Design safe sequence strategy before coding.

Do not rely solely on parsing `MAX(invoice_number)`.

DB unique remains final guard.

## B4.6 Edit

Edit:

- keep invoice number;
- preserve status unless explicit transition endpoint;
- recalc totals;
- sync items transactionally.

Published edit must not silently become Draft.

## B4.7 Publish

Draft -> Published.

**Do not create Income.**

## B4.8 Cancel

No automatic payment/income deletion.

Case invoice with payment requires explicit business decision.

## B4 Tests

- single item;
- multi item;
- manipulated subtotal ignored;
- manipulated total ignored;
- negative discount reject;
- discount > subtotal reject;
- unique number;
- number immutable;
- Draft excluded Billing;
- Published included Billing;
- Cancelled excluded active Billing;
- Publish no Income.

---

# B5 — Billing + Payment

## Goal

Backend authoritative Billing/Payment.

## B5.1 Billing Is Derived

```text
published invoice
+
payments
```

Output concept:

```text
invoice_total
total_paid
remaining
due_date
payment_status
```

## B5.2 Billing Endpoints

```text
GET /api/billing
GET /api/billing/{invoiceId}
```

## B5.3 Payment Endpoints

```text
GET  /api/payments
POST /api/invoices/{invoiceId}/payments
GET  /api/invoices/{invoiceId}/payments
```

## B5.4 Validation

- authenticated;
- authorized;
- invoice exists;
- Published;
- date required;
- amount > 0;
- method required;
- account valid;
- remaining > 0;
- amount <= remaining.

## B5.5 Atomic Payment Flow

```text
BEGIN
lock authoritative state
verify Published
calculate invoice total
sum payments
calculate remaining
reject invalid amount
create payment
create linked income
COMMIT
```

Failure -> rollback all.

## B5.6 Payment Status

Priority:

```text
paid
overdue
partial
unpaid
```

Due today is not overdue.

## B5.7 Proof Upload

- MIME validation;
- size validation;
- safe filename/path;
- authorization.

## B5 Tests

Partial:

```text
Invoice 5.000.000
Payment 2.000.000
remaining 3.000.000
partial
```

Overpayment:

```text
remaining 3.000.000
request 4.000.000
reject
```

No Payment, no Income.

Full:

```text
payment 3.000.000
remaining 0
paid
```

Due:

```text
due today + unpaid -> unpaid
due yesterday + unpaid -> overdue
due yesterday + partial -> overdue
paid + past due -> paid
```

Publish alone -> no Income.

---

# B6 — Income + Expense

## B6.1 Income Sources

```text
payment-derived
manual non-invoice
```

Payment-derived Income tidak dibuat melalui public manual endpoint.

## B6.2 Income API

```text
GET  /api/incomes
POST /api/incomes
PUT  /api/incomes/{id}
```

POST/PUT manual only.

## B6.3 Manual Income

Draft DB requires:

```text
income_date
source_type
category
description
amount
account_id
created_by
```

Align visible `source` before final API/schema.

## B6.4 Expense API

```text
GET  /api/expenses
POST /api/expenses
GET  /api/expenses/{id}
PUT  /api/expenses/{id}
```

## B6.5 Expense Validation

```text
expense_date required
vendor_id nullable valid
category required
description required
amount > 0
source_account_id required
transaction_type in cash,qris,credit,transfer
destination_account required_if transfer
```

Non-transfer -> destination normalized `null`.

## B6 Tests

- manual Income valid;
- payment Income cannot be forged via manual endpoint;
- duplicate payment-income prevented;
- cash/qris/credit no destination valid;
- transfer no destination reject;
- transfer destination valid;
- type switch clears destination;
- Manager forbidden write.

---

# B7 — Reports

## Goal

Server provides reporting data.

## B7.1 Cashbook

```text
GET /api/reports/cashbook
```

Rule:

```text
Income  -> Debit
Expense -> Kredit
```

Expense account = `source_account_id`.

External destination account bukan internal cashbook account.

## B7.2 Other Reports

```text
GET /api/reports/invoices
GET /api/reports/payments
GET /api/reports/incomes
GET /api/reports/expenses
```

Common filters:

```text
from
to
account_id
```

## B7.3 Opening Balance

Draft formula:

```text
ending_balance = opening_balance + debit - credit
```

But opening balance = REVIEW.

Do not finalize before decision.

## B7.4 Query Quality

Avoid N+1.

Use eager loading/aggregate/index appropriately.

## B7 Tests

- Income = Debit;
- Expense = Kredit;
- source account correct;
- date filter;
- account filter;
- balance only after decision.

---

# B8 — Company + Settings + Upload + PDF

## B8.1 Company

```text
GET /api/company
PUT /api/company
```

Align:

- tagline;
- signing_city;
- code semantics.

## B8.2 Template Settings

```text
GET /api/settings/invoice-template
PUT /api/settings/invoice-template
```

All frontend toggles must map without silent drop.

## B8.3 Numbering Settings

```text
GET /api/settings/invoice-numbering
PUT /api/settings/invoice-numbering
```

Existing invoices immutable.

## B8.4 Upload

Handle:

- logo;
- stamp;
- signature.

Document multipart endpoints before integration.

## B8.5 PDF

PDF:

- A4;
- dynamic data;
- official branding;
- correct client/items/total/account;
- terms;
- signer;
- stamp/signature;
- runtime assets.

Historical visual reference is on snapshot tag.

## B8 Tests

- company update;
- file validation;
- replacement;
- settings persistence;
- number settings do not mutate historical invoice;
- PDF response;
- dynamic values;
- manual visual QA.

---

# B9 — Frontend ↔ Backend Integration

## Goal

Replace demo state with API-backed state without redesign.

## B9.1 Existing API Client

`resources/js/services/api.js`

Base:

`/api`

`withCredentials: true`.

Use centralized service modules, not scattered Axios calls inside views.

## B9.2 Recommended Replacement Sequence

```text
auth
master data
company/users/settings
invoice
billing/payment
finance
reports
dashboard
```

## B9.3 Pinia

Pinia may remain state/cache.

Backend becomes source-of-truth.

Remove demo seed only after corresponding module works.

## B9.4 Validation Error Mapping

Map backend `errors.field` to current form errors.

## B9.5 UX States

Handle:

- loading;
- empty;
- validation;
- unauthorized;
- expired session;
- network error.

## B9 Smoke Flow

```text
Login
Master Data
Invoice Draft
Publish
Billing
Partial Payment
Income
Expense
Report
PDF
Logout
```

---

# B10 — E2E & Production Readiness

## B10.1 Full Regression

Admin and Manager.

## B10.2 Security

Audit:

- authentication;
- authorization;
- mass assignment;
- upload;
- validation;
- secrets;
- session/CSRF according auth mechanism;
- debug mode;
- error output.

## B10.3 DB

- migrate fresh dev/test;
- seed if needed;
- transaction safety;
- indexes;
- constraints.

## B10.4 Performance

- N+1;
- pagination;
- report query;
- PDF generation.

## B10.5 Final Test

All critical cases in `docs/TESTING.md` and backend checklist.

---

# 4. Dependency Graph

```text
B0
 ↓
B1
 ↓
B2
 ↓
B3
 ↓
B4
 ↓
B5
 ↓
B6
 ↓
B7
 ↓
B8
 ↓
B9
 ↓
B10
```

Some Company/Settings groundwork may be done earlier, but PDF should wait until Invoice contract stabilizes.

---

# 5. Deliverable Per Phase

Setiap phase report:

```text
Status
Scope
Docs read
Files added
Files modified
DB change
API change
Business rules
Authorization
Tests
Build/routes
Open decisions
Git commit
Next phase
```

---

# 6. Stop Conditions

Claude harus STOP bila:

- schema conflict unresolved dan memblok migration;
- Git state tidak jelas;
- destructive migration terhadap existing data dibutuhkan;
- business rule tidak specified;
- task perlu resolve OPEN decision;
- auth mechanism membutuhkan package baru belum approved;
- invoice cancel/payment undefined menjadi relevan.

---

# 7. Backend Completion Criteria

Backend overall complete ketika:

- DB authoritative;
- auth authoritative;
- authorization enforced backend;
- core APIs operational;
- invoice calculation authoritative;
- numbering unique/concurrency-safe;
- Billing derived benar;
- Payment atomic dengan Income;
- Manual Income separate;
- Expense correct;
- Reports correct;
- settings persistent;
- PDF server-side correct;
- frontend demo state replaced;
- tests critical PASS;
- UAT ready.
