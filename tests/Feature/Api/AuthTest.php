<?php

namespace Tests\Feature\Api;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_manager_denial_uses_the_api_error_format(): void
    {
        $manager = User::factory()->create(['role' => 'manager']);
        $this->actingAs($manager)->postJson('/api/clients', [])
            ->assertForbidden()->assertJsonPath('success', false)
            ->assertJsonStructure(['message']);
    }

    public function test_session_and_financial_responses_cannot_be_restored_from_http_cache(): void
    {
        $this->actingAs(User::factory()->create(['role' => 'admin']));
        foreach (['/api/me', '/api/invoices', '/api/payments'] as $url) {
            $response = $this->getJson($url)->assertOk();
            $this->assertStringContainsString('no-store', $response->headers->get('Cache-Control'));
        }
    }

    public function test_login_bootstrap_and_refresh_use_the_same_invoice_order(): void
    {
        $user = User::factory()->create(['username' => 'order-admin', 'password' => bcrypt('secret123'), 'role' => 'admin']);
        \App\Models\Invoice::factory()->count(3)->create(['invoice_date' => '2026-11-17']);
        $initial = $this->postJson('/api/login', ['username' => $user->username, 'password' => 'secret123'])
            ->assertOk()->json('data.bootstrap.invoices');
        $refreshed = $this->getJson('/api/invoices')->assertOk()->json('data.items');
        $this->assertSame(array_column($refreshed, 'id'), array_column($initial, 'id'));
    }

    public function test_user_can_login_from_local_port_8001(): void
    {
        $user = User::factory()->create([
            'username' => 'local-user',
            'password' => bcrypt('secret123'),
            'status' => 'aktif',
        ]);

        $this->withHeader('Referer', 'http://127.0.0.1:8001/login')
            ->postJson('/api/login', ['username' => 'local-user', 'password' => 'secret123'])
            ->assertOk()
            ->assertJsonPath('data.id', $user->id);
    }

    public function test_active_user_can_login_with_valid_credentials(): void
    {
        $user = User::factory()->create([
            'username' => 'fazrilukman',
            'password' => bcrypt('admin123'),
            'role' => 'admin',
            'status' => 'aktif',
        ]);

        $response = $this->postJson('/api/login', [
            'username' => 'fazrilukman',
            'password' => 'admin123',
        ]);

        $response->assertOk()
            ->assertJson([
                'success' => true,
                'data' => ['id' => $user->id, 'username' => 'fazrilukman', 'role' => 'admin'],
            ])
            ->assertJsonPath('data.bootstrap.invoices', [])
            ->assertJsonPath('data.bootstrap.payments', [])
            ->assertJsonPath('data.bootstrap.clients', [])
            ->assertJsonMissingPath('data.password');
    }

    public function test_login_fails_with_invalid_password(): void
    {
        User::factory()->create(['username' => 'fazrilukman', 'password' => bcrypt('admin123')]);

        $response = $this->postJson('/api/login', [
            'username' => 'fazrilukman',
            'password' => 'wrong-password',
        ]);

        $response->assertStatus(422)
            ->assertJson(['success' => false, 'message' => 'Validasi gagal']);
    }

    public function test_inactive_user_cannot_login(): void
    {
        User::factory()->create([
            'username' => 'dewikusuma',
            'password' => bcrypt('secret123'),
            'status' => 'nonaktif',
        ]);

        $response = $this->postJson('/api/login', [
            'username' => 'dewikusuma',
            'password' => 'secret123',
        ]);

        $response->assertStatus(422);
    }

    public function test_authenticated_user_can_fetch_me(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->getJson('/api/me');

        $response->assertOk()->assertJsonPath('data.id', $user->id);
    }

    public function test_unauthenticated_me_returns_401(): void
    {
        $this->getJson('/api/me')->assertStatus(401);
    }

    public function test_login_then_logout_invalidates_session(): void
    {
        $user = User::factory()->create(['username' => 'fazrilukman', 'password' => bcrypt('admin123')]);

        $this->postJson('/api/login', ['username' => 'fazrilukman', 'password' => 'admin123'])->assertOk();
        $this->assertAuthenticatedAs($user, 'web');

        $this->postJson('/api/logout')->assertOk();
        $this->assertGuest('web');
    }

    public function test_deactivated_user_is_logged_out_on_next_request(): void
    {
        $user = User::factory()->create(['status' => 'aktif']);

        $this->actingAs($user)->getJson('/api/me')->assertOk();

        $user->update(['status' => 'nonaktif']);

        $this->actingAs($user)->getJson('/api/me')->assertStatus(401);
    }
}
