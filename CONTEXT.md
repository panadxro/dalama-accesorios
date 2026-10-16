# DALAMA CRM — Demo

## Proyecto
Demo interactiva del CRM para DALAMA, distribuidora de accesorios para aberturas de aluminio.
Objetivo: que Laura (dueña) recorra la demo sola y entienda cómo funcionaría su negocio con el sistema, como paso previo a contratar el desarrollo real.

- Cliente: Laura (dueña, contadora) y Dario (dueño, arquitecto)
- Equipo: Lucas (producto y diseño), Valentino (desarrollo), Yoel (marketing)
- Diseño de referencia: /design (original: https://claude.ai/artifact/RgiZQRNc9T9xZa8sXoQxfj)
- Demo publicada: _pendiente_

## Alcance
- Es una DEMO: sin backend, datos en localStorage, WhatsApp/IA/ARCA simulados.
- Datos 100% ficticios. Nunca cargar datos reales de clientes de DALAMA.
- El sistema real (backend, ARCA real, WhatsApp API) se define al contratar.

## Stack
React + Vite + TypeScript · Tailwind CSS · shadcn/ui · lucide-react · Zustand (localStorage) · React Router · Recharts · jsPDF · Vercel

## Identidad visual
- Rojo DALAMA #E11B22 · Bold Red #B81D23 · Dark Brick #4A1F1F · Ink Black #111111 · Sandstone #D1C0A6
- Fondo general: Arena 50 #FAF7F2
- Tipografía: Montserrat
- Fuente de verdad: UI kit en /design

## Flujo principal
WhatsApp → Presupuesto con IA → Envío → Aceptación → Pedido → Factura → Cuenta corriente + Stock → Entrega → Cobro

## Estado de módulos
| Módulo | Estado | Notas |
|---|---|---|
| Base visual y navegación | Requiere revisión | Etapa 1: tokens, kit portado, layout, rutas, bienvenida, 404. Revisión en /kit |
| Datos de ejemplo | Requiere revisión | Etapa 2: modelo de datos, generador con semilla fija, store persistido, avisos, búsqueda y reinicio. Revisión en /kit/datos |
| Panel de inicio | Pendiente | |
| Bandeja de WhatsApp | Requiere revisión | Etapa 3: lista, chat, IA por reglas con confianza, alta rápida de cliente, simular mensaje y respuesta, celular |
| Presupuestos | Requiere revisión | Etapa 3: listado con KPI y filtros, nuevo, detalle editable, PDF, envío, recordatorio, convertir en pedido |
| Pedidos y entregas | Requiere revisión | Etapa 3: listado, detalle con estados, remito PDF, entrega editable, Entregas de hoy (celular), cobro al entregar |
| Facturación | En progreso | Etapa 3: emisión A/B con CAE simulado y error de ARCA, PDF, listado y detalle. Falta nota de crédito (etapa 4) |
| Clientes | Pendiente | |
| Cuentas corrientes | En progreso | Etapa 3: cuenta del cliente, antigüedad, cobros con 4 medios, recibo PDF, recordatorio. Falta listado general y cartera (etapa 4) |
| Productos y precios | Pendiente | |
| Stock | Pendiente | |
| Compras | Pendiente | |
| Reportes | Pendiente | |
| Configuración | Pendiente | |
| Recorrido guiado | Pendiente | |

Todas las rutas existen desde la Etapa 1: las secciones sin construir muestran "En preparación · etapa N" con lo que van a hacer y links a secciones relacionadas (sin links vacíos).

Estados: Pendiente · En progreso · Listo · Requiere revisión

## Decisiones
| Fecha | Decisión | Motivo |
|---|---|---|
| 13/10/2026 | Demo sin backend, datos en localStorage | Gratis, rápida y sin riesgo de datos reales |
| 13/10/2026 | WhatsApp, IA y ARCA simulados | Mostrar el flujo sin integraciones ni costos |
| 14/10/2026 | Datos fiscales de DALAMA ficticios (CUIT y domicilio de ejemplo) | El diseño dejaba marcadores; confirmado por Lucas |
| 14/10/2026 | Diseño copiado a /design (pantallas .dc.html, UI kit, logos) y logos a /public/brand | El repo no tenía /design; queda la fuente de verdad versionada |
| 14/10/2026 | Tailwind v3.4 con tailwind.config.ts que lee variables CSS de src/styles/tokens.css | Pedido explícito de tailwind.config; una sola fuente de tokens |
| 14/10/2026 | CSS de componentes del kit portado tal cual (src/styles/dalama.css, clases dl-*) fuera de @layer | Fidelidad al kit y evitar que Tailwind purgue clases armadas por variante |
| 14/10/2026 | shadcn/ui solo como base Radix (Dialog, DropdownMenu, Popover, Tooltip) con estilo del kit; toasts propios | Accesibilidad resuelta sin sumar un segundo sistema visual ni dependencias |
| 14/10/2026 | Íconos con lucide-react, trazo 1,5, mapeados a los nombres del kit | El kit dibuja íconos estilo Lucide |
| 14/10/2026 | Montos en centavos (enteros) | Evitar errores de redondeo en totales, IVA y saldos |
| 14/10/2026 | Layout de celular debajo de 1024 px: cabecera ink-black, menú deslizable y barra inferior (Inicio, Bandeja, Pedidos, Entregas, Stock) | Sigue las pantallas móviles del diseño |
| 14/10/2026 | Sesión de demo sin login: "Entrar como Laura" guarda la sesión en localStorage | Requisito de la demo |
| 14/10/2026 | Datos generados por código con semilla fija (src/data/seed), simulando las mismas operaciones del sistema | Siempre iguales y coherentes: cada factura tiene pedido, movimiento de stock y cobro o deuda |
| 14/10/2026 | Fechas guardadas como ISO local sin zona; al abrir la demo otro día se corren todas las fechas | "Entregas de hoy", vencimientos y mensajes recientes siguen teniendo sentido cualquier día que Laura entre |
| 14/10/2026 | Saldos, cuenta corriente, estado "vencido" y alertas se derivan, no se guardan (domain/calculos.ts, store/selectores.ts) | Una sola fuente de verdad; ninguna acción puede dejar números desfasados |
| 14/10/2026 | Detalle de presupuestos, pedidos y movimientos de stock solo en los últimos 60 días; facturas y cobros de 6 meses | Mantener localStorage cerca de 1 MB sin perder reportes de 6 meses |
| 14/10/2026 | Numeración del historial termina en la del diseño (P-0997, PED-0425, FC A 0003-00002137, OC-0089) | Coherencia con las pantallas diseñadas: lo próximo es P-0998, PED-0426 y FC A 2138 |
| 14/10/2026 | Bancos (cheques) y transportes (Vía Cargo, Andreani) con nombres reales; clientes, proveedores, CUIT, teléfonos y emails ficticios (dominio .example) | Los nombres de bancos y transportes dan realismo sin exponer datos de personas ni empresas clientes |
| 14/10/2026 | Esquema de datos versionado (ESQUEMA_DATOS): si cambia, la demo guardada se regenera | Evitar demos rotas tras un deploy |
| 15/10/2026 | El stock se descuenta al facturar; entre pedido y factura queda "reservado" (derivado) | Pedido explícito del flujo: la factura impacta en cuenta corriente y stock |
| 15/10/2026 | Se permite facturar con stock insuficiente, con aviso de faltante | Realista para una distribuidora que repone; no bloquea la demo |
| 15/10/2026 | IA simulada por reglas (services/ia/interpretarPedido.ts): sinónimos, raíces, colores, líneas, medidas y cantidades; confianza por línea; empates entre variantes de color se proponen y marcan "Revisar" | Funciona sin servicios externos y con la misma salida que tendría un modelo real |
| 15/10/2026 | La respuesta del cliente al presupuesto se simula con botones "El cliente acepta / no acepta" | En la demo no llegan mensajes reales; deja claro qué pasaría |
| 15/10/2026 | Bandeja: lista y chat arriba, presupuesto abajo a todo el ancho (tres columnas desde 1700 px) | En 1440 px el diseño ya hace pasar el panel a una segunda fila; la tabla necesita ancho |
| 15/10/2026 | "Cómo llegar" copia la dirección en lugar de abrir mapas | Ningún dato sale del navegador |
| 15/10/2026 | ARCA simulado con opción visible "Simular que ARCA no responde" | Mostrar el estado de error diseñado |
| 15/10/2026 | PDF con jsPDF y fuentes estándar (Helvetica); logo reducido a JPEG (~30 KB por PDF) | Sin cargar fuentes externas; Montserrat queda para la interfaz |

## Feedback de Laura
_(Anotar acá los comentarios después de que pruebe la demo)_

## Registro de cambios
Formato: `dd/mm/aaaa — [Agregado | Cambiado | Corregido | Eliminado] descripción`

- 13/10/2026 — [Agregado] Creación del proyecto y de CONTEXT.md
- 14/10/2026 — [Agregado] Análisis del diseño (canvas DALAMA CRM + UI kit) y propuesta de estructura, modelo de datos y plan por etapas (pendiente de confirmación)
- 14/10/2026 — [Cambiado] context.md renombrado a CONTEXT.md
- 14/10/2026 — [Agregado] Etapa 1: proyecto Vite + React + TS, Tailwind con tokens del UI kit, componentes base (Button, Input, Select, MoneyInput, DateInput, Textarea, StatusBadge, KpiCard, DataTable, Tabs, Alert, Toast, ConfirmModal, Dialog, Sheet, Menu, Popover, Tooltip, Switch, Card), estados vacío/carga/error, barra lateral, barra superior con etiqueta DEMO, buscador Ctrl K y avisos, navegación móvil, pantalla de bienvenida, 404, vercel.json y página de revisión /kit
- 14/10/2026 — [Agregado] Páginas provisorias para todas las rutas del sistema (sin links vacíos)
- 14/10/2026 — [Agregado] Etapa 2: modelo de datos (domain/types.ts), reglas de negocio puras (domain/calculos.ts: totales, IVA, letra A/B/C, cuenta corriente, antigüedad de deuda, stock, inactivos)
- 14/10/2026 — [Agregado] Datos de ejemplo: 60 productos en 7 categorías, 5 proveedores, 25 clientes de zona sur, 6 meses de ventas (~465 comprobantes), cobros con efectivo/transferencia/cheque/tarjeta, cheques en cartera, presupuestos en todos los estados, 6 entregas para hoy, órdenes de compra, último conteo y 8 conversaciones de WhatsApp (+5 para simular)
- 14/10/2026 — [Agregado] Store persistido con corrimiento automático de fechas, avisos de la campana conectados, contador de la bandeja, búsqueda global funcionando, "Reiniciar demo" en el menú de usuario y página de revisión /kit/datos
- 15/10/2026 — [Agregado] Etapa 3, flujo principal completo: bandeja de WhatsApp con presupuesto por IA (animación, confianza por línea, elección de productos dudosos), envío por WhatsApp con vista previa y confirmación, respuesta del cliente simulada, conversión en pedido con entrega sugerida, estados del pedido con remito, emisión de factura A/B con CAE simulado (y error de ARCA), descuento de stock, cuenta corriente con antigüedad, cobros (efectivo, transferencia, cheque, tarjeta) con imputación y recibo, entregas de hoy para celular con cobro al entregar
- 15/10/2026 — [Agregado] PDF de presupuesto, factura/nota de crédito, remito y recibo; exportación a CSV de presupuestos, pedidos y comprobantes; búsqueda de productos tipo combobox
- 15/10/2026 — [Cambiado] Datos de ejemplo (esquema 2): más presupuestos rechazados y vencidos para una tasa de aceptación realista
- 15/10/2026 — [Corregido] Barra superior en una sola línea con títulos largos; montos largos en tarjetas KPI; scroll al inicio al cambiar de pantalla
