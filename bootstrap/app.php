<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        
        $middleware->redirectGuestsTo(function(Request $request){
            session()->flash('feedback.message', 'se requiere iniciar sesion');
            // session()->flash('feedback.type', 'danger');
            return route('auth.login.form');
        });

        $middleware->alias([
            'recurrent-user' => \App\Http\Middleware\CheckAgeOver18::class,
            'role' => \App\Http\Middleware\RoleMiddleware::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
