<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class BrandSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('brands')->insert([
            [
                'brand_id' => 1,
                'name' => 'Axal',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'brand_id' => 2,
                'name' => 'Sunshine',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'brand_id' => 3,
                'name' => 'ECO',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'brand_id' => 4,
                'name' => 'Chamical',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'brand_id' => 5,
                'name' => 'FLX',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'brand_id' => 6,
                'name' => 'Fumaca',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'brand_id' => 7,
                'name' => 'Giesse',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'brand_id' => 8,
                'name' => 'Bronzen',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'brand_id' => 9,
                'name' => 'Roto',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'brand_id' => 10,
                'name' => 'QBO',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'brand_id' => 11,
                'name' => '-',
                'created_at' => now(),
                'updated_at' => now()
            ]
        ]);
    }
}
