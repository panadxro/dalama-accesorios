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
            ['quantity_id' => 12, 'name' => '50 Metros', 'measure' => 'Metro', 'multiplier' => 50 ],
            ['quantity_id' => 13, 'name' => '100 Metros', 'measure' => 'Metro', 'multiplier' => 100 ],
            ['quantity_id' => 14, 'name' => '150 Metros', 'measure' => 'Metro', 'multiplier' => 150 ],
            ['quantity_id' => 15, 'name' => '220 Metros', 'measure' => 'Metro', 'multiplier' => 220 ],
            ['quantity_id' => 16, 'name' => '300 Metros', 'measure' => 'Metro', 'multiplier' => 300 ],
            ['quantity_id' => 17, 'name' => '1 Kilo', 'measure' => 'Kilo', 'multiplier' => 1 ],
            ['quantity_id' => 18, 'name' => '5 Kilos', 'measure' => 'Kilo', 'multiplier' => 5 ],
            ['quantity_id' => 19, 'name' => '25 Kilos', 'measure' => 'Kilo', 'multiplier' => 25 ],
        ]);
        DB::table('products_have_quantity')->insert([
            ['product_fk' => 1, 'quantity_fk' => 1],
            ['product_fk' => 1, 'quantity_fk' => 2],
            ['product_fk' => 1, 'quantity_fk' => 3],
            ['product_fk' => 2, 'quantity_fk' => 4],
            ['product_fk' => 2, 'quantity_fk' => 5],
        ]);
    }
}
