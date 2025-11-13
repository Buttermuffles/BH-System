<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Room;
use App\Models\Tenant;
use App\Models\Bill;
use App\Models\Payment;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Carbon;

class DemoSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create demo user
        User::updateOrCreate(
            ['email' => 'demo@boarding.local'],
            [
                'name' => 'Demo User',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );

        // Create some rooms
        $rooms = [];
        for ($i = 1; $i <= 8; $i++) {
            $rooms[] = Room::updateOrCreate(
                ['room_number' => sprintf('10%02d', $i)],
                [
                    'type' => 'single',
                    'capacity' => 1,
                    'price' => 5000 + ($i * 100),
                    'status' => $i % 3 === 0 ? 'available' : 'occupied',
                    'connections' => [],
                ]
            );
        }

        // Create tenants for occupied rooms
        foreach ($rooms as $room) {
            if ($room->status === 'occupied') {
                $tenant = Tenant::updateOrCreate(
                    ['name' => 'Tenant ' . $room->room_number],
                    [
                        'contact' => '0917123456',
                        'room_id' => $room->id,
                        'check_in' => Carbon::now()->subMonths(rand(1, 12))->toDateString(),
                        'check_out' => null,
                    ]
                );

                // Create a recent payment
                Payment::create([
                    'tenant_id' => $tenant->id,
                    'amount' => $room->price,
                    'payment_date' => Carbon::now()->subDays(rand(1, 20))->toDateString(),
                    'status' => 'paid',
                ]);

                // Create a sample electricity bill
                Bill::create([
                    'tenant_id' => $tenant->id,
                    'room_id' => $room->id,
                    'type' => 'electricity',
                    'meter_number' => 'MTR-' . $room->room_number,
                    'previous_kwh' => 120,
                    'current_kwh' => 150,
                    'price' => 300.00,
                    'bill_date' => Carbon::now()->subDays(rand(1, 30))->toDateString(),
                ]);
            }
        }
    }
}
