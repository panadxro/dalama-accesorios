@extends('layouts.main')
@section('title', 'Administrar usuarios')
@section('content')
<div class="items-center my-20 w-full max-w-screen-xl mx-auto px-4">
    <div class="flex w-full items-center justify-center mb-8">
        <h2 class="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8">Usuarios y sus Carritos</h2>
    </div>
    <div class="overflow-x-auto w-full">
        <table class="table-auto w-full border-collapse border border-gray-300">
            <thead>
                <tr class="bg-gray-100">
                    <th class="border border-gray-300 px-4 py-2 text-left text-sm sm:text-base">Nombre</th>
                    <th class="border border-gray-300 px-4 py-2 text-left text-sm sm:text-base">Email</th>
                    <th class="border border-gray-300 px-4 py-2 text-left text-sm sm:text-base">Carrito</th>
                </tr>
            </thead>
            <tbody>
                @forelse ($users as $user)
                    <tr class="border-t">
                        <td class="border border-gray-300 px-4 py-2 text-sm sm:text-base">{{ $user->name }}</td>
                        <td class="border border-gray-300 px-4 py-2 text-sm sm:text-base">{{ $user->email }}</td>
                        <td class="border border-gray-300 px-4 py-2 text-sm sm:text-base">
                            @if ($user->cart && $user->cart->products->count())
                                <ul class="list-disc pl-5">
                                    @foreach ($user->cart->products as $product)
                                        <li>{{ $product->name }} x {{ $product->pivot->amount }}</li>
                                    @endforeach
                                </ul>
                            @else
                                <p>No hay productos en el carrito.</p>
                            @endif
                        </td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="3" class="text-center py-4">No hay usuarios registrados o con carritos.</td>
                    </tr>
                @endforelse
            </tbody>
        </table>
    </div>
</div>
@endsection
