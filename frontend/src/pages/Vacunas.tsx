import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'

import { getAnimales } from '../services/animalService'
import type { Animal } from '../services/animalService'

import {
  createVacuna,
  deleteVacuna,
  getVacunas,
  updateVacuna,
} from '../services/vacunaService'
import type { Vacuna } from '../services/vacunaService'

import {
  createRegistroVacunacion,
  deleteRegistroVacunacion,
  getRegistrosVacunacion,
} from '../services/registroVacunacionService'
import type { RegistroVacunacion } from '../services/registroVacunacionService'

function Vacunas() {
  const [vacunas, setVacunas] = useState<Vacuna[]>([])
  const [animales, setAnimales] = useState<Animal[]>([])
  const [registros, setRegistros] = useState<RegistroVacunacion[]>([])

  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [frecuenciaDias, setFrecuenciaDias] = useState('')
  const [obligatoria, setObligatoria] = useState(false)
  const [editandoId, setEditandoId] = useState<number | null>(null)

  const [idAnimal, setIdAnimal] = useState('')
  const [idVacuna, setIdVacuna] = useState('')
  const [fechaAplicacion, setFechaAplicacion] = useState('')
  const [veterinario, setVeterinario] = useState('')
  const [observaciones, setObservaciones] = useState('')

  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')

  const cargarDatos = async () => {
    try {
      const [vacunasData, animalesData, registrosData] = await Promise.all([
        getVacunas(),
        getAnimales(),
        getRegistrosVacunacion(),
      ])

      setVacunas(vacunasData)
      setAnimales(animalesData)
      setRegistros(registrosData)
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error al cargar datos')
    }
  }

  useEffect(() => {
    cargarDatos()
  }, [])

  const limpiarVacuna = () => {
    setNombre('')
    setDescripcion('')
    setFrecuenciaDias('')
    setObligatoria(false)
    setEditandoId(null)
  }

  const guardarVacuna = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setMensaje('')

    if (!nombre.trim()) {
      setError('El nombre de la vacuna es obligatorio')
      return
    }

    const data = {
      nombre,
      descripcion: descripcion || null,
      frecuencia_dias: frecuenciaDias ? Number(frecuenciaDias) : null,
      obligatoria,
    }

    try {
      if (editandoId) {
        await updateVacuna(editandoId, data)
        setMensaje('Vacuna actualizada correctamente')
      } else {
        await createVacuna(data)
        setMensaje('Vacuna creada correctamente')
      }

      limpiarVacuna()
      cargarDatos()
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error al guardar vacuna')
    }
  }

  const editarVacuna = (vacuna: Vacuna) => {
    setEditandoId(vacuna.id_vacuna)
    setNombre(vacuna.nombre)
    setDescripcion(vacuna.descripcion || '')
    setFrecuenciaDias(vacuna.frecuencia_dias ? String(vacuna.frecuencia_dias) : '')
    setObligatoria(Boolean(vacuna.obligatoria))
    setError('')
    setMensaje('')
  }

  const eliminarVacuna = async (id: number) => {
    if (!window.confirm('¿Eliminar esta vacuna?')) return

    try {
      await deleteVacuna(id)
      setMensaje('Vacuna eliminada correctamente')
      cargarDatos()
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error al eliminar vacuna')
    }
  }

  const registrarVacunacion = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setMensaje('')

    if (!idAnimal || !idVacuna || !fechaAplicacion) {
      setError('Animal, vacuna y fecha de aplicación son obligatorios')
      return
    }

    try {
      const respuesta = await createRegistroVacunacion({
        id_animal: Number(idAnimal),
        id_vacuna: Number(idVacuna),
        fecha_aplicacion: fechaAplicacion,
        veterinario: veterinario || null,
        observaciones: observaciones || null,
      })

      if (respuesta.proxima_fecha) {
        setMensaje(`Vacunación registrada correctamente. Próxima aplicación: ${respuesta.proxima_fecha}`)
      } else {
        setMensaje('Vacunación registrada correctamente. Esta vacuna no tiene frecuencia definida.')
      }

      setIdAnimal('')
      setIdVacuna('')
      setFechaAplicacion('')
      setVeterinario('')
      setObservaciones('')

      cargarDatos()
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error al registrar vacunación')
    }
  }

  const eliminarRegistro = async (id: number) => {
    if (!window.confirm('¿Eliminar este registro de vacunación?')) return

    try {
      await deleteRegistroVacunacion(id)
      setMensaje('Registro eliminado correctamente')
      cargarDatos()
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error al eliminar registro')
    }
  }

  const obtenerFrecuenciaVacunaSeleccionada = () => {
    const vacuna = vacunas.find((item) => item.id_vacuna === Number(idVacuna))

    if (!vacuna) {
      return null
    }

    return vacuna.frecuencia_dias
  }

  const calcularProximaFechaVisual = () => {
    const frecuencia = obtenerFrecuenciaVacunaSeleccionada()

    if (!fechaAplicacion || !frecuencia) {
      return null
    }

    const fecha = new Date(fechaAplicacion)
    fecha.setDate(fecha.getDate() + Number(frecuencia))

    return fecha.toISOString().slice(0, 10)
  }

  const proximaFechaCalculada = calcularProximaFechaVisual()

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-2">
        Vacunas y salud
      </h1>

      <p className="text-gray-500 mb-6">
        Administra vacunas y registros sanitarios.
      </p>

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
        <h2 className="text-xl font-semibold mb-4">
          {editandoId ? 'Editar vacuna' : 'Crear vacuna'}
        </h2>

        <form onSubmit={guardarVacuna} className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <input
            className="border rounded-lg px-4 py-2"
            placeholder="Nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />

          <input
            className="border rounded-lg px-4 py-2"
            placeholder="Descripción"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
          />

          <input
            type="number"
            className="border rounded-lg px-4 py-2"
            placeholder="Frecuencia días"
            value={frecuenciaDias}
            onChange={(e) => setFrecuenciaDias(e.target.value)}
          />

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={obligatoria}
              onChange={(e) => setObligatoria(e.target.checked)}
            />
            Obligatoria
          </label>

          <div className="flex gap-2">
            <button className="bg-green-700 text-white px-4 py-2 rounded-lg">
              {editandoId ? 'Actualizar' : 'Guardar'}
            </button>

            {editandoId && (
              <button
                type="button"
                onClick={limpiarVacuna}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="bg-white rounded-xl shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">
          Registrar vacunación
        </h2>

        <form onSubmit={registrarVacunacion} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select
            className="border rounded-lg px-4 py-2"
            value={idAnimal}
            onChange={(e) => setIdAnimal(e.target.value)}
          >
            <option value="">Seleccionar animal</option>
            {animales.map((animal) => (
              <option key={animal.id_animal} value={animal.id_animal}>
                {animal.codigo} - {animal.nombre || 'Sin nombre'}
              </option>
            ))}
          </select>

          <select
            className="border rounded-lg px-4 py-2"
            value={idVacuna}
            onChange={(e) => setIdVacuna(e.target.value)}
          >
            <option value="">Seleccionar vacuna</option>
            {vacunas.map((vacuna) => (
              <option key={vacuna.id_vacuna} value={vacuna.id_vacuna}>
                {vacuna.nombre}
              </option>
            ))}
          </select>

          <input
            type="date"
            className="border rounded-lg px-4 py-2"
            value={fechaAplicacion}
            onChange={(e) => setFechaAplicacion(e.target.value)}
          />

          <input
            className="border rounded-lg px-4 py-2"
            placeholder="Veterinario"
            value={veterinario}
            onChange={(e) => setVeterinario(e.target.value)}
          />

          <input
            className="border rounded-lg px-4 py-2 md:col-span-2"
            placeholder="Observaciones"
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
          />

          {idVacuna && fechaAplicacion && (
            <div className="md:col-span-3 bg-green-50 border border-green-200 text-green-800 rounded-lg p-4">
              {proximaFechaCalculada ? (
                <p>
                  Próxima aplicación calculada automáticamente:{' '}
                  <strong>{proximaFechaCalculada}</strong>
                </p>
              ) : (
                <p>
                  Esta vacuna no tiene frecuencia definida, por eso no se calculará una próxima aplicación.
                </p>
              )}
            </div>
          )}

          <button className="bg-green-700 text-white px-4 py-2 rounded-lg md:col-span-3">
            Registrar vacunación
          </button>
        </form>
      </section>

      <section className="bg-white rounded-xl shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">
          Catálogo de vacunas
        </h2>

        {vacunas.length === 0 ? (
          <p className="text-gray-500">No hay vacunas registradas.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b text-gray-600">
                  <th className="py-2">Nombre</th>
                  <th>Descripción</th>
                  <th>Frecuencia</th>
                  <th>Obligatoria</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {vacunas.map((vacuna) => (
                  <tr key={vacuna.id_vacuna} className="border-b">
                    <td className="py-3">{vacuna.nombre}</td>
                    <td>{vacuna.descripcion || 'Sin descripción'}</td>
                    <td>{vacuna.frecuencia_dias || 'N/A'} días</td>
                    <td>{vacuna.obligatoria ? 'Sí' : 'No'}</td>

                    <td className="flex gap-2 py-3">
                      <button
                        onClick={() => editarVacuna(vacuna)}
                        className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm"
                      >
                        Editar
                      </button>

                      <button
                        onClick={() => eliminarVacuna(vacuna.id_vacuna)}
                        className="bg-red-600 text-white px-3 py-1 rounded-lg text-sm"
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

      <section className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-semibold mb-4">
          Historial de vacunación
        </h2>

        {registros.length === 0 ? (
          <p className="text-gray-500">No hay registros de vacunación.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b text-gray-600">
                  <th className="py-2">Animal</th>
                  <th>Vacuna</th>
                  <th>Frecuencia</th>
                  <th>Aplicación</th>
                  <th>Próxima</th>
                  <th>Veterinario</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {registros.map((registro) => (
                  <tr key={registro.id_registro} className="border-b">
                    <td className="py-3">
                      {registro.nombre_animal || registro.codigo_animal}
                    </td>

                    <td>{registro.nombre_vacuna}</td>

                    <td>
                      {'frecuencia_dias' in registro && registro.frecuencia_dias
                        ? `${registro.frecuencia_dias} días`
                        : 'N/A'}
                    </td>

                    <td>{registro.fecha_aplicacion?.slice(0, 10)}</td>

                    <td>{registro.proxima_fecha?.slice(0, 10) || 'N/A'}</td>

                    <td>{registro.veterinario || 'N/A'}</td>

                    <td>
                      <button
                        onClick={() => eliminarRegistro(registro.id_registro)}
                        className="bg-red-600 text-white px-3 py-1 rounded-lg text-sm"
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

export default Vacunas