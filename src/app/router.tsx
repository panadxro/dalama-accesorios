import { lazy, type ReactNode } from 'react';
import { createBrowserRouter, Navigate, useLocation } from 'react-router-dom';
import { useUi } from '@/store/ui';
import { AppLayout } from './layout/AppLayout';
import BienvenidaPage from '@/features/bienvenida/pages/BienvenidaPage';

// Cada módulo se carga por separado: mientras llega se ve el esqueleto de carga.
const InicioPage = lazy(() => import('@/features/inicio/pages/InicioPage'));
const WhatsAppPage = lazy(() => import('@/features/whatsapp/pages/WhatsAppPage'));
const PresupuestosPage = lazy(() => import('@/features/presupuestos/pages/PresupuestosPage'));
const NuevoPresupuestoPage = lazy(() => import('@/features/presupuestos/pages/NuevoPresupuestoPage'));
const PresupuestoDetallePage = lazy(() => import('@/features/presupuestos/pages/PresupuestoDetallePage'));
const PedidosPage = lazy(() => import('@/features/pedidos/pages/PedidosPage'));
const PedidoDetallePage = lazy(() => import('@/features/pedidos/pages/PedidoDetallePage'));
const EntregasHoyPage = lazy(() => import('@/features/pedidos/pages/EntregasHoyPage'));
const FacturacionPage = lazy(() => import('@/features/facturacion/pages/FacturacionPage'));
const EmitirFacturaPage = lazy(() => import('@/features/facturacion/pages/EmitirFacturaPage'));
const ComprobantePage = lazy(() => import('@/features/facturacion/pages/ComprobantePage'));
const ClientesPage = lazy(() => import('@/features/clientes/pages/ClientesPage'));
const ClienteDetallePage = lazy(() => import('@/features/clientes/pages/ClienteDetallePage'));
const CuentasPage = lazy(() => import('@/features/cuentas/pages/CuentasPage'));
const CuentaClientePage = lazy(() => import('@/features/cuentas/pages/CuentaClientePage'));
const ChequesPage = lazy(() => import('@/features/cuentas/pages/ChequesPage'));
const ProductosPage = lazy(() => import('@/features/productos/pages/ProductosPage'));
const StockPage = lazy(() => import('@/features/stock/pages/StockPage'));
const ConteoPage = lazy(() => import('@/features/stock/pages/ConteoPage'));
const ComprasPage = lazy(() => import('@/features/compras/pages/ComprasPage'));
const ListaPedidoPage = lazy(() => import('@/features/compras/pages/ListaPedidoPage'));
const ReportesPage = lazy(() => import('@/features/reportes/pages/ReportesPage'));
const ConfiguracionPage = lazy(() => import('@/features/configuracion/pages/ConfiguracionPage'));
const BusquedaPage = lazy(() => import('@/features/busqueda/pages/BusquedaPage'));
const NoEncontradaPage = lazy(() => import('@/features/sistema/pages/NoEncontradaPage'));

/** Páginas de revisión del equipo (/kit y /kit/datos): solo en desarrollo; el build de producción las descarta. */
function rutasDeRevision() {
  if (!import.meta.env.DEV) return [];
  const KitPage = lazy(() => import('@/features/sistema/pages/KitPage'));
  const DatosPage = lazy(() => import('@/features/sistema/pages/DatosPage'));
  return [{ path: '/kit', element: <KitPage /> }, { path: '/kit/datos', element: <DatosPage /> }];
}

/** Sin login real: si Laura no entró desde la bienvenida, vuelve ahí. */
function RequiereSesion({ children }: { children: ReactNode }) {
  const sesion = useUi((s) => s.sesionIniciada);
  const location = useLocation();
  if (!sesion) return <Navigate to="/" replace state={{ desde: location.pathname }} />;
  return <>{children}</>;
}

export const router = createBrowserRouter([
  { path: '/', element: <BienvenidaPage /> },
  {
    element: (
      <RequiereSesion>
        <AppLayout />
      </RequiereSesion>
    ),
    children: [
      { path: '/inicio', element: <InicioPage /> },
      { path: '/whatsapp', element: <WhatsAppPage /> },
      { path: '/whatsapp/:conversacionId', element: <WhatsAppPage /> },
      { path: '/presupuestos', element: <PresupuestosPage /> },
      { path: '/presupuestos/nuevo', element: <NuevoPresupuestoPage /> },
      { path: '/presupuestos/:id', element: <PresupuestoDetallePage /> },
      { path: '/pedidos', element: <PedidosPage /> },
      { path: '/pedidos/:id', element: <PedidoDetallePage /> },
      { path: '/entregas', element: <EntregasHoyPage /> },
      { path: '/facturacion', element: <FacturacionPage /> },
      { path: '/facturacion/nueva', element: <EmitirFacturaPage /> },
      { path: '/facturacion/:id', element: <ComprobantePage /> },
      { path: '/clientes', element: <ClientesPage /> },
      { path: '/clientes/:id', element: <ClienteDetallePage /> },
      { path: '/cuentas', element: <CuentasPage /> },
      { path: '/cuentas/cheques', element: <ChequesPage /> },
      { path: '/cuentas/:clienteId', element: <CuentaClientePage /> },
      { path: '/productos', element: <ProductosPage /> },
      { path: '/stock', element: <StockPage /> },
      { path: '/stock/conteo', element: <ConteoPage /> },
      { path: '/compras', element: <ComprasPage /> },
      { path: '/compras/lista', element: <ListaPedidoPage /> },
      { path: '/reportes', element: <ReportesPage /> },
      { path: '/configuracion', element: <ConfiguracionPage /> },
      { path: '/buscar', element: <BusquedaPage /> },
      ...rutasDeRevision(),
      { path: '*', element: <NoEncontradaPage /> },
    ],
  },
], {
  future: {
    v7_relativeSplatPath: true,
    v7_fetcherPersist: true,
    v7_normalizeFormMethod: true,
    v7_partialHydration: true,
    v7_skipActionErrorRevalidation: true,
  },
});
