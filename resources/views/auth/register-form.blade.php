@extends('layouts.main')

@section('title', 'Inicio de Sesion')

@section('content')

<div class="my-20 md:w-6/12 mx-auto">
        <h2 class="text-3xl font-bold text-center">Registrar usuario</h2>
        <form 
            action="{{ route('auth.register.process') }}" 
            method="POST" 
            class="my-10 mx-20 flex flex-col gap-4">
            @csrf
            <div>
                <label for="name" class="block text-sm font-medium text-gray-700">Nombre</label>
                <input type="name" id="name" name="name" value="{{ old('name') }}" class="mt-1 block w-full p-2 border border-gray-300 rounded-md" required>
            </div>
            <div>
                <label for="surname" class="block text-sm font-medium text-gray-700">Apellido</label>
                <input type="name" id="surname" name="surname" value="{{ old('surname') }}" class="mt-1 block w-full p-2 border border-gray-300 rounded-md" required>
            </div>
            <div>
                <label for="phone_number" class="block text-sm font-medium text-gray-700">Nro de teléfono</label>
                <input type="number" id="phone_number" name="phone_number" value="{{ old('phone_number') }}" class="mt-1 block w-full p-2 border border-gray-300 rounded-md" required>
            </div>
            <div>
                <label for="address" class="block text-sm font-medium text-gray-700">Dirección</label>
                <input type="name" id="address" name="address" value="{{ old('address') }}" class="mt-1 block w-full p-2 border border-gray-300 rounded-md" required>
            </div>
            <div>
                <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
                <input type="email" id="email" name="email" value="{{ old('email') }}" class="mt-1 block w-full p-2 border border-gray-300 rounded-md" required>
            </div>
            <div>
                <label for="password" class="block text-sm font-medium text-gray-700">Contraseña</label>
                <input type="password" id="password" name="password" class="mt-1 block w-full p-2 border border-gray-300 rounded-md">
            </div>
            <div>
                <label for="password_confirmation" class="block text-sm font-medium text-gray-700">Confirmar contraseña</label>
                <input type="password" id="password_confirmation" name="password_confirmation" value="{{ old('password_confirmation') }}" class="mt-1 block w-full p-2 border border-gray-300 rounded-md" required>
            </div>
            <button type="submit" class="px-6 py-2 bg-red-800 text-white rounded-md hover:bg-red-900 hover:text-white font-semibold">Ingresar</button>
        </form>
        <p class="text-center text-sm text-gray-500">¿Ya tienes una cuenta? <a href="{{ route('auth.login.form') }}" class="text-red-800 hover:underline">Ingresar</a></p>
        @if($errors->any())
        <div>
            <ul>
                @foreach($errors->all() as $error)
                <li class="text-red-600">{{ $error }}</li>
                @endforeach
            </ul>
        </div>
        @endif
</div>

@endsection