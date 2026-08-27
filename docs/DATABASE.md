# DATABASE.md

> Draft awal. Final schema harus dikunci bersama sebelum migration production dibuat.

## Tabel Utama
### users
- id
- name
- username/email
- password
- role
- status
- timestamps

### companies
- id
- name
- address
- phone
- email
- website
- logo_path
- stamp_path
- signature_path
- signer_name
- signer_title
- timestamps

### clients
- id
- name
- pic_name
- address
- phone
- email
- notes
- status
- timestamps

### vendors
- id
- name
- pic_name
- address
- phone
- email
- notes
- status
- timestamps

### products_services
- id
- name
- description
- default_price
- unit
- status
- timestamps

### accounts
- id
- name
- account_number
- account_holder
- opening_balance
- status
- timestamps

Catatan:
UI prototype terbaru dapat tidak menampilkan saldo, tetapi `opening_balance` tetap dipertimbangkan karena laporan saldo membutuhkannya.

### invoices
- id
- invoice_number
- invoice_name
- client_id
- invoice_date
- due_date
- document_status
- subtotal
- discount
- total
- payment_account_id
- payment_terms
- invoice_notes
- created_by
- timestamps

### invoice_items
- id
- invoice_id
- product_service_id nullable
- description
- qty
- price
- total
- timestamps

### payments
- id
- invoice_id
- payment_date
- amount
- method
- account_id
- reference_number nullable
- proof_path nullable
- notes nullable
- created_by
- timestamps

### incomes
- id
- income_date
- source_type
- payment_id nullable
- invoice_id nullable
- category
- description
- amount
- account_id
- created_by
- timestamps

### expenses
- id
- expense_date
- vendor_id nullable
- category
- description
- amount
- source_account_id
- transaction_type
- destination_account nullable
- proof_path nullable
- notes nullable
- created_by
- timestamps

### invoice_number_settings
Draft:
- id
- sequence_start
- document_code
- company_code
- month_format
- year_format
- reset_rule
- timestamps

### invoice_template_settings
Draft:
- id
- show_logo
- show_tagline
- show_company_info
- show_invoice_number
- show_dates
- show_client
- show_items
- show_subtotal
- show_discount
- show_total
- show_account
- show_terms
- show_stamp
- show_signature
- show_signer_name
- show_signer_title
- timestamps

## Relasi Utama
```text
Client 1 ---- * Invoice
Invoice 1 ---- * InvoiceItem
Invoice 1 ---- * Payment
Invoice 1 ---- * Income (through payment/reference as needed)
Payment 1 ---- 0..1 Income
Vendor 1 ---- * Expense
Account 1 ---- * Payment
Account 1 ---- * Income
Account 1 ---- * Expense (source)
User 1 ---- * created records
```

## Database Rules
- `invoice_number` unique index.
- Foreign key wajib pada relasi utama.
- Amount menggunakan decimal, bukan float.
- Semua timestamps disimpan konsisten.
- File hanya menyimpan path/metadata di database, bukan binary besar jika tidak diperlukan.
- Payment -> Income sebaiknya dilakukan dalam satu DB transaction.
