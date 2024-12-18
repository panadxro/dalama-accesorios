<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\Cart;

class AuthController extends Controller
{
    public function registerForm()
    {
        return view('auth.register-form');
    }
    public function registerProcess(Request $request)
    {
        // Validar los datos
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'surname' => 'required|string|max:255',
            'phone_number' => 'required|string|max:10',
            'address' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
            'role' => 'in:user,admin',
        ]);

        // Crear el usuario
        $user = User::create([
            'name' => $validated['name'],
            'surname' => $validated['surname'],
            'phone_number' => $validated['phone_number'],
            'address' => $validated['address'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'] ?? 'user',
        ]);

        // Iniciar sesión automáticamente despues del registro
        auth()->login($user);
        Cart::create(['user_id' => $user->id]);

        return redirect()
            ->route('products.all-products')
            ->with('feedback.message', 'Registro exitoso');
    }
    public function loginForm()
    {
        return view('auth.login-form');
    }

    public function loginProcess(Request $request)
    {
        $credentials = $request->only(['email', 'password']);

        if(!auth()->attempt($credentials)){

            return redirect()
            ->back(fallback: route('auth.login.form'))
            ->withInput()
            ->with('feedback.message', 'las credenciales son incorrectas');
        }

        return redirect()
            ->route('products.all-products')
            ->with('feedback.message', 'inicio de sesion exitoso');

    }

    public function logoutProcess(Request $request)
    {
        auth()->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()
        ->route('auth.login.form')
        ->with('feedback.message', 'Cierre de sesion exitoso');
    }
    public function viewUsersWithCarts()
    {
        // Verifica que el usuario sea admin
        if (auth()->user()->role !== 'admin') {
            abort(403, 'Acceso no autorizado');
        }

        // Obtiene todos los usuarios y sus carritos con productos
        $users = User::with('orders.products')->get();

        return view('admin.users-carts', compact('users'));
    }
}
