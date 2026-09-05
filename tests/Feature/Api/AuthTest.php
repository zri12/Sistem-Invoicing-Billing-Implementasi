<?php

namespace Tests\Feature\Api;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

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
