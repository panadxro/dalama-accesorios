@extends('layouts.main')
@section('title', 'Productos')
@section('content')

<section class="min-h-dvh items-center my-20">
  <div class="flex w-full items-center justify-center">
    <h2 class="text-4xl font-bold text-center mb-10">Productos</h2>
  </div>
  <div class="flex w-full flex-col items-center justify-center">
    <ul class="grid grid-cols-4 gap-8 w-4/5 mx-auto mt-4">
    @foreach ($products as $product)
      <li class="flex flex-col items-center justify-center relative border-2 rounded-md p-4">
        <a 
          href="{{ route('products.view',['product_id' => $product->product_id])}}"
          class="flex flex-col items-center justify-center h-full"
          >
          @if($product->image && file_exists(public_path('img/' . $product->image)))
          <img src="{{ asset('img/' . $product->image) }}" alt="{{ $product->name }}" class="h-full w-full aspect-square object-contain">
          @else
          <img src="{{ asset($product->image) }}" alt="{{ $product->name }}" class="h-full w-full aspect-square object-contain">
          <!-- <img 
            src="{{ asset('img/' . $product->image) }}" 
            alt="{{$product->name}}"
            class="h-full w-full aspect-square object-contain"
            > -->
          @endif
          <span class="text-md text-gray-700 font-bold">{{$product->name}}</span>
        </a>
      </li>
      @endforeach
    </ul>
  </div>
</section>

@endsection