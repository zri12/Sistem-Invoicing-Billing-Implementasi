# REFERENCES.md

## 1. Tujuan
File ini mencatat sumber referensi resmi selama development agar developer dan AI agent menggunakan acuan yang sama.

## 2. Prototype UI/UX
Lokasi:

`/REFERENSI UI/`

Status: **FINAL UI/UX BASELINE**.

Digunakan untuk:
- layout;
- halaman;
- component;
- navigation;
- form;
- modal;
- table;
- responsive behavior;
- interaction;
- role-based view; dan
- flow UI.

Tidak digunakan untuk:
- backend architecture;
- database;
- authentication production;
- authorization;
- business logic final; atau
- persistence.

## 3. Requirement Sistem
Status: **PRIMARY FUNCTIONAL SOURCE**.

Requirement resmi perusahaan digunakan untuk functional requirements, non-functional requirements, role, scope, data, business flow, dan acceptance criteria. Jika dokumen requirement belum berada di repository, requirement resmi perusahaan tetap menjadi acuan utama; lokasi file diisi saat dokumen dimasukkan.

## 4. Proposal Kerja Praktik
Judul:

> Rancang Bangun Sistem Invoicing dan Billing Berbasis Web pada PT. Ruang Kreasi Aplikasi

Digunakan untuk:
- ruang lingkup akademik;
- metodologi Agile/Scrum;
- teknologi;
- tahapan KP; dan
- dokumentasi akademik.

Proposal bukan pengganti requirement teknis.

## 5. Referensi Invoice
Asset resmi yang digunakan:
- Logo DEVSPACE;
- Background invoice;
- Favicon/icon;
- Font invoice;
- Contoh Invoice PDF;
- Cap perusahaan; dan
- Tanda tangan.

Invoice final harus mengikuti referensi visual perusahaan.

## 6. Official Project Assets
Lokasi:

`/ASSETS/`

Status: **OFFICIAL SOURCE / REFERENCE ASSETS**.

`ASSETS/` menyimpan source original. File di dalamnya tidak selalu dipakai langsung oleh browser atau aplikasi; file yang diperlukan dapat disalin ke lokasi runtime yang sesuai tanpa mengubah original.

### Branding
- DEVSPACE favicon: `ASSETS/favicon.ico`.
- Runtime copy yang telah digunakan aplikasi: `public/favicon.svg`.

### Invoice
- DEVSPACE invoice logo: `ASSETS/logo untuk di invoice.png`.
- Background invoice: `ASSETS/bg-invoice.png`.
- Example invoice PDF: `ASSETS/contoh invoice.pdf`.
- Invoice font archive: `ASSETS/font invoice.zip`.

Contoh invoice dan asset invoice menjadi referensi visual output PDF final. Data invoice tetap dinamis dari database; jangan hard-code klien, nomor invoice, nominal, rekening, penanda tangan, atau tanggal dari PDF contoh.

### Documents
- Proposal Kerja Praktik: `ASSETS/PROPOSAL_KP_Fazri Lukman Nurrohman_Fahmi Nashruddin.pdf`.

Proposal digunakan untuk referensi akademik, judul KP, scope umum, metode pengembangan, dan dokumentasi KP; proposal bukan pengganti requirement teknis terbaru.

## 7. Prioritas Referensi
```text
Revisi Perusahaan Terbaru
            ↓
Requirement Resmi
            ↓
PRD / Business Rules / Technical Docs
            ↓
Official Assets (ASSETS/) untuk visual, brand, dan document reference
            ↓
Prototype Final
            ↓
Proposal KP
```

Detail urutan dokumen teknis tersedia pada `../AGENTS.md` dan keputusan yang telah dikunci dicatat pada `DECISIONS.md`.

## 8. Aturan Penggunaan Referensi
Jika ada perbedaan:
- jangan memilih sendiri;
- jangan membuat asumsi;
- cek `DECISIONS.md`;
- jika belum diputuskan, tandai `OPEN`; dan
- jangan mengubah implementation berdasarkan asumsi AI.
