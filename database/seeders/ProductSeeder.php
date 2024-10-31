<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\Product;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
         DB::table('products')->insert([
            [
                "product_id"=> 1,
                "name"=> "4 MM ESCUADRA MOSQ FIJO",
                "image"=> "/img/products/",
                "description"=> "Escuadra Mosquitero Fijo, presentación de 100 unidades.",
                "brand_fk"=> 11,
                "category_fk"=> 6
            ],
            [
                "product_id"=> 2,
                "name"=> "7MM AXAL ESC MOSQ MEDIANITO",
                "image"=> "/img/products/",
                "description"=> "Escuadra Mosquitero Medianito Axial, presentación de 500 unidades.",
                "brand_fk"=> 1,
                "category_fk"=> 6
            ],
            [
                "product_id"=> 3,
                "name"=> "AA003 ESC MARCO ROT",
                "image"=> "/img/products/",
                "description"=> "Escuadra Marco Rotonda, presentación de 100 unidades.",
                "brand_fk"=> 11,
                "category_fk"=> 6
            ],
            [
                "product_id"=> 4,
                "name"=> "AA202 GUIA CORR ROTOND",
                "image"=> "/img/products/",
                "description"=> "Guía Corredera Rotonda, presentación de 100 unidades.",
                "brand_fk"=> 11,
                "category_fk"=> 6
            ],
            [
                "product_id"=> 5,
                "name"=> "AA210 TOPE LAT ROTONDA",
                "image"=> "/img/products/",
                "description"=> "Tope Lateral Rotonda, presentación de 100 unidades.",
                "brand_fk"=> 11,
                "category_fk"=> 11
            ],
            [
                "product_id"=> 6,
                "name"=> "AIR ALUM 5 ALETAS PESADO",
                "image"=> "/img/products/",
                "description"=> "Aireador de Aluminio con 5 aletas, versión pesada, se vende por par.",
                "brand_fk"=> 11,
                "category_fk"=> 12
            ],
            [
                "product_id"=> 7,
                "name"=> "AIR PLASTICO 3 ALETAS",
                "image"=> "/img/products/",
                "description"=> "Aireador de Plástico con 3 aletas, se vende por par.",
                "brand_fk"=> 11,
                "category_fk"=> 12
            ],
            [
                "product_id"=> 8,
                "name"=> "ALDABA AXAL DUOMO K BC",
                "image"=> "/img/products/",
                "description"=> "Aldaba Axal Duomo K Blanca, presentación de 20 unidades.",
                "brand_fk"=> 1,
                "category_fk"=> 5
            ],
            [
                "product_id"=> 9,
                "name"=> "ALDABA PLASTICA",
                "image"=> "/img/products/",
                "description"=> "Aldaba Plástica Económica sin tornillos, presentación de 100 unidades",
                "brand_fk"=> 11,
                "category_fk"=> 5
            ],
            [
                "product_id"=> 10,
                "name"=> "ANTIRRUIDO Nro. 2",
                "image"=> "/img/products/",
                "description"=> "Antirruido Nro. 2, presentación de 100 unidades.",
                "brand_fk"=> 11,
                "category_fk"=> 11
            ],
            [
                "product_id"=> 11,
                "name"=> "B29 2MM BUR A30",
                "image"=> "/img/products/",
                "description"=> "Burlete A30 de 2mm, presentación de 100 metros.",
                "brand_fk"=> 11,
                "category_fk"=> 2
            ],
            [
                "product_id"=> 12,
                "name"=> "B48 CUÑA CHICA",
                "image"=> "/img/products/",
                "description"=> "Cuña Chica, presentación de 50 metros.",
                "brand_fk"=> 11,
                "category_fk"=> 14
            ],
            [
                "product_id"=> 13,
                "name"=> "B67 BTE HERM DOBLE PVC",
                "image"=> "/img/products/",
                "description"=> "Burlete Hermético Doble de PVC, presentación de 100 metros.",
                "brand_fk"=> 11,
                "category_fk"=> 2
            ],
            [
                "product_id"=> 14,
                "name"=> "CERRADURA BASE",
                "image"=> "/img/products/",
                "description"=> "Cerradura base, presentación individual.",
                "brand_fk"=> 11,
                "category_fk"=> 1
            ],
            [
                "product_id"=> 15,
                "name"=> "CIERRE APPLY ECO CON LLAVE",
                "image"=> "/img/products/",
                "description"=> "Cierre Apply con llave, versión eco.",
                "brand_fk"=> 11,
                "category_fk"=> 1
            ],
            [
                "product_id"=> 16,
                "name"=> "CIERRE AXAL MILEN MOD AUT NG",
                "image"=> "/img/products/",
                "description"=> "Cierre Axal Milenio, modelo automático, negro.",
                "brand_fk"=> 1,
                "category_fk"=> 1
            ],
            [
                "product_id"=> 17,
                "name"=> "CIERRE VENUS AXAL BLANCO",
                "image"=> "/img/products/",
                "description"=> "Cierre Venus Axal, blanco, presentación de 20 unidades.",
                "brand_fk"=> 1,
                "category_fk"=> 1
            ],
            [
                "product_id"=> 18,
                "name"=> "CIERR IMP SUPREM MODC/KIT",
                "image"=> "/img/products/",
                "description"=> "Cierre Impermeable Supremo con kit, presentación de 20 unidades.",
                "brand_fk"=> 11,
                "category_fk"=> 1
            ],
            [
                "product_id"=> 19,
                "name"=> "CIERR VENUS AXAL NEGRO",
                "image"=> "/img/products/",
                "description"=> "Cierre Venus Axal, negro, presentación de 20 unidades.",
                "brand_fk"=> 1,
                "category_fk"=> 1
            ],
            [
                "product_id"=> 20,
                "name"=> "CP20 AXAL ALDABA BCA DER.",
                "image"=> "/img/products/",
                "description"=> "Aldaba blanca derecha, marca Axal.",
                "brand_fk"=> 11,
                "category_fk"=> 5
            ],
            [
                "product_id"=> 21,
                "name"=> "CP5 ECO ALDABA NEGRA",
                "image"=> "/img/products/",
                "description"=> "Aldaba negra eco, presentación de 10 unidades.",
                "brand_fk"=> 3,
                "category_fk"=> 5
            ],
            [
                "product_id"=> 22,
                "name"=> "CUÑA STANDAR",
                "image"=> "/img/products/",
                "description"=> "Cuña estándar, presentación de 100 metros.",
                "brand_fk"=> 11,
                "category_fk"=> 14
            ],
            [
                "product_id"=> 23,
                "name"=> "ESC P/MARCO 38MM",
                "image"=> "/img/products/",
                "description"=> "Escuadra para marco de 38mm, presentación de 50 unidades.",
                "brand_fk"=> 11,
                "category_fk"=> 6
            ],
            [
                "product_id"=> 24,
                "name"=> "ESC.PARTE A STANDARD 80 MM",
                "image"=> "/img/products/",
                "description"=> "Escuadra parte A estándar de 80mm, presentación de 350 unidades.",
                "brand_fk"=> 11,
                "category_fk"=> 6
            ],
            [
                "product_id"=> 25,
                "name"=> "H14 AXAL BANDEROLA",
                "image"=> "/img/products/",
                "description"=> "Banderola Axal, color blanco.",
                "brand_fk"=> 1,
                "category_fk"=> 4
            ],
            [
                "product_id"=> 26,
                "name"=> "H42 PASD SUNSHINE 28CM",
                "image"=> "/img/products/",
                "description"=> "Pasador Sunshine de 28cm.",
                "brand_fk"=> 2,
                "category_fk"=> 8
            ],
            [
                "product_id"=> 27,
                "name"=> "H53 BRAZO SUNSHINE LG",
                "image"=> "/img/products/",
                "description"=> "Brazo largo marca Sunshine.",
                "brand_fk"=> 2,
                "category_fk"=> 7
            ],
            [
                "product_id"=> 28,
                "name"=> "H53 ECO BRAZO 250 MM",
                "image"=> "/img/products/",
                "description"=> "Brazo eco de 250mm, presentación por par.",
                "brand_fk"=> 3,
                "category_fk"=> 7
            ],
            [
                "product_id"=> 29,
                "name"=> "KIT COMP. FALLEBA",
                "image"=> "/img/products/",
                "description"=> "Kit completo de falleba.",
                "brand_fk"=> 11,
                "category_fk"=> 9
            ],
            [
                "product_id"=> 30,
                "name"=> "LLAVE ALLEN T 4",
                "image"=> "/img/products/",
                "description"=> "Llave Allen T de 4mm.",
                "brand_fk"=> 11,
                "category_fk"=> 14
            ],
            [
                "product_id"=> 31,
                "name"=> "MAN CH BIPT SUNSHINE BC",
                "image"=> "/img/products/",
                "description"=> "Manija chica bipt Sunshine, color blanco.",
                "brand_fk"=> 2,
                "category_fk"=> 5
            ],
            [
                "product_id"=> 32,
                "name"=> "PAN FRAM MECHA ECO 7X7",
                "image"=> "/img/products/",
                "description"=> "Pan framing mecha, eco 7x7, presentación de 1000 unidades.",
                "brand_fk"=> 3,
                "category_fk"=> 14
            ],
            [
                "product_id"=> 33,
                "name"=> "BISAGRA NYLON 60MM NEGRA",
                "image"=> "/img/products/",
                "description"=> "Bisagra de nylon de 60mm, color negro, presentación de 100 unidades.",
                    "brand_fk"=> 11,
                "category_fk"=> 4
            ],
            [
                "product_id"=> 34,
                "name"=> "BISAGRA ESTRIADA P/HOJA",
                "image"=> "/img/products/",
                "description"=> "Bisagra estriada para hoja, presentación de 100 unidades.",
                    "brand_fk"=> 11,
                "category_fk"=> 4
            ],
            [
                "product_id"=> 35,
                "name"=> "CIERRE SUPREM MILEN NG",
                "image"=> "/img/products/",
                "description"=> "Cierre Supreme Milenio negro, presentación individual.",

                "brand_fk"=> 11,
                "category_fk"=> 7
            ],
            [
                "product_id"=> 36,
                "name"=> "CERRADURA P/MOSQUITEROS",
                "image"=> "/img/products/",
                "description"=> "Cerradura para mosquiteros, presentación individual.",
                    "brand_fk"=> 11,
                "category_fk"=> 1
            ],
            [
                "product_id"=> 37,
                "name"=> "BRAZO RALLENTY H53 NG",
                "image"=> "/img/products/",
                "description"=> "Brazo Rallenty, código H53, color negro.",
                    "brand_fk"=> 2,
                "category_fk"=> 7
            ],
            [
                "product_id"=> 38,
                "name"=> "CERRADERO SUP 91X40 ZN",
                "image"=> "/img/products/",
                "description"=> "Cerradero superior de 91x40mm, presentación individual.",
                    "brand_fk"=> 11,
                "category_fk"=> 1
            ],
            [
                "product_id"=> 39,
                "name"=> "ESQUINERO ALUM BLANCO",
                "image"=> "/img/products/",
                "description"=> "Esquinero de aluminio blanco, presentación de 50 unidades.",

                "brand_fk"=> 11,
                "category_fk"=> 6
            ],
            [
                "product_id"=> 40,
                "name"=> "ESC.MED.P/MARCO 50MM",
                "image"=> "/img/products/",
                "description"=> "Escuadra media para marco de 50mm, presentación de 50 unidades.",

                "brand_fk"=> 11,
                "category_fk"=> 6
            ],
            [
                "product_id"=> 41,
                "name"=> "GUARNICION PVC MEDIANA",
                "image"=> "/img/products/",
                "description"=> "Guarnición de PVC mediana, presentación de 100 metros.",
                "brand_fk"=> 11,
                "category_fk"=> 12
            ],
            [
                "product_id"=> 42,
                "name"=> "BISAGRA 3 ALA AXAL NG",
                "image"=> "/img/products/",
                "description"=> "Bisagra de 3 alas marca Axal, color negro, presentación de 50 unidades.",
                "brand_fk"=> 1,
                "category_fk"=> 4
            ],
            [
                "product_id"=> 43,
                "name"=> "CIERRAPUERTAS SUPREM NG",
                "image"=> "/img/products/",
                "description"=> "Cierrapuertas Supreme negro, presentación individual.",
                "brand_fk"=> 11,
                "category_fk"=> 7
            ],
            [
                "product_id"=> 44,
                "name"=> "MANILLA SUPREM AXAL",
                "image"=> "/img/products/",
                "description"=> "Manilla Supreme Axal, presentación individual.",
                "brand_fk"=> 1,
                "category_fk"=> 5
            ],
            [
                "product_id"=> 45,
                "name"=> "TIRADOR SUPREME NG",
                "image"=> "/img/products/",
                "description"=> "Tirador Supreme negro, presentación individual.",
                "brand_fk"=> 11,
                "category_fk"=> 5
            ],
            [
                "product_id"=> 46,
                "name"=> "BURLETE PVC TRANSPARENTE",
                "image"=> "/img/products/",
                "description"=> "Burlete de PVC transparente, presentación de 100 metros.",
                "brand_fk"=> 11,
                "category_fk"=> 2
            ],
            [
                "product_id"=> 47,
                "name"=> "CARRIL AXAL P/PUERTAS",
                "image"=> "/img/products/",
                "description"=> "Carril Axal para puertas corredizas, presentación individual.",
                "brand_fk"=> 1,
                "category_fk"=> 8
            ],
            [
                "product_id"=> 48,
                "name"=> "PERNIO ROTONDA 110X55",
                "image"=> "/img/products/",
                "description"=> "Pernio para rotonda de 110x55mm, presentación individual.",
                "brand_fk"=> 11,
                "category_fk"=> 4
            ],
            [
                "product_id"=> 49,
                "name"=> "GUIA AXAL SUPERIOR NG",
                "image"=> "/img/products/",
                "description"=> "Guía superior marca Axal, color negro, presentación de 50 unidades.",
                "brand_fk"=> 1,
                "category_fk"=> 2
            ],
            [
                "product_id"=> 50,
                "name"=> "JUNTA DE SILICONA 10MM",
                "image"=> "/img/products/comunello/comunello-escuadra-1190f.jpg",
                "description"=> "Junta de silicona de 10mm, presentación de 100 metros.",
                "brand_fk"=> 11,
                "category_fk"=> 2
            ]
        ]);
    }
}
