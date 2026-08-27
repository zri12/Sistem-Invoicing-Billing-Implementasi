# API_CONTRACT.md

> Kontrak awal frontend-backend. Endpoint final dapat berubah, tetapi perubahan harus disepakati Fazri dan Fahmi.

## Response Convention
Success:
```json
{
  "success": true,
  "message": "Data berhasil disimpan",
  "data": {}
}
```

Validation error:
```json
{
  "success": false,
  "message": "Validasi gagal",
  "errors": {
    "field": ["Pesan error"]
  }
}
```

## Auth
- `POST /api/login`
- `POST /api/logout`
- `GET /api/me`

## Dashboard
- `GET /api/dashboard?period=month`

Expected data:
- invoice summary
- outstanding
- income
- expense
- latest invoices
- chart/report summary

## Clients
- `GET /api/clients`
- `POST /api/clients`
- `GET /api/clients/{id}`
- `PUT /api/clients/{id}`
- `PATCH /api/clients/{id}/status`
- `GET /api/clients/{id}/invoices`

## Vendors
- `GET /api/vendors`
- `POST /api/vendors`
- `GET /api/vendors/{id}`
- `PUT /api/vendors/{id}`
- `PATCH /api/vendors/{id}/status`
- `GET /api/vendors/{id}/expenses`

## Products & Services
- `GET /api/products-services`
- `POST /api/products-services`
- `GET /api/products-services/{id}`
- `PUT /api/products-services/{id}`
- `PATCH /api/products-services/{id}/status`

## Accounts
- `GET /api/accounts`
- `POST /api/accounts`
- `GET /api/accounts/{id}`
- `PUT /api/accounts/{id}`
- `PATCH /api/accounts/{id}/status`

## Invoices
- `GET /api/invoices`
- `POST /api/invoices`
- `GET /api/invoices/{id}`
- `PUT /api/invoices/{id}`
- `POST /api/invoices/{id}/publish`
- `POST /api/invoices/{id}/cancel`
- `GET /api/invoices/{id}/preview`
- `GET /api/invoices/{id}/pdf`

## Billing
- `GET /api/billing`
- `GET /api/billing/{invoiceId}`

## Payments
- `GET /api/payments`
- `POST /api/invoices/{invoiceId}/payments`
- `GET /api/invoices/{invoiceId}/payments`

Payment request example:
```json
{
  "payment_date": "2026-08-28",
  "amount": 1000000,
  "method": "transfer",
  "account_id": 1,
  "reference_number": "TRX-001",
  "notes": null
}
```

## Income
- `GET /api/incomes`
- `POST /api/incomes`
- `PUT /api/incomes/{id}`

Manual endpoint hanya untuk non-invoice income.

## Expenses
- `GET /api/expenses`
- `POST /api/expenses`
- `GET /api/expenses/{id}`
- `PUT /api/expenses/{id}`

Expense request example:
```json
{
  "expense_date": "2026-08-28",
  "vendor_id": 2,
  "category": "Operasional",
  "description": "Pembelian kebutuhan",
  "amount": 500000,
  "source_account_id": 1,
  "transaction_type": "transfer",
  "destination_account": "BCA 123456789 a/n Vendor",
  "notes": null
}
```

Validation:
- `transaction_type` one of: cash, qris, credit, transfer.
- `destination_account` required if transfer.

## Reports
- `GET /api/reports/cashbook`
- `GET /api/reports/invoices`
- `GET /api/reports/payments`
- `GET /api/reports/incomes`
- `GET /api/reports/expenses`

Common filters:
- `from`
- `to`
- `account_id`
- module-specific filter

## Company
- `GET /api/company`
- `PUT /api/company`
- upload endpoint/multipart sesuai implementasi final

## Invoice Settings
- `GET /api/settings/invoice-template`
- `PUT /api/settings/invoice-template`
- `GET /api/settings/invoice-numbering`
- `PUT /api/settings/invoice-numbering`

## Users
- `GET /api/users`
- `POST /api/users`
- `GET /api/users/{id}`
- `PUT /api/users/{id}`
- `PATCH /api/users/{id}/status`
