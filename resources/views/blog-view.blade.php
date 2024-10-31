@extends('layouts.main')
@section('title', $blog->title)
@section('content')
<div class="py-10">
<h2 class="font-bold text-3xl text-center">{{ $blog->title }}</h2>
<div class="grid grid-cols-1 md:grid-cols-2 mt-10 shadow-sm border-2 rounded-md p-8 mx-20 items-center">
<article class="">
<p class="font-semibold text-red-700 text-lg">{{ $blog->description }}</p>
<p class="text-pretty">{{$blog->content}}</p>
</article>
  <figure>
    <img src="{{ $blog->image }}" alt="{{ $blog->title }}" class="flex justify-center mx-auto h-3/4 rounded-md">
  </figure>
</div>
</div>
@endsection