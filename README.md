# DALAMA · Sistema de gestión (demo)

Demo interactiva del CRM de DALAMA, distribuidora de accesorios para aberturas de aluminio. Muestra cómo funcionaría el negocio con el sistema, del mensaje de WhatsApp al cobro:

**WhatsApp → presupuesto con IA → envío en PDF → aceptación → pedido → factura con CAE → cuenta corriente y stock → entrega → cobro.**

> **Es una demo, no el sistema real.** No tiene servidor ni base de datos: todo corre y se guarda en el navegador. WhatsApp, la IA y ARCA están simulados, y todos los datos (clientes, CUIT, montos) son ficticios.

El estado del proyecto, las decisiones tomadas y el registro de cambios están en [CONTEXT.md](CONTEXT.md).

---

## Correr la demo en tu computadora

**Requisitos:** Node.js 18.18 o más nuevo (se desarrolló con Node 22) y npm.

```bash
npm install
npm run dev
```

Abrí la dirección que muestra la terminal (por defecto, http://localhost:5173) y tocá **Entrar como Laura**.

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo con recarga automática. |
| `npm run build` | Chequea los tipos y genera la versión de producción en `dist/`. |
| `npm run preview` | Sirve `dist/` para probar la versión de producción antes de publicarla. |
| `npm run typecheck` | Solo chequea los tipos de TypeScript. |

---

## Publicar en Vercel

La demo es un sitio estático (Vite + React). No necesita variables de entorno ni servicios externos. La configuración ya está en [`vercel.json`](vercel.json):

- Compila con `npm run build` y publica la carpeta `dist`.
- Redirige cualquier ruta a `index.html`, para que funcionen los links directos y la recarga en pantallas como `/pedidos/…` o `/facturacion/nueva`.
- Cachea por un año los archivos de `/assets` (llevan un hash en el nombre, así que cada deploy los renueva).

### Opción A: desde la web de Vercel (recomendada)

1. Subí el repositorio a GitHub, GitLab o Bitbucket.
2. En [vercel.com/new](https://vercel.com/new), importá el repositorio.
3. Vercel detecta Vite. Dejá los valores que propone (los toma de `vercel.json`) y tocá **Deploy**.
4. Cada push a la rama principal publica una versión nueva. Cada pull request genera una URL de vista previa.

### Opción B: desde la terminal

```bash
npx vercel          # primera vez: vincula el proyecto y publica una vista previa
npx vercel --prod   # publica en producción
```

### Después de publicar, revisá

- [ ] La pantalla de bienvenida carga y se ve el logo.
- [ ] "Entrar como Laura" lleva al panel y aparece la invitación al recorrido guiado.
- [ ] Al recargar en una pantalla interna (por ejemplo `/clientes`) no aparece un error 404.
- [ ] El flujo principal funciona: en la bandeja de WhatsApp, "Generar presupuesto con IA" → enviar → "El cliente acepta" → convertir en pedido → emitir factura.
- [ ] Se descarga un PDF (presupuesto o factura).
- [ ] Desde un celular: la bandeja, "Entregas de hoy" y el conteo de inventario se usan cómodos.
- [ ] Anotar la URL en `CONTEXT.md` (sección *Proyecto → Demo publicada*).

---

## Cómo se usa la demo

- **Entrar:** no hay login. "Entrar como Laura" guarda la sesión en el navegador. "Salir de la demo", en el menú de usuario, vuelve a la bienvenida.
- **Recorrido guiado:** 6 pasos por el flujo principal. Se ofrece la primera vez y se reabre desde el menú de usuario o desde *Configuración → Demo*.
- **Reiniciar:** *Menú de usuario → Reiniciar demo* (o *Configuración → Demo*) restaura todos los datos de ejemplo.
- **Simulaciones visibles:**
  - "Simular nuevo mensaje" en la bandeja.
  - "El cliente acepta / no acepta" en un presupuesto enviado.
  - "Simular que ARCA no responde" al emitir una factura.

### Los datos de ejemplo

- Se generan con una semilla fija ([`src/data/seed/generar.ts`](src/data/seed/generar.ts)), así que siempre son iguales:
  - 60 productos y 5 proveedores.
  - 25 clientes de zona sur.
  - 6 meses de ventas, cobros y cheques.
  - Presupuestos en todos los estados.
  - Entregas para hoy.
  - 8 conversaciones de WhatsApp.
- **Las fechas son relativas a hoy.** Si la demo se abre otro día, todas las fechas se corren para que "Entregas de hoy", los vencimientos y los mensajes recientes sigan teniendo sentido.
- **Se guardan en el `localStorage` del navegador**, en tres claves:
  - `dalama-demo-datos`: los datos del negocio.
  - `dalama-demo-ui`: la sesión y las preferencias de vista.
  - `dalama-demo-tour`: si ya se ofreció el recorrido.

  Cada navegador y cada persona tiene su propia copia.
- **Si cambiás la forma de los datos** (tipos o generador), subí `ESQUEMA_DATOS` en `generar.ts`. Así las demos ya guardadas se regeneran solas en vez de romperse.

---

## Qué está simulado y dónde se reemplaza

Cada integración está aislada en `src/services/`, con la misma forma de entrada y salida que tendría la real:

| Integración | Demo | Sistema real |
|---|---|---|
| Interpretación de pedidos (IA) | [`services/ia/interpretarPedido.ts`](src/services/ia/interpretarPedido.ts): reglas con sinónimos, colores, líneas, medidas y cantidades, más un nivel de confianza por línea | Un modelo de lenguaje que devuelva el mismo `InterpretacionPedido` |
| Factura electrónica | [`services/arca.ts`](src/services/arca.ts): CAE ficticio de 14 dígitos, espera simulada y error opcional | Web service WSFE de ARCA con el certificado del punto de venta |
| WhatsApp | [`services/whatsapp.ts`](src/services/whatsapp.ts): espera y confirma, no envía nada | API de WhatsApp Business con plantillas aprobadas |
| PDF | [`services/pdf/documentos.ts`](src/services/pdf/documentos.ts) con jsPDF | Se puede mantener o pasar al servidor |
| Datos | Zustand + `localStorage` ([`store/demo.ts`](src/store/demo.ts)) | API y base de datos |

**La lógica de negocio no depende de la interfaz:**

- [`src/domain/`](src/domain/) tiene los tipos y los cálculos puros: totales, IVA, letra de factura, cuenta corriente, antigüedad de deuda y stock.
- [`src/store/acciones.ts`](src/store/acciones.ts) tiene las operaciones: crear presupuesto, convertir en pedido, emitir factura, registrar cobro, etc. Cada una recibe los datos y devuelve la versión nueva. En el sistema real, cada una es un endpoint.

---

## Estructura

```
design/                  Fuente de verdad del diseño: pantallas (.dc.html), UI kit (tokens, guía) y logos
public/brand/            Logos usados por la app y los PDF
src/
  app/                   Router, layout (barra lateral, barra superior, navegación móvil)
  components/ui/         Componentes del UI kit DALAMA en TypeScript (Button, Input, DataTable, KpiCard, Tabs, Dialog…)
  components/negocio/    Piezas de negocio reutilizables (editor de renglones, totales, envío por WhatsApp, PDF…)
  components/shared/     Estados vacío, de carga y de error
  domain/                Tipos y reglas de negocio puras
  data/seed/             Datos de ejemplo y generador
  features/              Un módulo por sección: inicio, whatsapp, presupuestos, pedidos, facturacion,
                         clientes, cuentas, productos, stock, compras, reportes, configuracion, tour
  services/              Integraciones simuladas (IA, ARCA, WhatsApp, PDF)
  store/                 Estado (datos, interfaz), acciones y selectores derivados
  styles/                tokens.css (variables), dalama.css (componentes del kit), index.css (Tailwind)
```

### Diseño

- **Fuente de verdad:** el UI kit está en [`design/ui-kit`](design/ui-kit) (tokens y guía de voz y uso) y las pantallas en [`design/pantallas`](design/pantallas). La referencia original es el canvas "DALAMA CRM" en claude.ai.
- **Dónde viven en el código:**
  - Tokens: [`src/styles/tokens.css`](src/styles/tokens.css), expuestos a Tailwind en [`tailwind.config.ts`](tailwind.config.ts).
  - Estilos de los componentes: [`src/styles/dalama.css`](src/styles/dalama.css), con clases `dl-*` portadas del kit.
- **Reglas para agregar pantallas:**
  - Usá los componentes de `components/ui` y los tokens; no agregues colores fuera de `tokens.css`.
  - Un solo botón primario por vista.
  - Montos con `formatARS` y fechas con `formatFecha` ([`src/lib/format.ts`](src/lib/format.ts)).
  - Textos en español de Argentina con voseo.

### Páginas de revisión (solo en desarrollo)

Con `npm run dev` existen dos páginas para el equipo, que no se publican:

- [`/kit`](http://localhost:5173/kit): todos los componentes base.
- [`/kit/datos`](http://localhost:5173/kit/datos): resumen de los datos de ejemplo.

---

## Privacidad

- **Los datos del negocio** quedan en el navegador. Ni se envían a un servidor ni se guardan fuera del equipo de quien usa la demo.
- **La única conexión externa** es la tipografía Montserrat, que se carga desde Google Fonts.
- **"Cómo llegar"** en las entregas copia la dirección en lugar de abrir un servicio de mapas.

## Problemas frecuentes

| Qué pasa | Qué hacer |
|---|---|
| Los datos quedaron en un estado raro después de probar | Reiniciar la demo desde el menú de usuario. |
| Página en blanco o 404 al recargar una pantalla interna en el sitio publicado | Verificar que el deploy use `vercel.json` (los rewrites a `index.html`). |
| Después de un deploy, alguien sigue viendo datos viejos | Si cambió la forma de los datos, subir `ESQUEMA_DATOS`. Si no, alcanza con reiniciar la demo. |
| `npm install` falla | Revisar la versión de Node (`node -v`, mínimo 18.18). |

---

<p>
  <img src="public/brand/levn-logo.svg" alt="" width="18" height="24" />
  Desarrollado por el equipo de <strong>Levn</strong>.
</p>
