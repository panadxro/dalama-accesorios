<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\User;
use App\Models\Product;

class Cart extends Model
{
    use HasFactory;

    protected $table = 'carts';

    protected $primaryKey = 'id';

    protected $fillable = ['user_id',];

    public function user() {
        return $this->belongsTo(User::class);
    }
    
    public function products() {
        return $this->belongsToMany(Product::class, 'cart_products', 'cart_id', 'product_id')->withPivot('id', 'amount')->withTimestamps();
    }
}
