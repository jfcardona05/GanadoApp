import { Edit3, MapPin, Plus, Ruler, Search, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'

import Alert from '../components/Alert'
import Button from '../components/Button'
import ConfirmDialog from '../components/ConfirmDialog'
import EmptyState from '../components/EmptyState'
import Modal from '../components/Modal'
import PageHeader from '../components/PageHeader'
import Panel from '../components/Panel'
import StatCard from '../components/StatCard'
import {
  createFinca,
  deleteFinca,
  getFincas,
  updateFinca,
} from '../services/fincaService'
import type { Finca } from '../services/fincaService'
import { getErrorMessage } from '../utils/errors'

function Fincas() {
  const [fincas, setFincas] = useState<Finca[]>([])
  const [nombre, setNombre] = useState('')
  const [ubicacion, setUbicacion] = useState('')
  const [hectareas, setHectareas] = useState('')
  const [editandoId, setEditandoId] = useState<number | null>(null)
  const [modalAbierto, setModalAbierto] = useState(false)
  const [fincaAEliminar, setFincaAEliminar] = useState<number | null>(null)
  const [busqueda, setBusqueda] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')

  const cargarFincas = async () => {
    try {
      setLoading(true)
      const data = await getFincas()
      setFincas(data)
    } catch (error: unknown) {
      setError(getErrorMessage(error, 'Error al cargar fincas'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    cargarFincas()
  }, [])

  const limpiarFormulario = () => {
    setNombre('')
    setUbicacion('')
    setHectareas('')
    setEditandoId(null)
  }

  const abrirModalCrear = () => {
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

    if (!nombre.trim()) {
      setError('El nombre de la finca es obligatorio')
      return
    }

    const fincaData = {
      nombre,
      ubicacion: ubicacion || null,
      hectareas: hectareas ? Number(hectareas) : null,
    }

    try {
      if (editandoId) {
        await updateFinca(editandoId, fincaData)
        setMensaje('Finca actualizada correctamente')
      } else {
        await createFinca(fincaData)
        setMensaje('Finca creada correctamente')
      }

      cerrarModal()
      cargarFincas()
    } catch (error: unknown) {
      setError(getErrorMessage(error, 'Error al guardar finca'))
    }
  }

  const handleEditar = (finca: Finca) => {
    setEditandoId(finca.id_finca)
    setNombre(finca.nombre)
    setUbicacion(finca.ubicacion || '')
    setHectareas(finca.hectareas ? String(finca.hectareas) : '')
    setError('')
    setMensaje('')
    setModalAbierto(true)
  }

  const handleEliminar = async (id: number) => {
    try {
      await deleteFinca(id)
      setMensaje('Finca eliminada correctamente')
      cargarFincas()
    } catch (error: unknown) {
      setError(getErrorMessage(error, 'Error al eliminar finca'))
    }
  }

  const totalHectareas = fincas.reduce((total, finca) => total + Number(finca.hectareas || 0), 0)
  const fincasFiltradas = fincas.filter((finca) => {
    const texto = `${finca.nombre} ${finca.ubicacion || ''}`.toLowerCase()
    return texto.includes(busqueda.toLowerCase())
  })

  return (
    <div>
      <PageHeader
        title="Fincas"
        description="Administra las unidades productivas donde gestionas animales, pesos, vacunas y finanzas."
        action={
          <Button onClick={abrirModalCrear} icon={<Plus size={17} />}>
            Nueva finca
          </Button>
        }
      />

      {error && <Alert type="error" message={error} />}
      {mensaje && <Alert type="success" message={mensaje} />}

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <StatCard title="Fincas registradas" value={fincas.length} icon={<MapPin size={20} />} helper="Predios activos en la cuenta" />
        <StatCard
          title="Hectáreas registradas"
          value={totalHectareas ? totalHectareas.toLocaleString() : 'N/A'}
          icon={<Ruler size={20} />}
          tone="slate"
          helper="Suma de hectáreas informadas"
        />
      </div>

      <Panel title="Listado de fincas" count={fincasFiltradas.length}>
        <div className="mb-4">
          <label className="mb-1 block text-sm font-semibold text-slate-700">Buscar finca</label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="search"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-10"
              placeholder="Nombre o ubicación"
            />
          </div>
        </div>

        {loading ? (
          <p className="text-sm text-slate-500">Cargando fincas...</p>
        ) : fincas.length === 0 ? (
          <EmptyState
            title="No hay fincas registradas"
            description="Crea tu primera finca para empezar a registrar animales, pesos, vacunas y finanzas."
          />
        ) : fincasFiltradas.length === 0 ? (
          <EmptyState title="No encontramos fincas" description="Prueba con otro nombre o ubicación." />
        ) : (
          <>
            <div className="grid gap-3 md:hidden">
              {fincasFiltradas.map((finca) => (
                <div key={finca.id_finca} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md">
                  <p className="font-semibold text-slate-950">{finca.nombre}</p>
                  <p className="mt-1 text-sm text-slate-500">{finca.ubicacion || 'Ubicación no registrada'}</p>
                  <p className="mt-1 text-sm text-slate-500">{finca.hectareas || 'N/A'} hectáreas</p>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <Button variant="secondary" size="sm" icon={<Edit3 size={15} />} onClick={() => handleEditar(finca)}>
                      Editar
                    </Button>
                    <Button variant="danger" size="sm" icon={<Trash2 size={15} />} onClick={() => setFincaAEliminar(finca.id_finca)}>
                      Eliminar
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="hidden overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm md:block">
              <table className="w-full min-w-[680px] text-left">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Ubicación</th>
                    <th>Hectáreas</th>
                    <th className="text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {fincasFiltradas.map((finca) => (
                    <tr key={finca.id_finca} className="hover:bg-slate-50">
                      <td className="font-semibold text-slate-900">{finca.nombre}</td>
                      <td className="text-slate-600">{finca.ubicacion || 'No registrada'}</td>
                      <td className="text-slate-600">{finca.hectareas || 'N/A'}</td>
                      <td>
                        <div className="flex justify-end gap-2">
                          <Button variant="secondary" size="sm" icon={<Edit3 size={15} />} onClick={() => handleEditar(finca)}>
                            Editar
                          </Button>
                          <Button variant="danger" size="sm" icon={<Trash2 size={15} />} onClick={() => setFincaAEliminar(finca.id_finca)}>
                            Eliminar
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </Panel>

      <Modal isOpen={modalAbierto} onClose={cerrarModal} title={editandoId ? 'Editar finca' : 'Nueva finca'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700">Nombre de la finca</label>
            <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} className="mt-1 w-full" placeholder="Finca El Paraíso" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700">Ubicación</label>
            <input type="text" value={ubicacion} onChange={(e) => setUbicacion(e.target.value)} className="mt-1 w-full" placeholder="Villavicencio, Meta" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700">Hectáreas</label>
            <input type="number" step="0.01" value={hectareas} onChange={(e) => setHectareas(e.target.value)} className="mt-1 w-full" placeholder="25.5" />
          </div>
          <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
            <Button type="button" variant="secondary" onClick={cerrarModal}>Cancelar</Button>
            <Button type="submit">{editandoId ? 'Actualizar finca' : 'Guardar finca'}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={fincaAEliminar !== null}
        title="Eliminar finca"
        message="Vas a eliminar esta finca. Si tiene animales o movimientos asociados, el sistema podría impedir la eliminación para proteger tus datos."
        onCancel={() => setFincaAEliminar(null)}
        onConfirm={() => {
          if (fincaAEliminar !== null) {
            handleEliminar(fincaAEliminar)
            setFincaAEliminar(null)
          }
        }}
      />
    </div>
  )
}

export default Fincas
