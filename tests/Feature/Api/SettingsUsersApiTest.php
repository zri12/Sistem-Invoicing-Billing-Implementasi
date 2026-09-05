<?php

namespace Tests\Feature\Api;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class SettingsUsersApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_update_company_including_logo_upload(): void
    {
        Storage::fake('public');
        $admin = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($admin)->post('/api/company', [
            '_method' => 'PUT',
            'name' => 'PT. Ruang Kreasi Aplikasi',
            'tagline' => 'Digital Transformation',
            'signing_city' => 'Cimahi',
            'logo' => UploadedFile::fake()->image('logo.png'),
        ]);

        $response->assertOk()->assertJsonPath('data.signing_city', 'Cimahi');
        $this->assertNotNull($response->json('data.logo_url'));
    }

    public function test_manager_cannot_update_company_but_can_read(): void
    {
        $manager = User::factory()->create(['role' => 'manager']);

        $this->actingAs($manager)->getJson('/api/company')->assertOk();
        $this->actingAs($manager)->putJson('/api/company', ['name' => 'x'])->assertStatus(403);
    }

    public function test_admin_can_update_invoice_template_settings(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin)->putJson('/api/settings/invoice-template', [
            'title' => 'INVOICE', 'show_logo' => false, 'show_tagline' => true, 'show_title' => true,
            'show_number' => true, 'show_invoice_date' => true, 'show_due_date' => true, 'show_client' => true,
            'show_items' => true, 'show_subtotal' => true, 'show_discount' => true, 'show_total' => true,
            'show_bank_info' => true, 'show_terms' => true, 'show_stamp' => true, 'show_signature' => true,
            'show_signer_name' => true, 'show_signer_position' => true,
        ])->assertOk()->assertJsonPath('data.show_logo', false);
    }

    public function test_manager_can_read_but_not_write_template_and_numbering_settings(): void
    {
        $manager = User::factory()->create(['role' => 'manager']);

        $this->actingAs($manager)->getJson('/api/settings/invoice-template')->assertOk();
        $this->actingAs($manager)->getJson('/api/settings/invoice-numbering')->assertOk();
        $this->actingAs($manager)->putJson('/api/settings/invoice-numbering', [
            'document_code' => 'INV', 'company_code' => 'RKA', 'digits' => 3,
            'month_format' => 'romawi', 'year_format' => '2digit',
        ])->assertStatus(403);
    }

    public function test_numbering_settings_reject_non_continuous_reset_rule(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin)->putJson('/api/settings/invoice-numbering', [
            'document_code' => 'INV', 'company_code' => 'RKA', 'digits' => 3,
            'month_format' => 'romawi', 'year_format' => '2digit', 'reset_rule' => 'bulanan',
        ])->assertStatus(422)->assertJsonValidationErrors('reset_rule');
    }

    public function test_admin_can_manage_users_and_cannot_self_downgrade(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $created = $this->actingAs($admin)->postJson('/api/users', [
            'name' => 'Budi', 'username' => 'budi.s', 'email' => 'budi@x.com',
            'password' => 'password123', 'role' => 'manager',
        ])->assertCreated()->json('data');

        $this->actingAs($admin)->patchJson("/api/users/{$created['id']}/status")
            ->assertOk()->assertJsonPath('data.status', 'nonaktif');

        $this->actingAs($admin)->putJson("/api/users/{$admin->id}", [
            'name' => $admin->name, 'username' => $admin->username, 'role' => 'manager',
        ])->assertStatus(422);

        $this->actingAs($admin)->patchJson("/api/users/{$admin->id}/status")->assertStatus(422);
    }

    public function test_manager_cannot_access_users_at_all(): void
    {
        $manager = User::factory()->create(['role' => 'manager']);

        $this->actingAs($manager)->getJson('/api/users')->assertStatus(403);
    }

    public function test_username_must_be_unique(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        User::factory()->create(['username' => 'taken']);

        $this->actingAs($admin)->postJson('/api/users', [
            'name' => 'X', 'username' => 'taken', 'password' => 'password123', 'role' => 'manager',
        ])->assertStatus(422)->assertJsonValidationErrors('username');
    }
}
