<?php

use Illuminate\Support\Facades\Route;

Route::get('/', [App\Http\Controllers\HomeController::class, "home"])
    ->name('home');
Route::get('/products', [App\Http\Controllers\ProductsController::class, "index"])
    ->name('products.all-products');
Route::get('/products/administrar', [App\Http\Controllers\ProductsController::class, "administrar"])
    ->name('products.administracion');
Route::get('/novedades', [App\Http\Controllers\HomeController::class, "blog"])
    ->name('blog');
Route::get('/contacto', [App\Http\Controllers\HomeController::class, "contact"])
    ->name('contact');
Route::get('/products/{product_id}', [App\Http\Controllers\ProductsController::class, "view"])
    ->name('products.view')
    ->whereNumber('product_id');
Route::get('/novedades/{blog_id}', [App\Http\Controllers\HomeController::class, "blogView"])
    ->name('blog.view')
    ->whereNumber('blog_id');
    
Route::get('/products/publicar', [App\Http\Controllers\ProductsController::class, "createForm"])
    ->name('product.create.form')
    ->middleware('auth');
Route::post('/products/publicar', [App\Http\Controllers\ProductsController::class, "createProcess"])
    ->name('product.create.process')
    ->middleware('auth');

Route::get('products/{id}/editar', [App\Http\Controllers\ProductsController::class, "editForm"])
    ->name('products.edit.form')
    ->whereNumber('id')
    ->middleware('auth');
Route::put('products/{id}/editar', [App\Http\Controllers\ProductsController::class, "editProcess"])
    ->name('products.edit.process')
    ->whereNumber('id')
    ->middleware('auth');

Route::delete('products/{id}/eliminar', [App\Http\Controllers\ProductsController::class, "deleteProcess"])
    ->name('products.delete.process')
    ->whereNumber('id')
    ->middleware('auth');

Route::get('/login', [\App\Http\Controllers\AuthController::class, "loginForm"])
    ->name('auth.login.form');

Route::post('/login', [\App\Http\Controllers\AuthController::class, "loginProcess"])
    ->name('auth.login.process');

Route::post('/logout', [\App\Http\Controllers\AuthController::class, "logoutProcess"])
    ->name('auth.logout.process');
