<?php

namespace Tests\Feature\Api;

use App\Models\Client;
use App\Models\Invoice;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ClientApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_list_clients(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        Client::factory()->count(3)->create();

        $this->actingAs($admin)->getJson('/api/clients')
            ->assertOk()
            ->assertJsonCount(3, 'data.items');
    }

    public function test_manager_can_list_clients(): void
    {
        $manager = User::factory()->create(['role' => 'manager']);
        Client::factory()->create();

        $this->actingAs($manager)->getJson('/api/clients')->assertOk();
    }

    public function test_admin_can_create_client(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($admin)->postJson('/api/clients', [
            'name' => 'PT Contoh Jaya',
            'pic_name' => 'Budi',
            'email' => 'budi@contoh.co.id',
        ]);

        $response->assertCreated()->assertJsonPath('data.status', 'aktif');
        $this->assertDatabaseHas('clients', ['name' => 'PT Contoh Jaya', 'status' => 'aktif']);
    }

    public function test_manager_cannot_create_client(): void
    {
        $manager = User::factory()->create(['role' => 'manager']);

        $this->actingAs($manager)->postJson('/api/clients', ['name' => 'PT Contoh Jaya'])
            ->assertStatus(403);
    }

    public function test_create_client_requires_name(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin)->postJson('/api/clients', [])
            ->assertStatus(422)
            ->assertJson(['success' => false, 'message' => 'Validasi gagal'])
            ->assertJsonValidationErrors('name');
    }

    public function test_admin_can_update_client(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $client = Client::factory()->create(['name' => 'Lama']);

        $this->actingAs($admin)->putJson("/api/clients/{$client->id}", ['name' => 'Baru'])
            ->assertOk()->assertJsonPath('data.name', 'Baru');
    }

    public function test_manager_cannot_update_client(): void
    {
        $manager = User::factory()->create(['role' => 'manager']);
        $client = Client::factory()->create();

        $this->actingAs($manager)->putJson("/api/clients/{$client->id}", ['name' => 'Baru'])
            ->assertStatus(403);
    }

    public function test_admin_can_toggle_client_status(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $client = Client::factory()->create(['status' => 'aktif']);

        $this->actingAs($admin)->patchJson("/api/clients/{$client->id}/status")
            ->assertOk()->assertJsonPath('data.status', 'nonaktif');
    }

    public function test_manager_cannot_toggle_client_status(): void
    {
        $manager = User::factory()->create(['role' => 'manager']);
        $client = Client::factory()->create();

        $this->actingAs($manager)->patchJson("/api/clients/{$client->id}/status")
            ->assertStatus(403);
    }

    public function test_client_invoice_history_is_readable_even_when_inactive(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $client = Client::factory()->inactive()->create();
        Invoice::factory()->for($client)->count(2)->create();

        $this->actingAs($admin)->getJson("/api/clients/{$client->id}/invoices")
            ->assertOk()->assertJsonCount(2, 'data');
    }

    public function test_unauthenticated_request_is_rejected(): void
    {
        $this->getJson('/api/clients')->assertStatus(401);
    }
}
