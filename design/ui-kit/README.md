UI kit del sistema de gestión (CRM) de DALAMA, distribuidora de accesorios para aberturas de aluminio en Argentina. La marca es sólida, cálida, profesional y confiable: moderna pero no fría, con formas rectas inspiradas en el marco de abertura en perspectiva del isotipo.

## Voz y contenido

- Español de Argentina con voseo: "Registrá el cobro", "Elegí el producto", "¿Pudiste ver el presupuesto?".
- Los botones dicen qué pasa, con verbo: "Emitir factura", "Enviar por WhatsApp", "Convertir en pedido". Nunca "Aceptar" o "OK".
- Los avisos confirman en participio: "Factura A 0003-00002138 emitida". Los errores dicen qué pasó y cómo resolverlo, sin disculpas: "ARCA no respondió a tiempo. No se generó número ni CAE."
- Montos: `$ 1.234.567,89` (punto de miles, coma decimal, espacio después del signo). En tarjetas KPI se omiten los centavos.
- Fechas `dd/mm/aaaa`; horas `14:30`. CUIT `30-71548293-6`.
- Mayúsculas solo en `overline`. Sin emoji ni signos de exclamación en la interfaz.
- Vocabulario del rubro: presupuesto, pedido, remito, factura A/B, nota de crédito, cuenta corriente, cheque diferido, carpintero, aberturista, línea Herrero, línea Módena.

## Color

- Fondo general `fondo` (`arena-50`); tarjetas, tablas y modales en `superficie` (`neutro-0`) con borde `borde` y `sombra-1`; barra lateral en `barra-lateral` (`ink-black`).
- `accion` (`bold-red`) para el botón primario, links y estados activos; hover y presionado en `accion-hover` (`dark-brick`). Un solo botón primario por vista.
- `rojo-dalama` solo como color de marca: el logo, la línea roja de 24 × 3 px bajo títulos y la marca del ítem activo. No es color de botón ni de texto chico.
- `sandstone` y la escala arena dan calidez: avatar, zonas destacadas (`superficie-destacada`), encabezados de tabla.
- Texto principal `texto` (`ink-black`); secundario `texto-secundario` (`neutro-700`). `neutro-500` como texto solo sobre blanco: sobre `arena-50` no llega a 4,5:1.
- Semánticos: `exito`, `advertencia`, `error` (= `bold-red`) e `info`, cada uno con su fondo `-suave`. El texto de advertencia va en `advertencia-texto` (#8A5A0E, agregado a la paleta) porque `advertencia` (#C7841A) mide 3,1:1 sobre blanco.
- Los errores siempre llevan ícono y texto, nunca solo color.
- Todos los pares de texto del kit cumplen WCAG AA; cada token indica sobre qué fondos se puede usar.

## Tipografía

- Montserrat (Google Fonts), una sola familia. Respaldo: "Segoe UI", Arial.
- Escala: `display` 32/40 bold para cifras protagonistas; `h1` 24/32 para el título de página; `h2` 20/28 para modales y secciones; `h3` 16/24 para tarjetas; `overline` 12/16 semibold en mayúsculas con 0,12em para encabezados de sección, siempre seguido de la línea roja; `body` 14/20; `body-small` 13/18; `caption` 12/16 medium.
- Cifras tabulares (`font-variant-numeric: tabular-nums`) en tablas, montos, KPIs y paginación.

## Espaciado, forma y profundidad

- Base 4: `space-1` 4, `space-2` 8, `space-3` 12, `space-4` 16, `space-6` 24, `space-8` 32, `space-12` 48. Tarjetas con padding `space-6`; márgenes de página `space-8`; gap entre tarjetas `space-4`.
- Radios chicos y rectos: `radius-sm` (4 px) en botones, inputs, badges y toasts; `radius-md` (6 px) en tarjetas, tablas y modales; `radius-none` en barras. Nada de píldoras ni esquinas muy redondeadas.
- Sombras cálidas teñidas con dark-brick: `sombra-1` para tarjetas, `sombra-2` para toasts y modales. No hay un tercer nivel.
- Foco: anillo sólido de 2 px en `foco` con 2 px de separación; dentro de la barra lateral, `foco-oscuro`.

## Logo

- Usá los archivos de `assets/Logos` sin modificarlos: positivo sobre superficies claras, negativo sobre `ink-black`. El isotipo solo, en la barra lateral colapsada y en espacios cuadrados.
- No se recolorea, no se estira, no se le cambia la tipografía y no se apoya sobre rojo ni sobre fotos. Margen libre mínimo: la altura de la "D" de DALAMA.

## Íconos

- Íconos de línea propios en el estilo de Lucide (`Icon`): grilla 24, trazo `icono-trazo` de 1,5 px, puntas redondeadas, color `neutro-700`.
- `icono-s` (16 px) en badges, botones S y acciones de fila; `icono-m` (20 px) en navegación, botones M y campos.
- Siempre de línea, nunca rellenos ni emoji. Si un ícono va solo, lleva `aria-label`.

## Componentes

Botón, Input (texto, buscador, select, fecha y monto), StatusBadge, KpiCard, DataTable, Sidebar, Topbar, Toast, Alert, ConfirmModal y Tabs, más `Icon`. Viven en `components/bundle.js` como `window.Dalama` y necesitan React 18 en la página; los estilos están en `components/bundle.css`. Las páginas Fundamentos y Panel de inicio muestran el kit completo y una pantalla armada con él.
