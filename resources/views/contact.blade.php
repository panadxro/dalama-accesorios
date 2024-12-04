@extends('layouts.main')

@section('title', 'Contacto')

@section('content')
<div class="py-10 px-4">
  <section>
    <h2 class="text-3xl lg:text-4xl font-bold text-center">Contáctanos</h2>
    <div class="mt-8 mx-auto max-w-4xl">
      <form action="#" method="POST" class="my-10 space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700">Nombre completo</label>
            <input 
              type="text" 
              placeholder="Gustavo Torres" 
              class="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-red-800 focus:border-red-800"
            >
          </div>
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
            <input 
              type="email" 
              placeholder="gustavo@gmail.com" 
              class="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-red-800 focus:border-red-800"
            >
          </div>
        </div>
        <div>
          <label for="message" class="block text-sm font-medium text-gray-700">Mensaje</label>
          <textarea 
            placeholder="Escribe tu mensaje aquí..." 
            class="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-red-800 focus:border-red-800" 
            rows="4"
          ></textarea>
        </div>
        <div class="flex justify-center">
          <button 
            type="submit" 
            class="mt-6 px-6 py-2 bg-red-800 text-white rounded-md hover:bg-red-900 font-semibold transition"
          >
            Enviar mensaje
          </button>
        </div>
      </form>
    </div>
  </section>

  <section class="grid grid-cols-1 md:grid-cols-2 gap-8 mt-16 mx-auto max-w-6xl shadow-md border border-gray-300 rounded-md p-6">
    <!-- Mapa -->
    <div class="w-full">
      <iframe 
        src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d13105.857105308298!2d-58.1444975!3d-34.7942596!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95a32d4325af24a7%3A0x8b6b12efb36ffe10!2sDALAMA%20ACCESORIOS!5e0!3m2!1ses!2sar!4v1727539180220!5m2!1ses!2sar" 
        width="100%" 
        height="320" 
        style="border:0;" 
        allowfullscreen="" 
        loading="lazy" 
        referrerpolicy="no-referrer-when-downgrade" 
        class="rounded-md"
      ></iframe>
    </div>

    <!-- Información de contacto -->
    <article class="flex flex-col gap-4 justify-start">
      <p class="font-medium flex items-center gap-2">
        <i class="fa-solid fa-at fa-lg text-red-800"></i> 
        <span>dalamaaccesorios@gmail.com</span>
      </p>
      <p class="font-medium flex items-center gap-2">
        <i class="fa-solid fa-phone fa-lg text-red-800"></i> 
        <span>011 6097-0172</span>
      </p>
      <p class="font-medium flex items-center gap-2">
        <i class="fa-solid fa-clock fa-lg text-red-800"></i> 
        <span>Lunes a Viernes de 6:30 AM a 17:30 PM</span>
      </p>
      <p class="font-medium flex items-center gap-2">
        <i class="fa-solid fa-location-dot fa-lg text-red-800"></i> 
        <span>C. 67, Guillermo Enrique Hudson, Bs.As - ARG</span>
      </p>
    </article>
  </section>
</div>
@endsection
