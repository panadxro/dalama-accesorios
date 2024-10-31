@extends('layouts.main')

@section('title', 'Publicar Producto')

@section('content')

<div class="my-10 md:w-4/5 mx-auto ">
    <h2 class="text-3xl font-bold text-center">Publicar un nuevo producto</h2>
    @if ($errors->any())
                <div class="bg-red-100 text-red-600 p-3 rounded mb-6">
                    hay errores en los datos del formulario. Por favor, revisalos y volvé a intentar.
                </div>
            @endif
        <form action="{{ route('product.create.process') }}" method="POST" enctype="multipart/form-data" class="my-10 mx-20">
            @csrf
            <div class="grid md:grid-cols-2 gap-4 my-3.5">
                <div>
                    <label for="name" class="block text-sm font-medium text-gray-700">Título</label>
                    <input type="text" id="name" name="name" value="{{ old('name') }}" class="mt-1 block w-full p-2 border border-gray-300 rounded-md">
                    @error('name')
                            <div class="text-danger">
                                {{ $message }}
                            </div>
                        @enderror
                </div>
                <div>
                    <label for="image" class="block text-sm font-medium text-gray-700">Imagen</label>
                    <input type="file" id="image" name="image" value="{{ old('image') }}" class="mt-1 block w-full p-2 border border-gray-300 rounded-md">
                    @error('image')
                        <div class="text-danger">
                            {{ $message }}
                        </div>
                    @enderror
                </div>

                <!-- <div>
                    <label for="image_description" class="block text-sm font-medium text-gray-700">Descripción de imagen</label>
                    <input type="text" id="image_description" name="image_description" value="{{ old('image_description') }}" class="mt-1 block w-full p-2 border border-gray-300 rounded-md">
                    @error('image_description')
                        <div class="text-danger">
                            {{ $message }}
                        </div>
                    @enderror
                </div> -->

            </div>
            <div class="grid md:grid-cols-2 gap-4 my-3.5">
            <div>
                    <label for="brand_fk" class="block text-sm font-medium text-gray-700">Marca</label>
                    <select
                        name="brand_fk"
                        id="brand_fk"
                        class="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                    >
                        @foreach ($brands as $brand)
                            <option value="{{ $brand->brand_id }}">
                                {{ $brand->name }}
                            </option>
                        @endforeach
                    </select>
                </div>

            <div>
                    <label for="category_fk" class="block text-sm font-medium text-gray-700">Categoria</label>
                    <select
                        name="category_fk"
                        id="category_fk"
                        class="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                    >
                        @foreach ($categories as $category)
                            <option value="{{ $category->category_id }}">
                                {{ $category->name }}
                            </option>
                        @endforeach
                    </select>
                </div>

            </div>
            <fieldset>
                @foreach ($quantities as $quantity)
                <label>
                    <input 
                        type="checkbox" 
                        name="quantity_id[]" 
                        value="{{ $quantity->quantity_id }}"
                        @checked(in_array($quantity->quantity_id, old('quantity_id', [])))
                    >
                    {{ $quantity->name }}
                </label>
                @endforeach
            </fieldset>
            <div>
                <label for="description" class="block text-sm font-medium text-gray-700">Descripción</label>
                <textarea name="description" id="description" class="mt-1 block w-full p-2 border border-gray-300 rounded-md"></textarea>
                @error('description')
                        <div class="text-danger">
                            {{ $message }}
                        </div>
                    @enderror
            </div>

            <div class="col-span-2 flex justify-center mt-4">
            <button type="submit" class="px-6 py-2 bg-red-800 text-white rounded-md hover:bg-red-900 hover:text-white font-semibold">Publicar</button>
            </div>
        </form>
</div>
@endsection