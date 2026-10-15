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
| Datos de ejemplo | Pendiente | |
| Panel de inicio | Pendiente | |
| Bandeja de WhatsApp | Pendiente | |
| Presupuestos | Pendiente | |
| Pedidos y entregas | Pendiente | |
| Facturación | Pendiente | |
| Clientes | Pendiente | |
| Cuentas corrientes | Pendiente | |
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

## Feedback de Laura
_(Anotar acá los comentarios después de que pruebe la demo)_

## Registro de cambios
Formato: `dd/mm/aaaa — [Agregado | Cambiado | Corregido | Eliminado] descripción`

- 13/10/2026 — [Agregado] Creación del proyecto y de CONTEXT.md
- 14/10/2026 — [Agregado] Análisis del diseño (canvas DALAMA CRM + UI kit) y propuesta de estructura, modelo de datos y plan por etapas (pendiente de confirmación)
- 14/10/2026 — [Cambiado] context.md renombrado a CONTEXT.md
- 14/10/2026 — [Agregado] Etapa 1: proyecto Vite + React + TS, Tailwind con tokens del UI kit, componentes base (Button, Input, Select, MoneyInput, DateInput, Textarea, StatusBadge, KpiCard, DataTable, Tabs, Alert, Toast, ConfirmModal, Dialog, Sheet, Menu, Popover, Tooltip, Switch, Card), estados vacío/carga/error, barra lateral, barra superior con etiqueta DEMO, buscador Ctrl K y avisos, navegación móvil, pantalla de bienvenida, 404, vercel.json y página de revisión /kit
- 14/10/2026 — [Agregado] Páginas provisorias para todas las rutas del sistema (sin links vacíos)
