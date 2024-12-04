@extends('layouts.main')

@section('title', 'Editar el producto '.e($product->name))

@section('content')
<?php $quantitiesIds = $product->quantities->pluck('quantity_id')->all() ?>

        <div class="my-10 md:w-4/5 mx-auto ">
            <h2 class="text-3xl font-bold text-center">Editar el producto {{ $product->name }}</h2>

            @if ($errors->any())
                <div class="alert alert-danger">
                    Hay errores en los datos del formulario. Por favor, revisalos y volvé a intentar.
                </div>
            @endif

            <form action="{{ route('products.edit.process', ['id' => $product->product_id]) }}" method="POST" enctype="multipart/form-data" class="my-10 mx-20">
                @method('PUT')
                @csrf
                <div class="grid md:grid-cols-2 gap-4 my-3.5">
                    <div>
                        <label for="name" class="block text-sm font-medium text-gray-700">Título</label>
                        <input 
                            type="text" 
                            class="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                            id="name" 
                            name="name" 
                            value="{{ old('name') ?? $product->name }}"
                        >
                        @error('name')
                                <div class="text-danger">
                                    {{ $message }}
                                </div>
                            @enderror
                    </div>
                    <div>
                        <label for="image" class="block text-sm font-medium text-gray-700">Imagen</label>
                        <input 
                            type="file" 
                            class="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                            id="image" 
                            name="image" 
                            value="{{ old('image') }}" 
                        >
                        @error('image')
                            <div class="text-danger">
                                {{ $message }}
                            </div>
                        @enderror
                    </div>
                </div>
            <div class="grid md:grid-cols-2 gap-4 my-3.5">

            <div>
                    <label for="brand_fk" class="block text-sm font-medium text-gray-700">Marca</label>
                    <select
                        name="brand_fk"
                        id="brand_fk"
                        value="{{ old('brand_fk') ?? $product->brand_fk }}" 
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
                        value="{{ old('category_fk') ?? $product->category_fk }}" 
                        class="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                    >
                        @foreach ($categories as $category)
                            <option value="{{ $category->category_id }}">
                                {{ $category->name }}
                            </option>
                        @endforeach
                    </select>
                </div>

                <fieldset>
                @foreach ($quantities as $quantity)
                <label>
                    <input 
                        type="checkbox" 
                        name="quantity_id[]" 
                        value="{{ $quantity->quantity_id }}"
                        @checked(in_array($quantity->quantity_id, old('quantity_id', $quantitiesIds)))
                    >
                    {{ $quantity->name }}
                </label>
                @endforeach
            </fieldset>

            </div>
            
            <div>
                <label for="description" class="block text-sm font-medium text-gray-700">Descripción</label>
                <textarea 
                    name="description" 
                    class="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                    id="description" 
                >{{ old('description') ?? $product->description }}</textarea>
                @error('description')
                        <div class="text-danger">
                            {{ $message }}
                        </div>
                    @enderror
            </div>

            <div class="col-span-2 flex justify-center mt-4">
            <button type="submit" class="px-6 py-2 bg-red-800 text-white rounded-md hover:bg-red-900 hover:text-white font-semibold">Actualizar</button>
            </div>

            </form>

        </div>



@endsection
