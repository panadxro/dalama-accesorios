<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    public function profile()
    {
        return view('profile.profile');
    }

    public function editForm()
    {
        $user = auth()->user();
        return view('profile.edit-form', compact('user'));
    }

    public function update(Request $request)
    {
        $request->validate([
            'name' => 'string|min:2|max:255',
            'surname' => 'string|min:2|max:255',
            'phone_number' => 'string|max:10',
            'address' => 'string|max:255',
            'email' => 'email|unique:users,email,' . auth()->id(),
            'password' => 'nullable|min:8|confirmed',
        ], [
            'name.min' => 'El nombre del usuario debe tener al menos :min caracteres',
            'surname.min' => 'El apellido del usuario debe tener al menos :min caracteres',
            'phone_number.max' => 'El número de telefono debe contener máximo :max caracteres',
            'email.unique' => 'Este correo electrónico ya está en uso',
            'password.min' => 'La contraseña debe tener al menos :min caracteres',
            'password.confirmed' => 'Las contraseñas no coinciden',
        ]);

        $user = auth()->user();
        $user->update($request->only(['name', 'surname', 'phone_number', 'address', 'email']));

        if ($request->filled('password')) {
            $user->update(['password' => bcrypt($request->password)]);
        }

        return redirect()->route('profile')->with('feedback.message', 'El perfil fue actualizado con exito.');
    }
}
