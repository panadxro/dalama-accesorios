<?php

namespace Database\Seeders;



use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;

class BlogSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('blogs')->insert([
            [
                "blog_id"=> 1,
                "title"=> "5 Tips para Elegir Accesorios de Aluminio",
                "image"=> "images/blog/5_tips.jpg",
                "description"=> "Aprende a seleccionar los mejores accesorios para tus proyectos de carpintería.",
                "content"=> "Elegir los accesorios adecuados para tus proyectos de carpintería de aluminio es crucial para garantizar la durabilidad y el buen funcionamiento de las instalaciones. Es importante asegurarse de que los accesorios estén fabricados con materiales de alta calidad, como aluminio y componentes inoxidables, que ofrecen una mayor resistencia y durabilidad. También es fundamental verificar que los accesorios sean compatibles con los perfiles de aluminio que se utilizarán en el proyecto, asegurando un ajuste perfecto y una instalación sin problemas. Al trabajar con estructuras grandes, como portones o puertas de grandes dimensiones, se debe considerar la capacidad de carga de los accesorios, especialmente en el caso de bisagras y carros, para garantizar estabilidad y seguridad. La facilidad de instalación también es un factor a tener en cuenta, ya que es esencial que los accesorios permitan un ensamblaje rápido y seguro. Por último, es importante no descuidar el aspecto estético de los accesorios, ya que deben complementar el diseño general de la carpintería, aportando tanto funcionalidad como estilo."
            ],
            [
                "blog_id"=> 2,
                "title"=> "Tendencias en Carpintería de Aluminio 2024",
                "image"=> "images/blog/tendencias.jpg",
                "description"=> "Descubre las tendencias de este año que están transformando la industria.",
                "content"=> "La carpintería de aluminio está en constante evolución, adaptándose a las necesidades y gustos de los consumidores. En 2024, las tendencias se centran en la sostenibilidad y la eficiencia energética, impulsando el uso de perfiles de aluminio reciclado y técnicas que mejoran el aislamiento térmico y acústico. Además, los diseños minimalistas están ganando popularidad, con líneas limpias y acabados anodizados que aportan un toque moderno y elegante a cualquier proyecto. La personalización también es clave; los clientes buscan soluciones adaptadas a sus necesidades específicas, lo que ha llevado a la innovación en productos como sistemas de corredera silenciosa y accesorios de fácil instalación. Por último, la integración de tecnología en la carpintería, como cerraduras inteligentes y automatización de puertas, está revolucionando la forma en que interactuamos con nuestros espacios."
            ],
            [
                "blog_id"=> 3,
                "title"=> "BISAGRA H82 PLUS Tipo puente",
                "image"=> "images/blog/bisagra-h82.jpg",
                "description"=> "Conoce la BISAGRA H82 PLUS, diseñada para ofrecer resistencia y durabilidad en proyectos de gran envergadura.",
                "content"=> "La BISAGRA H82 PLUS es una solución excepcional para proyectos de carpintería de aluminio que requieren robustez y confiabilidad. Desarrollada por un equipo especializado, esta bisagra soporta hasta 130 kilos, lo que la convierte en una opción ideal para puertas y portones pesados. Fabricada con tornillos y pletina en acero inoxidable AISI 304, garantiza un rendimiento óptimo incluso en condiciones climáticas adversas. Su diseño innovador no solo asegura un funcionamiento suave y eficiente, sino que también se integra perfectamente en cualquier estética arquitectónica, ofreciendo una combinación perfecta de funcionalidad y estilo."
            ],
            [
                "blog_id"=> 4,
                "title"=> "CARRO R47 A AGUJAS",
                "image"=> "images/blog/R47-aguja_thumbnail.jpg",
                "description"=> "El CARRO R47 A AGUJAS es la solución ideal para garantizar un deslizamiento fluido y preciso en tus instalaciones.",
                "content"=> "Este carro se ha diseñado pensando en la eficiencia y el rendimiento. Con una carcasa de nylon y porta ruedas de zamak, el CARRO R47 A AGUJAS ofrece un funcionamiento silencioso y duradero, incluso bajo cargas pesadas. Sus casquillos de agujas y ruedas de acetal garantizan un deslizamiento suave y estable, haciendo que este producto sea perfecto para puertas de gran tamaño. La posibilidad de ajuste micrométrico permite personalizar su funcionamiento, adaptándose a las necesidades específicas de cada instalación. Con este carro, no solo mejoras la funcionalidad, sino que también aportas un toque de calidad y tecnología a tus proyectos."
            ],
            [
                "blog_id"=> 5,
                "title"=> "CARRO PROIN / STAC R47",
                "image"=> "images/blog/PROIN-R47_thumbnail.jpg",
                "description"=> "Optimiza el funcionamiento de tus puertas corredizas con el CARRO PROIN / STAC R47, un sistema versátil y duradero.",
                "content"=> "Este carro tándem regulable es ideal para instalaciones que requieren un alto rendimiento y versatilidad. Con un diseño desmontable y un soporte de zamak, el CARRO PROIN / STAC R47 permite una instalación rápida y eficiente, sin sacrificar la calidad. Capaz de soportar hasta 400 kg por hoja, es la solución perfecta para puertas pesadas, garantizando un funcionamiento suave y estable. Su diseño basculante facilita la alineación y el ajuste, lo que resulta en una experiencia de uso excepcional. Invertir en este carro significa optar por calidad, durabilidad y un rendimiento superior en cada apertura y cierre."
            ],
            [
                "blog_id"=> 6,
                "title"=> "Cierre lateral + tirador (opcional)",
                "image"=> "images/blog/cierre-lateral.jpg",
                "description"=> "Mejora la seguridad de tus accesos con el innovador cierre lateral que incluye tirador opcional.",
                "content"=> "Este cierre lateral ha sido diseñado para ofrecer un sistema de seguridad efectivo y práctico. Su construcción íntegramente metálica garantiza durabilidad y resistencia, mientras que el mecanismo de cierre dual permite opciones de cierre automático o en dos posiciones. Fácil de instalar y compatible con todas las líneas existentes en el mercado, este cierre se adapta a diversas aplicaciones, ofreciendo una solución funcional y estética. Con este accesorio, no solo mejorarás la seguridad de tus instalaciones, sino que también añadirás un toque moderno a tu diseño."
            ]
            ]);
    }
}
