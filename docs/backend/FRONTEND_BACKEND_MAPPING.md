# FRONTEND_BACKEND_MAPPING.md

> Mapping antara frontend Vue/Pinia saat ini dan backend Laravel API yang akan dibangun.  
> Tujuan: mengganti demo state dengan server persistence tanpa mengubah makna data atau merusak UI baseline.

---

# 1. Current Frontend Architecture

Frontend menggunakan:

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

Axios instance:

```text
baseURL = /api
withCredentials = true
Accept = application/json
Content-Type = application/json
```

Current source masih memiliki demo state di Pinia. Backend target harus menggantikan ownership data tersebut.

---

# 2. Integration Principle

Current:

```text
Vue View
→ Pinia Demo State
```

Target:

```text
Vue View
→ Pinia
→ Frontend Service
→ Laravel API
→ MySQL
```

Pinia boleh tetap menjadi client-side state/cache.

Backend menjadi source-of-truth.

---

# 3. General Mapping Convention

Backend/API/DB menggunakan `snake_case`.

Frontend saat ini menggunakan campuran camelCase dan nama Indonesia.

Gunakan mapper eksplisit.

Jangan:

- mengganti schema DB hanya supaya sama dengan Pinia;
- expose raw Eloquent model tanpa kontrol bila shape tidak stabil;
- menyimpan display-only property sebagai DB field tanpa alasan.

Possible flow:

```text
Eloquent
→ API Resource
→ JSON snake_case
→ frontend service mapper
→ Pinia expected shape
```

---

# 4. Authentication Mapping

Current store:

`resources/js/stores/auth.js`

Current demo actions:

```text
loginDemo(username, password)
logoutDemo()
```

Current state:

```text
user
loginError
```

Target endpoints:

```text
POST /api/login
POST /api/logout
GET  /api/me
```

Target integration:

```text
loginDemo()
→ login()
→ POST /api/login

logoutDemo()
→ logout()
→ POST /api/logout

app init/session restore
→ fetchCurrentUser()
→ GET /api/me
```

Frontend expected minimal user:

```text
id
username
name
role
```

Backend may include:

```text
email
status
```

Never return password/hash.

---

# 5. Users Store Mapping

Current store:

`resources/js/stores/users.js`

Demo operations:

```text
findByUsername()
addUser()
updateUser()
setStatus()
```

Target endpoints:

```text
GET    /api/users
POST   /api/users
GET    /api/users/{id}
PUT    /api/users/{id}
PATCH  /api/users/{id}/status
```

Current frontend fields:

```text
id
name
email
username
password
role
status
createdAt
```

Mapping:

| Frontend | Backend |
|---|---|
| `id` | `id` |
| `name` | `name` |
| `email` | `email` |
| `username` | `username` |
| `password` input | request only; DB hash |
| `role` | `role` |
| `status` | `status` |
| `createdAt` | `created_at` |

Password must not be returned.

---

# 6. Master Data Store

Current:

`resources/js/stores/masterData.js`

Collections:

```text
clients
vendors
products
accounts
```

Helpers:

```text
recordsFor
activeRecordsFor
getClientById
getVendorById
getProductById
getAccountById
```

Target:

- state starts empty/loading;
- API fetch populates state;
- active selector uses API data/status;
- historical lookup uses all fetched/related records.

Do not retain `masterDataSeed` as production authority after integration.

---

# 7. Client Mapping

Current frontend fields:

```text
id
nama
pic
alamat
telepon
email
catatan
status
jumlah
```

DB contract:

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

Mapping:

| Frontend | Backend |
|---|---|
| `id` | `id` |
| `nama` | `name` |
| `pic` | `pic_name` |
| `alamat` | `address` |
| `telepon` | `phone` |
| `email` | `email` |
| `catatan` | `notes` |
| `status` | `status` |
| `jumlah` | derived invoice count |

`jumlah` sebaiknya derived count, bukan field persisted hanya karena demo state memilikinya.

Endpoints:

```text
GET /api/clients
POST /api/clients
GET /api/clients/{id}
PUT /api/clients/{id}
PATCH /api/clients/{id}/status
GET /api/clients/{id}/invoices
```

---

# 8. Vendor Mapping

Current frontend:

```text
id
nama
pic
alamat
telepon
email
status
jumlah
```

Backend:

```text
id
name
pic_name
address
phone
email
notes
status
```

Mapping follows Client pattern.

`jumlah` = derived Expense count.

---

# 9. Product & Service Mapping

Current frontend:

```text
id
nama
deskripsi
harga
satuan
status
```

Backend:

```text
id
name
description
default_price
unit
status
```

Mapping:

| Frontend | Backend |
|---|---|
| `nama` | `name` |
| `deskripsi` | `description` |
| `harga` | `default_price` |
| `satuan` | `unit` |
| `status` | `status` |

---

# 10. Account Mapping

Current frontend:

```text
id
nama
nomor
atasNama
cabang
status
```

Database draft:

```text
id
name
account_number
account_holder
opening_balance
status
```

Mapping:

| Frontend | Backend |
|---|---|
| `nama` | `name` |
| `nomor` | `account_number` |
| `atasNama` | `account_holder` |
| `cabang` | schema alignment required |
| `status` | `status` |
| not shown | `opening_balance` REVIEW |

`cabang` jangan hilang diam-diam.

---

# 11. Invoice Store Mapping

Current store:

`resources/js/stores/invoice.js`

Demo operations:

```text
getInvoiceById()
numberFor()
createInvoice()
updateInvoice()
cancelInvoice()
setPreview()
```

Target endpoints:

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

Backend owns:

- ID;
- invoice number;
- subtotal;
- total;
- document status transition;
- persistence.

Frontend `numberFor()` tidak menjadi authority setelah backend integration.

---

# 12. Invoice Header Mapping

Current frontend form/state:

```text
name
clientId
client
date
dueDate
discount
accountId
terms
notes
status
number
items
```

Backend contract:

```text
invoice_name
client_id
invoice_date
due_date
discount
payment_account_id
payment_terms
invoice_notes
document_status
invoice_number
subtotal
total
```

Mapping:

| Frontend | Backend |
|---|---|
| `name` | `invoice_name` |
| `clientId` | `client_id` |
| `client` | relation/display; jangan dipercaya sebagai FK |
| `date` | `invoice_date` |
| `dueDate` | `due_date` |
| `discount` | `discount` |
| `accountId` | `payment_account_id` |
| `terms` | `payment_terms` |
| `notes` | `invoice_notes` |
| `status` | `document_status` |
| `number` | `invoice_number` |
| frontend computed | `subtotal` backend authoritative |
| frontend computed | `total` backend authoritative |

---

# 13. Invoice Item Mapping

Current frontend item:

```text
id
productServiceId
product
description
price
qty
```

Backend draft:

```text
id
invoice_id
product_service_id
description
qty
price
total
```

Mapping:

| Frontend | Backend |
|---|---|
| `id` | `id` |
| `productServiceId` | `product_service_id` |
| `product` | historical/display snapshot decision |
| `description` | `description` |
| `price` | `price` |
| `qty` | `qty` |
| computed display total | backend `total` |

Backend must recalculate item total.

---

# 14. Invoice Response Shape — Integration Target

Exact response harus dikunci di `API_CONTRACT.md` sebelum dianggap final.

Possible controlled Resource:

```json
{
  "id": 1,
  "invoice_number": "001/INV/RKA/VIII/26",
  "invoice_name": "Project",
  "client_id": 1,
  "client": {},
  "invoice_date": "2026-08-01",
  "due_date": "2026-08-15",
  "document_status": "published",
  "subtotal": "3000000.00",
  "discount": "0.00",
  "total": "3000000.00",
  "payment_account_id": 1,
  "payment_account": {},
  "payment_terms": "...",
  "invoice_notes": null,
  "items": []
}
```

Frontend mapper dapat mengubah menjadi camelCase current shape.

---

# 15. Payment Store Mapping

Current store:

`resources/js/stores/payment.js`

Current fields:

```text
id
invoiceId
paymentDate
amount
method
accountId
referenceNumber
proofName
notes
createdBy
createdAt
```

Backend DB:

```text
id
invoice_id
payment_date
amount
method
account_id
reference_number
proof_path
notes
created_by
timestamps
```

Mapping:

| Frontend | Backend |
|---|---|
| `invoiceId` | `invoice_id` |
| `paymentDate` | `payment_date` |
| `amount` | `amount` |
| `method` | `method` |
| `accountId` | `account_id` |
| `referenceNumber` | `reference_number` |
| `proofName` | display from `proof_path`/metadata |
| `notes` | `notes` |
| `createdBy` | creator relation/resource |
| `createdAt` | `created_at` |

---

# 16. Payment API and Derived Data

Endpoints:

```text
GET  /api/payments
POST /api/invoices/{invoiceId}/payments
GET  /api/invoices/{invoiceId}/payments
```

Current frontend getters:

```text
paymentsByInvoice
totalPaidByInvoice
paymentSummaryByInvoice
```

Target:

- backend calculates authoritative Billing summary;
- frontend may compute display temporarily but server wins.

---

# 17. Payment Status Mapping

Frontend current display-internal values:

```text
lunas
jatuh_tempo
dibayar_sebagian
belum_dibayar
```

Business/backend canonical:

```text
paid
overdue
partial
unpaid
```

Recommended:

backend returns canonical English status, frontend maps label Indonesia.

Do not store display labels as DB values unless explicitly decided.

---

# 18. Finance Store Mapping

Current:

`resources/js/stores/finance.js`

State:

```text
manualIncomes
expenses
```

Getters:

```text
allIncomes
cashbookEntries
```

Current payment-derived income dibuat client-side.

Target:

Payment Service creates payment-derived Income server-side.

---

# 19. Income Mapping

Current conceptual frontend fields:

```text
id
source
paymentId
invoiceId
date
category
description
invoiceNumber
client
accountId
amount
notes
```

Backend draft:

```text
id
income_date
source_type
payment_id
invoice_id
category
description
amount
account_id
created_by
timestamps
```

Mapping:

| Frontend | Backend |
|---|---|
| `date` | `income_date` |
| `source` | source_type/source-detail alignment needed |
| `paymentId` | `payment_id` |
| `invoiceId` | `invoice_id` |
| `category` | `category` |
| `description` | `description` |
| `amount` | `amount` |
| `accountId` | `account_id` |
| `invoiceNumber` | relation-derived |
| `client` | relation-derived |
| `notes` | DB draft currently not explicit; align |

Important:

- manual endpoint tidak boleh membuat fake invoice source;
- payment-derived income tidak boleh duplicate;
- account_id dibutuhkan oleh DB contract.

---

# 20. Expense Mapping

Current frontend:

```text
id
date
vendorId
category
description
amount
transactionType
sourceAccountId
destinationAccount
referenceNumber
proofName
notes
```

Backend draft:

```text
id
expense_date
vendor_id
category
description
amount
source_account_id
transaction_type
destination_account
proof_path
notes
created_by
timestamps
```

Mapping:

| Frontend | Backend |
|---|---|
| `date` | `expense_date` |
| `vendorId` | `vendor_id` |
| `category` | `category` |
| `description` | `description` |
| `amount` | `amount` |
| `sourceAccountId` | `source_account_id` |
| `transactionType` | `transaction_type` |
| `destinationAccount` | `destination_account` |
| `proofName` | `proof_path`/metadata |
| `notes` | `notes` |
| `referenceNumber` | DB alignment needed |

External `destinationAccount` jangan dipakai sebagai internal account/report filter.

---

# 21. Reports Mapping

Current cashbook rule:

```text
Income -> Debit
Expense -> Kredit
```

Target endpoints:

```text
GET /api/reports/cashbook
GET /api/reports/invoices
GET /api/reports/payments
GET /api/reports/incomes
GET /api/reports/expenses
```

Expense account for report:

`source_account_id`.

Never map external destination as company cashbook account.

---

# 22. Settings Store Mapping

Current:

`resources/js/stores/settings.js`

State groups:

```text
company
invoiceTemplate
invoiceNumbering
```

Target API:

```text
GET /api/company
PUT /api/company

GET /api/settings/invoice-template
PUT /api/settings/invoice-template

GET /api/settings/invoice-numbering
PUT /api/settings/invoice-numbering
```

---

# 23. Company Mapping

Current frontend:

```text
name
code
address
signingCity
phone
email
website
tagline
signerName
signerPosition
logoUrl
stampUrl
signatureUrl
```

DB draft:

```text
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
```

Alignment gaps:

```text
code
signingCity
tagline
```

Potential mapping:

| Frontend | Backend |
|---|---|
| `name` | `name` |
| `address` | `address` |
| `phone` | `phone` |
| `email` | `email` |
| `website` | `website` |
| `tagline` | pending DB alignment |
| `signingCity` | pending DB alignment |
| `signerName` | `signer_name` |
| `signerPosition` | `signer_title` |
| `logoUrl` | derived from `logo_path` |
| `stampUrl` | derived from `stamp_path` |
| `signatureUrl` | derived from `signature_path` |

`code` semantics perlu dibedakan dari numbering `companyCode` bila keduanya dipertahankan.

---

# 24. Invoice Template Mapping

Frontend current:

```text
title
showLogo
showTagline
showTitle
showNumber
showInvoiceDate
showDueDate
showClient
showItems
showSubtotal
showDiscount
showTotal
showBankInfo
showTerms
showStamp
showSignature
showSignerName
showSignerPosition
```

DB draft:

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

Not exact 1:1:

- `title`;
- `showTitle`;
- separate invoice/due date vs `show_dates`;
- `showBankInfo` vs `show_account`;
- `showSignerPosition` vs `show_signer_title`.

Align before persistence.

---

# 25. Invoice Numbering Mapping

Frontend:

```text
documentCode
companyCode
digits
monthFormat
yearFormat
resetPolicy
```

DB draft:

```text
sequence_start
document_code
company_code
month_format
year_format
reset_rule
```

Mapping:

| Frontend | Backend |
|---|---|
| `documentCode` | `document_code` |
| `companyCode` | `company_code` |
| `monthFormat` | `month_format` |
| `yearFormat` | `year_format` |
| `resetPolicy` | `reset_rule` |
| `digits` | schema field not explicit |
| sequence | sequence strategy to define |

Reset = OPEN.

Final separator = NEEDS CONFIRMATION.

---

# 26. Dashboard Mapping

API contract:

```text
GET /api/dashboard?period=month
```

Current frontend derives data from stores.

Target conceptual response sections:

```text
invoice_summary
outstanding
income
expense
status_summary
latest_invoices
chart
```

Exact shape must be documented in API Contract before final integration.

Current UI periods:

- Bulan Ini
- 3 Bulan Terakhir
- Tahun Ini

Need standardized API period values, for example only after contract update:

```text
month
3months
year
```

Do not assume names silently.

---

# 27. Recommended Frontend Service Modules

Use centralized API service modules rather than Axios inside views.

Possible structure:

```text
services/authService.js
services/masterDataService.js
services/invoiceService.js
services/paymentService.js
services/financeService.js
services/reportService.js
services/settingsService.js
services/userService.js
services/dashboardService.js
```

Exact naming may follow current style.

---

# 28. Integration Sequence

Recommended:

1. Auth
2. Clients/Vendors/Products/Accounts
3. Company/Users/Settings
4. Invoice
5. Billing
6. Payment
7. Income/Expense
8. Reports
9. Dashboard
10. PDF/file handling

Do not replace every store in one giant change.

---

# 29. Store Migration Pattern

Example Master Data:

Current:

```text
state initialized from masterDataSeed
```

Target:

```text
state = []
loading/error
fetchClients()
createClient()
updateClient()
changeClientStatus()
```

After mutation, update state from API response or re-fetch intentionally.

---

# 30. Error Mapping

Backend validation:

```json
{
  "success": false,
  "message": "Validasi gagal",
  "errors": {
    "client_id": ["Klien wajib dipilih."]
  }
}
```

Frontend can map:

```text
client_id
→ errors.client
```

Do not show raw exception stack.

---

# 31. Data Types

Dates:

`YYYY-MM-DD`

Money:

backend authoritative DECIMAL; JSON may serialize as string depending resource strategy.

Frontend should normalize safely for display/calculation.

Do not use floating-point DB type.

---

# 32. Historical Integrity

New transaction selector:

active records only.

Historical relation:

must still resolve inactive Client/Vendor/Account/Product.

Backend resource/detail should not hide relations because master record became inactive.

---

# 33. Demo Data Removal Gate

Do not remove frontend demo seed before corresponding API works.

Safe sequence:

```text
Backend endpoint ready
↓
Frontend service integrated
↓
Pinia updated
↓
Smoke test PASS
↓
Remove demo source for that module
```

---

# 34. Integration Checklist

## Auth

- [ ] login
- [ ] logout
- [ ] me
- [ ] remove demo credential dependency

## Master

- [ ] clients
- [ ] vendors
- [ ] products
- [ ] accounts

## Invoice

- [ ] list
- [ ] create
- [ ] detail
- [ ] edit
- [ ] publish
- [ ] cancel
- [ ] preview
- [ ] PDF

## Billing

- [ ] list
- [ ] detail

## Payment

- [ ] list
- [ ] invoice payments
- [ ] add payment

## Finance

- [ ] income list
- [ ] manual income
- [ ] expense

## Reports

- [ ] cashbook
- [ ] invoice
- [ ] payment
- [ ] income
- [ ] expense

## Settings

- [ ] company
- [ ] template
- [ ] numbering

## Users

- [ ] list
- [ ] create
- [ ] update
- [ ] status

## Dashboard

- [ ] period aggregate

---

# 35. Integration Non-Regression Rules

After backend integration, verify frontend still preserves:

- current route structure;
- current visual baseline;
- active/inactive master behavior;
- Invoice create/edit flow;
- Draft/Published/Cancelled state;
- Billing derived behavior;
- partial/full/overpayment UX;
- Income source distinction;
- Expense source/destination semantics;
- Report Debit/Kredit semantics;
- company/template/numbering UI;
- Manager read-only behavior.
