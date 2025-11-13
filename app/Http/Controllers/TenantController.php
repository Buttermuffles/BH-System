<?php

namespace App\Http\Controllers;

use App\Models\Tenant;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TenantController extends Controller
{
    public function index()
    {
        $tenants = Tenant::with('room')->get();
        return Inertia::render('Tenants/Index', [
            'tenants' => $tenants,
        ]);
    }

    public function create()
    {
        return Inertia::render('Tenants/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255|unique:tenants',
            'phone' => 'nullable|string|max:20',
            'room_id' => 'nullable|integer|exists:rooms,id',
        ]);

        // Map email and phone to contact if needed, or store as is
        $data = $validated;
        if (!isset($data['contact']) && ($validated['email'] || $validated['phone'])) {
            $data['contact'] = ($validated['email'] ?? '') . ' ' . ($validated['phone'] ?? '');
        }

        Tenant::create($data);

        return redirect('/tenants')->with('success', 'Tenant created successfully.');
    }

    public function edit(Tenant $tenant)
    {
        return Inertia::render('Tenants/Edit', [
            'tenant' => $tenant,
        ]);
    }

    public function update(Request $request, Tenant $tenant)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255|unique:tenants,email,' . $tenant->id,
            'phone' => 'nullable|string|max:20',
            'room_id' => 'nullable|integer|exists:rooms,id',
        ]);

        // Map email and phone to contact if needed, or store as is
        $data = $validated;
        if (!isset($data['contact']) && ($validated['email'] || $validated['phone'])) {
            $data['contact'] = ($validated['email'] ?? '') . ' ' . ($validated['phone'] ?? '');
        }

        $tenant->update($data);

        return redirect('/tenants')->with('success', 'Tenant updated successfully.');
    }

    public function destroy(Tenant $tenant)
    {
        $tenant->delete();
        return redirect('/tenants')->with('success', 'Tenant deleted successfully.');
    }
}

