<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

/**
 * Rejects requests from an authenticated user whose account has been set to
 * "nonaktif" since login. Technical choice (AUTHORIZATION_MATRIX.md section 9
 * leaves this undocumented): deactivation takes effect on the user's very next
 * request rather than requiring a separate session-invalidation broadcast.
 */
class EnsureUserIsActive
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && $user->status !== 'aktif') {
            Auth::guard('web')->logout();

            if ($request->hasSession()) {
                $request->session()->invalidate();
                $request->session()->regenerateToken();
            }

            return response()->json([
                'success' => false,
                'message' => 'Akun tidak aktif.',
            ], 401);
        }

        return $next($request);
    }
}
