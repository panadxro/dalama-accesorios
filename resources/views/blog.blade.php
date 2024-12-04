@extends('layouts.main')


@section('title', 'Novedades')


@section('content')


<section class="min-h-dvh items-center py-20">
  <div class="flex w-full items-center justify-center">
    <h2 class="text-4xl font-bold text-center">Novedades</h2>
  </div>
  <div class="grid md:grid-cols-2 gap-8 w-4/5 mx-auto mt-10">
  @foreach ($blogs as $blog)
    <div class="shadow-sm border-2 rounded-md p-4">
            <img src="{{Storage::url($blog->image)}}" alt="{{ $blog->title }}" class="w-full h-40 object-cover mb-4 rounded">
            <h3 class="font-bold text-xl mb-2">{{ $blog->title }}</h3>
            <p class="text-gray-700 mb-4">{{ $blog->description}}</p>
            <a href="{{ route('blog.view', ['blog_id' => $blog->blog_id]) }}" class="block bg-red-800 hover:bg-red-900 text-white text-center font-semibold py-2 px-4 rounded">Leer más</a>
    </div>
    @endforeach
    </div>
  </div>
</section>

@endsection
