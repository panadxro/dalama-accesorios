<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Quantity extends Model
{
    use HasFactory;
    protected $primaryKey = 'quantity_id';
    public function quantities()
{
    return $this->belongsToMany(Quantity::class, 'products_have_quantity', 'product_id', 'quantity_id');
}
}
