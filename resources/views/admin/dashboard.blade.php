@extends('layouts.main')
@section('title', 'Dashboard')
@section('content')
<section>
<div class="items-center my-20 w-full max-w-screen-xl mx-auto px-4">

<div class="flex w-full items-center justify-center pb-20">
    <div class="text-center">
        <h2 class="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
            Dashboard administración
        </h2>
        <p class="text-lg sm:text-xl text-gray-600">
            Bienvenido administrador <span class="font-semibold text-red-800">{{ auth()->user()->name }}!</span>
        </p>
    </div>
</div>


        <div class="flex w-full items-center justify-center mb-6">
            <h2 class="text-lg sm:text-xl md:text-2xl font-bold text-center mb-8">Últimas 5 Compras</h2>
        </div>

        <div class="overflow-x-auto w-full">
            <table class="table-auto w-full border-collapse border border-gray-300">
                <thead>
                    <tr class="bg-gray-100">
                        <th class="border border-gray-300 px-4 py-2 text-left text-sm sm:text-base">ID del Carrito</th>
                        <th class="border border-gray-300 px-4 py-2 text-left text-sm sm:text-base">Usuario</th>
                        <th class="border border-gray-300 px-4 py-2 text-left text-sm sm:text-base">Productos</th>
                        <th class="border border-gray-300 px-4 py-2 text-left text-sm sm:text-base">Total</th>
                        <th class="border border-gray-300 px-4 py-2 text-left text-sm sm:text-base">Fecha</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse ($latestCarts as $cart)
                        <tr class="border-t">
                            <td class="border border-gray-300 px-4 py-2 text-sm sm:text-base">{{ $cart->id }}</td>
                            <td class="border border-gray-300 px-4 py-2 text-sm sm:text-base">{{ $cart->user->name ?? 'Usuario no disponible' }}</td>
                            <td class="border border-gray-300 px-4 py-2 text-sm sm:text-base">
                                <ul class="list-disc pl-5">
                                    @foreach ($cart->products as $product)
                                        <li>{{ $product->name }} (Cantidad: {{ $product->pivot->amount }})</li>
                                    @endforeach
                                </ul>
                            </td>
                            <td class="border border-gray-300 px-4 py-2 text-sm sm:text-base">
                                @php
                                    $total = $cart->products->sum(fn($product) => $product->price * $product->pivot->amount);
                                @endphp
                                @if ($total > 0)
                                    ${{ number_format($total, 2) }}
                                @else
                                    <span class="text-red-500">No hay productos</span>
                                @endif
                            </td>
                            <td class="border border-gray-300 px-4 py-2 text-sm sm:text-base">{{ $cart->updated_at->format('d/m/Y H:i') }}</td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="5" class="text-center py-4">No hay compras recientes.</td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
    </div>
</section>
@endsection
