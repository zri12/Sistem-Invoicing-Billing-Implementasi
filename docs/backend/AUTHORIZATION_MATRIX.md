# AUTHORIZATION_MATRIX.md

> Backend authorization contract for Sistem Invoicing & Billing.  
> Frontend visibility is **not** a security control.

---

# 1. Roles

## Admin / Finance

Operational role untuk pekerjaan harian.

Frontend current internal value:

`admin`

Expected capability:

- master data operational;
- invoice operational;
- billing/payment operational;
- finance operational;
- settings operational;
- users operational.

---

## Pimpinan / Manager

Monitoring/read-only role untuk module yang diizinkan.

Frontend current internal value:

`manager`

Manager bukan Admin kedua.

Invoice approval masih `OPEN / OPTIONAL`.

---

# 2. Authorization Principles

1. Setiap protected API membutuhkan authenticated user.
2. Authorization wajib ditegakkan di Laravel.
3. Hidden button/read-only UI tidak menggantikan backend security.
4. Manager read-only kecuali ada source resmi yang mengizinkan write.
5. User management Admin-only.
6. Invoice create/edit saat ini Admin-only pada frontend baseline.
7. Tidak ada implicit privilege escalation.
8. User nonaktif tidak boleh login.
9. Direct HTTP request harus tetap ditolak bila role tidak berhak.
10. Permission baru harus di-update di matrix + Policy + tests.

---

# 3. Legend

| Symbol | Meaning |
|---|---|
| `R` | Read/list/detail allowed |
| `C` | Create allowed |
| `U` | Update allowed |
| `S` | Status/business transition allowed |
| `X` | Explicit deny |
| `?` | Requires confirmation |

---

# 4. High-Level Matrix

| Module | Action | Admin / Finance | Manager | Notes |
|---|---|---:|---:|---|
| Authentication | Login | Yes | Yes | active users only |
| Authentication | Logout | Yes | Yes | own session |
| Authentication | Current user | Yes | Yes | own identity |
| Dashboard | Read | R | R | monitoring |
| Clients | List/detail/history | R | R | PRD permits master-data read |
| Clients | Create/update/status | C/U/S | X | Manager read-only |
| Vendors | List/detail/history | R | R | monitoring |
| Vendors | Create/update/status | C/U/S | X | Admin operation |
| Products & Services | List/detail | R | R | read |
| Products & Services | Create/update/status | C/U/S | X | Admin operation |
| Accounts | List/detail | R | R | read financial master |
| Accounts | Create/update/status | C/U/S | X | Admin operation |
| Invoice | List/detail/preview/PDF | R | R | PRD explicitly allows Manager read |
| Invoice | Create | C | X | frontend route Admin-only |
| Invoice | Update | U | X | frontend route Admin-only |
| Invoice | Publish | S | X | operational |
| Invoice | Cancel | S | X | operational |
| Invoice | Approval | ? | ? | OPEN / OPTIONAL |
| Billing | List/detail | R | R | derived monitoring |
| Payment | List/detail | R | R | monitoring |
| Payment | Create | C | X | financial operation |
| Income | List/detail | R | R | monitoring |
| Manual Income | Create/update | C/U | X | financial operation |
| Expense | List/detail | R | R | monitoring |
| Expense | Create/update | C/U | X | financial operation |
| Reports | Read | R | R | monitoring |
| Company | Read | R | R | PRD lists Manager access |
| Company | Update | U | X | consistent with Manager read-only rule |
| Invoice Template | Read | R | ? | visibility not fully locked in PRD |
| Invoice Template | Update | U | X | proposed safe write restriction |
| Invoice Numbering | Read | R | ? | visibility requires confirmation |
| Invoice Numbering | Update | U | X | Admin-only proposed |
| Users | List/detail | R | X | frontend route Admin-only |
| Users | Create/update/status | C/U/S | X | Admin-only |

---

# 5. Unresolved Permission Points

## 5.1 Manager Invoice Approval

Status:

`OPEN / OPTIONAL`

Do not implement mandatory approval.

Jika nanti enabled, update:

- PRD;
- Business Rules;
- Database;
- API Contract;
- this matrix;
- backend tests;
- frontend integration.

---

## 5.2 Template / Numbering Read Access

PRD explicitly allows Manager access to Data Perusahaan, tetapi tidak secara jelas mengunci access ke Template Invoice dan Penomoran Invoice.

Safe rule until confirmed:

- Manager write = deny;
- Manager read = `NEEDS CONFIRMATION`.

Jangan silently expose sensitive settings.

---

# 6. Suggested Policy Structure

Possible Laravel policies:

```text
ClientPolicy
VendorPolicy
ProductServicePolicy
AccountPolicy
InvoicePolicy
PaymentPolicy
IncomePolicy
ExpensePolicy
CompanyPolicy
InvoiceTemplateSettingPolicy
InvoiceNumberSettingPolicy
UserPolicy
```

Dashboard/Billing/Reports dapat menggunakan Gate/Policy/controller authorization sesuai architecture.

---

# 7. Policy Method Convention

Gunakan standard method bila cocok:

```text
viewAny
view
create
update
delete
```

Business action dapat memakai:

```text
publish
cancel
recordPayment
changeStatus
updateSettings
```

Jangan overload `update` untuk seluruh transition jika endpoint terpisah.

---

# 8. Detailed Permission Intent

## 8.1 Client

### Admin

```text
viewAny = allow
view = allow
create = allow
update = allow
changeStatus = allow
```

### Manager

```text
viewAny = allow
view = allow
create = deny
update = deny
changeStatus = deny
```

---

## 8.2 Vendor

Same pattern as Client.

---

## 8.3 Product Service

Admin write, Manager read.

---

## 8.4 Account

Admin write, Manager read.

Inactive account tetap dapat dibaca untuk historical relation.

---

## 8.5 Invoice

### Admin

```text
viewAny = allow
view = allow
create = allow
update = allow
publish = allow
cancel = allow
```

### Manager

```text
viewAny = allow
view = allow
create = deny
update = deny
publish = deny
cancel = deny
```

Approval method jangan dibuat sampai decision resolved.

---

## 8.6 Billing

Billing derived, tidak ada independent write operation pada API contract.

Admin/Manager read.

---

## 8.7 Payment

Admin:

```text
view = allow
create = allow
```

Manager:

```text
view = allow
create = deny
```

---

## 8.8 Manual Income

Admin read/write.

Manager read-only.

Payment-derived Income bukan target manual update.

---

## 8.9 Expense

Admin read/create/update.

Manager read-only.

---

## 8.10 Reports

Admin + Manager read.

No write action.

---

## 8.11 Company

Admin read/update.

Manager read.

---

## 8.12 Users

Admin only.

Manager deny list/detail/write berdasarkan frontend baseline dan role model.

---

# 9. Authentication Status Handling

User status:

```text
aktif
nonaktif
```

Auth layer harus menolak inactive user.

Saat status user diubah ke nonaktif, tentukan apakah active session harus langsung invalidated atau berlaku pada login berikutnya. Jika requirement tidak ada, dokumentasikan technical choice.

Jangan membuat flow yang tanpa sengaja mengunci seluruh Admin user.

---

# 10. Endpoint Authorization Expectations

## Authentication

```text
POST /api/login
```

Guest.

```text
POST /api/logout
GET  /api/me
```

Authenticated.

---

## Dashboard

```text
GET /api/dashboard
```

Admin + Manager.

---

## Clients

Read endpoints:

```text
GET /api/clients
GET /api/clients/{id}
GET /api/clients/{id}/invoices
```

Admin + Manager.

Write:

```text
POST  /api/clients
PUT   /api/clients/{id}
PATCH /api/clients/{id}/status
```

Admin only.

---

## Vendors

Read Admin + Manager.

Write/status Admin only.

---

## Products Services

Read Admin + Manager.

Write/status Admin only.

---

## Accounts

Read Admin + Manager.

Write/status Admin only.

---

## Invoice

Read/preview/PDF:

Admin + Manager.

Create/update/publish/cancel:

Admin only.

---

## Billing

Read:

Admin + Manager.

---

## Payment

Read:

Admin + Manager.

Create:

Admin only.

---

## Income

Read:

Admin + Manager.

Manual create/update:

Admin only.

---

## Expense

Read:

Admin + Manager.

Create/update:

Admin only.

---

## Reports

Read:

Admin + Manager.

---

## Company

Read:

Admin + Manager.

Update:

Admin only unless revised.

---

## Invoice Settings

Write:

Admin only.

Manager read:

`NEEDS CONFIRMATION`.

---

## Users

Admin only.

Manager deny.

---

# 11. HTTP Behaviour

Expected semantic status:

```text
401 Unauthenticated
403 Authenticated but forbidden
404 Resource not found
422 Validation/business validation where appropriate
```

Jaga API response convention tetapi jangan mengubah authorization menjadi fake HTTP 200 tanpa requirement.

---

# 12. Direct API Bypass Tests

Frontend may hide action, tetapi backend test harus direct request.

Examples:

```text
Manager POST /api/clients
→ 403

Manager PUT /api/invoices/{id}
→ 403

Manager POST /api/invoices/{id}/payments
→ 403

Manager POST /api/expenses
→ 403

Manager GET /api/reports/cashbook
→ 200
```

---

# 13. Unauthenticated Tests

Protected endpoints example:

```text
GET /api/clients
GET /api/invoices
GET /api/billing
GET /api/reports/cashbook
```

Unauthenticated:

`401`.

---

# 14. Resource Ownership

System adalah internal company system, bukan multi-tenant/client portal.

Current docs tidak mendefinisikan per-user ownership restriction.

Jangan invent:

```text
Admin hanya dapat melihat record yang dia buat.
```

`created_by` adalah audit attribution, bukan ownership boundary kecuali requirement berubah.

---

# 15. Sensitive Data

User resource tidak boleh expose:

- password hash;
- remember token;
- auth secrets.

Company/private uploaded files harus mengikuti file visibility policy.

---

# 16. Authorization Test Checklist

## Auth

- [ ] active Admin login
- [ ] active Manager login
- [ ] inactive user rejected
- [ ] invalid credential rejected
- [ ] logout
- [ ] unauthenticated API 401

## Admin

- [ ] master write
- [ ] invoice create/update/publish/cancel
- [ ] payment create
- [ ] manual income write
- [ ] expense write
- [ ] company/settings update
- [ ] users write

## Manager

- [ ] dashboard read
- [ ] master read
- [ ] invoice read
- [ ] billing read
- [ ] payment read
- [ ] income read
- [ ] expense read
- [ ] reports read
- [ ] company read
- [ ] master write 403
- [ ] invoice write 403
- [ ] payment write 403
- [ ] income write 403
- [ ] expense write 403
- [ ] users 403
- [ ] settings write 403

---

# 17. Change Procedure

Jika permission berubah:

1. update source requirement/decision;
2. update this matrix;
3. update Policy/Gate;
4. update route/controller authorization;
5. add tests;
6. verify frontend UI visibility.

Never change only frontend button state.
