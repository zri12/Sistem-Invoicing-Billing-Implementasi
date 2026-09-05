# BACKEND_CHECKLIST.md

> Checklist implementasi backend Sistem Invoicing & Billing.  
> Update checkbox hanya setelah implementation + validation benar-benar selesai.

---

# Status Legend

```text
[ ] TODO
[-] IN PROGRESS
[x] DONE
[!] BLOCKED / NEEDS DECISION
```

---

# 0. Preflight

- [ ] Baca `CLAUDE.md`.
- [ ] Baca `docs/PRD.md`.
- [ ] Baca `docs/BUSINESS_RULES.md`.
- [ ] Baca `docs/DATABASE.md`.
- [ ] Baca `docs/API_CONTRACT.md`.
- [ ] Baca `docs/ARCHITECTURE.md`.
- [ ] Baca `docs/DECISIONS.md`.
- [ ] Baca `docs/backend/BACKEND_IMPLEMENTATION_PLAN.md`.
- [ ] Baca `docs/backend/AUTHORIZATION_MATRIX.md`.
- [ ] Baca `docs/backend/FRONTEND_BACKEND_MAPPING.md`.
- [ ] Baca `docs/TESTING.md`.
- [ ] `git status` clean.
- [ ] PHP/Laravel environment valid.
- [ ] MySQL environment tersedia.
- [ ] Existing migrations diaudit.
- [ ] Existing routes diaudit.
- [ ] Existing Composer packages diaudit.

---

# 1. Decision / Schema Alignment Gate

## Company

- [ ] Tentukan apakah `tagline` masuk DB.
- [ ] Tentukan apakah `signing_city` masuk DB.
- [ ] Tentukan semantics `company.code`.

## Account

- [ ] Tentukan field `branch/cabang`.
- [!] Opening balance — REVIEW.

## Income

- [ ] Align `source_type`.
- [ ] Align visible manual `source` field.
- [ ] Tentukan apakah `notes` diperlukan pada Income.

## Expense

- [ ] Align `reference_number` frontend vs DB draft.

## Invoice Item

- [ ] Tentukan product-name snapshot requirement.

## Invoice Numbering

- [!] Reset policy — OPEN.
- [!] Final separator — NEEDS CONFIRMATION.
- [ ] Align `digits`.
- [ ] Align sequence storage/concurrency strategy.

## Invoice Workflow

- [!] Manager approval — OPEN / OPTIONAL.
- [!] Cancel invoice after payment — behavior belum rinci.

---

# 2. B1 Database Schema

## Users

- [ ] users schema final.
- [ ] username strategy.
- [ ] email strategy.
- [ ] role field.
- [ ] status field.
- [ ] unique constraints.
- [ ] password hashing.

## Companies

- [ ] migration.
- [ ] model.
- [ ] fillable/casts.
- [ ] single-company strategy.
- [ ] file path fields.
- [ ] tagline/signing city aligned.

## Clients

- [ ] migration.
- [ ] model.
- [ ] status.
- [ ] relationships.
- [ ] factory.
- [ ] seeder if needed.

## Vendors

- [ ] migration.
- [ ] model.
- [ ] relationships.
- [ ] factory.
- [ ] seeder if needed.

## Products Services

- [ ] migration.
- [ ] model.
- [ ] default_price DECIMAL.
- [ ] unit.
- [ ] status.
- [ ] factory.
- [ ] seeder if needed.

## Accounts

- [ ] migration.
- [ ] model.
- [ ] branch decision reflected.
- [ ] opening balance decision reflected.
- [ ] relationships.

## Invoices

- [ ] migration.
- [ ] `invoice_number` unique.
- [ ] client FK.
- [ ] payment account FK.
- [ ] created_by FK.
- [ ] money decimals.
- [ ] dates.
- [ ] document status.
- [ ] indexes.

## Invoice Items

- [ ] migration.
- [ ] invoice FK.
- [ ] nullable product service FK.
- [ ] snapshot fields aligned.
- [ ] qty type.
- [ ] price/total DECIMAL.

## Payments

- [ ] migration.
- [ ] invoice FK.
- [ ] account FK.
- [ ] created_by FK.
- [ ] proof path.
- [ ] indexes.

## Incomes

- [ ] migration.
- [ ] payment nullable FK.
- [ ] invoice nullable FK.
- [ ] account FK.
- [ ] created_by FK.
- [ ] source_type.
- [ ] duplicate payment-income protection strategy.

## Expenses

- [ ] migration.
- [ ] vendor nullable FK.
- [ ] source account FK.
- [ ] transaction type.
- [ ] destination account.
- [ ] reference number decision reflected.
- [ ] proof path.
- [ ] created_by FK.

## Number Settings

- [ ] migration.
- [ ] model.
- [ ] settings row lifecycle.
- [ ] schema matches frontend contract.

## Template Settings

- [ ] migration.
- [ ] model.
- [ ] boolean fields aligned.

## Global DB

- [ ] all FK names reviewed.
- [ ] indexes reviewed.
- [ ] unique indexes reviewed.
- [ ] decimal precision reviewed.
- [ ] migration order correct.
- [ ] `php artisan migrate:fresh` PASS in dev/test.
- [ ] relationship tests PASS.

---

# 3. B2 Authentication

- [ ] Auth mechanism confirmed.
- [ ] Login endpoint.
- [ ] Logout endpoint.
- [ ] Me endpoint.
- [ ] password hash.
- [ ] inactive user reject.
- [ ] auth middleware.
- [ ] unauthenticated returns correct status.
- [ ] current user resource.
- [ ] no password/hash response.
- [ ] auth tests.

---

# 4. B2 Authorization

## Policies / Gates

- [ ] ClientPolicy.
- [ ] VendorPolicy.
- [ ] ProductServicePolicy.
- [ ] AccountPolicy.
- [ ] InvoicePolicy.
- [ ] PaymentPolicy.
- [ ] IncomePolicy.
- [ ] ExpensePolicy.
- [ ] CompanyPolicy.
- [ ] Settings authorization.
- [ ] UserPolicy.
- [ ] Reports/Dashboard access enforcement.

## Manager Restrictions

- [ ] cannot create/update/status Client.
- [ ] cannot create/update/status Vendor.
- [ ] cannot modify Product.
- [ ] cannot modify Account.
- [ ] cannot create/edit Invoice.
- [ ] cannot publish/cancel Invoice.
- [ ] cannot record Payment.
- [ ] cannot add/edit Manual Income.
- [ ] cannot add/edit Expense.
- [ ] cannot update Company.
- [ ] cannot manage Users.
- [ ] invoice settings permission follows final matrix.

---

# 5. B3 Clients API

- [ ] list.
- [ ] search/filter if contract.
- [ ] create.
- [ ] detail.
- [ ] update.
- [ ] status.
- [ ] invoice history.
- [ ] Form Requests.
- [ ] API Resource.
- [ ] Policy.
- [ ] tests.

---

# 6. B3 Vendors API

- [ ] list.
- [ ] create.
- [ ] detail.
- [ ] update.
- [ ] status.
- [ ] expense history.
- [ ] validation.
- [ ] Resource.
- [ ] Policy.
- [ ] tests.

---

# 7. B3 Products Services API

- [ ] list.
- [ ] create.
- [ ] detail.
- [ ] update.
- [ ] status.
- [ ] default price validation.
- [ ] Resource.
- [ ] Policy.
- [ ] tests.

---

# 8. B3 Accounts API

- [ ] list.
- [ ] create.
- [ ] detail.
- [ ] update.
- [ ] status.
- [ ] branch mapping.
- [ ] opening balance logic follows decision.
- [ ] Resource.
- [ ] Policy.
- [ ] tests.

---

# 9. B4 Invoice Service

## Calculation

- [ ] backend item total.
- [ ] backend subtotal.
- [ ] discount >= 0.
- [ ] discount <= subtotal.
- [ ] backend total.

## Create

- [ ] `StoreInvoiceRequest`.
- [ ] client validation.
- [ ] payment account validation.
- [ ] item validation.
- [ ] number generation.
- [ ] header/items DB transaction.
- [ ] created_by.
- [ ] Resource response.

## Update

- [ ] `UpdateInvoiceRequest`.
- [ ] number immutable.
- [ ] status not implicitly downgraded.
- [ ] item sync transaction.
- [ ] totals recalculated.

## Status

- [ ] Draft.
- [ ] Published.
- [ ] Cancelled.
- [ ] publish endpoint.
- [ ] cancel endpoint.
- [ ] Publish does not create Income.

## Tests

- [ ] single item.
- [ ] multiple items.
- [ ] manipulated subtotal ignored.
- [ ] manipulated total ignored.
- [ ] negative discount reject.
- [ ] discount > subtotal reject.
- [ ] existing number immutable.
- [ ] Draft Billing excluded.
- [ ] Published Billing included.
- [ ] Cancelled active Billing excluded.

---

# 10. B4 Numbering

- [ ] `InvoiceNumberService`.
- [ ] parser not dependent on `/`.
- [ ] unique number.
- [ ] concurrent creation strategy.
- [ ] roman month.
- [ ] numeric month if supported.
- [ ] 2/4 digit year.
- [ ] digits setting.
- [ ] company code.
- [ ] document code.
- [!] reset policy OPEN until confirmed.
- [!] separator decision pending.
- [ ] DB unique fallback.
- [ ] tests.

---

# 11. B5 Billing

- [ ] `BillingService`.
- [ ] only Published.
- [ ] invoice total.
- [ ] total paid.
- [ ] remaining.
- [ ] remaining never negative.
- [ ] payment status.
- [ ] list endpoint.
- [ ] detail endpoint.
- [ ] tests.

---

# 12. B5 Payment

## Validation

- [ ] invoice exists.
- [ ] Published only.
- [ ] payment date.
- [ ] amount > 0.
- [ ] method.
- [ ] account.
- [ ] remaining > 0.
- [ ] amount <= remaining.

## Atomic Flow

- [ ] DB transaction.
- [ ] concurrency-safe read/lock strategy.
- [ ] Payment create.
- [ ] linked Income create.
- [ ] rollback on failure.

## Proof

- [ ] proof optional.
- [ ] MIME validate.
- [ ] size validate.
- [ ] safe path/name.
- [ ] authorization.

## Tests

- [ ] partial.
- [ ] multiple.
- [ ] full.
- [ ] overpayment.
- [ ] fully paid reject new payment.
- [ ] Draft reject.
- [ ] Cancelled behavior follows final rule.
- [ ] due today.
- [ ] overdue unpaid.
- [ ] overdue partial.
- [ ] paid overrides overdue.
- [ ] Payment -> Income.
- [ ] Payment failure -> no Income.
- [ ] Income failure -> no Payment.
- [ ] concurrency race.

---

# 13. B6 Manual Income

- [ ] list API.
- [ ] manual create.
- [ ] manual update.
- [ ] account required according DB contract.
- [ ] amount > 0.
- [ ] payment_id null.
- [ ] invoice_id null for pure manual income unless contract says otherwise.
- [ ] cannot forge source type invoice.
- [ ] visible source mapping aligned.
- [ ] notes mapping aligned.
- [ ] Policy.
- [ ] tests.

---

# 14. B6 Expense

- [ ] list.
- [ ] detail.
- [ ] create.
- [ ] update.
- [ ] vendor optional.
- [ ] category.
- [ ] description.
- [ ] amount > 0.
- [ ] source account required.
- [ ] cash.
- [ ] qris.
- [ ] credit.
- [ ] transfer.
- [ ] destination required Transfer.
- [ ] destination null non-Transfer.
- [ ] reference number decision reflected.
- [ ] proof upload.
- [ ] notes.
- [ ] Policy.
- [ ] tests.

---

# 15. B7 Reports

## Cashbook

- [ ] Income -> Debit.
- [ ] Expense -> Kredit.
- [ ] Expense account = source account.
- [ ] period filter.
- [ ] account filter.
- [ ] efficient query.
- [!] opening balance behavior follows decision.

## Module Reports

- [ ] Invoice.
- [ ] Payment.
- [ ] Income.
- [ ] Expense.
- [ ] filters.
- [ ] pagination/export only if required.

## Tests

- [ ] Debit correct.
- [ ] Kredit correct.
- [ ] Expense source account correct.
- [ ] date filter.
- [ ] account filter.
- [ ] balance after decision.

---

# 16. B8 Company

- [ ] GET company.
- [ ] PUT company.
- [ ] tagline persistence.
- [ ] signing city persistence.
- [ ] signer.
- [ ] logo path.
- [ ] stamp path.
- [ ] signature path.
- [ ] authorization.
- [ ] tests.

---

# 17. B8 Template Settings

- [ ] GET.
- [ ] PUT.
- [ ] all frontend toggles mapped.
- [ ] no stale/dropped fields.
- [ ] authorization.
- [ ] tests.

---

# 18. B8 Numbering Settings

- [ ] GET.
- [ ] PUT.
- [ ] existing invoice not mutated.
- [ ] reset setting only after decision.
- [ ] authorization.
- [ ] tests.

---

# 19. B8 Upload

- [ ] logo upload.
- [ ] stamp upload.
- [ ] signature upload.
- [ ] MIME validation.
- [ ] max size.
- [ ] safe filename.
- [ ] replacement handling.
- [ ] DB path.
- [ ] authorization.
- [ ] tests.

---

# 20. B8 PDF

- [ ] route.
- [ ] service.
- [ ] A4.
- [ ] Company dynamic.
- [ ] Client dynamic.
- [ ] items dynamic.
- [ ] total dynamic.
- [ ] account dynamic.
- [ ] terms dynamic.
- [ ] signing city/date.
- [ ] stamp.
- [ ] signature.
- [ ] signer.
- [ ] background.
- [ ] official runtime logo.
- [ ] font.
- [ ] no hard-code transaction/company financial data.
- [ ] HTTP test.
- [ ] manual visual QA.

---

# 21. B9 Frontend Integration

## Auth

- [ ] remove demo login dependency.
- [ ] login API.
- [ ] logout API.
- [ ] current user.
- [ ] session restore.
- [ ] unauthorized behavior.

## Master

- [ ] Clients API.
- [ ] Vendors API.
- [ ] Products API.
- [ ] Accounts API.
- [ ] inactive historical resolution.

## Invoice

- [ ] list API.
- [ ] create.
- [ ] edit.
- [ ] detail.
- [ ] publish.
- [ ] cancel.
- [ ] preview/PDF.

## Billing / Payment

- [ ] Billing server-derived.
- [ ] Payment add.
- [ ] Payment list.
- [ ] overpayment error mapping.

## Finance

- [ ] Income.
- [ ] Expense.

## Reports

- [ ] Cashbook.
- [ ] Invoice report.
- [ ] Payment report.
- [ ] Income report.
- [ ] Expense report.

## Settings

- [ ] Company.
- [ ] Template.
- [ ] Numbering.
- [ ] Users.

## Dashboard

- [ ] aggregate API.
- [ ] period mapping.

## Demo State Replacement

- [ ] demo users replaced.
- [ ] demo auth replaced.
- [ ] master seed replaced.
- [ ] invoice demo replaced.
- [ ] payment demo replaced.
- [ ] finance demo replaced.
- [ ] settings demo replaced.

---

# 22. B10 End-to-End

## Admin Flow

- [ ] login.
- [ ] create Client.
- [ ] create Product.
- [ ] create Account.
- [ ] create Invoice Draft.
- [ ] publish Invoice.
- [ ] Billing appears.
- [ ] partial Payment.
- [ ] Income appears.
- [ ] Expense.
- [ ] Reports.
- [ ] PDF.
- [ ] logout.

## Manager Flow

- [ ] login.
- [ ] monitoring routes.
- [ ] read data.
- [ ] forbidden writes blocked API.
- [ ] reports.

## Error Flow

- [ ] 401.
- [ ] 403.
- [ ] 404.
- [ ] 422.
- [ ] DB transaction rollback.
- [ ] upload failure.

---

# 23. Security Review

- [ ] `.env` ignored.
- [ ] no credential committed.
- [ ] APP_DEBUG production false.
- [ ] password hash.
- [ ] authorization.
- [ ] mass assignment reviewed.
- [ ] Form Request validation.
- [ ] upload security.
- [ ] private file visibility.
- [ ] SQL injection avoided through ORM/binding.
- [ ] XSS/output handling reviewed where applicable.
- [ ] CSRF/session behavior reviewed according auth mechanism.
- [ ] stack trace not exposed production.

---

# 24. Performance Review

- [ ] pagination master lists.
- [ ] pagination transaction lists.
- [ ] eager loading.
- [ ] no obvious N+1.
- [ ] report indexes.
- [ ] Invoice detail efficient.
- [ ] PDF acceptable performance.

---

# 25. Final Technical Validation

- [ ] `composer install`.
- [ ] `npm install`.
- [ ] `php artisan migrate:fresh` on dev/test database.
- [ ] `php artisan route:list`.
- [ ] `php artisan test`.
- [ ] `npm run build`.
- [ ] no failing critical tests.
- [ ] no unexplained server exception.

---

# 26. Documentation

- [ ] API Contract reflects implementation.
- [ ] Database doc reflects final schema.
- [ ] Decisions updated.
- [ ] Testing updated.
- [ ] Backend checklist updated.
- [ ] Frontend mapping updated if API shape changed.
- [ ] README project status updated only when factual.

---

# 27. Git / Handoff

- [ ] working tree clean.
- [ ] commit scope clear.
- [ ] no generated/private file committed.
- [ ] no force push.
- [ ] backend task report prepared.
- [ ] next phase identified.

---

# 28. Final Business Invariants

Before declaring backend complete:

- [ ] Publish Invoice does NOT create Income.
- [ ] Payment creates one related Income.
- [ ] Multiple Payment works.
- [ ] Overpayment rejected.
- [ ] Billing remaining correct.
- [ ] Draft excluded active Billing.
- [ ] Cancelled excluded active Billing.
- [ ] Paid priority over overdue.
- [ ] Due today is not overdue.
- [ ] Partial + past due = overdue.
- [ ] Expense independent from Billing.
- [ ] Expense source account correct.
- [ ] Transfer destination conditional.
- [ ] Report Debit = Income.
- [ ] Report Kredit = Expense.
- [ ] Existing invoice number immutable.
- [ ] Manager authorization backend-enforced.
