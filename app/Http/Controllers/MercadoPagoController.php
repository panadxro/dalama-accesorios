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

    public function shopForm() {
        return view('cart.shop-form');
    }

    public function processShopForm(Request $request) {
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

        // Redirigimos a la URL de pago generada por MercadoPago
        return redirect()->to($preference->init_point);

    } catch (\Throwable $e) {
        dd($e); // En caso de error, ver el detalle
    }


    }
    // public function show() {
    //     // Buscamos un par de peliculas simulando un carrito de compras. Esto es lo que vamos para "cobrar" con Mercado Pago.
    //     $products = cart->products()->withPivot('amount', 'price')->get();

    //     // Integracion con Mercado Pago
    //     // Preparamos el array con los datos en el formato que pide MercadoPago
    //     $items = [];
    //     foreach ($products as $product) {
    //         $items[] = [
    //             'id' => $product->product_id,
    //             'title' => $product->name,
    //             'unit_price' => $product->price,
    //             'quantity' => 1, // Agregar cantidad
    //         ];
    //     }
        
    //     try {
    //         // Defnimos el token de acceso de nuestra cuenta.
    //         MercadoPagoConfig::setAccessToken(config(mercadopago.access_token));

    //         // Iniciamos nuestro "factory" de preferencia (cobro)
    //         $preferenceFactory = new PreferencesClient();
    //         // Creamos la rpeferencia usando el metodo create() del factory.
    //         // Este metodo recibe un array de configuracion. Debe tener al menos una clave "items" que contenga un array con los datos de los items a facturar.
    //         // Cada item debe tener al menos 3 claves: 'title', 'unit_price', 'quantity'            
    //         $preference = $preferenceFactory->create([
    //             'items' => $items,
    //             // Configuramos las back_urls
    //             'back_urls' => [
    //                 'success' => route('test.mercadopago.successProcess'),
    //                 'pending' => route('test.mercadopago.pendingProcess'),
    //                 'failure' => route('test.mercadopago.failureProcess'),
    //             ],
    //             'auto_return' => 'approved',
    //         ]);
    //     } catch (\Throwable $e) {
    //         dd($e);
    //     }
    //     return view('test.mercadopago', [
    //         'products' => $products,
    //         'preference' => $preference,
    //         // Pasar public key para poder agregarla en la conexion de JS
    //         'mpPublicKey' => config('mercadopago.public_key'),

    //     ]);
    // }

    public function successProcess(Request $request)
    {
        // En esta ruta podríamos mostrar un mensaje de éxito al usuario de que su compra
        // fue realizada con éxito.
        // Vamos a recibir en el query string varios datos sobre la operación en Mercado Pago,
        // como id de operación.
        dd($request->query);
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
