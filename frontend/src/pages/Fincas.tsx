import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'

import {
  createFinca,
  deleteFinca,
  getFincas,
  updateFinca,
} from '../services/fincaService'

import type { Finca } from '../services/fincaService'

import Modal from '../components/Modal'
import Button from '../components/Button'
import PageHeader from '../components/PageHeader'
import EmptyState from '../components/EmptyState'
import Alert from '../components/Alert'

function Fincas() {
  const [fincas, setFincas] = useState<Finca[]>([])

  const [nombre, setNombre] = useState('')
  const [ubicacion, setUbicacion] = useState('')
  const [hectareas, setHectareas] = useState('')

  const [editandoId, setEditandoId] = useState<number | null>(null)
  const [modalAbierto, setModalAbierto] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')

  const cargarFincas = async () => {
    try {
      setLoading(true)
      const data = await getFincas()
      setFincas(data)
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error al cargar fincas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
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
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error al guardar finca')
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
    const confirmar = window.confirm('¿Seguro que deseas eliminar esta finca?')

    if (!confirmar) return

    try {
      await deleteFinca(id)
      setMensaje('Finca eliminada correctamente')
      cargarFincas()
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error al eliminar finca')
    }
  }

  return (
    <div>
      <PageHeader
        title="Fincas"
        description="Administra las fincas registradas en GanadoApp."
        action={
          <Button onClick={abrirModalCrear}>
            Nueva finca
          </Button>
        }
      />

      {error && (
        <Alert type="error" message={error} />
      )}

      {mensaje && (
        <Alert type="success" message={mensaje} />
      )}

      <section className="bg-white rounded-xl shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Listado de fincas
          </h2>

          <span className="text-sm text-gray-500">
            Total: {fincas.length}
          </span>
        </div>

        {loading ? (
          <p className="text-gray-500">Cargando fincas...</p>
        ) : fincas.length === 0 ? (
          <EmptyState
            title="No hay fincas registradas"
            description="Crea tu primera finca para empezar a registrar animales, pesos, vacunas y finanzas."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b text-gray-600">
                  <th className="py-3">Nombre</th>
                  <th>Ubicación</th>
                  <th>Hectáreas</th>
                  <th className="text-right">Acciones</th>
                </tr>
              </thead>

              <tbody>
                {fincas.map((finca) => (
                  <tr key={finca.id_finca} className="border-b hover:bg-gray-50">
                    <td className="py-4 font-medium text-gray-800">
                      {finca.nombre}
                    </td>

                    <td className="text-gray-600">
                      {finca.ubicacion || 'No registrada'}
                    </td>

                    <td className="text-gray-600">
                      {finca.hectareas || 'N/A'}
                    </td>

                    <td className="py-4">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="secondary"
                          onClick={() => handleEditar(finca)}
                        >
                          Editar
                        </Button>

                        <Button
                          variant="danger"
                          onClick={() => handleEliminar(finca.id_finca)}
                        >
                          Eliminar
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <Modal
        isOpen={modalAbierto}
        onClose={cerrarModal}
        title={editandoId ? 'Editar finca' : 'Nueva finca'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nombre de la finca
            </label>

            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
              placeholder="Finca El Paraíso"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Ubicación
            </label>

            <input
              type="text"
              value={ubicacion}
              onChange={(e) => setUbicacion(e.target.value)}
              className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
              placeholder="Villavicencio, Meta"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Hectáreas
            </label>

            <input
              type="number"
              step="0.01"
              value={hectareas}
              onChange={(e) => setHectareas(e.target.value)}
              className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
              placeholder="25.5"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={cerrarModal}
            >
              Cancelar
            </Button>

            <Button type="submit">
              {editandoId ? 'Actualizar finca' : 'Guardar finca'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Fincas