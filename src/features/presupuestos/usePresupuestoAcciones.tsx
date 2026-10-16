import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { ConfirmModal, Dialog } from '@/components/ui/Dialog';
import { Select } from '@/components/ui/Input';
import { toast } from '@/components/ui/Toast';
import { EnviarWhatsApp } from '@/components/negocio/EnviarWhatsApp';
import { EntregaForm } from '@/components/negocio/EntregaForm';
import { completarPlantilla, METODO_ENTREGA, totales } from '@/domain/calculos';
import type { Entrega, Presupuesto } from '@/domain/types';
import { formatARS, formatFecha, formatHora } from '@/lib/format';
import { deISO, diasEntre } from '@/lib/fechas';
import { interpretarPedido } from '@/services/ia/interpretarPedido';
import { convertirEnPedido, ejecutar, entregaSugerida, enviarPresupuesto, responderPresupuesto } from '@/store/acciones';
import { datosActuales } from '@/store/demo';

const MOTIVOS = ['Le resultó caro', 'Compró en otro lado', 'Se postergó la obra', 'Pidió otra línea', 'Sin motivo'];

/** "mañana jueves 16/10" / "hoy" / "el lunes 20/10" */
export function cuandoTexto(iso: string): string {
  const d = diasEntre(new Date(), iso);
  const f = formatFecha(iso).slice(0, 5);
  const dia = deISO(iso).toLocaleDateString('es-AR', { weekday: 'long' });
  if (d === 0) return `hoy ${f}`;
  if (d === 1) return `mañana ${dia} ${f}`;
  return `el ${dia} ${f}`;
}

/**
 * Acciones de un presupuesto con sus diálogos: enviar por WhatsApp, registrar la respuesta del cliente
 * y convertir en pedido. Cada una explica su efecto con un toast.
 */
export function usePresupuestoAcciones(p: Presupuesto | undefined) {
  const navigate = useNavigate();
  const [enviar, setEnviar] = useState(false);
  const [convertir, setConvertir] = useState(false);
  const [rechazar, setRechazar] = useState(false);
  const [motivo, setMotivo] = useState(MOTIVOS[0]);
  const [entrega, setEntrega] = useState<Entrega | null>(null);

  const d = datosActuales();
  const cliente = p ? d.clientes.find((c) => c.id === p.clienteId) : undefined;
  const total = p ? totales(p.renglones.filter((r) => r.productoId), p.descuentoPct, d.ajustes.ivaPct).total : 0;

  const textoEnvio = () => {
    if (!p || !cliente) return '';
    const plantilla = d.plantillas.find((x) => x.uso === 'presupuesto')!;
    return completarPlantilla(plantilla.cuerpo, {
      contacto: cliente.contacto.split(' ')[0],
      numero: p.numero,
      total: formatARS(total),
      vence: formatFecha(p.estado === 'borrador' ? p.validoHasta : new Date(Date.now() + d.ajustes.validezPresupuestoDias * 86_400_000)),
    });
  };

  const abrirConvertir = () => {
    if (!p || !cliente) return;
    // Pistas de entrega del mensaje original ("para mañana", "paso a retirar").
    const conv = p.conversacionId ? d.conversaciones.find((c) => c.id === p.conversacionId) : undefined;
    const texto = conv?.mensajes.filter((m) => m.de === 'cliente').map((m) => m.texto).join('\n') ?? '';
    setEntrega(entregaSugerida(cliente, texto ? interpretarPedido(texto, []).entrega : undefined));
    setConvertir(true);
  };

  const simularRespuesta = (respuesta: 'acepta' | 'rechaza') => {
    if (!p || !cliente) return;
    const nombre = cliente.contacto.split(' ')[0];
    const mensaje = respuesta === 'acepta' ? 'Dale, va. Confirmame cuando sale. Gracias!' : 'Gracias Dario, por ahora lo dejo. Cualquier cosa te aviso';
    ejecutar((x) => responderPresupuesto(x, p.id, respuesta, { mensaje: p.conversacionId ? mensaje : undefined, motivo: respuesta === 'rechaza' ? 'Se postergó la obra' : undefined }));
    if (respuesta === 'acepta') {
      toast.show({
        tone: 'success',
        title: `${nombre} aceptó el presupuesto ${p.numero}`,
        description: 'Pasó a Aceptado. El siguiente paso es convertirlo en pedido para reservar el stock y programar la entrega.',
        action: { label: 'Convertir en pedido', onClick: abrirConvertir },
      });
    } else {
      toast.info(`${nombre} rechazó el presupuesto ${p.numero}`, 'Pasó a Rechazado y dejó de contar en los pendientes. El motivo queda para los reportes.');
    }
  };

  const dialogos = p && cliente ? (
    <>
      <EnviarWhatsApp
        open={enviar}
        onClose={() => setEnviar(false)}
        titulo={p.estado === 'borrador' ? `Enviar presupuesto ${p.numero}` : `Reenviar presupuesto ${p.numero}`}
        destinatario={`${cliente.contacto} · ${cliente.razonSocial}`}
        telefono={cliente.telefono}
        textoInicial={textoEnvio()}
        adjunto={`Presupuesto ${p.numero}.pdf`}
        onEnviado={(texto) => {
          setEnviar(false);
          const reenvio = p.estado !== 'borrador';
          ejecutar((x) => enviarPresupuesto(x, p.id, 'whatsapp', texto));
          toast.success(
            `Presupuesto ${p.numero} ${reenvio ? 'reenviado' : 'enviado'}`,
            `${cliente.razonSocial} lo recibió por WhatsApp · ${formatARS(total)}. Pasó a Enviado${p.recordatorio.activo ? ` y, si no responde en ${p.recordatorio.dias} días, te lo recordamos` : ''}.`,
          );
        }}
      />

      <ConfirmModal
        open={rechazar}
        title={`¿Marcar ${p.numero} como rechazado?`}
        confirmLabel="Marcar como rechazado"
        destructive
        onCancel={() => setRechazar(false)}
        onConfirm={() => {
          setRechazar(false);
          ejecutar((x) => responderPresupuesto(x, p.id, 'rechaza', { motivo }));
          toast.info(`Presupuesto ${p.numero} rechazado`, `Motivo: ${motivo.toLowerCase()}. Deja de contar en los pendientes de respuesta.`);
        }}
      >
        <span className="mb-3 block">El motivo se usa en los reportes para entender por qué no se cierran ventas.</span>
        <Select label="Motivo" value={motivo} onChange={(e) => setMotivo(e.target.value)} options={MOTIVOS} />
      </ConfirmModal>

      {entrega && (
        <Dialog
          open={convertir}
          onOpenChange={(o) => !o && setConvertir(false)}
          overline={`Desde el presupuesto ${p.numero}`}
          title="Convertir en pedido"
          description={`Se reservan los productos del stock, el presupuesto pasa a Aceptado y se crea el pedido PED-${String(d.secuencias.pedido).padStart(4, '0')} para ${cliente.razonSocial}.`}
          width={560}
          footer={
            <>
              <Button variant="secondary" onClick={() => setConvertir(false)}>Volver</Button>
              <Button
                icon="package"
                onClick={() => {
                  setConvertir(false);
                  const pedido = ejecutar((x) => convertirEnPedido(x, p.id, entrega));
                  const unidades = pedido.renglones.reduce((a, r) => a + r.cantidad, 0);
                  toast.show({
                    tone: 'success',
                    title: `Pedido ${pedido.numero} creado`,
                    description: `Se reservaron ${unidades} unidades del stock y quedó programado para ${cuandoTexto(pedido.entrega.fecha)} a las ${formatHora(pedido.entrega.fecha)} (${METODO_ENTREGA[pedido.entrega.metodo].toLowerCase()}). Siguiente paso: facturar.`,
                    action: { label: 'Ver pedido', onClick: () => navigate(`/pedidos/${pedido.id}`) },
                  });
                }}
              >
                Crear pedido
              </Button>
            </>
          }
        >
          <EntregaForm entrega={entrega} onChange={setEntrega} direccionCliente={`${cliente.direccion}, ${cliente.localidad}`} />
        </Dialog>
      )}
    </>
  ) : null;

  return {
    abrirEnvio: () => setEnviar(true),
    abrirConvertir,
    abrirRechazo: () => setRechazar(true),
    simularRespuesta,
    aceptarManual: () => {
      if (!p) return;
      ejecutar((x) => responderPresupuesto(x, p.id, 'acepta'));
      toast.success(`Presupuesto ${p.numero} aceptado`, 'Ahora podés convertirlo en pedido para reservar el stock.');
    },
    dialogos,
  };
}
