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
                "price" => 123.21,
                "image" => "images/escuadras/escuadra_4mm_mosq.webp",
                "description"=> "Escuadra Mosquitero Fijo, presentación de 100 unidades.",
                "brand_fk"=> 11,
                "category_fk"=> 6
            ],
            [
                "product_id"=> 2,
                "name"=> "7MM AXAL ESC MOSQ MEDIANITO",
                "price" => 168.874,
                "image" => "images/escuadras/escuadra_7mm_axal.webp",
                "description"=> "Escuadra Mosquitero Medianito Axial, presentación de 500 unidades.",
                "brand_fk"=> 1,
                "category_fk"=> 6
            ],
            [
                "product_id"=> 3,
                "name"=> "AA003 ESC MARCO ROT",
                "price" => 936.77,
                "image" => "images/escuadras/escuadra_aa003_marco.jpg",
                "description"=> "Escuadra Marco Rotonda, presentación de 100 unidades.",
                "brand_fk"=> 11,
                "category_fk"=> 6
            ],
            [
                "product_id"=> 4,
                "name"=> "AA202 GUIA CORR ROTOND",
                "price" => 65.63,
                "image" => "images/escuadras/guia_aa202_corrediza.webp",
                "description"=> "Guía Corredera Rotonda, presentación de 100 unidades.",
                "brand_fk"=> 11,
                "category_fk"=> 6
            ],
            [
                "product_id"=> 5,
                "name"=> "AA210 TOPE LAT ROTONDA",
                "price" => 187.36,
                "image" => "images/felpas/tope_lat_aa210.webp",
                "description"=> "Tope Lateral Rotonda, presentación de 100 unidades.",
                "brand_fk"=> 11,
                "category_fk"=> 11
            ],
            [
                "product_id"=> 6,
                "name"=> "AIR ALUM 5 ALETAS PESADO",
                "price" => 9953.50,
                "image" => "images/cerraduras/aireador_aletas_aluminio.webp",
                "description"=> "Aireador de Aluminio con 5 aletas, versión pesada, se vende por par.",
                "brand_fk"=> 11,
                "category_fk"=> 1
            ],
            [
                "product_id"=> 7,
                "name"=> "AIR PLASTICO 3 ALETAS",
                "price" => 1850.50,
                "image" => "images/cerraduras/aireador_3aletas_pvc.webp",
                "description"=> "Aireador de Plástico con 3 aletas, se vende por par.",
                "brand_fk"=> 11,
                "category_fk"=> 1
            ],
            [
                "product_id"=> 8,
                "name"=> "ALDABA AXAL DUOMO K BC",
                "price" => 1125.70,
                "image" => "images/picaportes/aldaba_duomo_bc.webp",
                "description"=> "Aldaba Axal Duomo K Blanca, presentación de 20 unidades.",
                "brand_fk"=> 1,
                "category_fk"=> 5
            ],
            [
                "product_id"=> 9,
                "name"=> "ALDABA PLASTICA",
                "price" => 81.56,
                "image" => "images/picaportes/aldaba_eco.webp",
                "description"=> "Aldaba Plástica Económica sin tornillos, presentación de 100 unidades",
                "brand_fk"=> 11,
                "category_fk"=> 5
            ],
            [
                "product_id"=> 10,
                "name"=> "ANTIRRUIDO Nro. 2",
                "price" => 11.65,
                "image" => "images/felpas/antirruido_n2.webp",
                "description"=> "Antirruido Nro. 2, presentación de 100 unidades.",
                "brand_fk"=> 11,
                "category_fk"=> 12
            ],
            [
                "product_id"=> 11,
                "name"=> "B29 2MM BUR A30",
                "price" => 268.85,
                "image" => "images/burletes/burlete_b29.webp",
                "description"=> "Burlete A30 de 2mm, presentación de 100 metros.",
                "brand_fk"=> 11,
                "category_fk"=> 2
            ],
            [
                "product_id"=> 12,
                "name"=> "B48 CUÑA CHICA",
                "price" => 499.56,
                "image" => "images/burletes/burlete_b48.webp",
                "description"=> "Burlete cuña chica, presentación de 50 metros.",
                "brand_fk"=> 11,
                "category_fk"=> 2
            ],
            [
                "product_id"=> 13,
                "name"=> "B67 BTE HERM DOBLE PVC",
                "price" => 445,
                "image" => "images/burletes/burlete_b67.webp",
                "description"=> "Burlete Hermético Doble de PVC, presentación de 100 metros.",
                "brand_fk"=> 11,
                "category_fk"=> 2
            ],
            [
                "product_id"=> 14,
                "name"=> "CERRADURA BASE",
                "price" => 8650,
                "image" => "images/cerraduras/cerradura_base.webp",
                "description"=> "Cerradura base, presentación individual.",
                "brand_fk"=> 11,
                "category_fk"=> 1
            ],
            [
                "product_id"=> 15,
                "name"=> "CIERRE APPLY ECO CON LLAVE",
                "price" => 6810,
                "image" => "images/cerraduras/cierre_apply.webp",
                "description"=> "Cierre Apply con llave, versión eco.",
                "brand_fk"=> 11,
                "category_fk"=> 1
            ],
            [
                "product_id"=> 16,
                "name"=> "CIERRE AXAL MILEN MOD AUT NG",
                "price" => 4726,
                "image" => "images/cerraduras/cierre_milenio_auto.webp",
                "description"=> "Cierre Axal Milenio, modelo automático, negro.",
                "brand_fk"=> 1,
                "category_fk"=> 1
            ],
            [
                "product_id"=> 17,
                "name"=> "CIERRE VENUS AXAL BLANCO",
                "price" => 768.15,
                "image" => "images/cerraduras/cierre_venus_bc.webp",
                "description"=> "Cierre Venus Axal, blanco, presentación de 20 unidades.",
                "brand_fk"=> 1,
                "category_fk"=> 1
            ],
            [
                "product_id"=> 18,
                "name"=> "CIER LAT. CHAMICAL 1096 BLCO",
                "price" => 3863,
                "image" => "images/cerraduras/cierre_1096.webp",
                "description"=> "Cierre lateral marca Chamical, color blanco.",
                "brand_fk"=> 4,
                "category_fk"=> 1
            ],
            [
                "product_id"=> 19,
                "name"=> "CIERRE VENUS AXAL NEGRO",
                "price" => 768.15,
                "image" => "images/cerraduras/cierre_venus_negro.webp",
                "description"=> "Cierre Venus Axal, negro, presentación de 20 unidades.",
                "brand_fk"=> 1,
                "category_fk"=> 1
            ],
            [
                "product_id"=> 20,
                "name"=> "CP20 AXAL ALDABA BCA DER.",
                "price" => 7255,
                "image" => "images/picaportes/aldaba_cp20_bc.jpeg",
                "description"=> "Aldaba blanca derecha, marca Axal.",
                "brand_fk"=> 11,
                "category_fk"=> 5
            ],
            [
                "product_id"=> 21,
                "name"=> "CP5 ECO ALDABA NEGRA",
                "price" => 485,
                "image" => "images/picaportes/aldaba_cp5.webp",
                "description"=> "Aldaba negra eco, presentación de 10 unidades.",
                "brand_fk"=> 3,
                "category_fk"=> 5
            ],
            [
                "product_id"=> 22,
                "name"=> "CUÑA STANDAR",
                "price" => 176.44,
                "image" => "images/burletes/burlete_standar.webp",
                "description"=> "Cuña estándar, presentación de 100 metros.",
                "brand_fk"=> 11,
                "category_fk"=> 2
            ],
            [
                "product_id"=> 23,
                "name"=> "ESC. PARTE A 71.8 PESADA",
                "price" => 433.27,
                "image" => "images/escuadras/escuadra_A_pesada.webp",
                "description"=> "Escuadra parte A pesada de 71.8mm, presentación de 100 unidades.",
                "brand_fk"=> 11,
                "category_fk"=> 6
            ],
            [
                "product_id"=> 24,
                "name"=> "ESC.PARTE A STANDARD 80 MM",
                "price" => 288.83,
                "image" => "images/escuadras/escuadra_A_standar80.webp",
                "description"=> "Escuadra parte A estándar de 80mm, presentación de 350 unidades.",
                "brand_fk"=> 11,
                "category_fk"=> 6
            ],
            [
                "product_id"=> 25,
                "name"=> "H14 AXAL BANDEROLA - NEGRO",
                "price" => 1670.75,
                "image" => "images/cerraduras/banderola_h14_negro.webp",
                "description"=> "Banderola Axal, color negro.",
                "brand_fk"=> 1,
                "category_fk"=> 1
            ],
            [
                "product_id"=> 26,
                "name"=> "H42 PASD SUNSHINE 28CM",
                "price" => 10088,
                "image" => "images/pasadores/pasador_h42.webp",
                "description"=> "Pasador Sunshine de 28cm.",
                "brand_fk"=> 2,
                "category_fk"=> 8
            ],
            [
                "product_id"=> 27,
                "name"=> "H53 BRAZO SUNSHINE LG",
                "price" => 4599,
                "image" => "images/cierres/h53_brazo_largo.webp",
                "description"=> "Brazo largo marca Sunshine.",
                "brand_fk"=> 2,
                "category_fk"=> 7
            ],
            [
                "product_id"=> 28,
                "name"=> "H53 ECO BRAZO 250 MM",
                "price" => 3843,
                "image" => "images/cierres/h53_brazo_250mm.webp",
                "description"=> "Brazo eco de 250mm, presentación por par.",
                "brand_fk"=> 3,
                "category_fk"=> 7
            ],
            [
                "product_id"=> 29,
                "name"=> "KIT COMP. FALLEBA",
                "price" => 3388,
                "image" => "images/fallebas/kit_completo.webp",
                "description"=> "Kit completo de falleba.",
                "brand_fk"=> 11,
                "category_fk"=> 9
            ],
            [
                "product_id"=> 30,
                "name"=> "LLAVE ALLEN T 4",
                "price" => 14539.95,
                "image" => "images/tronillos/llave_allen_4mm.webp",
                "description"=> "Llave Allen T de 4mm.",
                "brand_fk"=> 11,
                "category_fk"=> 14
            ],
            [
                "product_id"=> 31,
                "name"=> "MAN CH BIPT SUNSHINE BC",
                "price" => 3956,
                "image" => "images/picaportes/manija_bipt.webp",
                "description"=> "Manija chica bipt Sunshine, color blanco.",
                "brand_fk"=> 2,
                "category_fk"=> 5
            ],
            [
                "product_id"=> 32,
                "name"=> "PAN FRAM MECHA ECO 7X7",
                "price" => 10.185,
                "image" => "images/tronillos/tornillo_framing_7x7.webp",
                "description"=> "Pan framing mecha, eco 7x7, presentación de 1000 unidades.",
                "brand_fk"=> 3,
                "category_fk"=> 14
            ],
            [
                "product_id"=> 33,
                "name"=> "BISAGRA MOSQ NEGRO",
                "price" => 1709.7,
                "image" => "images/bisagras/bisagra_mosq_negro.webp",
                "description"=> "Bisagra mosquera color negro.",
                "brand_fk"=> 11,
                "category_fk"=> 4
            ],
            [
                "product_id"=> 34,
                "name"=> "ALE7/AA207 ESC HOJA ROT",
                "price" => 655.76,
                "image" => "images/escuadras/aa207_esc_hoja.jpg",
                "description"=> "Escuadra AA207 Hoja Rotonda.",
                "brand_fk"=> 11,
                "category_fk"=> 6
            ],
            [
                "product_id"=> 35,
                "name"=> "H62 BRONZEN BISAGRA BC",
                "price" => 3100,
                "image" => "images/bisagras/bisagra_h62.webp",
                "description"=> "Bisagra H62 Bronzen color blanco.",
                "brand_fk"=> 8,
                "category_fk"=> 7
            ],
            [
                "product_id"=> 36,
                "name"=> "H89 MANIJON AXAL MILENIO NG",
                "price" => 6645,
                "image" => "images/picaportes/tirador_h89.avif",
                "description"=> "Manijon H89 Axal, color negro.",
                "brand_fk"=> 1,
                "category_fk"=> 5
            ],
            [
                "product_id"=> 37,
                "name"=> "H51 QBO CERR MOD 5 LLAVES",
                "price" => 26501,
                "image" => "images/cerraduras/cerradura_h51.webp",
                "description"=> "Cerradura H51 Módena con 5 llaves.",
                "brand_fk"=> 11,
                "category_fk"=> 1
            ],
            [
                "product_id"=> 38,
                "name"=> "B75 ESQUINERO B74",
                "price" => 1830,
                "image" => "images/burletes/esquinero_b75.png",
                "description"=> "Esquinero para unir burlete de junta abierta B74.",
                "brand_fk"=> 11,
                "category_fk"=> 2
            ],
            [
                "product_id"=> 39,
                "name"=> "E68 AXAL ESC PREMARCO ALUMINIO",
                "price" => 201.44,
                "image" => "images/escuadras/e68-escuadra-premarco.jpg",
                "description"=> "Escuadra de armado premarco E68 de aluminio.",
                "brand_fk"=> 1,
                "category_fk"=> 6
            ],
            [
                "product_id"=> 40,
                "name"=> "AA212 TAPON CAJA DE AGUA",
                "price" => 223,
                "image" => "images/plasticos/aa212-tapon-agua.webp",
                "description"=> "Tapón caja de agua AA212, presentación de 100 unidades.",
                "brand_fk"=> 11,
                "category_fk"=> 12
            ],
            [
                "product_id"=> 41,
                "name"=> "T132 CRUCE DE HOJA",
                "price" => 1169.6,
                "image" => "images/felpas/t132-cruce-hoja.webp",
                "description"=> "T132 Tapón para cruce entre hojas ",
                "brand_fk"=> 11,
                "category_fk"=> 11
            ],
            [
                "product_id"=> 42,
                "name"=> "KIT OSC SUNSHINE CT NG",
                "price" => 78324,
                "image" => "images/oscilo/kit_oscilo_negro.webp",
                "description"=> "Kit mecánico oscilobatiente corto, color negro.",
                "brand_fk"=> 2,
                "category_fk"=> 10
            ],
            [
                "product_id"=> 43,
                "name"=> "BOCALLAVE ECO S/TOR",
                "price" => 281.59,
                "image" => "images/cerraduras/bocallave_eco.webp",
                "description"=> "Bocallave sin tornillos, presentación individual.",
                "brand_fk"=> 3,
                "category_fk"=> 7
            ],
            [
                "product_id"=> 44,
                "name"=> "5043 CHAMICAL PAT P/MOS",
                "price" => 205.78,
                "image" => "images/picaportes/patin_5043_chamical.webp",
                "description"=> "Patin 5043 Chamical para mosquiteros, presentación de 100 unidades.",
                "brand_fk"=> 4,
                "category_fk"=> 5
            ],
            [
                "product_id"=> 45,
                "name"=> "CP7 CIERRE PLAS.P/VENT.",
                "price" => 4621.73,
                "image" => "images/picaportes/cierre_cp7.webp",
                "description"=> "CP7 cierre plástico para ventanas, presentación de 100 unidades.",
                "brand_fk"=> 11,
                "category_fk"=> 5
            ],
            [
                "product_id"=> 46,
                "name"=> "B52 BTE INT DOBLE VDE",
                "price" => 375.13,
                "image" => "images/burletes/burlete_b52.webp",
                "description"=> "Burlete B52 para interior de doble contacto, presentación de 100 metros.",
                "brand_fk"=> 11,
                "category_fk"=> 2
            ],
            [
                "product_id"=> 47,
                "name"=> "H91 BRAVO PRIMA GIESSE NG",
                "price" => 36437,
                "image" => "images/picaportes/h91_bravo_prima.webp",
                "description"=> "Manija H91 Bravo Prima Giesse, color negro.",
                "brand_fk"=> 7,
                "category_fk"=> 5
            ],
            [
                "product_id"=> 48,
                "name"=> "R46 AXAL RUEDA SIM. A30 ECO",
                "price" => 5118,
                "image" => "images/rodamientos/r46_rodamiento.webp",
                "description"=> "Rodamiento R46, presentación de 20 unidades.",
                "brand_fk"=> 1,
                "category_fk"=> 3
            ],
            [
                "product_id"=> 49,
                "name"=> "T96 CLIP CONTRA V ECONOMICO",
                "price" => 26.36,
                "image" => "images/plasticos/t96_clip.webp",
                "description"=> "T96 clip contravidrios económico, presentación de 100 unidades.",
                "brand_fk"=> 3,
                "category_fk"=> 12
            ],
            [
                "product_id"=> 50,
                "name"=> "S9 AXAL GRAMPAS AMURE",
                "price" => 113.33,
                "image" => "images/escuadras/s9_axal.webp",
                "description"=> "Grampa amure S9 Axal, presentación de 100 unidades.",
                "brand_fk"=> 1,
                "category_fk"=> 6
            ]
        ]);
        
    }
}
