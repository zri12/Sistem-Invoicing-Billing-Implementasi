# AGENTS.md

## Tujuan
File ini menjadi aturan kerja utama untuk developer dan AI agent yang mengerjakan **Sistem Invoicing dan Billing Berbasis Web pada PT. Ruang Kreasi Aplikasi**.

Semua perubahan kode harus mengikuti dokumen pada folder `docs/` dan tidak boleh menambah fitur di luar scope tanpa keputusan bersama.

## Source of Truth
Urutan acuan jika ada konflik:
1. Kebutuhan/revisi resmi dari PT. Ruang Kreasi Aplikasi.
2. Dokumen requirement resmi sistem.
3. `docs/PRD.md`.
4. `docs/BUSINESS_RULES.md`.
5. `docs/DATABASE.md`.
6. `docs/API_CONTRACT.md`.
7. `docs/UI_UX_GUIDE.md`.
8. Folder `REFERENSI UI/` sebagai baseline UI/UX dan flow.
9. Proposal KP sebagai acuan akademik dan ruang lingkup umum.

Jika ada konflik, jangan menebak. Periksa `docs/DECISIONS.md`; jika belum diputuskan, tandai sebagai `OPEN` dan minta keputusan bersama. Lihat juga `docs/REFERENCES.md` untuk penggunaan setiap acuan.

## Referensi UI
Folder `REFERENSI UI/` berisi prototype final yang telah dibuat dan direvisi. Developer dan AI agent wajib mempelajari prototype yang relevan sebelum mengimplementasikan frontend.

Prototype digunakan sebagai acuan:
- layout, sidebar, dan topbar;
- page hierarchy, navigation, dan flow antarhalaman;
- form, modal, table, card, button, input, dan badge;
- invoice preview;
- role-based UI; dan
- responsive behavior.

Jangan:
- redesign UI tanpa requirement baru;
- mengganti warna atau layout secara bebas;
- menghapus fitur UI yang sudah disetujui;
- menambah fitur hanya karena dianggap lebih baik;
- menyalin arsitektur React prototype ke project final;
- menjadikan mock data prototype sebagai desain database; atau
- menjadikan state prototype sebagai business logic production.

Prototype React hanya referensi. Implementasi final menggunakan Laravel + Vue.js + MySQL. Business logic final mengikuti `docs/BUSINESS_RULES.md`, database mengikuti `docs/DATABASE.md`, kontrak frontend-backend mengikuti `docs/API_CONTRACT.md`, dan UI mengikuti `docs/UI_UX_GUIDE.md`.

## Official Assets
Folder `ASSETS/` berisi asset dan dokumen referensi original/resmi untuk project. Developer dan AI agent harus memperlakukan file di folder tersebut sebagai source reference. Lihat `docs/REFERENCES.md` dan `docs/UI_UX_GUIDE.md` untuk pemetaan penggunaan asset.

Jangan:
- menghapus atau menimpa file original;
- resize atau compress asset original secara langsung;
- mengedit PDF atau font referensi;
- memasukkan seluruh folder `ASSETS/` ke `public/`;
- menggunakan Proposal KP sebagai pengganti business requirement; atau
- membuat ulang logo apabila asset resmi tersedia.

Jika asset diperlukan oleh runtime aplikasi, copy file yang relevan ke lokasi yang sesuai: favicon ke `public/`, asset frontend ke `resources/js/assets/` atau `public/`, template PDF ke Laravel, dan upload dinamis ke `storage/`. Original pada `ASSETS/` tetap dipertahankan.

## Tech Stack Final
- Laravel sebagai framework/backend utama.
- Vue.js 3 sebagai frontend.
- MySQL sebagai database.
- Vite sebagai build tool frontend.
- Tailwind CSS untuk styling.
- PDF invoice dihasilkan dari sisi Laravel.
- Sistem adalah aplikasi internal perusahaan.

## Pembagian Tugas
### Fazri — Frontend + Project Foundation
Fokus:
- Membuat struktur project awal.
- Setup Laravel + Vue + Vite + Tailwind.
- Struktur frontend.
- Implementasi UI dari prototype.
- Layout, router, components, views, state frontend.
- API integration.
- Loading, error, toast, validation UI.
- Responsive desktop/laptop.
- Sidebar collapse/minimize.
- Implementasi modal/form sesuai prototype dan revisi perusahaan.

Area utama:
- `resources/js/`
- `resources/css/`
- asset frontend di `public/`

### Fahmi — Backend + Database + Business Logic
Fokus:
- MySQL, migrations, models, relations.
- Authentication dan authorization.
- API/controllers/requests/services.
- Business logic invoice, billing, payment.
- Income/expense.
- Reports/dashboard query.
- File upload.
- PDF invoice.
- Backend testing.

Area utama:
- `app/`
- `database/`
- `routes/`
- `storage/`

## Aturan Implementasi
- Satu project, satu repository.
- Jangan pisahkan frontend/backend menjadi dua repository.
- Jangan membuat ulang desain yang sudah disetujui.
- Jangan menaruh business rule penting hanya di frontend.
- Laravel adalah source of truth untuk validasi dan perhitungan final.
- Vue boleh menghitung preview UI, tetapi hasil final tetap divalidasi ulang oleh backend.
- Jangan hard-code data perusahaan, rekening, terms, nomor invoice, cap, tanda tangan, atau nilai laporan di production code.
- Jangan commit `.env`, token, password, API key, atau secret.
- Jangan menyimpan password plaintext.
- Jangan force push ke `main`.
- Semua fitur utama harus diuji sebelum merge.

## Git Workflow
Rekomendasi:
- `main`: stabil/final.
- `develop`: integrasi.
- `feature/frontend-*`: pekerjaan Fazri.
- `feature/backend-*`: pekerjaan Fahmi.

Alur:
`feature/* -> develop -> testing -> main`

## Definition of Done
Sebuah fitur dianggap selesai jika:
- UI sesuai prototype/revisi.
- Backend endpoint tersedia jika dibutuhkan.
- Validasi frontend dan backend tersedia.
- Data tersimpan/terbaca dari database.
- Role access sesuai.
- Tidak ada blocking error.
- Flow utama diuji.
- Dokumentasi terkait diperbarui jika kontrak/data berubah.
