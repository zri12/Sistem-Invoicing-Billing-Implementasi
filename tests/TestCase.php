<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    public function createApplication(): \Illuminate\Foundation\Application
    {
        $app = parent::createApplication();
        // Runs before RefreshDatabase is set up: never migrate an application DB.
        if ($app['config']->get('database.default') !== 'sqlite'
            || $app['config']->get('database.connections.sqlite.database') !== ':memory:') {
            throw new \RuntimeException('STOP: API tests require SQLite :memory: before any database reset.');
        }
        $app['config']->set('invoice.pdf_storage_path', $app->storagePath('framework/testing/dompdf'));
        $app['config']->set('filesystems.disks.public.root', $app->storagePath('framework/testing/disks/public'));
        return $app;
    }

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
