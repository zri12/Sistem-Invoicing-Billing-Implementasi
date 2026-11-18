<?php

// Run only against the disposable SQLite database used by browser tests.
require __DIR__.'/../../vendor/autoload.php';
$app = require __DIR__.'/../../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();
if (! $app->environment('testing') || config('database.default') !== 'sqlite'
    || strcasecmp((string) realpath(config('database.connections.sqlite.database')),
        (string) realpath(storage_path('app/browser-testing.sqlite'))) !== 0) {
    throw new RuntimeException('Browser fixtures require the isolated testing database.');
}
if (in_array('--check', $argv, true)) {
    echo "Verified isolated browser database configuration.\n";
    exit;
}
\Carbon\Carbon::setTestNow(\Carbon\Carbon::parse('2026-11-17T05:00:00Z'));

foreach (['admin', 'manager'] as $role) {
    App\Models\User::factory()->create([
        'name' => 'Browser '.ucfirst($role), 'username' => 'browser-'.$role,
        'role' => $role, 'status' => 'aktif', 'password' => bcrypt('Browser-test-123!'),
    ]);
}
$fixtureDirectory = storage_path('app/browser-test-results/fixtures');
@mkdir($fixtureDirectory, 0755, true);
copy(public_path('images/invoice/devspace-invoice-logo.png'), $fixtureDirectory.'/logo.png');
$artwork = imagecreatetruecolor(240, 100);
$white = imagecolorallocate($artwork, 255, 255, 255); $navy = imagecolorallocate($artwork, 23, 59, 108);
imagefill($artwork, 0, 0, $white);
imagerectangle($artwork, 5, 5, 234, 94, $navy);
imagestring($artwork, 5, 35, 40, 'E2E SIGNATURE', $navy);
imagepng($artwork, $fixtureDirectory.'/signature.png'); imagedestroy($artwork);
$disk = \Illuminate\Support\Facades\Storage::disk('public');
foreach (['logo', 'stamp', 'signature'] as $field) {
    $disk->put('company/browser-'.$field.'.png', file_get_contents($fixtureDirectory.'/'.($field === 'logo' ? 'logo' : 'signature').'.png'));
}
App\Models\Company::factory()->create([
    'name' => 'Browser Test Company', 'logo_path' => 'company/browser-logo.png',
    'stamp_path' => 'company/browser-stamp.png', 'signature_path' => 'company/browser-signature.png',
]);
App\Models\InvoiceTemplateSetting::factory()->create();
App\Models\InvoiceNumberSetting::factory()->create();
$client = App\Models\Client::factory()->create(['name' => 'Browser Test Client', 'status' => 'aktif']);
$account = App\Models\Account::factory()->create(['name' => 'Browser Test Bank', 'status' => 'aktif']);
App\Models\Vendor::factory()->create(['name' => 'Browser Test Vendor', 'status' => 'aktif']);
App\Models\ProductService::factory()->create([
    'name' => 'Browser Test Service', 'description' => 'Browser test service',
    'default_price' => 100000, 'status' => 'aktif',
]);
$invoice = App\Models\Invoice::factory()->published()->create([
    'invoice_name' => 'Browser Test Invoice', 'client_id' => $client->id,
    'payment_account_id' => $account->id, 'subtotal' => 100000, 'total' => 100000,
    'invoice_date' => '2026-11-17', 'due_date' => '2026-12-01',
]);
App\Models\InvoiceItem::factory()->create([
    'invoice_id' => $invoice->id, 'description' => 'Browser test service',
    'qty' => 1, 'price' => 100000, 'total' => 100000,
]);
echo "Browser fixtures ready.\n";
