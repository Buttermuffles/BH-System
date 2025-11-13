<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Room extends Model
{
    protected $fillable = [
        'room_number',
        'type',
        'capacity',
        'price',
        'status',
    ];

    // optional JSON column that holds an array of connected room ids, e.g. [2,3]
    protected $casts = [
        'connections' => 'array',
    ];

    public function tenants()
    {
        return $this->hasMany(Tenant::class);
    }
}
