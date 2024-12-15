<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Product;
use App\Models\Blog;

use App\Models\Quantity;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();
        // $json = File::get("database/data/productos.json");
        // $data = json_decode($json);
        // foreach ($data as $obj) {
        //     Product::create([
        //         'name' => $obj->nombre,
        //         'image' => $obj->imagen,
        //         'description' => $obj->descripcion,
        //         'brand' => $obj->marca,
        //         'category' => $obj->categoria
        //     ]);
        // }
        // User::factory()->create([
        //     'name' => 'Test User',
        //     'email' => 'test@example.com',
        // ]);
        $this->call([
            BrandSeeder::class,
            CategorySeeder::class,
            ProductSeeder::class,
            QuantitySeeder::class,
            BlogSeeder::class,
            CartSeeder::class,
            UserSeeder::class
        ]);

        // $jsonBlog = File::get("database/data/blog.json");
        // $dataBlog = json_decode($jsonBlog);
        // foreach ($dataBlog as $objBlog) {
        //     Blog::create([
        //         'title' => $objBlog->titulo,
        //         'image' => $objBlog->imagen,
        //         'description' => $objBlog->descripcion,
        //         'content'=> $objBlog->contenido
        //     ]);
        // }
    }
}
