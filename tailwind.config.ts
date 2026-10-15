import type { Config } from 'tailwindcss';

/**
 * Tokens del UI kit DALAMA (design/ui-kit/tokens.json).
 * Los valores viven como variables CSS en src/styles/tokens.css; acá solo se exponen a Tailwind.
 * El espaciado usa la escala por defecto de Tailwind, que ya es base 4 (1 = 4px … 12 = 48px).
 */
const v = (name: string) => `var(--${name})`;

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    screens: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1440px',
    },
    extend: {
      colors: {
        // Marca
        'rojo-dalama': v('rojo-dalama'),
        'bold-red': v('bold-red'),
        'dark-brick': v('dark-brick'),
        'ink-black': v('ink-black'),
        sandstone: v('sandstone'),
        rojo: {
          50: v('rojo-50'), 100: v('rojo-100'), 300: v('rojo-300'), 500: v('rojo-500'),
          600: v('rojo-600'), 700: v('rojo-700'), 900: v('rojo-900'),
        },
        arena: {
          50: v('arena-50'), 100: v('arena-100'), 200: v('arena-200'), 300: v('arena-300'),
          500: v('arena-500'), 700: v('arena-700'),
        },
        neutro: {
          0: v('neutro-0'), 100: v('neutro-100'), 300: v('neutro-300'), 500: v('neutro-500'),
          700: v('neutro-700'), 900: v('neutro-900'),
        },
        // Semánticos
        exito: { DEFAULT: v('exito'), suave: v('exito-suave') },
        advertencia: { DEFAULT: v('advertencia'), texto: v('advertencia-texto'), suave: v('advertencia-suave') },
        error: { DEFAULT: v('error'), suave: v('error-suave') },
        info: { DEFAULT: v('info'), suave: v('info-suave') },
        // Alias de uso
        fondo: v('fondo'),
        superficie: { DEFAULT: v('superficie'), destacada: v('superficie-destacada') },
        texto: { DEFAULT: v('texto'), secundario: v('texto-secundario') },
        borde: { DEFAULT: v('borde'), control: v('borde-control') },
        accion: { DEFAULT: v('accion'), hover: v('accion-hover') },
        foco: { DEFAULT: v('foco'), oscuro: v('foco-oscuro') },
        'barra-lateral': v('barra-lateral'),
      },
      fontFamily: {
        sans: ['Montserrat', '"Segoe UI"', 'Arial', 'sans-serif'],
      },
      fontSize: {
        display: ['32px', { lineHeight: '40px', fontWeight: '700' }],
        h1: ['24px', { lineHeight: '32px', fontWeight: '600' }],
        h2: ['20px', { lineHeight: '28px', fontWeight: '600' }],
        h3: ['16px', { lineHeight: '24px', fontWeight: '600' }],
        overline: ['12px', { lineHeight: '16px', fontWeight: '600', letterSpacing: '0.12em' }],
        body: ['14px', { lineHeight: '20px' }],
        'body-small': ['13px', { lineHeight: '18px' }],
        caption: ['12px', { lineHeight: '16px', fontWeight: '500' }],
      },
      borderRadius: {
        none: '0px',
        sm: v('radius-sm'),
        DEFAULT: v('radius-sm'),
        md: v('radius-md'),
      },
      boxShadow: {
        1: v('sombra-1'),
        2: v('sombra-2'),
      },
      width: {
        sidebar: '248px',
        'sidebar-colapsada': '72px',
      },
      keyframes: {
        'dl-in': { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'none' } },
        'dl-fade': { from: { opacity: '0' }, to: { opacity: '1' } },
        'dl-slide': { from: { transform: 'translateX(-100%)' }, to: { transform: 'none' } },
        'dl-pulse': { '0%,100%': { opacity: '1' }, '50%': { opacity: '.45' } },
      },
      animation: {
        'dl-in': 'dl-in .18s ease-out',
        'dl-fade': 'dl-fade .15s ease-out',
        'dl-slide': 'dl-slide .2s ease-out',
        'dl-pulse': 'dl-pulse 1.4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
