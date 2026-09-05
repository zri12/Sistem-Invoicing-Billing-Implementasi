<?php

namespace Tests\Feature\Api;

use App\Models\Expense;
use App\Models\User;
use App\Models\Vendor;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class VendorApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_and_manager_can_list_vendors(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $manager = User::factory()->create(['role' => 'manager']);
        Vendor::factory()->count(2)->create();

        $this->actingAs($admin)->getJson('/api/vendors')->assertOk()->assertJsonCount(2, 'data.items');
        $this->actingAs($manager)->getJson('/api/vendors')->assertOk();
    }

    public function test_only_admin_can_create_update_and_change_status(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $manager = User::factory()->create(['role' => 'manager']);

        $this->actingAs($manager)->postJson('/api/vendors', ['name' => 'CV Contoh'])->assertStatus(403);

        $created = $this->actingAs($admin)->postJson('/api/vendors', ['name' => 'CV Contoh'])->assertCreated();
        $vendorId = $created->json('data.id');

        $this->actingAs($manager)->putJson("/api/vendors/{$vendorId}", ['name' => 'Baru'])->assertStatus(403);
        $this->actingAs($admin)->putJson("/api/vendors/{$vendorId}", ['name' => 'Baru'])->assertOk();

        $this->actingAs($manager)->patchJson("/api/vendors/{$vendorId}/status")->assertStatus(403);
        $this->actingAs($admin)->patchJson("/api/vendors/{$vendorId}/status")->assertOk()
            ->assertJsonPath('data.status', 'nonaktif');
    }

    public function test_create_vendor_requires_name(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin)->postJson('/api/vendors', [])
            ->assertStatus(422)->assertJsonValidationErrors('name');
    }

    public function test_vendor_expense_history_is_readable(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $vendor = Vendor::factory()->create();
        Expense::factory()->count(2)->create(['vendor_id' => $vendor->id]);

        $this->actingAs($admin)->getJson("/api/vendors/{$vendor->id}/expenses")
            ->assertOk()->assertJsonCount(2, 'data');
    }
}
