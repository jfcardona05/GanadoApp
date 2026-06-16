import { CalendarDays, Plus, Scale, Search, Trash2, TrendingUp } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'

import Alert from '../components/Alert'
import Badge from '../components/Badge'
import Button from '../components/Button'
import ConfirmDialog from '../components/ConfirmDialog'
import EmptyState from '../components/EmptyState'
import Modal from '../components/Modal'
import PageHeader from '../components/PageHeader'
import Panel from '../components/Panel'
import StatCard from '../components/StatCard'
import { getAnimales } from '../services/animalService'
import type { Animal } from '../services/animalService'
import { createPeso, deletePeso, getPesos } from '../services/pesoService'
import type { RegistroPeso } from '../services/pesoService'
import { getErrorMessage } from '../utils/errors'

function Pesos() {
  const [animales, setAnimales] = useState<Animal[]>([])
  const [pesos, setPesos] = useState<RegistroPeso[]>([])
  const [idAnimal, setIdAnimal] = useState('')
  const [peso, setPeso] = useState('')
  const [fechaRegistro, setFechaRegistro] = useState('')
  const [observaciones, setObservaciones] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [animalFiltro, setAnimalFiltro] = useState('')
  const [modalAbierto, setModalAbierto] = useState(false)
  const [pesoAEliminar, setPesoAEliminar] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')

  const cargarDatos = async () => {
    try {
      setLoading(true)
      const [animalesData, pesosData] = await Promise.all([getAnimales(), getPesos()])
      setAnimales(animalesData)
      setPesos(pesosData)
    } catch (error: unknown) {
      setError(getErrorMessage(error, 'Error al cargar control de peso'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    cargarDatos()
  }, [])

  const limpiarFormulario = () => {
    setIdAnimal('')
    setPeso('')
    setFechaRegistro('')
    setObservaciones('')
  }

  const abrirModal = () => {
    limpiarFormulario()
    setError('')
    setMensaje('')
    setModalAbierto(true)
  }

  const cerrarModal = () => {
    setModalAbierto(false)
    limpiarFormulario()
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setMensaje('')

    if (!idAnimal || !peso || !fechaRegistro) {
      setError('Animal, peso y fecha son obligatorios')
      return
    }

    if (Number(peso) <= 0) {
      setError('El peso debe ser mayor a cero')
      return
    }

    try {
      await createPeso({
        id_animal: Number(idAnimal),
        peso: Number(peso),
        fecha_registro: fechaRegistro,
        observaciones: observaciones || null,
      })

      setMensaje('Peso registrado correctamente')
      cerrarModal()
      cargarDatos()
    } catch (error: unknown) {
      setError(getErrorMessage(error, 'Error al registrar peso'))
    }
  }

  const handleEliminar = async (id: number) => {
    try {
      await deletePeso(id)
      setMensaje('Registro de peso eliminado correctamente')
      cargarDatos()
    } catch (error: unknown) {
      setError(getErrorMessage(error, 'Error al eliminar registro'))
    }
  }

  const obtenerAnimalSeleccionado = () => {
    return animales.find((animal) => animal.id_animal === Number(idAnimal))
  }

  const pesosFiltrados = pesos.filter((registro) => {
    const texto = `${registro.nombre_animal || ''} ${registro.codigo_animal} ${registro.nombre_finca || ''} ${registro.observaciones || ''}`.toLowerCase()
    const coincideBusqueda = texto.includes(busqueda.toLowerCase())
    const coincideAnimal = animalFiltro ? registro.id_animal === Number(animalFiltro) : true
    return coincideBusqueda && coincideAnimal
  })

  const totalRegistros = pesos.length
  const ultimoPeso = pesos.length > 0 ? pesos[0] : null
  const pesoPromedio = pesos.length > 0
    ? pesos.reduce((total, registro) => total + Number(registro.peso), 0) / pesos.length
    : 0

  return (
    <div>
      <PageHeader
        title="Control de peso"
        description="Registra y consulta la evolución de peso del ganado por animal y finca."
        action={<Button onClick={abrirModal} icon={<Plus size={17} />}>Registrar peso</Button>}
      />

      {error && <Alert type="error" message={error} />}
      {mensaje && <Alert type="success" message={mensaje} />}

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard title="Registros de peso" value={totalRegistros} icon={<Scale size={20} />} />
        <StatCard title="Peso promedio" value={pesoPromedio ? `${pesoPromedio.toFixed(1)} kg` : 'N/A'} icon={<TrendingUp size={20} />} />
        <StatCard title="Último registro" value={ultimoPeso ? `${ultimoPeso.peso} kg` : 'N/A'} icon={<CalendarDays size={20} />} tone="slate" />
      </div>

      <Panel title="Historial de peso" count={pesosFiltrados.length}>
        <div className="mb-4 grid gap-3 md:grid-cols-[1fr_260px]">
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">Buscar registro</label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="search"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-10"
                placeholder="Animal, código, finca u observación"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">Animal</label>
            <select value={animalFiltro} onChange={(e) => setAnimalFiltro(e.target.value)} className="w-full">
              <option value="">Todos</option>
              {animales.map((animal) => (
                <option key={animal.id_animal} value={animal.id_animal}>
                  {animal.codigo} - {animal.nombre || 'Sin nombre'}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <p className="text-sm text-slate-500">Cargando registros de peso...</p>
        ) : pesos.length === 0 ? (
          <EmptyState title="No hay registros de peso" description="Cuando registres un animal con peso inicial, se generará automáticamente el primer control de peso." />
        ) : pesosFiltrados.length === 0 ? (
          <EmptyState title="No encontramos registros" description="Prueba con otro animal o búsqueda." />
        ) : (
          <>
            <div className="grid gap-3 md:hidden">
              {pesosFiltrados.map((registro) => (
                <div key={registro.id_peso} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-950">{registro.nombre_animal || registro.codigo_animal}</p>
                      <p className="mt-1 text-sm text-slate-500">{registro.nombre_finca || 'Sin finca'} · {registro.fecha_registro?.slice(0, 10)}</p>
                      <p className="mt-1 text-sm text-slate-500">{registro.observaciones || 'Sin observaciones'}</p>
                    </div>
                    <Badge variant="green">{registro.peso} kg</Badge>
                  </div>
                  <div className="mt-4">
                    <Button variant="danger" size="sm" icon={<Trash2 size={15} />} onClick={() => setPesoAEliminar(registro.id_peso)}>
                      Eliminar
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="hidden overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm md:block">
              <table className="w-full min-w-[860px] text-left">
                <thead>
                  <tr>
                    <th>Animal</th>
                    <th>Peso</th>
                    <th>Fecha</th>
                    <th>Finca</th>
                    <th>Observaciones</th>
                    <th className="text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {pesosFiltrados.map((registro) => (
                    <tr key={registro.id_peso} className="hover:bg-slate-50">
                      <td className="font-semibold text-slate-900">{registro.nombre_animal || registro.codigo_animal}</td>
                      <td><Badge variant="green">{registro.peso} kg</Badge></td>
                      <td className="text-slate-600">{registro.fecha_registro?.slice(0, 10)}</td>
                      <td className="text-slate-600">{registro.nombre_finca || 'N/A'}</td>
                      <td className="max-w-xs truncate text-slate-600">{registro.observaciones || 'N/A'}</td>
                      <td><div className="flex justify-end"><Button variant="danger" size="sm" icon={<Trash2 size={15} />} onClick={() => setPesoAEliminar(registro.id_peso)}>Eliminar</Button></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </Panel>

      <Modal isOpen={modalAbierto} onClose={cerrarModal} title="Registrar peso">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700">Animal</label>
            <select value={idAnimal} onChange={(e) => setIdAnimal(e.target.value)} className="mt-1 w-full">
              <option value="">Seleccionar animal</option>
              {animales.map((animal) => <option key={animal.id_animal} value={animal.id_animal}>{animal.codigo} - {animal.nombre || 'Sin nombre'}</option>)}
            </select>
          </div>

          {idAnimal && obtenerAnimalSeleccionado() && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
              Peso actual registrado del animal: <strong>{obtenerAnimalSeleccionado()?.peso_actual || 'N/A'} kg</strong>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-slate-700">Nuevo peso kg</label>
            <input type="number" step="0.01" value={peso} onChange={(e) => setPeso(e.target.value)} className="mt-1 w-full" placeholder="480.5" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700">Fecha de registro</label>
            <input type="date" value={fechaRegistro} onChange={(e) => setFechaRegistro(e.target.value)} className="mt-1 w-full" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700">Observaciones</label>
            <textarea value={observaciones} onChange={(e) => setObservaciones(e.target.value)} className="mt-1 w-full" placeholder="Peso registrado después de control mensual" rows={3} />
          </div>
          <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
            <Button type="button" variant="secondary" onClick={cerrarModal}>Cancelar</Button>
            <Button type="submit">Guardar peso</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={pesoAEliminar !== null}
        title="Eliminar registro de peso"
        message="Vas a eliminar este control de peso. Esta acción no se puede deshacer."
        onCancel={() => setPesoAEliminar(null)}
        onConfirm={() => {
          if (pesoAEliminar !== null) {
            handleEliminar(pesoAEliminar)
            setPesoAEliminar(null)
          }
        }}
      />
    </div>
  )
}

export default Pesos
