<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('categories')->insert([
            [
                'category_id' => 1,
                'name' => 'Cerraduras',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'category_id' => 2,
                'name' => 'Burletes',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'category_id' => 3,
                'name' => 'Rodamientos',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'category_id' => 4,
                'name' => 'Bisagras',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'category_id' => 5,
                'name' => 'Picaportes',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'category_id' => 6,
                'name' => 'Escuadras',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'category_id' => 7,
                'name' => 'Cierres',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'category_id' => 8,
                'name' => 'Pasadores',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'category_id' => 9,
                'name' => 'Fallebas',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'category_id' => 10,
                'name' => 'Oscilo',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'category_id' => 11,
                'name' => 'Felpas',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'category_id' => 12,
                'name' => 'Plasticos',
                'created_at' => now(),
                'updated_at' => now()
            ],            
            [
                'category_id' => 13,
                'name' => 'Selladores',
                'created_at' => now(),
                'updated_at' => now()
            ],            
            [
                'category_id' => 14,
                'name' => 'Tornillos',
                'created_at' => now(),
                'updated_at' => now()
            ],
        ]);
    }
}
