<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $table = 'products';

    protected $primaryKey = 'product_id';

    protected $fillable = [
        'name',
        'image',
        'description',
        // 'price',
        'brand_fk',
        'category_fk',
    ];

    public function brand()
    {
        return $this->belongsTo(Brand::class, 'brand_fk', 'brand_id');
    }
    public function category()
    {
        return $this->belongsTo(Category::class, 'category_fk', 'category_id');
    }
    public function quantities() {
        return $this->belongsToMany(
            Quantity::class,
            'products_have_quantity',
            'product_fk',
            'quantity_fk',
            'product_id',
            'quantity_id'
        );
    }
    public function carts() {
        return $this->belongsToMany(Cart::class, 'cart_products', 'product_id', 'cart_id')->withPivot('amount')->withTimestamps();
    }
}
