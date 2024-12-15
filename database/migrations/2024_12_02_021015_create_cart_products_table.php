<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
/*         Schema::create('products', function (Blueprint $table) {
            $table->unsignedTinyInteger('cart_fk');
            $table->foreign('cart_fk')->references('cart_id')->on('carts')->onDelete('cascade');
            $table->integer('amount')->default(1);
            $table->timestamps();
        }); */
        Schema::create('cart_products', function (Blueprint $table) {
            $table->id(); // Clave primaria
            $table->unsignedBigInteger('cart_id'); // Clave foránea al carrito
            $table->unsignedBigInteger('product_id'); // Clave foránea al producto
            $table->integer('amount')->default(1); // Cantidad del producto en el carrito
            $table->decimal('price', 10, 2)->default(0); // Precio del producto
            $table->integer('multiplier'); // Agrega el campo multiplier
            $table->unsignedSmallInteger('quantity_id')->nullable();
            $table->timestamps();

            // Relaciones
            $table->foreign('cart_id')->references('id')->on('carts')->onDelete('cascade');
            $table->foreign('product_id')->references('product_id')->on('products')->onDelete('cascade');
            $table->foreign('quantity_id')->references('quantity_id')->on('quantities')->onDelete('cascade');
        });
    }
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cart_products');
    }
};
