import { useEffect, useState } from 'react'

import Alert from '../components/Alert'
import EmptyState from '../components/EmptyState'
import PageHeader from '../components/PageHeader'
import Panel from '../components/Panel'
import { ganaderiaService } from '../services/ganaderiaService'
import { getErrorMessage } from '../utils/errors'

function Trazabilidad() {
  const [eventos, setEventos] = useState<Record<string, any>[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    ganaderiaService.getEventos()
      .then(setEventos)
      .catch((error: unknown) => setError(getErrorMessage(error, 'Error al cargar trazabilidad')))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <PageHeader
        title="Trazabilidad"
        description="Línea de tiempo de eventos importantes por animal: registros, reproducción, salud, peso, vacunas y movimientos."
      />

      {error && <Alert type="error" message={error} />}

      <Panel title="Eventos de animales" count={eventos.length}>
        {loading ? (
          <p className="text-sm text-slate-500">Cargando trazabilidad...</p>
        ) : eventos.length === 0 ? (
          <EmptyState title="No hay eventos registrados" description="Los eventos se irán creando cuando registres operaciones importantes." />
        ) : (
          <div className="space-y-3">
            {eventos.map((evento) => (
              <div key={evento.id_evento} className="rounded-lg border border-slate-200 bg-white p-4">
                <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="font-semibold text-slate-950">{evento.titulo}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      Animal: {evento.codigo} {evento.nombre_animal || ''} · {evento.tipo_evento}
                    </p>
                    {evento.descripcion && <p className="mt-2 text-sm text-slate-600">{evento.descripcion}</p>}
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                    {evento.fecha_evento}
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

export default Trazabilidad


