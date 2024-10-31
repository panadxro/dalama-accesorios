@extends('layouts.main')


@section('title', 'Inicio con blade')


@section('content')

<div>
<div class="relative">
    <figure>
        <video class="w-full h-screen object-cover" autoplay muted loop>
            <source src="/videos/dalama-video_banner.mp4" type="video/mp4">
        </video>
    </figure>
    <div class="absolute inset-0 flex flex-col justify-center items-center bg-black bg-opacity-50 text-white">
        <h1 class="text-4xl md:text-5xl font-bold">Calidad en Accesorios de Carpintería de Aluminio</h1>
        <p class="mt-4 text-lg md:text-xl">Durabilidad, trayectoria y confianza en cada producto</p>
        <a href="/products" class="mt-8 bg-red-800 hover:bg-red-900 text-white py-3 px-6 rounded-lg font-semibold">Explorar productos</a>
    </div>
    </div>
    <section class="flex justify-center items-center gap-8 mx-20 my-20 md:flex-row flex-col">
        <figure class="md:w-1/2 w-full">
            <img class="object-cover rounded" src="/img/dalama-inicio.jpg" alt="Dalama Accesorios">
        </figure>
        <article class="md:w-1/2 w-full">
            <h2 class="font-bold mb-10 text-3xl">Dalama - Accesorios de Carpintería de Aluminio con 30 Años de Trayectoria Familiar</h2>
            <p>En Dalama, ofrecemos soluciones <b>duraderas y de alta calidad</b> para tus proyectos de carpintería de aluminio. Con 30 años de experiencia como empresa familiar, nos comprometemos a brindar productos <b>confiables</b> y un servicio de <b>excelencia</b> que cumple con las necesidades de nuestros clientes en todo el país.</p>
        </article>
    </section>
    <section class="py-20 bg-zinc-100 inner-shadow">
        <h2 class="text-center font-bold text-3xl">Nuestros servicios</h2>
        <div class="grid md:grid-cols-3 gap-20 mt-10 w-full md:w-4/5 grid-cols-1 mx-auto">
            <div>
                <figure>
                    <img src="/img/envio.png" alt="Icono Envios" class="flex items-center mx-auto h-16">
                </figure>
                <article class="text-center mt-5">
                    <h3 class="font-bold text-lg">Entrega inmediata a toda Argentina</h3>
                    <p class="text-sm text-balance mt-2">Garantizamos entregas rápidas y seguras en cualquier punto del país para que no tengas que esperar.</p>
                </article>
            </div>
            <div>
                <figure>
                    <img src="/img/help.png" alt="Icono Asesoramiento" class="flex items-center mx-auto h-16">
                </figure>
                <article class="text-center mt-5">
                    <h3 class="font-bold text-lg">Asesoramiento personalizado</h3>
                    <p class="text-sm text-balance mt-2">Nuestro equipo de expertos está disponible para ofrecerte soluciones adaptadas a tus proyectos, asegurando que obtengas los productos adecuados para cada necesidad.</p>
                </article>
            </div>
            <div>
                <figure>
                    <img src="/img/calidad.png" alt="Icono Calidad" class="flex items-center mx-auto h-16">
                </figure>
                <article class="text-center mt-5">
                    <h3 class="font-bold text-lg">Calidad garantizada</h3>
                    <p class="text-sm text-balance mt-2">Todos nuestros accesorios de carpintería de aluminio cumplen con los más altos estándares de calidad, brindándote durabilidad y confianza en cada compra.</p>
                </article>
            </div>
        </div>
    </section>

<section class="py-20">
    <h2 class="text-center font-bold text-3xl mb-12">Últimas Noticias y Artículos</h2>
    <div class="grid md:grid-cols-2 gap-8 w-4/5 mx-auto">
    @foreach ($blogs->take(2) as $blog)
    <div class="shadow-sm border-2 rounded-md p-4">
            <img src="{{ $blog->image }}" alt="{{ $blog->title }}" class="w-full h-40 object-cover mb-4 rounded">
            <h3 class="font-bold text-xl mb-2">{{ $blog->title }}</h3>
            <p class="text-gray-700 mb-4">{{ $blog->description}}</p>
            <a href="{{ route('blog.view', ['blog_id' => $blog->blog_id]) }}" class="block bg-red-800 hover:bg-red-900 text-white text-center font-semibold py-2 px-4 rounded">Leer más</a>
    </div>
    @endforeach
    </div>
</section>

<section class="bg-zinc-100 py-20 inner-shadow">
    <h2 class="text-center font-bold text-3xl mb-12">Lo que dicen nuestros clientes</h2>
    <div class="grid md:grid-cols-3 gap-8 w-4/5 mx-auto">
        <div class="bg-white p-6 shadow-lg rounded-lg text-center">
            <p class="italic">"Los productos de Dalama son de la mejor calidad que he encontrado. Totalmente recomendados."</p>
            <p class="font-bold text-red-700 mt-4">Juan Pérez</p>
        </div>
        <div class="bg-white p-6 shadow-lg rounded-lg text-center">
            <p class="italic">"Excelente servicio y entrega rápida. Mis proyectos siempre son exitosos con Dalama."</p>
            <p class="font-bold text-red-700 mt-4">Ana Gómez</p>
        </div>
        <div class="bg-white p-6 shadow-lg rounded-lg text-center">
            <p class="italic">"Confiabilidad y durabilidad en todos sus productos. No busco en otro lugar."</p>
            <p class="font-bold text-red-700 mt-4">Carlos Méndez</p>
        </div>
    </div>
</section>

<section class="flex justify-center my-20">
    <div class="shadow-sm border-2 rounded-md p-8 max-w-4xl w-full flex gap-8 items-center">
        <img src="/img/contactanos.png" alt="contactanos" class="w-1/2 h-auto object-cover">
        <div class="flex flex-col justify-center w-1/2">
            <h2 class="text-2xl font-bold mb-4">¡Contáctanos!</h2>
            <p class="text-gray-600 mb-6">
                Si tienes alguna pregunta o necesitas más información sobre nuestros productos, 
                no dudes en enviarnos un mensaje. Estamos aquí para ayudarte.
            </p>
            <a href="/contacto" class="bg-red-800 text-white font-semibold py-2 px-4 rounded hover:bg-red-900 self-start">
                Enviar Mensaje
            </a>
        </div>
    </div>
</section>
</div>

@endsection