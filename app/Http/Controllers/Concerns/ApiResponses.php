<?php

namespace App\Http\Controllers\Concerns;

trait ApiResponses
{
    protected function success(mixed $data = null, string $message = 'OK', int $status = 200)
    {
        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => $data,
        ], $status);
    }
}
