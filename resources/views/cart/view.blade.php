@extends('layouts.main')
@section('title', 'Mi carrito')
@section('content')
<section class="min-h-dvh my-10 px-4">
  <div class="flex justify-center">
    <h2 class="text-3xl lg:text-4xl font-bold text-center mb-10">Mi carrito</h2>
  </div>
  <div class="flex flex-col items-center justify-center">
    @if (empty($products))
      <p class="text-lg text-gray-700">No hay productos en el carrito</p>
    @else
      <div class="overflow-x-auto w-full max-w-4xl">
        <table class="min-w-full table-auto border-collapse border border-gray-300">
          <thead>
            <tr class="bg-gray-100 text-left">
              <th class="border border-gray-300 px-4 py-2 text-sm lg:text-base">Cant</th>
              <th class="border border-gray-300 px-4 py-2 text-sm lg:text-base">Producto</th>
              <th class="border border-gray-300 px-4 py-2 text-sm lg:text-base">Presentación</th>
              <th class="border border-gray-300 px-4 py-2 text-sm lg:text-base">Precio unitario</th>              
              <th class="border border-gray-300 px-4 py-2 text-sm lg:text-base">Precio</th>              
              <th class="border border-gray-300 px-4 py-2 text-sm lg:text-base">Acción</th>
            </tr>
          </thead>
          <tbody>
            @foreach ($products as $product)
              <tr class="text-center">
                <td class="border border-gray-300 px-4 py-2 text-sm lg:text-base">
                  <p class="text-gray-700 font-bold">{{ $product->pivot->amount }}</p>
                </td>
                <td class="border border-gray-300 px-4 py-2 text-sm lg:text-base">
                  <p class="text-gray-700 font-bold">{{ $product->name }}</p>
                </td>
                <td class="border border-gray-300 px-4 py-2 text-sm lg:text-base">
                  <p class="text-gray-700 font-bold">
                    x 
                    @php
                      $quantity = \App\Models\Quantity::find($product->pivot->quantity_id);
                    @endphp
                    {{ $quantity ? $quantity->name : 'Cantidad no disponible' }}
                  </p>
                </td>
                <td class="border border-gray-300 px-4 py-2 text-sm lg:text-base">
                  <p class="text-gray-700 font-bold">${{ number_format($product->pivot->price, 2) }}</p>
                </td>
                <td class="border border-gray-300 px-4 py-2 text-sm lg:text-base">
                  <p class="text-gray-700 font-bold">${{ number_format($product->pivot->price * $product->pivot->amount, 2) }}</p>
                </td>
                
                <td class="border border-gray-300 px-4 py-2">
                  <form 
                    action="{{ route('cart.remove', ['cart_product_id' => $product->pivot->id]) }}" 
                    method="post" 
                    class="inline"
                  >
                    @csrf
                    @method('delete')
                    <input 
                      type="submit" 
                      value="Borrar" 
                      onclick="return confirm('¿Estás seguro que quieres borrar el producto del carrito?')" 
                      class="bg-red-800 rounded p-2 text-white font-semibold hover:bg-red-900 cursor-pointer text-sm lg:text-base"
                    >
                  </form>
                </td>
              </tr>
            @endforeach
          </tbody>
        </table>
      </div>
      
      <div class="pt-10 w-full max-w-4xl flex justify-end items-center flex-col">
        <div class="w-full max-w-sm bg-white rounded-lg shadow-sm p-6 border border-gray-300">
          <h3 class="text-lg font-bold text-gray-800 border-b border-gray-300 pb-4 mb-4">
            Total del carrito
          </h3>
          <div class="flex justify-between items-center">
            <p class="text-sm text-gray-700">Total:</p>
            <p class="text-2xl font-extrabold text-red-600">
              ${{ number_format($total, 2) }}
            </p>
            
          </div>
        </div>
        <form action="{{ route('mercadopago.show') }}" method="POST" class="my-10 mx-20">
            @csrf

            <div class="col-span-2 flex justify-center">
                <!-- Este botón redirige al proceso de MercadoPago -->
                <button type="submit" class="px-6 py-2 bg-red-800 text-white rounded-md hover:bg-red-900 hover:text-white font-semibold">Confirmar y Pagar</button>
            </div>
        </form>
      </div>

    @endif
  </div>
</section>
@endsection
