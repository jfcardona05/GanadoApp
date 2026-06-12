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

import Modal from '../components/Modal'
import Button from '../components/Button'
import PageHeader from '../components/PageHeader'
import EmptyState from '../components/EmptyState'
import Alert from '../components/Alert'
import Badge from '../components/Badge'

function Vacunas() {
  const [vacunas, setVacunas] = useState<Vacuna[]>([])
  const [animales, setAnimales] = useState<Animal[]>([])
  const [registros, setRegistros] = useState<RegistroVacunacion[]>([])

  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [frecuenciaDias, setFrecuenciaDias] = useState('')
  const [obligatoria, setObligatoria] = useState(false)
  const [editandoVacunaId, setEditandoVacunaId] = useState<number | null>(null)

  const [idAnimal, setIdAnimal] = useState('')
  const [idVacuna, setIdVacuna] = useState('')
  const [fechaAplicacion, setFechaAplicacion] = useState('')
  const [veterinario, setVeterinario] = useState('')
  const [observaciones, setObservaciones] = useState('')

  const [modalVacunaAbierto, setModalVacunaAbierto] = useState(false)
  const [modalRegistroAbierto, setModalRegistroAbierto] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')

  const cargarDatos = async () => {
    try {
      setLoading(true)

      const [vacunasData, animalesData, registrosData] = await Promise.all([
        getVacunas(),
        getAnimales(),
        getRegistrosVacunacion(),
      ])

      setVacunas(vacunasData)
      setAnimales(animalesData)
      setRegistros(registrosData)
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error al cargar vacunas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarDatos()
  }, [])

  const limpiarFormularioVacuna = () => {
    setNombre('')
    setDescripcion('')
    setFrecuenciaDias('')
    setObligatoria(false)
    setEditandoVacunaId(null)
  }

  const limpiarFormularioRegistro = () => {
    setIdAnimal('')
    setIdVacuna('')
    setFechaAplicacion('')
    setVeterinario('')
    setObservaciones('')
  }

  const abrirModalCrearVacuna = () => {
    limpiarFormularioVacuna()
    setError('')
    setMensaje('')
    setModalVacunaAbierto(true)
  }

  const cerrarModalVacuna = () => {
    setModalVacunaAbierto(false)
    limpiarFormularioVacuna()
  }

  const abrirModalRegistro = () => {
    limpiarFormularioRegistro()
    setError('')
    setMensaje('')
    setModalRegistroAbierto(true)
  }

  const cerrarModalRegistro = () => {
    setModalRegistroAbierto(false)
    limpiarFormularioRegistro()
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
      if (editandoVacunaId) {
        await updateVacuna(editandoVacunaId, data)
        setMensaje('Vacuna actualizada correctamente')
      } else {
        await createVacuna(data)
        setMensaje('Vacuna creada correctamente')
      }

      cerrarModalVacuna()
      cargarDatos()
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error al guardar vacuna')
    }
  }

  const editarVacuna = (vacuna: Vacuna) => {
    setEditandoVacunaId(vacuna.id_vacuna)
    setNombre(vacuna.nombre)
    setDescripcion(vacuna.descripcion || '')
    setFrecuenciaDias(vacuna.frecuencia_dias ? String(vacuna.frecuencia_dias) : '')
    setObligatoria(Boolean(vacuna.obligatoria))
    setError('')
    setMensaje('')
    setModalVacunaAbierto(true)
  }

  const eliminarVacuna = async (id: number) => {
    const confirmar = window.confirm('¿Seguro que deseas eliminar esta vacuna?')

    if (!confirmar) return

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

      cerrarModalRegistro()
      cargarDatos()
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error al registrar vacunación')
    }
  }

  const eliminarRegistro = async (id: number) => {
    const confirmar = window.confirm('¿Seguro que deseas eliminar este registro de vacunación?')

    if (!confirmar) return

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

  const totalObligatorias = vacunas.filter((vacuna) => Boolean(vacuna.obligatoria)).length
  const totalRegistros = registros.length
  const totalProximas = registros.filter((registro) => registro.proxima_fecha).length

  return (
    <div>
      <PageHeader
        title="Vacunas y salud"
        description="Administra el catálogo de vacunas y el historial sanitario del ganado."
        action={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={abrirModalRegistro}>
              Registrar vacunación
            </Button>

            <Button onClick={abrirModalCrearVacuna}>
              Crear vacuna
            </Button>
          </div>
        }
      />

      {error && (
        <Alert type="error" message={error} />
      )}

      {mensaje && (
        <Alert type="success" message={mensaje} />
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow p-5">
          <p className="text-sm text-gray-500">Vacunas registradas</p>
          <h2 className="text-3xl font-bold text-green-700">
            {vacunas.length}
          </h2>
        </div>

        <div className="bg-white rounded-xl shadow p-5">
          <p className="text-sm text-gray-500">Obligatorias</p>
          <h2 className="text-3xl font-bold text-blue-600">
            {totalObligatorias}
          </h2>
        </div>

        <div className="bg-white rounded-xl shadow p-5">
          <p className="text-sm text-gray-500">Vacunaciones</p>
          <h2 className="text-3xl font-bold text-green-700">
            {totalRegistros}
          </h2>
        </div>

        <div className="bg-white rounded-xl shadow p-5">
          <p className="text-sm text-gray-500">Próximas calculadas</p>
          <h2 className="text-3xl font-bold text-yellow-600">
            {totalProximas}
          </h2>
        </div>
      </div>

      <section className="bg-white rounded-xl shadow p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Catálogo de vacunas
          </h2>

          <span className="text-sm text-gray-500">
            Total: {vacunas.length}
          </span>
        </div>

        {loading ? (
          <p className="text-gray-500">Cargando vacunas...</p>
        ) : vacunas.length === 0 ? (
          <EmptyState
            title="No hay vacunas registradas"
            description="Crea vacunas con frecuencia en días para calcular automáticamente la próxima aplicación."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b text-gray-600">
                  <th className="py-3">Nombre</th>
                  <th>Descripción</th>
                  <th>Frecuencia</th>
                  <th>Obligatoria</th>
                  <th className="text-right">Acciones</th>
                </tr>
              </thead>

              <tbody>
                {vacunas.map((vacuna) => (
                  <tr key={vacuna.id_vacuna} className="border-b hover:bg-gray-50">
                    <td className="py-4 font-medium text-gray-800">
                      {vacuna.nombre}
                    </td>

                    <td className="text-gray-600">
                      {vacuna.descripcion || 'Sin descripción'}
                    </td>

                    <td className="text-gray-600">
                      {vacuna.frecuencia_dias ? `${vacuna.frecuencia_dias} días` : 'N/A'}
                    </td>

                    <td>
                      {vacuna.obligatoria ? (
                        <Badge variant="blue">Obligatoria</Badge>
                      ) : (
                        <Badge variant="gray">Opcional</Badge>
                      )}
                    </td>

                    <td className="py-4">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="secondary"
                          onClick={() => editarVacuna(vacuna)}
                        >
                          Editar
                        </Button>

                        <Button
                          variant="danger"
                          onClick={() => eliminarVacuna(vacuna.id_vacuna)}
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

      <section className="bg-white rounded-xl shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Historial de vacunación
          </h2>

          <span className="text-sm text-gray-500">
            Total: {registros.length}
          </span>
        </div>

        {loading ? (
          <p className="text-gray-500">Cargando historial...</p>
        ) : registros.length === 0 ? (
          <EmptyState
            title="No hay registros de vacunación"
            description="Registra la aplicación de una vacuna para empezar a construir el historial sanitario."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b text-gray-600">
                  <th className="py-3">Animal</th>
                  <th>Vacuna</th>
                  <th>Frecuencia</th>
                  <th>Aplicación</th>
                  <th>Próxima</th>
                  <th>Veterinario</th>
                  <th className="text-right">Acciones</th>
                </tr>
              </thead>

              <tbody>
                {registros.map((registro) => (
                  <tr key={registro.id_registro} className="border-b hover:bg-gray-50">
                    <td className="py-4 font-medium text-gray-800">
                      {registro.nombre_animal || registro.codigo_animal}
                    </td>

                    <td className="text-gray-600">
                      {registro.nombre_vacuna}
                    </td>

                    <td className="text-gray-600">
                      {registro.frecuencia_dias
                        ? `${registro.frecuencia_dias} días`
                        : 'N/A'}
                    </td>

                    <td className="text-gray-600">
                      {registro.fecha_aplicacion?.slice(0, 10)}
                    </td>

                    <td>
                      {registro.proxima_fecha ? (
                        <Badge variant="yellow">
                          {registro.proxima_fecha.slice(0, 10)}
                        </Badge>
                      ) : (
                        <Badge variant="gray">Sin frecuencia</Badge>
                      )}
                    </td>

                    <td className="text-gray-600">
                      {registro.veterinario || 'N/A'}
                    </td>

                    <td className="py-4">
                      <div className="flex justify-end">
                        <Button
                          variant="danger"
                          onClick={() => eliminarRegistro(registro.id_registro)}
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
        isOpen={modalVacunaAbierto}
        onClose={cerrarModalVacuna}
        title={editandoVacunaId ? 'Editar vacuna' : 'Crear vacuna'}
      >
        <form onSubmit={guardarVacuna} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nombre de la vacuna
            </label>

            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
              placeholder="Fiebre Aftosa"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Descripción
            </label>

            <input
              type="text"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
              placeholder="Vacuna obligatoria aplicada cada 6 meses"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Frecuencia en días
            </label>

            <input
              type="number"
              value={frecuenciaDias}
              onChange={(e) => setFrecuenciaDias(e.target.value)}
              className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
              placeholder="180"
            />

            <p className="mt-1 text-xs text-gray-500">
              Esta frecuencia se usará para calcular automáticamente la próxima aplicación.
            </p>
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={obligatoria}
              onChange={(e) => setObligatoria(e.target.checked)}
            />
            Marcar como obligatoria
          </label>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={cerrarModalVacuna}
            >
              Cancelar
            </Button>

            <Button type="submit">
              {editandoVacunaId ? 'Actualizar vacuna' : 'Guardar vacuna'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={modalRegistroAbierto}
        onClose={cerrarModalRegistro}
        title="Registrar vacunación"
      >
        <form onSubmit={registrarVacunacion} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Animal
            </label>

            <select
              value={idAnimal}
              onChange={(e) => setIdAnimal(e.target.value)}
              className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
            >
              <option value="">Seleccionar animal</option>
              {animales.map((animal) => (
                <option key={animal.id_animal} value={animal.id_animal}>
                  {animal.codigo} - {animal.nombre || 'Sin nombre'}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Vacuna
            </label>

            <select
              value={idVacuna}
              onChange={(e) => setIdVacuna(e.target.value)}
              className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
            >
              <option value="">Seleccionar vacuna</option>
              {vacunas.map((vacuna) => (
                <option key={vacuna.id_vacuna} value={vacuna.id_vacuna}>
                  {vacuna.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Fecha de aplicación
            </label>

            <input
              type="date"
              value={fechaAplicacion}
              onChange={(e) => setFechaAplicacion(e.target.value)}
              className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
            />
          </div>

          {idVacuna && fechaAplicacion && (
            <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
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

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Veterinario
            </label>

            <input
              type="text"
              value={veterinario}
              onChange={(e) => setVeterinario(e.target.value)}
              className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
              placeholder="Dr. Carlos Pérez"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Observaciones
            </label>

            <textarea
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
              placeholder="Aplicación normal sin reacciones"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={cerrarModalRegistro}
            >
              Cancelar
            </Button>

            <Button type="submit">
              Registrar vacunación
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Vacunas