<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ReleaseReadOnlySession
{
    public function handle(Request $request, Closure $next): Response
    {
        // PHP file sessions memakai lock eksklusif. Tutup session setelah
        // autentikasi untuk GET/HEAD agar request data paralel tidak antre.
        if ($request->hasSession() && in_array($request->method(), ['GET', 'HEAD'], true)) {
            $request->session()->save();
        }

        return $next($request);
    }
}
