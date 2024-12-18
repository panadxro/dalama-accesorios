<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Cart;
use App\Payments\MercadoPagoPayment;
use Illuminate\Http\Request;
use MercadoPago\Client\Preference\PreferenceClient;
use MercadoPago\Resources\Preference;
use MercadoPago\MercadoPagoConfig;

class MercadoPagoController extends Controller
{
    public function show(Request $request) {
        $userData = $request->only(['name', 'email', 'address']);

        $user = auth()->user();
        $cart = Cart::where('user_id', $user->id)->first();

        if($cart->products()->count() == 0) {
            return redirect()->route('cart.view')->with('error', 'tu carrito esta vacio');
        }

        $products = $cart->products()->withPivot('amount', 'price')->get();
        $items = [];
        $totalPrice = 0;

    foreach ($products as $product) {
        $itemPrice = $product->pivot->price * $product->pivot->amount;
        $totalPrice += $itemPrice;
        $items[] = [
            'id' => $product->id,
            'title' => $product->name,
            'unit_price' => (float) $product->pivot->price ,
            'quantity' => $product->pivot->amount, // Podrías agregar la cantidad si es necesario
        ];
    }

    session(['totalPrice' => $totalPrice]);


    try {
        MercadoPagoConfig::setAccessToken(config('mercadopago.access_token'));

        $preferenceClient = new PreferenceClient();
        $preference = $preferenceClient->create([
            'items' => $items,
            'back_urls' => [
                'success' => route('mercadopago.successProcess'),
                'pending' => route('mercadopago.pendingProcess'),
                'failure' => route('mercadopago.failureProcess'),
            ],
            'auto_return' => 'approved',
            'total_amount' => $totalPrice,
        ]);

        // dd($preference);
        // Redirigimos a la URL de pago generada por MercadoPago
        return redirect()->to($preference->sandbox_init_point);

    } catch (\Throwable $e) {
        dd($e); // En caso de error, ver el detalle
    }
    return view ('mercadopago', [
        'products' => $products,
        'preference' => $preference,
        'publicKey' => config('mercadopago.public_key'),
    ]);

    }

    public function successProcess(Request $request)
    {
        $user = auth()->user();
        $cart = $user->cart;

        $order = $user->orders()->create(['total_price' => $totalPrice]);

            // Obtener el totalPrice desde la sesión
    $totalPrice = session('totalPrice', 0); // Si no hay precio en sesión, lo asumimos como 0

    // Crear la orden en la base de datos
    $order = $user->orders()->create([
        'total_price' => $totalPrice,
    ]);

    // Asociar los productos de la compra a la orden
    $products = $cart->products()->withPivot('amount', 'price')->get();
    foreach ($products as $product) {
        $order->products()->attach($product->id, [
            'amount' => $product->pivot->amount,
            'price' => $product->pivot->price,
        ]);
    }

    $cart->products()->detach();

    return redirect()->route('cart.view')->with('success', '¡Compra realizada con éxito!');

    }

    public function pendingProcess(Request $request)
    {
        dd($request->query);
    }

    public function failureProcess(Request $request)
    {
        dd($request->query);
    }

}
