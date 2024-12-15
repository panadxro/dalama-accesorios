<?php

namespace App\Http\Controllers;

use App\Models\Cart;
use Illuminate\Http\Request;

class AdminDashboardController extends Controller
{
    public function index()
    {

        $latestCarts = Cart::with(['user', 'products'])
            ->whereHas('products', function ($query) {
                // Filtrar solo los carritos que tengan productos con un precio mayor a 0
                $query->where('price', '>', 0);
            })
            ->latest('updated_at')
            ->take(5)
            ->get();

        return view('admin.dashboard', compact('latestCarts'));
    }
}
