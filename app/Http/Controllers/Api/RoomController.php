<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Room;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;

class RoomController extends Controller
{
    /**
     * Get rooms data for drawing the map.
     */
    public function map()
    {
        // Build a safe select list: only select 'connections' if the column exists.
        $select = ['id', 'room_number', 'type', 'capacity', 'status'];
        if (Schema::hasColumn('rooms', 'connections')) {
            $select[] = 'connections';
        }

        $rooms = Room::select($select)
            ->with(['tenants' => function ($query) {
                $query->select('id', 'name', 'room_id');
            }])
            ->get();

        return response()->json($rooms);
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $rooms = Room::orderBy('room_number')->get();

        return response()->json($rooms);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'room_number' => 'nullable|string|max:64',
            'type' => 'nullable|string|max:64',
            'capacity' => 'nullable|integer|min:1',
            'price' => 'nullable|numeric|min:0',
            'status' => 'nullable|in:available,occupied,maintenance',
            'connections' => 'nullable|array',
            'connections.*' => 'integer',
        ]);

        $room = Room::create(array_merge([
            'capacity' => 1,
            'status' => 'available',
            'connections' => [],
        ], $data));

        return response()->json($room, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $room = Room::find($id);
        if (! $room) {
            return response()->json(['message' => 'Room not found'], 404);
        }

        $data = $request->validate([
            'connections' => 'nullable|array',
            'connections.*' => 'integer',
        ]);

        if (array_key_exists('connections', $data)) {
            $room->connections = $data['connections'] ?? [];
        }

        $room->save();

        return response()->json($room);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $room = Room::find($id);
        if (! $room) {
            return response()->json(['message' => 'Room not found'], 404);
        }

        $room->delete();

        return response()->json(['message' => 'Room deleted']);
    }
}
