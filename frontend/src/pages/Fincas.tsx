import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'

import {
  createFinca,
  deleteFinca,
  getFincas,
  updateFinca,
} from '../services/fincaService'

import type { Finca } from '../services/fincaService'

function Fincas() {
  const [fincas, setFincas] = useState<Finca[]>([])
  const [nombre, setNombre] = useState('')
  const [ubicacion, setUbicacion] = useState('')
  const [hectareas, setHectareas] = useState('')

  const [editandoId, setEditandoId] = useState<number | null>(null)
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

      limpiarFormulario()
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
    setMensaje('')
    setError('')
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
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          Fincas
        </h1>
        <p className="text-gray-500 mt-1">
          Administra las fincas registradas en GanadoApp.
        </p>
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-4">
          {error}
        </div>
      )}

      {mensaje && (
        <div className="bg-green-100 text-green-700 p-4 rounded-lg mb-4">
          {mensaje}
        </div>
      )}

      <section className="bg-white rounded-xl shadow p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          {editandoId ? 'Editar finca' : 'Registrar finca'}
        </h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nombre
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

          <div className="flex items-end gap-2">
            <button
              type="submit"
              className="bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-lg w-full"
            >
              {editandoId ? 'Actualizar' : 'Guardar'}
            </button>

            {editandoId && (
              <button
                type="button"
                onClick={limpiarFormulario}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Listado de fincas
        </h2>

        {loading ? (
          <p className="text-gray-500">Cargando fincas...</p>
        ) : fincas.length === 0 ? (
          <p className="text-gray-500">No hay fincas registradas.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b text-gray-600">
                  <th className="py-2">Nombre</th>
                  <th>Ubicación</th>
                  <th>Hectáreas</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {fincas.map((finca) => (
                  <tr key={finca.id_finca} className="border-b">
                    <td className="py-3 font-medium">
                      {finca.nombre}
                    </td>
                    <td>
                      {finca.ubicacion || 'No registrada'}
                    </td>
                    <td>
                      {finca.hectareas || 'N/A'}
                    </td>
                    <td className="flex gap-2 py-3">
                      <button
                        onClick={() => handleEditar(finca)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-sm"
                      >
                        Editar
                      </button>

                      <button
                        onClick={() => handleEliminar(finca.id_finca)}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg text-sm"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}

export default Fincas