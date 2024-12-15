@extends('layouts.main')

@section('title', 'Completar Compra')

@section('content')

<div class="my-10 md:w-4/5 mx-auto">
    <h2 class="text-3xl font-bold text-center">Completa tus datos para la compra</h2>
    
    @if ($errors->any())
        <div class="bg-red-100 text-red-600 p-3 rounded mb-6">
            Hay errores en los datos del formulario. Por favor, revisalos y volvé a intentar.
        </div>
    @endif

    <!-- Formulario para completar los datos del usuario -->
    <form action="{{ route('mercadopago.processShopForm') }}" method="POST" class="my-10 mx-20">
        @csrf
        <div class="grid md:grid-cols-2 gap-4 my-3.5">
            <div>
                <label for="name" class="block text-sm font-medium text-gray-700">Nombre</label>
                <input type="text" id="name" name="name" value="{{ old('name') }}" class="mt-1 block w-full p-2 border border-gray-300 rounded-md">
                @error('name')
                    <div class="text-danger">
                        {{ $message }}
                    </div>
                @enderror
            </div>
            <div>
                <label for="email" class="block text-sm font-medium text-gray-700">Correo Electrónico</label>
                <input type="email" id="email" name="email" value="{{ old('email') }}" class="mt-1 block w-full p-2 border border-gray-300 rounded-md">
                @error('email')
                    <div class="text-danger">
                        {{ $message }}
                    </div>
                @enderror
            </div>
        </div>

        <div class="my-3.5">
            <label for="address" class="block text-sm font-medium text-gray-700">Dirección</label>
            <input type="text" id="address" name="address" value="{{ old('address') }}" class="mt-1 block w-full p-2 border border-gray-300 rounded-md">
            @error('address')
                <div class="text-danger">
                    {{ $message }}
                </div>
            @enderror
        </div>

        <div class="col-span-2 flex justify-center mt-4">
            <!-- Este botón redirige al proceso de MercadoPago -->
            <button type="submit" class="px-6 py-2 bg-red-800 text-white rounded-md hover:bg-red-900 hover:text-white font-semibold">Confirmar y Pagar</button>
        </div>
    </form>
</div>

@endsection
