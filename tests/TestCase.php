<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        // Sanctum only starts a session for requests it detects as coming
        // from the SPA frontend (Referer/Origin matching config('sanctum.stateful')).
        // The test HTTP client sends neither by default, so without this every
        // session-backed request (login, logout, /me) would 500 with
        // "Session store not set on request." This simulates the real
        // same-origin SPA request the frontend actually sends.
        $this->withServerVariables(['HTTP_REFERER' => config('app.url')]);
    }
}
