<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Bill extends Model
{
    protected $fillable = [
        'tenant_id',
        'room_id',
        'type',
        'meter_number',
        'previous_kwh',
        'current_kwh',
        'consumption',
        'price',
        'bill_date',
    ];

    protected static function boot()
    {
        parent::boot();

        static::saving(function ($bill) {
            if ($bill->type === 'electricity' && $bill->current_kwh && $bill->previous_kwh) {
                $bill->consumption = $bill->current_kwh - $bill->previous_kwh;
            }
        });
    }

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    public function room()
    {
        return $this->belongsTo(Room::class);
    }
}
