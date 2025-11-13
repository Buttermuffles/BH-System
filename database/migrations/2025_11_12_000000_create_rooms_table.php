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
        // Create table only if it doesn't already exist (safe for environments where
        // a later migration already created the rooms table).
        if (! Schema::hasTable('rooms')) {
            Schema::create('rooms', function (Blueprint $table) {
                $table->id();
                $table->string('room_number')->nullable();
                $table->string('type')->nullable();
                $table->unsignedSmallInteger('capacity')->default(1);
                $table->decimal('price', 10, 2)->nullable();
                $table->string('status')->default('vacant');
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('rooms')) {
            Schema::dropIfExists('rooms');
        }
    }
};
