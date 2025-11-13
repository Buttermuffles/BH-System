<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('bills', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->onDelete('cascade');
            $table->enum('type', ['water', 'electricity']);
            $table->string('meter_number');
            $table->decimal('previous_kwh', 8, 2)->nullable(); // for electricity
            $table->decimal('current_kwh', 8, 2)->nullable(); // for electricity
            $table->decimal('consumption', 8, 2)->nullable(); // calculated as current - previous
            $table->decimal('price', 10, 2); // total price
            $table->date('bill_date');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bills');
    }
};
