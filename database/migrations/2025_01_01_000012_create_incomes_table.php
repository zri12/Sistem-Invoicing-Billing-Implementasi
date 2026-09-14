<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('incomes', function (Blueprint $table) {
            $table->id();
            $table->date('income_date');
            $table->enum('source_type', ['invoice', 'manual']);
            $table->string('source')->nullable();
            $table->foreignId('payment_id')->nullable()->unique()->constrained('payments')->cascadeOnDelete();
            $table->foreignId('invoice_id')->nullable()->constrained('invoices')->nullOnDelete();
            $table->string('category');
            $table->text('description');
            $table->decimal('amount', 15, 2);
            $table->foreignId('account_id')->constrained('accounts')->restrictOnDelete();
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index('invoice_id');
            $table->index('income_date');
            $table->index('account_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('incomes');
    }
};
