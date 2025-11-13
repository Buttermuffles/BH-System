<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Bill;
use App\Models\Room;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class BillController extends Controller
{
    /**
     * Create a bill for a room's tenant.
     */
    public function store(Request $request, $roomId)
    {
        $validator = Validator::make($request->all(), [
            'amount' => 'required|numeric',
            'notes' => 'nullable|string',
            'type' => 'nullable|in:water,electricity',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $room = Room::with('tenants')->find($roomId);
        if (! $room) {
            return response()->json(['message' => 'Room not found'], 404);
        }

        $tenant = $room->tenants->first();
        if (! $tenant) {
            return response()->json(['message' => 'No tenant assigned to this room'], 422);
        }

        // Create a simple Bill record: map amount -> price, set bill_date to today.
        $bill = Bill::create([
            'tenant_id' => $tenant->id,
            'room_id' => $room->id,
            'type' => $request->input('type', 'electricity'),
            'meter_number' => '',
            'previous_kwh' => null,
            'current_kwh' => null,
            'consumption' => null,
            'price' => $request->input('amount'),
            'bill_date' => Carbon::today()->toDateString(),
        ]);

        return response()->json($bill, 201);
    }
}
