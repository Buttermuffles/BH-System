<?php

namespace App\Http\Controllers;

use App\Models\Room;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RoomController extends Controller
{
    public function index()
    {
        $rooms = Room::all();
        return Inertia::render('Rooms/Index', [
            'rooms' => $rooms,
        ]);
    }

    public function create()
    {
        return Inertia::render('Rooms/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'room_number' => 'required|string|max:50|unique:rooms',
            'type' => 'nullable|string|max:50',
            'capacity' => 'nullable|integer|min:1',
            'status' => 'required|in:available,occupied,maintenance',
            'price' => 'nullable|numeric|min:0',
        ]);

        Room::create($validated);

        return redirect('/rooms')->with('success', 'Room created successfully.');
    }

    public function edit(Room $room)
    {
        return Inertia::render('Rooms/Edit', [
            'room' => $room,
        ]);
    }

    public function update(Request $request, Room $room)
    {
        $validated = $request->validate([
            'room_number' => 'required|string|max:50|unique:rooms,room_number,' . $room->id,
            'type' => 'nullable|string|max:50',
            'capacity' => 'nullable|integer|min:1',
            'status' => 'required|in:available,occupied,maintenance',
            'price' => 'nullable|numeric|min:0',
        ]);

        $room->update($validated);

        return redirect('/rooms')->with('success', 'Room updated successfully.');
    }

    public function destroy(Room $room)
    {
        $room->delete();
        return redirect('/rooms')->with('success', 'Room deleted successfully.');
    }
}
