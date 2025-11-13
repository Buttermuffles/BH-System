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
        Schema::table('bills', function (Blueprint $table) {
            // Add room_id column after tenant_id if it doesn't exist
            if (!Schema::hasColumn('bills', 'room_id')) {
                $table->foreignId('room_id')->nullable()->constrained()->onDelete('cascade')->after('tenant_id');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('bills', function (Blueprint $table) {
            if (Schema::hasColumn('bills', 'room_id')) {
                $table->dropForeignIdFor('Room');
                $table->dropColumn('room_id');
            }
        });
    }
};
