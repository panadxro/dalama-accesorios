@extends('layouts.main')

@section('title', 'Editar Perfil')

@section('content')
<section class="min-h-dvh flex justify-center items-center py-20 px-6">
  <div class="bg-white shadow-lg rounded-md p-10 w-full md:w-3/4 lg:w-1/2 mx-auto border-t-4 border-red-700">
    <div class="text-center mb-8">
      <h2 class="text-3xl md:text-4xl font-bold text-center mb-4">Editar Perfil</h2>
      <p class="text-gray-600 text-lg mb-4">Actualiza tu información personal</p>
    </div>

    <form method="POST" action="{{ route('profile.update') }}" class="space-y-6">
      @csrf
      @method('PUT')

      <div>
        <label for="name" class="block text-sm font-medium text-gray-700">Nombre</label>
        <input 
          type="text" 
          id="name" 
          name="name" 
          value="{{ old('name', $user->name) }}" 
          class="mt-1 block w-full p-3 border border-gray-300 rounded-md"
        >
        @error('name')
          <span class="text-sm text-red-600">{{ $message }}</span>
        @enderror
      </div>

      <div>
        <label for="surname" class="block text-sm font-medium text-gray-700">Apellido</label>
        <input 
          type="text" 
          id="surname" 
          name="surname" 
          value="{{ old('surname', $user->surname) }}" 
          class="mt-1 block w-full p-3 border border-gray-300 rounded-md"
        >
        @error('surname')
          <span class="text-sm text-red-600">{{ $message }}</span>
        @enderror
      </div>

      <div>
        <label for="phone_number" class="block text-sm font-medium text-gray-700">Número de Teléfono</label>
        <input 
          type="text" 
          id="phone_number" 
          name="phone_number" 
          value="{{ old('phone_number', $user->phone_number) }}" 
          class="mt-1 block w-full p-3 border border-gray-300 rounded-md"
        >
        @error('phone_number')
          <span class="text-sm text-red-600">{{ $message }}</span>
        @enderror
      </div>

      <div>
        <label for="address" class="block text-sm font-medium text-gray-700">Dirección</label>
        <input 
          type="text" 
          id="address" 
          name="address" 
          value="{{ old('address', $user->address) }}" 
          class="mt-1 block w-full p-3 border border-gray-300 rounded-md"
        >
        @error('address')
          <span class="text-sm text-red-600">{{ $message }}</span>
        @enderror
      </div>

      <div>
          <label for="email" class="block text-sm font-medium text-gray-700">Correo Electrónico</label>
          <input 
            type="email" 
            id="email" 
            name="email" 
            value="{{ old('email', $user->email) }}" 
            class="mt-1 block w-full p-3 border border-gray-300 rounded-md"
          >
          @error('email')
            <span class="text-sm text-red-600">{{ $message }}</span>
          @enderror
      </div>

      <div>
          <label for="password" class="block text-sm font-medium text-gray-700">Nueva Contraseña</label>
          <input 
            type="password" 
            id="password" 
            name="password" 
            class="mt-1 block w-full p-3 border border-gray-300 rounded-md"
          >
          @error('password')
            <span class="text-sm text-red-600">{{ $message }}</span>
          @enderror
      </div>

      <div>
          <label for="password_confirmation" class="block text-sm font-medium text-gray-700">Confirmar Contraseña</label>
          <input 
            type="password" 
            id="password_confirmation" 
            name="password_confirmation" 
            class="mt-1 block w-full p-3 border border-gray-300 rounded-md"
          >
      </div>

      <div class="text-center mt-8">
        <button 
          type="submit" 
          class="bg-red-800 hover:bg-red-900 text-white font-bold text-lg px-6 py-3 rounded-lg"
        >
          Guardar Cambios
        </button>
      </div>
    </form>
  </div>
</section>
@endsection
