<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('expenses', function (Blueprint $table) {
            $table->id();
            $table->date('expense_date');
            $table->foreignId('vendor_id')->nullable()->constrained('vendors')->nullOnDelete();
            $table->string('category');
            $table->text('description');
            $table->decimal('amount', 15, 2);
            $table->foreignId('source_account_id')->constrained('accounts')->restrictOnDelete();
            $table->enum('transaction_type', ['cash', 'qris', 'credit', 'transfer']);
            // Free-text external destination (bank/account name), not an internal
            // accounts.id relation. Required only when transaction_type = transfer
            // (enforced in the Form Request / Service, not at the DB layer).
            $table->string('destination_account')->nullable();
            $table->string('reference_number')->nullable();
            $table->string('proof_path')->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index('vendor_id');
            $table->index('source_account_id');
            $table->index('expense_date');
            $table->index('transaction_type');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('expenses');
    }
};
