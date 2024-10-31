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
            ['quantity_id' => 1, 'name' => 'Unidad', 'created_at' => now(), 'updated_at' => now()],
            ['quantity_id' => 2, 'name' => 'Par', 'created_at' => now(), 'updated_at' => now()],
            ['quantity_id' => 3, 'name' => '20 Unidades', 'created_at' => now(), 'updated_at' => now()],
            ['quantity_id' => 4, 'name' => '50 Unidades', 'created_at' => now(), 'updated_at' => now()],
            ['quantity_id' => 5, 'name' => '100 Unidades', 'created_at' => now(), 'updated_at' => now()],
            ['quantity_id' => 6, 'name' => '200 Unidades', 'created_at' => now(), 'updated_at' => now()],
            ['quantity_id' => 7, 'name' => '500 Unidades', 'created_at' => now(), 'updated_at' => now()],
            ['quantity_id' => 8, 'name' => '1000 Unidades', 'created_at' => now(), 'updated_at' => now()],
            ['quantity_id' => 9, 'name' => '12 Unidades', 'created_at' => now(), 'updated_at' => now()],
            ['quantity_id' => 10, 'name' => '15 Unidades', 'created_at' => now(), 'updated_at' => now()],
            ['quantity_id' => 11, 'name' => '40 Unidades', 'created_at' => now(), 'updated_at' => now()],
            ['quantity_id' => 12, 'name' => '100 Metros', 'created_at' => now(), 'updated_at' => now()],
            ['quantity_id' => 13, 'name' => '150 Metros', 'created_at' => now(), 'updated_at' => now()],
            ['quantity_id' => 14, 'name' => '220 Metros', 'created_at' => now(), 'updated_at' => now()],
            ['quantity_id' => 15, 'name' => '300 Metros', 'created_at' => now(), 'updated_at' => now()],
            ['quantity_id' => 16, 'name' => '1 Kilo', 'created_at' => now(), 'updated_at' => now()],
            ['quantity_id' => 17, 'name' => '5 Kilos', 'created_at' => now(), 'updated_at' => now()],
            ['quantity_id' => 18, 'name' => '25 Kilos', 'created_at' => now(), 'updated_at' => now()],
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
