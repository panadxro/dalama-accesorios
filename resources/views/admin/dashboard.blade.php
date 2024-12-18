@extends('layouts.main')
@section('title', 'Dashboard')
@section('content')
<section class="py-20">
<div class="items-center py-20 w-full max-w-screen-xl mx-auto px-4">

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
</div>
</section>
@endsection
