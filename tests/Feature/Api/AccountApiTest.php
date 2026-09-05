<?php

namespace Tests\Feature\Api;

use App\Models\Account;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AccountApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_and_manager_can_list_accounts(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $manager = User::factory()->create(['role' => 'manager']);
        Account::factory()->count(2)->create();

        $this->actingAs($admin)->getJson('/api/accounts')->assertOk()->assertJsonCount(2, 'data.items');
        $this->actingAs($manager)->getJson('/api/accounts')->assertOk();
    }

    public function test_only_admin_can_create_update_and_change_status(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $manager = User::factory()->create(['role' => 'manager']);
        $payload = ['name' => 'BCA', 'account_number' => '123456', 'branch' => 'Cimahi'];

        $this->actingAs($manager)->postJson('/api/accounts', $payload)->assertStatus(403);

        $created = $this->actingAs($admin)->postJson('/api/accounts', $payload)->assertCreated();
        $id = $created->json('data.id');
        $this->assertSame('Cimahi', $created->json('data.branch'));

        $this->actingAs($manager)->putJson("/api/accounts/{$id}", $payload)->assertStatus(403);
        $this->actingAs($admin)->putJson("/api/accounts/{$id}", array_merge($payload, ['name' => 'BCA Updated']))
            ->assertOk()->assertJsonPath('data.name', 'BCA Updated');

        $this->actingAs($manager)->patchJson("/api/accounts/{$id}/status")->assertStatus(403);
        $this->actingAs($admin)->patchJson("/api/accounts/{$id}/status")->assertOk();
    }

    public function test_create_account_requires_name(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin)->postJson('/api/accounts', [])
            ->assertStatus(422)->assertJsonValidationErrors('name');
    }
}
