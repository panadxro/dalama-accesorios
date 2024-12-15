@extends('layouts.main')

@section('title', 'Mi perfil')

@section('content')
<section class="min-h-dvh flex justify-center items-center py-20 px-6">
  <div class="bg-white shadow-lg rounded-md p-10 w-full md:w-3/4 lg:w-1/2 mx-auto border-2">

      <h1 class="text-3xl md:text-4xl font-bold text-center mb-8">Mi Perfil</h1>

    <div class="flex flex-col gap-6 mb-6">
      <div class="flex items-center gap-4">
        <div class="w-20 h-20 rounded-full bg-red-400 flex justify-center items-center">
          <span class="text-3xl text-white font-semibold">{{ substr(auth()->user()->name, 0, 1) }}</span>
        </div>
        <div>
          <h2 class="text-2xl font-semibold text-black">{{ auth()->user()->name }} {{ auth()->user()->surname }}</h2>
          <p class="text-gray-700 text-sm lg:text-base">{{ auth()->user()->email }}</p>
        </div>
      </div>

      <div class="border-t border-gray-300 py-6">
        <h3 class="text-xl font-semibold text-black mb-4">Información de contacto</h3>
        <ul class="text-gray-700 text-base space-y-2">
          <li><b>Teléfono:</b> {{ auth()->user()->phone_number }}</li>
          <li><b>Dirección:</b> {{ auth()->user()->address }}</li>
        </ul>
      </div>
    </div>

    <div class="mt-8 text-center">
      <a 
        href="{{ route('profile.edit-form') }}" 
        class="bg-red-700 hover:bg-red-800 text-white font-bold text-lg px-6 py-3 rounded-lg"
      >
        Editar perfil
      </a>
    </div>
  </div>
</section>
@endsection
