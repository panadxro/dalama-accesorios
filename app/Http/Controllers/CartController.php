<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

use App\Models\Cart;
use App\Models\Product;

class CartController extends Controller
{
    public function addToCart(Request $request, $product_id) {
        $product = Product::findOrFail($product_id);
        $user = auth()->user();
    
        if (!$user) {
            return redirect()->route('login')->with('error', 'Debes iniciar sesión para agregar productos al carrito');
        }
    
        // Verifica si el usuario ya tiene un carrito o crea uno nuevo
        $cart = $user->cart ?? Cart::create(['user_id' => $user->id]);  // Esto asigna el carrito o crea uno nuevo
    
        // Asegúrate de que el ID del carrito esté disponible
        if (!$cart->id) {
            return redirect()->back()->with('error', 'Error al crear el carrito. Por favor, intenta nuevamente.');
        }
    
        // Adjunta el producto al carrito con la cantidad
        $cart->products()->attach($product_id, [
            'amount' => $request->input('amount', 1),
        ]);
    
        return redirect()->back()->with('success', 'Producto agregado al carrito');
    }
/*     public function removeFromCart(Request $request, $product_id) {
        $cart = auth()->user()->cart;

        $cart->products()->detach($product_id);

        return redirect()->back()->with('success', 'Producto eliminado del carrito');
    } */
    public function removeFromCart(Request $request, $cart_product_id) {
    // Obtener el carrito del usuario autenticado
    $cart = auth()->user()->cart;
    
    // Verificar si el cart_product_id existe en la tabla cart_products
    $cartProduct = DB::table('cart_products')
        ->where('id', $cart_product_id) // Buscar por el id del producto en el carrito
        ->where('cart_id', $cart->id)  // Asegurarse de que pertenece al carrito del usuario
        ->first(); // Trae el primer registro que coincida

    // Si no existe el producto en el carrito, redirigir con mensaje de error
    if (!$cartProduct) {
        return redirect()->back()->with('error', 'Este producto no existe en tu carrito.');
    }

    // Si el producto existe, proceder a eliminarlo
    DB::table('cart_products')
        ->where('id', $cart_product_id) // Asegurarse de eliminar el producto correcto
        ->delete(); // Elimina el producto

    // Redirigir de vuelta con un mensaje de éxito
    return redirect()->back()->with('success', 'Producto eliminado del carrito');
}
    public function viewCart() {
        $user = auth()->user();
        if (!$user) {
            return redirect()->route('login')->with('error', 'Debes iniciar sesión para ver tu carrito');
        }

        $cart = $user->cart; // Se obtiene el carrito del usuario
        
        if (!$cart) {
            return view('cart.view', ['products' => []]);
        }

        $products = $cart->products()->withPivot('amount')->get();

        return view('cart.view', compact('products'));
    }
}
