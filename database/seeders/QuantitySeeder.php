<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class QuantitySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('quantities')->insert([
            ['quantity_id' => 1, 'name' => 'Unidad', 'measure' => 'Unidad', 'multiplier' => 1 ],
            ['quantity_id' => 2, 'name' => 'Par', 'measure' => 'Unidad', 'multiplier' => 2 ],
            ['quantity_id' => 3, 'name' => '20 Unidades', 'measure' => 'Unidad', 'multiplier' => 20 ],
            ['quantity_id' => 4, 'name' => '50 Unidades', 'measure' => 'Unidad', 'multiplier' => 50 ],
            ['quantity_id' => 5, 'name' => '100 Unidades', 'measure' => 'Unidad', 'multiplier' => 100 ],
            ['quantity_id' => 6, 'name' => '200 Unidades', 'measure' => 'Unidad', 'multiplier' => 200 ],
            ['quantity_id' => 7, 'name' => '500 Unidades', 'measure' => 'Unidad', 'multiplier' => 500 ],
            ['quantity_id' => 8, 'name' => '1000 Unidades', 'measure' => 'Unidad', 'multiplier' => 1000 ],
            ['quantity_id' => 9, 'name' => '12 Unidades', 'measure' => 'Unidad', 'multiplier' => 12 ],
            ['quantity_id' => 10, 'name' => '15 Unidades', 'measure' => 'Unidad', 'multiplier' => 15 ],
            ['quantity_id' => 11, 'name' => '40 Unidades', 'measure' => 'Unidad', 'multiplier' => 40 ],
            ['quantity_id' => 12, 'name' => '3500 Unidades', 'measure' => 'Unidad', 'multiplier' => 3500 ],
            ['quantity_id' => 13, 'name' => '50 Metros', 'measure' => 'Metro', 'multiplier' => 50 ],
            ['quantity_id' => 14, 'name' => '100 Metros', 'measure' => 'Metro', 'multiplier' => 100 ],
            ['quantity_id' => 15, 'name' => '150 Metros', 'measure' => 'Metro', 'multiplier' => 150 ],
            ['quantity_id' => 16, 'name' => '220 Metros', 'measure' => 'Metro', 'multiplier' => 220 ],
            ['quantity_id' => 17, 'name' => '300 Metros', 'measure' => 'Metro', 'multiplier' => 300 ],
            ['quantity_id' => 18, 'name' => '1 Kilo', 'measure' => 'Kilo', 'multiplier' => 1 ],
            ['quantity_id' => 19, 'name' => '5 Kilos', 'measure' => 'Kilo', 'multiplier' => 5 ],
            ['quantity_id' => 20, 'name' => '25 Kilos', 'measure' => 'Kilo', 'multiplier' => 25 ],
            ['quantity_id' => 21, 'name' => '10 Unidades', 'measure' => 'Unidad', 'multiplier' => 10 ],
            ['quantity_id' => 22, 'name' => '350 Unidades', 'measure' => 'Unidad', 'multiplier' => 350 ],
        ]);
        DB::table('products_have_quantity')->insert([
            ['product_fk' => 1, 'quantity_fk' => 1],
            ['product_fk' => 1, 'quantity_fk' => 2],
            ['product_fk' => 1, 'quantity_fk' => 3],
            ['product_fk' => 2, 'quantity_fk' => 4],
            ['product_fk' => 2, 'quantity_fk' => 5],
            ['product_fk' => 3, 'quantity_fk' => 5],
            ['product_fk' => 4, 'quantity_fk' => 5],
            ['product_fk' => 5, 'quantity_fk' => 5],
            ['product_fk' => 6, 'quantity_fk' => 2],
            ['product_fk' => 7, 'quantity_fk' => 2],
            ['product_fk' => 8, 'quantity_fk' => 3],
            ['product_fk' => 9, 'quantity_fk' => 5],
            ['product_fk' => 10, 'quantity_fk' => 5],
            ['product_fk' => 10, 'quantity_fk' => 12],
            ['product_fk' => 11, 'quantity_fk' => 14],
            ['product_fk' => 12, 'quantity_fk' => 13],
            ['product_fk' => 13, 'quantity_fk' => 14],
            ['product_fk' => 14, 'quantity_fk' => 1],
            ['product_fk' => 15, 'quantity_fk' => 1],
            ['product_fk' => 16, 'quantity_fk' => 3],
            ['product_fk' => 17, 'quantity_fk' => 3],
            ['product_fk' => 18, 'quantity_fk' => 9],
            ['product_fk' => 19, 'quantity_fk' => 3],
            ['product_fk' => 20, 'quantity_fk' => 1],
            ['product_fk' => 21, 'quantity_fk' => 21],
            ['product_fk' => 22, 'quantity_fk' => 14],
            ['product_fk' => 23, 'quantity_fk' => 5],
            ['product_fk' => 24, 'quantity_fk' => 22],
            ['product_fk' => 25, 'quantity_fk' => 9],
            ['product_fk' => 26, 'quantity_fk' => 1],
            ['product_fk' => 27, 'quantity_fk' => 1],
            ['product_fk' => 28, 'quantity_fk' => 2],
            ['product_fk' => 29, 'quantity_fk' => 1],
            ['product_fk' => 30, 'quantity_fk' => 1],
            ['product_fk' => 31, 'quantity_fk' => 1],
            ['product_fk' => 32, 'quantity_fk' => 8],
            ['product_fk' => 33, 'quantity_fk' => 11],
            ['product_fk' => 34, 'quantity_fk' => 5],
            ['product_fk' => 35, 'quantity_fk' => 1],
            ['product_fk' => 35, 'quantity_fk' => 9],
            ['product_fk' => 36, 'quantity_fk' => 1],
            ['product_fk' => 37, 'quantity_fk' => 1],
            ['product_fk' => 38, 'quantity_fk' => 1],
            ['product_fk' => 39, 'quantity_fk' => 5],
            ['product_fk' => 40, 'quantity_fk' => 5],
            ['product_fk' => 41, 'quantity_fk' => 3],
            ['product_fk' => 42, 'quantity_fk' => 1],
            ['product_fk' => 43, 'quantity_fk' => 1],
            ['product_fk' => 44, 'quantity_fk' => 5],
            ['product_fk' => 45, 'quantity_fk' => 1],
            ['product_fk' => 46, 'quantity_fk' => 14],
            ['product_fk' => 47, 'quantity_fk' => 1],
            ['product_fk' => 48, 'quantity_fk' => 1],
            ['product_fk' => 48, 'quantity_fk' => 3],
            ['product_fk' => 49, 'quantity_fk' => 5],
            ['product_fk' => 50, 'quantity_fk' => 5],
        ]);
    }
}
