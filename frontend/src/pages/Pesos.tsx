import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'

import { getAnimales } from '../services/animalService'
import type { Animal } from '../services/animalService'

import { createPeso, deletePeso, getPesos } from '../services/pesoService'
import type { RegistroPeso } from '../services/pesoService'

import Modal from '../components/Modal'
import Button from '../components/Button'
import PageHeader from '../components/PageHeader'
import EmptyState from '../components/EmptyState'
import Alert from '../components/Alert'
import Badge from '../components/Badge'

function Pesos() {
  const [animales, setAnimales] = useState<Animal[]>([])
  const [pesos, setPesos] = useState<RegistroPeso[]>([])

  const [idAnimal, setIdAnimal] = useState('')
  const [peso, setPeso] = useState('')
  const [fechaRegistro, setFechaRegistro] = useState('')
  const [observaciones, setObservaciones] = useState('')

  const [modalAbierto, setModalAbierto] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')

  const cargarDatos = async () => {
    try {
      setLoading(true)

      const [animalesData, pesosData] = await Promise.all([
        getAnimales(),
        getPesos(),
      ])

      setAnimales(animalesData)
      setPesos(pesosData)
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error al cargar control de peso')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
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
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error al registrar peso')
    }
  }

  const handleEliminar = async (id: number) => {
    const confirmar = window.confirm('¿Seguro que deseas eliminar este registro de peso?')

    if (!confirmar) return

    try {
      await deletePeso(id)
      setMensaje('Registro de peso eliminado correctamente')
      cargarDatos()
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error al eliminar registro')
    }
  }

  const obtenerAnimalSeleccionado = () => {
    return animales.find((animal) => animal.id_animal === Number(idAnimal))
  }

  const totalRegistros = pesos.length

  const ultimoPeso = pesos.length > 0
    ? pesos[0]
    : null

  const pesoPromedio = pesos.length > 0
    ? pesos.reduce((total, registro) => total + Number(registro.peso), 0) / pesos.length
    : 0

  return (
    <div>
      <PageHeader
        title="Control de peso"
        description="Registra y consulta el historial de peso del ganado."
        action={
          <Button onClick={abrirModal}>
            Registrar peso
          </Button>
        }
      />

      {error && (
        <Alert type="error" message={error} />
      )}

      {mensaje && (
        <Alert type="success" message={mensaje} />
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow p-5">
          <p className="text-sm text-gray-500">Registros de peso</p>
          <h2 className="text-3xl font-bold text-green-700">
            {totalRegistros}
          </h2>
        </div>

        <div className="bg-white rounded-xl shadow p-5">
          <p className="text-sm text-gray-500">Peso promedio</p>
          <h2 className="text-3xl font-bold text-green-700">
            {pesoPromedio ? `${pesoPromedio.toFixed(1)} kg` : 'N/A'}
          </h2>
        </div>

        <div className="bg-white rounded-xl shadow p-5">
          <p className="text-sm text-gray-500">Último registro</p>
          <h2 className="text-2xl font-bold text-green-700">
            {ultimoPeso ? `${ultimoPeso.peso} kg` : 'N/A'}
          </h2>
        </div>
      </div>

      <section className="bg-white rounded-xl shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Historial de peso
          </h2>

          <span className="text-sm text-gray-500">
            Total: {pesos.length}
          </span>
        </div>

        {loading ? (
          <p className="text-gray-500">Cargando registros de peso...</p>
        ) : pesos.length === 0 ? (
          <EmptyState
            title="No hay registros de peso"
            description="Cuando registres un animal con peso inicial, se generará automáticamente el primer control de peso."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b text-gray-600">
                  <th className="py-3">Animal</th>
                  <th>Peso</th>
                  <th>Fecha</th>
                  <th>Finca</th>
                  <th>Observaciones</th>
                  <th className="text-right">Acciones</th>
                </tr>
              </thead>

              <tbody>
                {pesos.map((registro) => (
                  <tr key={registro.id_peso} className="border-b hover:bg-gray-50">
                    <td className="py-4 font-medium text-gray-800">
                      {registro.nombre_animal || registro.codigo_animal}
                    </td>

                    <td>
                      <Badge variant="green">
                        {registro.peso} kg
                      </Badge>
                    </td>

                    <td className="text-gray-600">
                      {registro.fecha_registro?.slice(0, 10)}
                    </td>

                    <td className="text-gray-600">
                      {registro.nombre_finca || 'N/A'}
                    </td>

                    <td className="text-gray-600">
                      {registro.observaciones || 'N/A'}
                    </td>

                    <td className="py-4">
                      <div className="flex justify-end">
                        <Button
                          variant="danger"
                          onClick={() => handleEliminar(registro.id_peso)}
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
        title="Registrar peso"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
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

          {idAnimal && obtenerAnimalSeleccionado() && (
            <div className="rounded-lg bg-green-50 border border-green-200 p-4 text-sm text-green-800">
              Peso actual registrado del animal:{' '}
              <strong>
                {obtenerAnimalSeleccionado()?.peso_actual || 'N/A'} kg
              </strong>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nuevo peso kg
            </label>

            <input
              type="number"
              step="0.01"
              value={peso}
              onChange={(e) => setPeso(e.target.value)}
              className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
              placeholder="480.5"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Fecha de registro
            </label>

            <input
              type="date"
              value={fechaRegistro}
              onChange={(e) => setFechaRegistro(e.target.value)}
              className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
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
              placeholder="Peso registrado después de control mensual"
              rows={3}
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
              Guardar peso
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Pesos