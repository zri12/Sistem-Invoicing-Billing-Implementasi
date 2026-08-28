# BACKLOG.md

Status:
- TODO
- IN PROGRESS
- REVIEW
- DONE
- BLOCKED

## Foundation
- [ ] Setup Laravel project.
- [ ] Setup Vue 3.
- [ ] Setup Tailwind/Vite.
- [ ] Struktur folder.
- [ ] Git workflow.
- [ ] Asset DEVSPACE.
- [ ] Base layout.
- [ ] Sidebar collapse/minimize.
- [ ] Router.

## Authentication
- [ ] Login.
- [ ] Logout.
- [ ] Current user.
- [ ] Role Admin/Finance.
- [ ] Role Pimpinan/Manager.
- [ ] Backend authorization.

## Master Data
- [ ] Clients CRUD.
- [ ] Client invoice history.
- [ ] Vendors CRUD.
- [ ] Vendor expense history.
- [ ] Products & Services CRUD.
- [ ] Accounts CRUD.
- [ ] Company data.
- [ ] Logo/stamp/signature upload.

## Invoice
- [ ] List.
- [ ] Create.
- [ ] Edit.
- [ ] Detail.
- [ ] Multiple items.
- [ ] Calculation.
- [ ] Auto numbering.
- [ ] Draft.
- [ ] Publish.
- [ ] Cancel.
- [ ] Preview.
- [ ] PDF.

## Billing & Payment
- [ ] Billing list.
- [ ] Billing detail.
- [ ] Remaining calculation.
- [ ] Unpaid.
- [ ] Partial.
- [ ] Paid.
- [ ] Overdue.
- [ ] Add payment.
- [ ] Multiple payments.
- [ ] Overpayment validation.
- [ ] Payment proof.
- [ ] Payment -> Income.

## Income
- [ ] Invoice income.
- [ ] Manual non-invoice income.
- [ ] Edit manual income.
- [ ] Filters.

## Expense
- [ ] Create expense.
- [ ] Edit expense.
- [ ] Vendor optional.
- [ ] Category.
- [ ] Source account.
- [ ] Transaction type.
- [ ] Cash.
- [ ] QRIS.
- [ ] Credit.
- [ ] Transfer.
- [ ] Destination account required for transfer.
- [ ] Proof upload.
- [ ] Notes.
- [ ] Wider 3-column modal.

## Reports
- [ ] Debit/Credit.
- [ ] Invoice.
- [ ] Payment.
- [ ] Income.
- [ ] Expense.
- [ ] Period filters.
- [ ] Account filters.
- [ ] Running balance.

## Settings
- [ ] Invoice template persistence.
- [ ] Invoice numbering persistence.
- [ ] User management.

## QA
- [ ] Frontend responsive.
- [ ] Role test.
- [ ] Invoice flow test.
- [ ] Payment flow test.
- [ ] Expense flow test.
- [ ] Report test.
- [ ] PDF visual check.
- [ ] UAT.

## Corrective frontend finalization (demo state)

- [x] Shared Master Data store untuk klien, vendor, produk, dan rekening.
- [x] Pengeluaran memakai rekening sumber dan tujuan transfer bebas teks.
- [x] Status invoice dipertahankan saat edit; pembayaran tervalidasi di frontend demo.
- [x] Dashboard period menyaring metrik, grafik, status, dan invoice terbaru.
- [ ] Persistensi dan validasi final tetap menunggu API Laravel.
