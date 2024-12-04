<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Cart;
use App\Models\User;

class CartSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Obtener los usuarios
        $users = User::all();

        // Crear un carrito para cada usuario
        foreach ($users as $user) {
            $cart = Cart::create([
                'user_id' => $user->id,
            ]);
        }
    }
}
