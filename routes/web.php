<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('app');
});

// Vue SPA routes (including /login) are rendered by the shared frontend entry.
Route::fallback(function () {
    return view('app');
});
