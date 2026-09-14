<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('invoice_number_settings', function (Blueprint $table) {
            $table->id();
            $table->string('document_code')->default('INV');
            $table->string('company_code')->default('RKA');
            $table->unsignedTinyInteger('digits')->default(3);
            $table->enum('month_format', ['romawi', 'angka'])->default('romawi');
            $table->enum('year_format', ['2digit', '4digit'])->default('2digit');
            $table->enum('reset_rule', ['continuous', 'bulanan', 'tahunan'])->default('continuous');
            $table->unsignedBigInteger('last_sequence')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('invoice_number_settings');
    }
};
