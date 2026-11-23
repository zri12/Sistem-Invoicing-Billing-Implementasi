<?php
namespace Tests\Feature\Api;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RequiredFieldsTest extends TestCase
{
    use RefreshDatabase;

    public function test_master_data_rejects_incomplete_and_accepts_complete_values(): void
    {
        $this->actingAs(User::factory()->create(['role' => 'admin']));
        $cases = [
            ['/api/clients', ['name' => 'Client QA'], ['pic_name', 'address', 'phone', 'email'], ['pic_name' => 'PIC', 'address' => 'Alamat', 'phone' => '0812345678', 'email' => 'client@example.test']],
            ['/api/vendors', ['name' => 'Vendor QA'], ['pic_name', 'address', 'phone', 'email'], ['pic_name' => 'PIC', 'address' => 'Alamat', 'phone' => '0812345678', 'email' => 'vendor@example.test']],
            ['/api/products-services', ['name' => 'Produk QA', 'default_price' => 100], ['description', 'unit'], ['description' => 'Pengujian', 'unit' => 'paket']],
            ['/api/accounts', ['name' => 'Kas QA'], ['account_holder'], ['account_holder' => 'Penguji']],
        ];
        foreach ($cases as [$url, $initial, $missing, $additional]) {
            $this->postJson($url, $initial)->assertUnprocessable()->assertJsonValidationErrors($missing);
            $this->postJson($url, $initial + $additional)->assertCreated();
        }
    }

    public function test_company_and_users_reject_missing_required_fields(): void
    {
        $this->actingAs(User::factory()->create(['role' => 'admin']));
        $this->putJson('/api/company', ['name' => 'Perusahaan'])
            ->assertUnprocessable()->assertJsonValidationErrors(['code', 'address', 'phone', 'email', 'website', 'tagline', 'signing_city', 'signer_name', 'signer_title']);
        $this->postJson('/api/users', ['name' => 'Penguji', 'username' => 'qauser', 'password' => 'password123', 'role' => 'manager'])
            ->assertUnprocessable()->assertJsonValidationErrors('email');
    }
}
