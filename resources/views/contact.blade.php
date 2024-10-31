@extends('layouts.main')


@section('title', 'Contacto')


@section('content')
<div class="py-20">
<section class="">
    <h2 class="text-4xl font-bold text-center">Contactanos</h2>
    <div class="mx-20">
        <form action="#" method="POST" class="my-10 mx-20">
            <div class="grid md:grid-cols-2 gap-4 my-3.5">
                <div>
                    <label for="name" class="block text-sm font-medium text-gray-700">Nombre completo</label>
                    <input type="text" placeholder="Gustavo Torres" class="mt-1 block w-full p-2 border border-gray-300 rounded-md">
                </div>
                <div>
                    <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
                    <input type="email" placeholder="gustavo@gmail.com" class="mt-1 block w-full p-2 border border-gray-300 rounded-md">
                </div>
            </div>
            <textarea placeholder="Mensaje" class="mt-1 block w-full p-2 border border-gray-300 rounded-md"></textarea>
            
            <div class="flex justify-center">
                <button class="mt-6 px-6 py-2 bg-red-800 text-white rounded-md hover:bg-red-900 hover:text-white font-semibold">
                    Enviar mensaje
                </button>
            </div>
        </form>
    </div>
</section>

<section class="grid md:grid-cols-2 gap-8 my-10 mx-40 mt-20 shadow-sm border-2 rounded-md p-8">
<div class="w-full">
        <iframe src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d13105.857105308298!2d-58.1444975!3d-34.7942596!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95a32d4325af24a7%3A0x8b6b12efb36ffe10!2sDALAMA%20ACCESORIOS!5e0!3m2!1ses!2sar!4v1727539180220!5m2!1ses!2sar" width="100%" height="320" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade" class="rounded-md"></iframe>
    </div>
    <article class="flex justify-center items-start ml-5 flex-col gap-4 my-10">
            <p class="font-medium"><i class="fa-solid fa-at fa-lg" style="color: #b91c1c;"></i> dalamaaccesorios@gmail.com</p>
            <p class="font-medium"><i class="fa-solid fa-phone fa-lg" style="color: #b91c1c;"></i> 011 6097-0172</p>
            <p class="font-medium"><i class="fa-solid fa-clock fa-lg" style="color: #b91c1c;"></i> Lunes a Viernes de 6:30 AM a 17:30 PM.</p>
            <p class="font-medium"><i class="fa-solid fa-location-dot fa-lg" style="color: #b91c1c;"></i>  C. 67, Guillermo Enrique Hudson, Bs.As - ARG</p>
        </article>
</section>
</div>

@endsection