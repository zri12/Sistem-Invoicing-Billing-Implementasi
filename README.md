<div align="center">
  <img src="public/images/invoice/devspace-invoice-logo.png" alt="DEVSPACE" width="300" />

# Sistem Invoicing & Billing

**PT. Ruang Kreasi Aplikasi**

Sistem internal berbasis web untuk pengelolaan invoice, billing, pembayaran, pemasukan, pengeluaran, dan laporan keuangan sederhana.

![PHP](https://img.shields.io/badge/PHP-8.2%2B-777BB4?logo=php&logoColor=white)
![Laravel 12](https://img.shields.io/badge/Laravel-12-FF2D20?logo=laravel&logoColor=white)
![Vue 3](https://img.shields.io/badge/Vue.js-3-4FC08D?logo=vuedotjs&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-Planned-4479A1?logo=mysql&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-20%2B-5FA04E?logo=nodedotjs&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)
</div>

## Project Status

| Area | Status |
| --- | --- |
| Frontend UI/UX | ✅ Complete |
| Frontend business-flow demo | ✅ Complete |
| Backend Laravel | ⏳ Planned |
| Database integration | ⏳ Planned |
| End-to-end production QA | ⏳ Planned |

## Tentang Project

Project Kerja Praktik: **Rancang Bangun Sistem Invoicing dan Billing Berbasis Web pada PT. Ruang Kreasi Aplikasi**. Aplikasi ini menyatukan proses pembuatan invoice, monitoring billing, pencatatan pembayaran, pemasukan, pengeluaran, serta laporan sederhana dalam satu sistem internal.

## Fitur Utama

- **Dashboard** — ringkasan invoice, tagihan, pemasukan, pengeluaran, dan grafik periode.
- **Master Data** — klien, vendor, produk & layanan, serta rekening.
- **Invoice** — draft, terbitkan, batalkan, item invoice, penomoran, preview A4, dan template invoice.
- **Billing & Payment** — sisa tagihan, pembayaran parsial/multiple, status pembayaran, dan validasi overpayment.
- **Keuangan** — pemasukan dari pembayaran, pemasukan manual, pengeluaran, rekening sumber, dan transfer.
- **Laporan** — buku kas debit/kredit, invoice, pembayaran, pemasukan, dan pengeluaran.
- **Pengaturan** — data perusahaan, template invoice, penomoran invoice, serta pengguna & hak akses.

## Alur Bisnis

```mermaid
flowchart LR
    A[Invoice] -->|Terbitkan| B[Billing]
    B --> C[Payment]
    C --> D[Pemasukan]
    D --> E[Laporan]
    F[Pengeluaran] --> E
```

Invoice diterbitkan tidak otomatis menjadi pemasukan. Pemasukan invoice dicatat saat pembayaran diterima.

## Business Rules Utama

- Billing = total invoice − total pembayaran.
- Satu invoice dapat memiliki beberapa pembayaran.
- Overpayment ditolak; invoice draft tidak masuk billing aktif.
- Pengeluaran terpisah dari billing dan memakai rekening sumber.
- Laporan memakai konsep debit/kredit sederhana.

## Teknologi

- Laravel 12
- Vue.js 3, Vue Router, dan Pinia
- MySQL (fase integrasi berikutnya)
- Vite dan Tailwind CSS

## Arsitektur

```mermaid
flowchart LR
    V[Vue 3 + Pinia] --> L[Laravel API - planned phase]
    L --> M[MySQL - planned phase]
```

Frontend saat ini memakai data demo terstruktur. API Laravel dan integrasi MySQL adalah fase pengembangan berikutnya.

## Struktur Project

```text
.
├── app/                 # Laravel application
├── config/              # Framework configuration
├── database/            # Future database schema and seeders
├── docs/                # Product and technical contracts
├── public/              # Runtime favicon, fonts, and invoice images
├── resources/           # Vue frontend and Blade views
├── routes/              # Laravel routes
├── storage/
├── tests/
├── artisan
├── composer.json
├── package.json
└── vite.config.js
```

## Development Setup

```bash
composer install
npm install
copy .env.example .env
php artisan key:generate
# Konfigurasikan database pada .env sebelum menjalankan migration.
npm run dev
php artisan serve
```

## Catatan Pengembangan

Dokumen kebutuhan, aturan bisnis, kontrak API, dan keputusan teknis berada di [`docs/`](docs/). Referensi UI dan asset sumber original yang digunakan selama implementasi frontend diarsipkan pada tag [`frontend-full-reference-2026-08-28`](https://github.com/zri12/Sistem-Invoicing-Billing-Implementasi/tree/frontend-full-reference-2026-08-28).

Current development: frontend implementation complete; backend dan integrasi database merupakan fase berikutnya.

## Developer

| Nama | Tanggung Jawab |
| --- | --- |
| Fazri Lukman Nurrohman | Frontend & Project Foundation |
| Fahmi Nashruddin | Backend & Database |

## Environment

File `.env` tidak disimpan di repository. Gunakan `.env.example` sebagai baseline konfigurasi lokal.

<div align="center">
  Developed for PT. Ruang Kreasi Aplikasi
</div>
