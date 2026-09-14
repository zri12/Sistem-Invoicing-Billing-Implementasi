<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('invoice_id')->constrained('invoices')->cascadeOnDelete();
            $table->date('payment_date');
            $table->decimal('amount', 15, 2);
            $table->enum('method', ['cash', 'transfer', 'cheque', 'qris'])->default('transfer');
            $table->foreignId('account_id')->constrained('accounts')->restrictOnDelete();
            $table->string('reference_number')->nullable();
            $table->string('proof_path')->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index('invoice_id');
            $table->index('payment_date');
            $table->index('account_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
