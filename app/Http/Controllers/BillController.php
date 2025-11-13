<?php

namespace App\Http\Controllers;

use App\Models\Bill;
use App\Models\Room;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BillController extends Controller
{
    public function index()
    {
        $bills = Bill::with(['tenant', 'room'])->get();
        return Inertia::render('Bills/Index', [
            'bills' => $bills,
        ]);
    }

    public function create()
    {
        return Inertia::render('Bills/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'room_id' => 'required|integer|exists:rooms,id',
            'type' => 'required|in:water,electricity,rent,other',
            'amount' => 'required|numeric|min:0',
            'bill_date' => 'required|date',
            'notes' => 'nullable|string|max:500',
        ]);

        $room = Room::findOrFail($validated['room_id']);
        
        // Get tenant associated with this room
        $tenant = $room->tenant();

        $bill = new Bill($validated);
        if ($tenant) {
            $bill->tenant_id = $tenant->id;
        }
        $bill->save();

        return redirect('/bills')->with('success', 'Bill created successfully.');
    }

    public function edit(Bill $bill)
    {
        return Inertia::render('Bills/Edit', [
            'bill' => $bill,
        ]);
    }

    public function update(Request $request, Bill $bill)
    {
        $validated = $request->validate([
            'room_id' => 'required|integer|exists:rooms,id',
            'type' => 'required|in:water,electricity,rent,other',
            'amount' => 'required|numeric|min:0',
            'bill_date' => 'required|date',
            'notes' => 'nullable|string|max:500',
        ]);

        $bill->update($validated);

        return redirect('/bills')->with('success', 'Bill updated successfully.');
    }

    public function destroy(Bill $bill)
    {
        $bill->delete();
        return redirect('/bills')->with('success', 'Bill deleted successfully.');
    }
}
