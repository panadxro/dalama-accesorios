import type { IconName } from '@/components/ui/Icon';

export interface NavItem {
  id: string;
  label: string;
  icon: IconName;
  to: string;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

/** Navegación principal, tal como la define el diseño (design/pantallas/Main.dc.html). */
export const NAV: NavGroup[] = [
  {
    label: 'Operación',
    items: [
      { id: 'inicio', label: 'Inicio', icon: 'home', to: '/inicio' },
      { id: 'bandeja', label: 'Bandeja WhatsApp', icon: 'message', to: '/whatsapp' },
      { id: 'presupuestos', label: 'Presupuestos', icon: 'file-text', to: '/presupuestos' },
      { id: 'pedidos', label: 'Pedidos y entregas', icon: 'truck', to: '/pedidos' },
    ],
  },
  {
    label: 'Administración',
    items: [
      { id: 'facturacion', label: 'Facturación', icon: 'receipt', to: '/facturacion' },
      { id: 'clientes', label: 'Clientes', icon: 'users', to: '/clientes' },
      { id: 'cuentas', label: 'Cuentas corrientes', icon: 'wallet', to: '/cuentas' },
    ],
  },
  {
    label: 'Catálogo',
    items: [
      { id: 'productos', label: 'Productos y precios', icon: 'tag', to: '/productos' },
      { id: 'stock', label: 'Stock', icon: 'boxes', to: '/stock' },
      { id: 'compras', label: 'Compras', icon: 'cart', to: '/compras' },
    ],
  },
  {
    label: 'Análisis',
    items: [
      { id: 'reportes', label: 'Reportes', icon: 'chart', to: '/reportes' },
      { id: 'configuracion', label: 'Configuración', icon: 'settings', to: '/configuracion' },
    ],
  },
];

/** Navegación inferior en celular (diseño: pantallas móviles). */
export const NAV_MOVIL: NavItem[] = [
  { id: 'inicio', label: 'Inicio', icon: 'home', to: '/inicio' },
  { id: 'bandeja', label: 'Bandeja', icon: 'message', to: '/whatsapp' },
  { id: 'pedidos', label: 'Pedidos', icon: 'package', to: '/pedidos' },
  { id: 'entregas', label: 'Entregas', icon: 'truck', to: '/entregas' },
  { id: 'conteo', label: 'Stock', icon: 'boxes', to: '/stock/conteo' },
];

/** Ítem activo de la barra lateral según la ruta. */
export function navActivo(pathname: string): string | undefined {
  if (pathname.startsWith('/entregas')) return 'pedidos';
  for (const g of NAV) for (const it of g.items) if (pathname === it.to || pathname.startsWith(`${it.to}/`)) return it.id;
  return undefined;
}

/** Ítem activo de la barra inferior según la ruta. */
export function navMovilActivo(pathname: string): string | undefined {
  if (pathname.startsWith('/stock')) return 'conteo';
  for (const it of NAV_MOVIL) if (pathname === it.to || pathname.startsWith(`${it.to}/`)) return it.id;
  return undefined;
}
