# Diseño — fuente de verdad

Copia del canvas "DALAMA CRM" (https://claude.ai/artifact/RgiZQRNc9T9xZa8sXoQxfj) y de su UI kit.

- `pantallas/`: las 13 pantallas del canvas en formato `.dc.html` (12 de escritorio y 3 de celular) y `canvas.json`.
- `ui-kit/`: `tokens.json`, `README.md` (voz, color, tipografía, reglas), `bundle.css` / `bundle.js` (componentes de referencia) e `index.d.ts` (props).
- `logos/`: logo positivo y negativo, isotipo positivo y negativo (PNG con transparencia). No se modifican.

La app no carga estos archivos: los tokens viven en `src/styles/tokens.css`, el CSS del kit en `src/styles/dalama.css` y los componentes en `src/components/ui`.
