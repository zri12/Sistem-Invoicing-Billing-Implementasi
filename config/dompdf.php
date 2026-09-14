<?php

// Project Laravel dan document root domain berada pada folder yang berbeda
// di cPanel. Jangan mengandalkan public_path() saja di sini: nilai config ini
// dapat dibekukan oleh `config:cache` sebelum request web dijalankan.
//
// Pada hosting ini, aplikasi berada di /home/<akun>/PROJECT KP dan document
// root domain berada di /home/<akun>/public_html/<domain>. Jalur turunan
// berikut hanya dipilih apabila memang ada, sehingga pengembangan lokal tetap
// memakai folder public Laravel biasa. DOMPDF_PUBLIC_PATH tetap dapat dipakai
// untuk hosting dengan struktur yang berbeda.
$cpanelDomainPublicPath = dirname(base_path()).'/public_html/demoprojectwebsite.my.id';

return [
    'public_path' => env(
        'DOMPDF_PUBLIC_PATH',
        is_dir($cpanelDomainPublicPath) ? $cpanelDomainPublicPath : public_path(),
    ),
];
