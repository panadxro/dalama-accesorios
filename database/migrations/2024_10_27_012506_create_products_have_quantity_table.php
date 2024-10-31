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
        Schema::create('products_have_quantity', function (Blueprint $table) {
            $table->foreignId('product_fk')->constrained(table: 'products', column: 'product_id');
            $table->unsignedSmallInteger('quantity_fk');
            $table->foreign('quantity_fk')->references('quantity_id')->on('quantities');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products_have_quantity');
    }
};
