import { AlertTriangle, CheckCircle2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import Alert from '../components/Alert'
import Badge from '../components/Badge'
import EmptyState from '../components/EmptyState'
import PageHeader from '../components/PageHeader'
import Panel from '../components/Panel'
import StatCard from '../components/StatCard'
import { ganaderiaService } from '../services/ganaderiaService'
import { getErrorMessage } from '../utils/errors'

function Alertas() {
  const [alertas, setAlertas] = useState<Record<string, any>[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    ganaderiaService.getAlertas()
      .then(setAlertas)
      .catch((error: unknown) => setError(getErrorMessage(error, 'Error al cargar alertas')))
      .finally(() => setLoading(false))
  }, [])

  const resumen = useMemo(() => ({
    criticas: alertas.filter((alerta) => alerta.prioridad === 'CRITICA').length,
    altas: alertas.filter((alerta) => alerta.prioridad === 'ALTA').length,
    stock: alertas.filter((alerta) => alerta.tipo_alerta === 'BAJO_STOCK').length,
  }), [alertas])

  const variant = (prioridad: string) => {
    if (prioridad === 'CRITICA' || prioridad === 'ALTA') return 'red'
    if (prioridad === 'MEDIA') return 'yellow'
    return 'green'
  }

  return (
    <div>
      <PageHeader title="Alertas" description="Prioriza lo urgente: bajo stock, cuentas cercanas, salud, vacunas y tareas pendientes." />

      {error && <Alert type="error" message={error} />}

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard title="Alertas activas" value={alertas.length} icon={<AlertTriangle size={20} />} helper="Pendientes o vistas" />
        <StatCard title="Alta prioridad" value={resumen.criticas + resumen.altas} tone="red" icon={<AlertTriangle size={20} />} helper="Revisar primero" />
        <StatCard title="Bajo stock" value={resumen.stock} tone="yellow" icon={<CheckCircle2 size={20} />} helper="Insumos por reponer" />
      </div>

      <Panel title="Listado de alertas" count={alertas.length}>
        {loading ? (
          <p className="text-sm text-slate-500">Cargando alertas...</p>
        ) : alertas.length === 0 ? (
          <EmptyState title="No hay alertas activas" description="Cuando algo requiera atención aparecerá en este panel." />
        ) : (
          <div className="space-y-3">
            {alertas.map((alerta) => (
              <div key={alerta.id_alerta} className="rounded-lg border border-slate-200 bg-white p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-slate-950">{alerta.titulo}</p>
                      <Badge variant={variant(alerta.prioridad)}>{alerta.prioridad}</Badge>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">{alerta.mensaje}</p>
                    <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      {alerta.tipo_alerta} {alerta.nombre_finca ? `· ${alerta.nombre_finca}` : ''}
                    </p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                    {alerta.fecha_alerta}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  )
}

export default Alertas
