<?php

require __DIR__.'/../../vendor/autoload.php';
$app = require __DIR__.'/../../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();
$expected = realpath(storage_path('app/browser-testing.sqlite'));
$actual = config('database.default') === 'sqlite' ? realpath(config('database.connections.sqlite.database')) : false;
if (! $expected || ! $actual || strcasecmp($expected, $actual) !== 0) {
    throw new RuntimeException('STOP: database is not the exact isolated storage/app/browser-testing.sqlite');
}
if (in_array('--check', $argv, true)) {
    echo json_encode(['database' => $actual, 'isolated' => true]); exit;
}
if (in_array('--snapshot', $argv, true)) {
    $data = [];
    foreach (['clients', 'vendors', 'products_services', 'accounts', 'invoices', 'invoice_items', 'payments', 'incomes', 'expenses',
        'companies', 'invoice_template_settings', 'invoice_number_settings', 'users'] as $table) {
        $data[$table] = \Illuminate\Support\Facades\DB::table($table)->get()->map(function ($row) {
            unset($row->password, $row->remember_token);
            // DATE is represented as text by SQLite; compare its calendar value.
            foreach (get_object_vars($row) as $key => $value) {
                if (is_string($value) && str_ends_with($key, '_date') && preg_match('/^\d{4}-\d{2}-\d{2}/', $value)) $row->$key = \Carbon\Carbon::parse($value)->format('Y-m-d');
            }
            return $row;
        });
    }
    $data['foreign_key_check'] = \Illuminate\Support\Facades\DB::select('PRAGMA foreign_key_check');
    echo json_encode($data, JSON_THROW_ON_ERROR); exit;
}

if (in_array('--volume', $argv, true)) {
    $suffix = $argv[2]; $account = \App\Models\Account::findOrFail((int) $argv[3]);
    if (! preg_match('/^[a-z0-9]+$/', $suffix)) throw new RuntimeException('Invalid fixture suffix');
    for ($i = 0; $i < 105; $i++) \App\Models\Client::factory()->create([
        'name' => 'ZZZ-E2E-CLIENT-VOLUME-'.$suffix.'-'.str_pad((string) $i, 3, '0', STR_PAD_LEFT),
    ]);
    for ($i = 0; $i < 205; $i++) \App\Models\Income::factory()->create([
        'income_date' => '2025-01-01', 'source_type' => 'manual', 'payment_id' => null, 'invoice_id' => null,
        'source' => 'E2E volume', 'description' => 'E2E-INCOME-VOLUME-'.$suffix.'-'.str_pad((string) $i, 3, '0', STR_PAD_LEFT),
        'amount' => 1, 'account_id' => $account->id,
    ]);
    echo json_encode(['clients' => 105, 'incomes' => 205]); exit;
}

if (in_array('--worker', $argv, true)) {
    \Carbon\Carbon::setTestNow(\Carbon\Carbon::parse('2026-11-17T05:00:00Z'));
    [$script, $mode, $job, $invoiceId, $gate] = $argv;
    echo "READY\n"; flush();
    $deadline = microtime(true) + 20;
    while (! is_file($gate)) {
        if (microtime(true) > $deadline) throw new RuntimeException('Concurrency barrier timeout');
        usleep(1000);
    }
    try {
        $invoice = \App\Models\Invoice::findOrFail((int) $invoiceId);
        if ($job === 'payment') {
            $record = app(\App\Services\PaymentService::class)->recordPayment($invoice, [
                'payment_date' => now()->toDateString(), 'amount' => 800000, 'method' => 'cash',
                'account_id' => $invoice->payment_account_id,
            ], $invoice->created_by);
            echo json_encode(['status' => 201, 'id' => $record->id]);
        } elseif ($job === 'invoice') {
            $record = app(\App\Services\InvoiceService::class)->create([
                'invoice_name' => 'E2E-INVOICE-CONCURRENT', 'client_id' => $invoice->client_id,
                'payment_account_id' => $invoice->payment_account_id, 'invoice_date' => now()->toDateString(),
                'due_date' => now()->addDay()->toDateString(), 'items' => [
                    ['description' => 'Concurrent number', 'price' => 100000, 'qty' => 1],
                ],
            ], $invoice->created_by);
            echo json_encode(['status' => 201, 'number' => $record->invoice_number]);
        } else { throw new RuntimeException('Unknown worker job'); }
    } catch (\Illuminate\Validation\ValidationException $e) {
        echo json_encode(['status' => 422, 'errors' => $e->errors()]);
    } catch (\Throwable $e) {
        fwrite(STDERR, $e->getMessage()); exit(1);
    }
    exit;
}
