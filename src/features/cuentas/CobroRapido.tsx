import { useEffect, useState } from 'react';
import { Select, Sheet } from '@/components/ui';
import { formatARS } from '@/lib/format';
import { useDemo } from '@/store/demo';
import { useDerivados } from '@/store/selectores';
import { RegistrarCobro } from './RegistrarCobro';

/** Panel lateral para registrar un cobro eligiendo el cliente (desde el inicio o el listado de cuentas). */
export function CobroRapido({ open, onClose, clienteId }: { open: boolean; onClose: () => void; clienteId?: string }) {
  const clientes = useDemo((s) => s.datos.clientes);
  const der = useDerivados();
  const conSaldo = [...clientes].filter((c) => der.cuentas.get(c.id)!.saldo > 0).sort((a, b) => der.cuentas.get(b.id)!.vencido - der.cuentas.get(a.id)!.vencido || a.razonSocial.localeCompare(b.razonSocial));
  const [id, setId] = useState(clienteId ?? conSaldo[0]?.id);
  useEffect(() => { if (open && clienteId) setId(clienteId); }, [open, clienteId]);
  const cliente = id ? der.clientePorId.get(id) : undefined;

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()} overline="Cobranzas" title="Registrar cobro">
      <div className="flex flex-col gap-5">
        <Select
          label="Cliente"
          value={id}
          onChange={(e) => setId(e.target.value)}
          options={conSaldo.map((c) => {
            const r = der.cuentas.get(c.id)!;
            return { value: c.id, label: `${c.razonSocial} · ${formatARS(r.saldo)}${r.vencido ? ' · con vencido' : ''}` };
          })}
          helper="Se muestran los clientes con saldo, primero los que tienen deuda vencida."
        />
        {cliente && <RegistrarCobro key={cliente.id} cliente={cliente} onListo={onClose} />}
      </div>
    </Sheet>
  );
}
