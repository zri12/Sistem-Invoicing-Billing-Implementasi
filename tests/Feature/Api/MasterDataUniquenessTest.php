<?php
use App\Models\User;
use App\Models\Client;
use App\Models\Vendor;
use App\Models\ProductService;
use App\Models\Account;
use App\Models\Company;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class MasterDataUniquenessTest extends TestCase {
 use RefreshDatabase;
 public function test_duplicate_master_names_and_accounts_are_rejected(): void {
  $this->actingAs(User::factory()->create(['role'=>'admin']));
  Client::factory()->create(['name'=>'PT Contoh Jaya']);
  Vendor::factory()->create(['name'=>'Vendor Contoh']);
  ProductService::factory()->create(['name'=>'Produk Contoh']);
  Account::factory()->create(['name'=>'BCA','account_number'=>'12345']);
  foreach ([['/api/clients',['name'=>' pt   contoh jaya ','pic_name'=>'PIC','address'=>'Alamat','phone'=>'081234','email'=>'client@example.test']], ['/api/vendors',['name'=>' VENDOR contoh ','pic_name'=>'PIC','address'=>'Alamat','phone'=>'081234','email'=>'vendor@example.test']], ['/api/products-services',['name'=>' produk contoh ','description'=>'Deskripsi','unit'=>'paket','default_price'=>100]], ['/api/accounts',['name'=>'Bank Lain','account_number'=>'12345','account_holder'=>'Penguji']]] as [$uri,$data]) {
   $this->postJson($uri,$data)->assertUnprocessable();
  }
  $this->postJson('/api/accounts',['name'=>'BCA','account_number'=>'67890','account_holder'=>'Penguji'])->assertCreated();
 }
 public function test_existing_duplicate_can_be_edited_without_changing_name(): void {
  $this->actingAs(User::factory()->create(['role'=>'admin']));
  Client::factory()->create(['name'=>'Duplikat']); $client=Client::factory()->create(['name'=>'Duplikat']);
  $this->putJson('/api/clients/'.$client->id,['name'=>'Duplikat','pic_name'=>'Baru','address'=>'Alamat','phone'=>'0812000000','email'=>'qa@example.test'])->assertOk();
 }
 public function test_company_logo_is_served_without_storage_symlink(): void {
  Storage::fake('public'); Storage::disk('public')->put('company/logo.png','example');
  Company::factory()->create(['logo_path'=>'company/logo.png']);
  $this->get('/company/assets/logo')->assertRedirect();
  $this->actingAs(User::factory()->create(['role'=>'manager']))->getJson('/api/company')->assertOk()->assertJsonPath('data.logo_url','/company/assets/logo');
  $this->get('/company/assets/logo')->assertOk();
 }
}
