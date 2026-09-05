<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('invoice_template_settings', function (Blueprint $table) {
            $table->id();
            $table->string('title')->default('INVOICE');
            $table->boolean('show_logo')->default(true);
            $table->boolean('show_tagline')->default(true);
            $table->boolean('show_title')->default(true);
            $table->boolean('show_number')->default(true);
            $table->boolean('show_invoice_date')->default(true);
            $table->boolean('show_due_date')->default(true);
            $table->boolean('show_client')->default(true);
            $table->boolean('show_items')->default(true);
            $table->boolean('show_subtotal')->default(true);
            $table->boolean('show_discount')->default(true);
            $table->boolean('show_total')->default(true);
            $table->boolean('show_bank_info')->default(true);
            $table->boolean('show_terms')->default(true);
            $table->boolean('show_stamp')->default(true);
            $table->boolean('show_signature')->default(true);
            $table->boolean('show_signer_name')->default(true);
            $table->boolean('show_signer_position')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('invoice_template_settings');
    }
};
