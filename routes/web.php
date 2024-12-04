<?php

use Illuminate\Support\Facades\Route;

Route::get('/', [App\Http\Controllers\HomeController::class, "home"])
    ->name('home');
Route::get('/products', [App\Http\Controllers\ProductsController::class, "index"])
    ->name('products.all-products');
Route::get('/novedades', [App\Http\Controllers\HomeController::class, "blog"])
    ->name('blog');
Route::get('/contacto', [App\Http\Controllers\HomeController::class, "contact"])
    ->name('contact');
Route::get('/products/{product_id}', [App\Http\Controllers\ProductsController::class, "view"])
    ->name('products.view')
    ->middleware(\App\Http\Middleware\CheckRecurrentUser::class)
    ->whereNumber('product_id');
Route::get('/novedades/{blog_id}', [App\Http\Controllers\HomeController::class, "blogView"])
    ->name('blog.view')
    ->whereNumber('blog_id');
    
// Rutas de autenticación
Route::get('/register', [\App\Http\Controllers\AuthController::class, "registerForm"])
    ->name('auth.register.form');
Route::post('/register', [\App\Http\Controllers\AuthController::class, "registerProcess"])
    ->name('auth.register.process');
Route::get('/login', [\App\Http\Controllers\AuthController::class, "loginForm"])
    ->name('auth.login.form');
Route::post('/login', [\App\Http\Controllers\AuthController::class, "loginProcess"])
    ->name('auth.login.process');
Route::post('/logout', [\App\Http\Controllers\AuthController::class, "logoutProcess"])
    ->name('auth.logout.process');



// Rutas protegidas por autenticación y roles
Route::middleware(['auth'])->group(function () {
    // Rutas de reservas
    Route::post('/products/{id}/reservation', [\App\Http\Controllers\ProductsReservationController::class, "reservationProcess"])
        ->name('products.reservation.process');
    Route::get('/tests/emails/reservation-product', [\App\Http\Controllers\ProductsReservationController::class, "printEmail"])
        ->name('products.reservation.test');

    Route::post('/cart/add/{product_id}', [\App\Http\Controllers\CartController::class, "addToCart"])
        ->name('cart.add');
    Route::get('/cart', [\App\Http\Controllers\CartController::class, "viewCart"])
        ->name('cart.view');
    Route::delete('/cart/remove/{cart_product_id}', [\App\Http\Controllers\CartController::class, "removeFromCart"])
        ->name('cart.remove');
    
    Route::middleware(['role:admin'])->group(function () {
/*         Route::get('/admin', function () {
            return 'Área de administradores';
        })->name('admin.dashboard'); */
        Route::get('/products/admin', [App\Http\Controllers\ProductsController::class, "administrar"])
            ->name('products.administracion');
        Route::get('/products/publicar', [App\Http\Controllers\ProductsController::class, "createForm"])
            ->name('product.create.form');
        Route::post('/products/publicar', [App\Http\Controllers\ProductsController::class, "createProcess"])
            ->name('product.create.process');
        Route::get('products/{id}/editar', [App\Http\Controllers\ProductsController::class, "editForm"])
            ->name('products.edit.form')
            ->whereNumber('id');
        Route::put('products/{id}/editar', [App\Http\Controllers\ProductsController::class, "editProcess"])
            ->name('products.edit.process')
            ->whereNumber('id');
        Route::delete('products/{id}/eliminar', [App\Http\Controllers\ProductsController::class, "deleteProcess"])
            ->name('products.delete.process')
            ->whereNumber('id');
        Route::get('/carts/admin', [App\Http\Controllers\AuthController::class, "viewUsersWithCarts"])
            ->name('admin.users-carts');
    });

    Route::middleware(['role:user'])->group(function () {
        Route::get('/dashboard', function () {
            return 'Área de usuarios comunes';
        })->name('user.dashboard');

        // Rutas de pago
        Route::get('test/mercadopago', [\App\Http\Controllers\MercadoPagoController::class, 'show'])
        ->name('test.mercadopago.show');
        // Route::get('test/mercadopago/v2', [\App\Http\Controllers\MercadoPagoController::class, 'showV2'])
        //     ->name('test.mercadopago.show.v2');
        Route::get('test/mercadopago/success', [\App\Http\Controllers\MercadoPagoController::class, 'successProcess'])
        ->name('test.mercadopago.successProcess');
        Route::get('test/mercadopago/pending', [\App\Http\Controllers\MercadoPagoController::class, 'pendingProcess'])
        ->name('test.mercadopago.pendingProcess');
        Route::get('test/mercadopago/failure', [\App\Http\Controllers\MercadoPagoController::class, 'failureProcess'])
        ->name('test.mercadopago.failureProcess');
    });
});