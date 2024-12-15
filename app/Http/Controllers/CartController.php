<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

use App\Models\Cart;
use App\Models\Product;
use App\Models\Quantity;

class CartController extends Controller
{
    public function addToCart(Request $request, $product_id)
    {
        $product = Product::findOrFail($product_id);
        $user = auth()->user();

        if (!$user) {
            return redirect()->route('login')->with('error', 'Debes iniciar sesión para agregar productos al carrito');
        }

        // Verifica si el usuario ya tiene un carrito o crea uno nuevo
        $cart = $user->cart ?? Cart::create(['user_id' => $user->id]);

        // Asegúrate de que el ID del carrito esté disponible
        if (!$cart->id) {
            return redirect()->back()->with('error', 'Error al crear el carrito. Por favor, intenta nuevamente.');
        }

        // Obtener el ID de la cantidad seleccionada
        $quantity_id = $request->input('quantity_id');
        if (!$quantity_id) {
            return redirect()->back()->with('error', 'Debes seleccionar una cantidad.');
        }

        // Buscar el multiplicador asociado al quantity_id
        $quantity = Quantity::find($quantity_id);
        if (!$quantity) {
            return redirect()->back()->with('error', 'Cantidad seleccionada no válida.');
        }

        $multiplier = $quantity->multiplier;

        // Obtener la cantidad del formulario
        $amount = $request->input('amount', 1); // Valor por defecto es 1
        if ($amount < 1) {
            return redirect()->back()->with('error', 'La cantidad debe ser mayor o igual a 1.');
        }

        // Calculamos el precio con el multiplicador
        $updatedPrice = $product->price * $multiplier;

        // Verificar si el producto ya está en el carrito con el mismo multiplicador
        $cartItem = $cart->products()
            ->where('cart_products.product_id', $product_id)
            ->where('cart_products.quantity_id', $quantity_id) // Filtramos por el multiplicador
            ->first();

        if ($cartItem) {
            // Si el producto ya está en el carrito con ese multiplicador, actualizamos la cantidad
            $cartItem->pivot->amount += $amount; // Sumar la cantidad
            $cartItem->pivot->price = $updatedPrice; // Actualiza el precio con el multiplicador
            $cartItem->pivot->save();
        } else {
            // Si no está en el carrito, lo agregamos con el multiplicador
            $cart->products()->attach($product_id, [
                'amount' => $amount, // Usa la cantidad del formulario
                'price' => $updatedPrice, // Establece el precio con el multiplicador
                'multiplier' => $multiplier, // Guardamos el multiplicador
                'quantity_id' => $quantity_id,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

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

        $products = $cart->products()->withPivot('amount', 'quantity_id')->get();

        $total = $products->reduce(function ($carry, $product) {
            return $carry + ($product->pivot->price * $product->pivot->amount);
        }, 0);

        return view('cart.view', compact('products', 'total'));
    }
}
