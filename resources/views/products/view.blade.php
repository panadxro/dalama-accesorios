@extends('layouts.main')
@section('title', $product->name)
@section('content')

<section class="min-h-dvh flex justify-center items-center py-10 px-4">
  <div class="flex flex-col md:flex-row items-center justify-start gap-8 w-full lg:w-4/5 mx-auto">
    <!-- Imagen del producto -->
    <figure class="w-full md:w-2/3 lg:w-1/2 aspect-square border-2 border-gray-300 rounded-lg">
      @if($product->image)
        <img 
          src="{{ Storage::url($product->image) }}" 
          alt="{{ $product->name }}" 
          class="h-full w-full object-contain"
        >
      @else
        <span class="flex items-center justify-center h-full text-gray-500">Sin imagen</span>
      @endif
    </figure>
    
    <!-- Información del producto -->
    <article class="flex flex-col gap-4 w-full md:w-1/3 lg:w-1/2 p-4">
      <div class="flex flex-wrap gap-4 items-center">
        <p class="text-gray-700 text-xl lg:text-2xl font-bold">{{ $product->brand->name }}</p>
        <span class="bg-gray-400 text-white rounded-full px-4 py-1 font-bold text-sm lg:text-base">
          {{ $product->category->name }}
        </span>
      </div>
      <h1 class="text-2xl lg:text-4xl font-bold">{{ $product->name }}</h1>
      <p class="text-gray-700 text-sm lg:text-base leading-relaxed">{{ $product->description }}</p>
      
      <!-- Formulario para agregar al carrito -->
      <form 
        action="{{ route('cart.add', $product->product_id) }}"
        method="post" 
        class="mt-4 mb-2 flex flex-col gap-4"
      >
        @csrf
        <div class="flex flex-wrap gap-2">
          @foreach($product->quantities as $quantity)
          <div class="relative">
            <input 
              type="radio" 
              name="quantity" 
              value="{{ $quantity->name }}" 
              id="quantity_{{ $quantity->name }}" 
              class="hidden peer" 
              required
            >
            <label 
              for="quantity_{{ $quantity->name }}" 
              class="text-sm lg:text-base text-red-700 border-2 border-red-600 rounded-xl px-4 py-2 font-bold w-fit cursor-pointer peer-checked:bg-red-700 peer-checked:text-white peer-checked:border-transparent hover:bg-red-600 hover:text-white hover:border-transparent"
            >
              x {{ $quantity->name }}
            </label>
          </div>
          @endforeach
        </div>
        <label for="amount" class="text-gray-600 text-sm lg:text-base">Cantidad:</label>
        <input 
          type="number" 
          name="amount" 
          value="1" 
          min="1" 
          required 
          class="border-2 border-gray-300 rounded-lg px-4 py-2 w-full lg:w-auto"
        >
        <button 
          class="bg-black text-white text-sm lg:text-lg rounded-full px-6 py-3 font-bold w-full lg:w-fit hover:bg-transparent hover:text-black border-4 border-black focus:outline-none focus:bg-black focus:text-white"
          type="submit"
        >
          Agregar al carrito
        </button>
      </form>
      
      @if(session('success'))
        <div class="bg-green-500 text-white text-center p-2 rounded">
          {{ session('success') }}
        </div>
      @endif
    </article>
  </div>
</section>

@endsection
