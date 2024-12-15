<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::create([
            'name' => 'Sofía',
            'surname' => 'Lorenzo',
            'email' => 'sofia.lorenzo@davinci.edu.ar',
            'password' => Hash::make('contraseña'),
            'phone_number' => '1145555666',
            'address' => 'Boedo 125',
        ]);
        User::create([
            'name' => 'Lucas',
            'surname' => 'Panadero',
            'email' => 'lucas@gmail.com',
            'password' => Hash::make('contraseña'),
            'phone_number' => '1146666777',
            'address' => 'Avenida Corrientes 1436',
        ]);

        User::create([
            'name' => 'Carlos',
            'surname' => 'Ferrer',
            'email' => 'carlos@gmail.com',
            'password' => Hash::make('contraseña'),
            'phone_number' => '1147777888',
            'address' => 'Rivadavia 750',
        ]);
    }
}
