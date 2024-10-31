@extends('layouts.main')
@section('title', 'Productos')
@section('content')

<section class="min-h-dvh items-center my-20">
  <div class="flex w-full items-center justify-center">
    <h2 class="text-4xl font-bold text-center">Administrar productos</h2>
  </div>
  <div class="flex w-full flex-col items-center justify-center">
    <a href="{{ route('product.create.form') }}" class="bg-red-800 rounded p-1.5 text-white font-semibold my-5 hover:bg-red-900">Publicar un Producto</a>
    
    <!-- Tabla de productos -->
    <div class="overflow-x-auto w-4/5 mx-auto mt-4">
      <table class="min-w-full table-auto border-collapse border border-gray-300">
        <thead>
          <tr class="bg-gray-100">
            <th class="border border-gray-300 px-4 py-2 text-left">Imagen</th>
            <th class="border border-gray-300 px-4 py-2 text-left">Nombre</th>
            <th class="border border-gray-300 px-4 py-2 text-left">Acción</th>
          </tr>
        </thead>
        <tbody>
          @foreach ($products as $product)
          <tr class="text-center">
            <td class="border border-gray-300 px-4 py-2">
              <a href="{{ route('products.view', ['product_id' => $product->product_id]) }}">
                @if($product->image && file_exists(public_path('img/' . $product->image)))
                <img src="{{ asset('img/' . $product->image) }}" alt="{{ $product->name }}" class="h-16 w-16 object-contain mx-auto">
                @else
                <img src="{{ asset($product->image) }}" alt="{{ $product->name }}" class="h-16 w-16 object-contain mx-auto">
                @endif
              </a>
            </td>
            <td class="border border-gray-300 px-4 py-2">
              <a href="{{ route('products.view', ['product_id' => $product->product_id]) }}" class="text-md text-gray-700 font-bold">{{ $product->name }}</a>
            </td>
            <td class="border border-gray-300 px-4 pt-4">
        <a
            href="{{ route('products.edit.form',['id' => $product->product_id])}}" 
            class="bg-red-800 rounded p-1.5 text-white font-semibold hover:bg-red-900">
            Editar
        </a>
        <form 
            action="{{ route('products.delete.process', ['id' => $product->product_id]) }}"
            method="post" class="mt-4 mb-2">
            @csrf
            @method('DELETE')
            <input 
            type="submit"
            value="Borrar" 
            onclick="return confirm('¿Estás seguro que quieres borrar el producto?')" 
            class="bg-red-800 rounded p-1.5 text-white font-semibold hover:bg-red-900">
        </form>
        </td>
          </tr>
          @endforeach
        </tbody>
      </table>
    </div>
  </div>
</section>

@endsection
