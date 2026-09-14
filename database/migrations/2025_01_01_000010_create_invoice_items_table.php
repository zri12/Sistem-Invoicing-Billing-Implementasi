<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('invoice_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('invoice_id')->constrained('invoices')->cascadeOnDelete();
            $table->foreignId('product_service_id')->nullable()->constrained('products_services')->nullOnDelete();
            // Nama produk saat invoice diterbitkan.
            $table->string('product_name')->nullable();
            $table->text('description');
            $table->decimal('qty', 10, 2);
            $table->decimal('price', 15, 2);
            $table->decimal('total', 15, 2);
            $table->timestamps();

            $table->index('invoice_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('invoice_items');
    }
};
