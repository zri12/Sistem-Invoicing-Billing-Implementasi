<?php

namespace Tests\Feature\Api;

use App\Models\ProductService;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProductServiceApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_and_manager_can_list_products(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $manager = User::factory()->create(['role' => 'manager']);
        ProductService::factory()->count(2)->create();

        $this->actingAs($admin)->getJson('/api/products-services')->assertOk()->assertJsonCount(2, 'data.items');
        $this->actingAs($manager)->getJson('/api/products-services')->assertOk();
    }

    public function test_only_admin_can_create_update_and_change_status(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $manager = User::factory()->create(['role' => 'manager']);
        $payload = ['name' => 'Jasa Baru', 'default_price' => 1000000, 'unit' => 'project'];

        $this->actingAs($manager)->postJson('/api/products-services', $payload)->assertStatus(403);

        $created = $this->actingAs($admin)->postJson('/api/products-services', $payload)->assertCreated();
        $id = $created->json('data.id');

        $this->actingAs($manager)->putJson("/api/products-services/{$id}", $payload)->assertStatus(403);
        $this->actingAs($admin)->putJson("/api/products-services/{$id}", array_merge($payload, ['name' => 'Diperbarui']))
            ->assertOk()->assertJsonPath('data.name', 'Diperbarui');

        $this->actingAs($manager)->patchJson("/api/products-services/{$id}/status")->assertStatus(403);
        $this->actingAs($admin)->patchJson("/api/products-services/{$id}/status")->assertOk();
    }

    public function test_default_price_must_be_numeric_and_non_negative(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin)->postJson('/api/products-services', [
            'name' => 'Jasa', 'default_price' => -100,
        ])->assertStatus(422)->assertJsonValidationErrors('default_price');
    }
}
