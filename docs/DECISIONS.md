# DECISIONS.md

Catat keputusan yang belum/baru dikunci agar developer dan AI agent tidak membuat asumsi berbeda.

## D-001 — Arsitektur Project
Status: DECIDED

Keputusan:
Satu Laravel project, Vue.js di dalam `resources/js`, MySQL sebagai database. Satu repository.

## D-002 — Pembagian Kerja
Status: DECIDED

- Fazri: project foundation + seluruh frontend + API integration.
- Fahmi: backend + database + business logic + PDF + API.

## D-003 — Expense Transaction Type
Status: DECIDED

Pilihan:
- Cash
- QRIS
- Credit
- Transfer

Jika Transfer, rekening tujuan wajib.

## D-004 — Sidebar
Status: DECIDED

Sidebar harus dapat expanded/collapsed agar area content lebih luas.

## D-005 — Modal Pengeluaran
Status: DECIDED

Modal desktop dibuat lebih lebar dan mendukung layout hingga 3 kolom.

## D-006 — Invoice PDF
Status: DECIDED

Gunakan contoh invoice dan asset resmi perusahaan sebagai referensi visual.

## D-007 — Invoice Number Reset Rule
Status: OPEN

Belum boleh diasumsikan apakah sequence reset bulanan, tahunan, atau continuous sampai dikonfirmasi.

## D-008 — Approval Invoice oleh Manager
Status: OPEN / OPTIONAL

Proposal menyebut approval dapat diberikan jika digunakan perusahaan. Jangan implementasikan sebagai wajib tanpa konfirmasi.

## D-009 — Opening Balance Account
Status: REVIEW

Requirement/proposal laporan menggunakan konsep saldo awal + debit - kredit. Prototype terakhir tidak menampilkan saldo di halaman Rekening. Tentukan apakah `opening_balance` disimpan di database tetapi tidak ditampilkan di list.

## D-010: Prototype Final sebagai UI Baseline
Status: DECIDED

Keputusan:
Prototype yang diarsipkan pada tag `frontend-full-reference-2026-08-28` menjadi baseline UI/UX implementasi sistem final.

Prototype digunakan untuk:
- visual;
- layout;
- interaction;
- responsive behavior; dan
- flow UI.

Prototype tidak digunakan sebagai source of truth untuk:
- database;
- authentication;
- authorization;
- persistence;
- security;
- business logic production;
- financial calculation; atau
- reporting query.

## D-011: Development Setelah Prototype
Status: DECIDED

Tahap prototype dinyatakan cukup untuk memulai implementasi sistem. Tech stack final adalah Laravel + Vue.js + MySQL, dalam satu project dan satu repository.

## D-012: Expense Transaction Type
Status: DECIDED

Jenis transaksi Pengeluaran adalah Cash, QRIS, Credit, dan Transfer. Jika Transfer, Rekening Tujuan tampil dan wajib diisi.

## D-013: Modal Pengeluaran
Status: DECIDED

Modal Pengeluaran dibuat lebih lebar, mendukung layout hingga 3 kolom pada desktop, serta responsive ke 2/1 kolom.

## D-014: Sidebar Collapse
Status: DECIDED

Sidebar desktop mendukung expanded/collapsed. Saat collapsed, icon tetap ada, label disembunyikan, dan content area melebar. Pada mobile, gunakan drawer/overlay.

## D-015: Invoice Asset Reference
Status: DECIDED

Invoice PDF final menggunakan referensi visual dan asset resmi perusahaan. Prototype invoice React bukan satu-satunya referensi final; contoh PDF dan asset resmi perusahaan menjadi acuan visual output invoice.

## D-016: Official Asset Repository
Status: DECIDED

Source/reference original untuk branding, invoice, dan dokumen project diarsipkan pada tag `frontend-full-reference-2026-08-28`. Runtime asset digunakan dari lokasi `public/` dan tidak diubah tanpa revisi perusahaan.

Proposal pada snapshot tag hanya digunakan sebagai referensi akademik, judul KP, scope umum, metode pengembangan, dan dokumentasi KP. Proposal tidak menjadi source of truth teknis jika bertentangan dengan requirement terbaru.
