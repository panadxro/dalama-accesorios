@extends('layouts.main')
@section('title', 'Mi carrito')
@section('content')
<section class="min-h-dvh my-10 px-4">
  <!-- Título -->
  <div class="flex justify-center">
    <h2 class="text-3xl lg:text-4xl font-bold text-center mb-10">Mi carrito</h2>
  </div>

  <!-- Contenido -->
  <div class="flex flex-col items-center justify-center">
    @if ($products->isEmpty())
      <p class="text-lg text-gray-700">No hay productos en el carrito</p>
    @else
      <div class="overflow-x-auto w-full max-w-4xl">
        <table class="min-w-full table-auto border-collapse border border-gray-300">
          <thead>
            <tr class="bg-gray-100 text-left">
              <th class="border border-gray-300 px-4 py-2 text-sm lg:text-base">Cant</th>
              <th class="border border-gray-300 px-4 py-2 text-sm lg:text-base">Producto</th>
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
    @endif
  </div>
</section>
@endsection
