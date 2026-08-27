# ARCHITECTURE.md

## Arsitektur
Satu project Laravel dengan Vue.js di dalam project yang sama.

```text
Browser
  |
  v
Vue.js Frontend
  |
  | HTTP / JSON
  v
Laravel Backend
  |
  v
MySQL
```

## Struktur Project Target

```text
sistem-invoicing-billing/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   ├── Middleware/
│   │   └── Requests/
│   ├── Models/
│   ├── Services/
│   └── Policies/
├── database/
│   ├── migrations/
│   ├── seeders/
│   └── factories/
├── public/
├── resources/
│   ├── css/
│   ├── js/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── layouts/
│   │   ├── views/
│   │   ├── router/
│   │   ├── stores/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── App.vue
│   │   └── app.js
│   └── views/
│       ├── app.blade.php
│       └── pdf/
├── routes/
│   ├── web.php
│   └── api.php
├── storage/
├── tests/
├── .env
├── .env.example
├── artisan
├── composer.json
├── package.json
└── vite.config.js
```

## Ownership
### Fazri
- Project foundation.
- Vue frontend.
- UI components/views.
- Router/stores/services frontend.
- API integration.
- Responsive/layout.

### Fahmi
- Laravel backend.
- Database.
- API.
- Business logic.
- Auth/authorization.
- PDF.
- File handling.
- Backend tests.

## Data Flow
```text
User Action
-> Vue Form
-> Frontend Validation
-> API Request
-> Laravel Request Validation
-> Service/Business Logic
-> Model/DB Transaction
-> MySQL
-> JSON Response
-> Vue State
-> UI Update
```

## Backend Guidelines
- Controller tipis.
- Validation di Form Request.
- Business logic kompleks di Service.
- Authorization di Policy/Middleware.
- Gunakan database transaction untuk flow yang menulis beberapa tabel, terutama payment -> income.
- Jangan bergantung pada perhitungan frontend untuk nilai keuangan final.

## Frontend Guidelines
- Gunakan reusable components.
- API access melalui `services/`, bukan fetch tersebar di view.
- Pisahkan state global dan local state.
- Jangan hard-code data production.
- Error dari backend harus ditampilkan dengan jelas.
