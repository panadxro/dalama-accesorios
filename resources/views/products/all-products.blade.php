@extends('layouts.main')
@section('title', 'Productos')
@section('content')

<section class="min-h-dvh items-center my-10 w-11/12 md:w-4/5 mx-auto">
  <div class="flex w-full items-center justify-center">
    <h2 class="text-3xl md:text-4xl font-bold text-center mb-8">Productos</h2>
  </div>
  
  <div>
    <form 
      action="{{ route('products.all-products') }}" 
      method="get"
      class="flex flex-wrap items-center justify-between gap-4 py-4 px-4 md:gap-8 md:py-4 md:px-8 border-2 rounded-lg"
    >
      <div class="flex-1 border-b-2 md:border-b-0 md:border-r-2">
        <label class="sr-only" for="search">Buscar</label>
        <input 
          type="search"
          name="search"
          id="search"
          value="{{ $searchParams['search'] }}"
          class="w-full bg-transparent border-none outline-none py-2 px-4"
          placeholder="Buscar"
        >
      </div>
      
      <div class="flex-1 border-b-2 md:border-b-0">
        <label class="sr-only" for="category">Categoría</label>
        <select 
          class="w-full bg-transparent border-none outline-none py-2 px-4"
          name="category" 
          id="category"
        >
          <option value="">Categorías</option>
          @foreach ($categories as $category)
            <option 
              value="{{ $category->category_id }}"
              @selected($category->category_id == $searchParams['category'])
            >
              {{ $category->name }}
            </option>
          @endforeach
        </select>
      </div>
      
      <button 
        class="bg-red-800 hover:bg-red-900 text-white py-2 px-6 md:py-3 md:px-8 rounded-lg font-semibold w-full md:w-auto"
        type="submit"
      >
        Buscar
      </button>
    </form>
  </div>

  @if (!empty($searchParams['search']))
    <p class="text-gray-600 mt-4">Resultados de la búsqueda: <b class="text-gray-600">{{ $searchParams['search'] }}</b></p>
  @endif

  @if ($products->isNotEmpty())
    <div class="flex w-full flex-col items-center justify-center mt-8">
      <ul class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        @foreach ($products as $product)
        <li class="flex flex-col items-center justify-center relative border-2 rounded-md p-4">
          <a 
            href="{{ route('products.view',['product_id' => $product->product_id])}}"
            class="flex flex-col items-center justify-center h-full"
          >
            @if($product->image)
              <img src="{{Storage::url($product->image)}}" alt="{{$product->name}}" class="h-full w-full aspect-square object-contain mb-4">
            @else
              <span class="text-gray-600">Sin imagen</span>
            @endif
            <span class="text-md text-gray-700 font-bold text-center">{{$product->name}}</span>
          </a>
        </li>
        @endforeach
      </ul>
      <div class="mt-6 w-full">
        {{ $products->links() }}
      </div>
    </div>
  @else
    <h3 class="text-center text-xl md:text-2xl font-bold text-gray-600 my-8">
      No se encontraron resultados para la búsqueda: <b class="text-gray-600">{{ $searchParams['search'] }}</b>
    </h3>
  @endif

</section>

@endsection
