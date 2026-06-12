import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'

import { getFincas } from '../services/fincaService'
import type { Finca } from '../services/fincaService'

import {
  createAnimal,
  deleteAnimal,
  getAnimales,
  updateAnimal,
} from '../services/animalService'

import type { Animal } from '../services/animalService'

import Modal from '../components/Modal'
import Button from '../components/Button'
import PageHeader from '../components/PageHeader'
import EmptyState from '../components/EmptyState'
import Alert from '../components/Alert'
import Badge from '../components/Badge'

function Animales() {
  const [animales, setAnimales] = useState<Animal[]>([])
  const [fincas, setFincas] = useState<Finca[]>([])

  const [idFinca, setIdFinca] = useState('')
  const [codigo, setCodigo] = useState('')
  const [nombre, setNombre] = useState('')
  const [raza, setRaza] = useState('')
  const [sexo, setSexo] = useState('MACHO')
  const [fechaNacimiento, setFechaNacimiento] = useState('')
  const [pesoActual, setPesoActual] = useState('')
  const [estadoSalud, setEstadoSalud] = useState('SANO')

  const [editandoId, setEditandoId] = useState<number | null>(null)
  const [modalAbierto, setModalAbierto] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')

  const cargarDatos = async () => {
    try {
      setLoading(true)

      const [animalesData, fincasData] = await Promise.all([
        getAnimales(),
        getFincas(),
      ])

      setAnimales(animalesData)
      setFincas(fincasData)
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error al cargar animales')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarDatos()
  }, [])

  const limpiarFormulario = () => {
    setIdFinca('')
    setCodigo('')
    setNombre('')
    setRaza('')
    setSexo('MACHO')
    setFechaNacimiento('')
    setPesoActual('')
    setEstadoSalud('SANO')
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

  const formatDateInput = (date: string | null) => {
    if (!date) return ''
    return date.slice(0, 10)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setMensaje('')

    if (!editandoId && !idFinca) {
      setError('Debes seleccionar una finca')
      return
    }

    if (!codigo.trim()) {
      setError('El código del animal es obligatorio')
      return
    }

    if (!sexo) {
      setError('El sexo del animal es obligatorio')
      return
    }

    const animalData = {
      id_finca: idFinca ? Number(idFinca) : undefined,
      codigo,
      nombre: nombre || null,
      foto: null,
      raza: raza || null,
      sexo,
      fecha_nacimiento: fechaNacimiento || null,
      peso_actual: pesoActual ? Number(pesoActual) : null,
      estado_salud: estadoSalud,
    }

    try {
      if (editandoId) {
        await updateAnimal(editandoId, animalData)
        setMensaje('Animal actualizado correctamente')
      } else {
        await createAnimal(animalData)
        setMensaje('Animal registrado correctamente')
      }

      cerrarModal()
      cargarDatos()
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error al guardar animal')
    }
  }

  const handleEditar = (animal: Animal) => {
    setEditandoId(animal.id_animal)
    setIdFinca(String(animal.id_finca))
    setCodigo(animal.codigo)
    setNombre(animal.nombre || '')
    setRaza(animal.raza || '')
    setSexo(animal.sexo)
    setFechaNacimiento(formatDateInput(animal.fecha_nacimiento))
    setPesoActual(animal.peso_actual ? String(animal.peso_actual) : '')
    setEstadoSalud(animal.estado_salud)
    setError('')
    setMensaje('')
    setModalAbierto(true)
  }

  const handleEliminar = async (id: number) => {
    const confirmar = window.confirm('¿Seguro que deseas eliminar este animal?')

    if (!confirmar) return

    try {
      await deleteAnimal(id)
      setMensaje('Animal eliminado correctamente')
      cargarDatos()
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error al eliminar animal')
    }
  }

  const getEstadoBadge = (estado: string) => {
    if (estado === 'SANO') return 'green'
    if (estado === 'ENFERMO') return 'red'
    if (estado === 'EN_TRATAMIENTO') return 'yellow'
    if (estado === 'VENDIDO') return 'blue'
    return 'gray'
  }

  const totalSanos = animales.filter((animal) => animal.estado_salud === 'SANO').length
  const totalEnfermos = animales.filter((animal) => animal.estado_salud === 'ENFERMO').length
  const totalTratamiento = animales.filter((animal) => animal.estado_salud === 'EN_TRATAMIENTO').length

  return (
    <div>
      <PageHeader
        title="Animales"
        description="Gestiona el inventario de ganado registrado en tus fincas."
        action={
          <Button onClick={abrirModalCrear}>
            Registrar animal
          </Button>
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
          <p className="text-sm text-gray-500">Total animales</p>
          <h2 className="text-3xl font-bold text-green-700">
            {animales.length}
          </h2>
        </div>

        <div className="bg-white rounded-xl shadow p-5">
          <p className="text-sm text-gray-500">Sanos</p>
          <h2 className="text-3xl font-bold text-green-700">
            {totalSanos}
          </h2>
        </div>

        <div className="bg-white rounded-xl shadow p-5">
          <p className="text-sm text-gray-500">Enfermos</p>
          <h2 className="text-3xl font-bold text-red-600">
            {totalEnfermos}
          </h2>
        </div>

        <div className="bg-white rounded-xl shadow p-5">
          <p className="text-sm text-gray-500">En tratamiento</p>
          <h2 className="text-3xl font-bold text-yellow-600">
            {totalTratamiento}
          </h2>
        </div>
      </div>

      <section className="bg-white rounded-xl shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Listado de animales
          </h2>

          <span className="text-sm text-gray-500">
            Total: {animales.length}
          </span>
        </div>

        {loading ? (
          <p className="text-gray-500">Cargando animales...</p>
        ) : animales.length === 0 ? (
          <EmptyState
            title="No hay animales registrados"
            description="Registra tu primer animal para empezar a controlar vacunas, peso, salud y trazabilidad."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b text-gray-600">
                  <th className="py-3">Código</th>
                  <th>Nombre</th>
                  <th>Raza</th>
                  <th>Sexo</th>
                  <th>Peso</th>
                  <th>Estado</th>
                  <th>Finca</th>
                  <th className="text-right">Acciones</th>
                </tr>
              </thead>

              <tbody>
                {animales.map((animal) => (
                  <tr key={animal.id_animal} className="border-b hover:bg-gray-50">
                    <td className="py-4 font-medium text-gray-800">
                      {animal.codigo}
                    </td>

                    <td className="text-gray-600">
                      {animal.nombre || 'Sin nombre'}
                    </td>

                    <td className="text-gray-600">
                      {animal.raza || 'N/A'}
                    </td>

                    <td className="text-gray-600">
                      {animal.sexo}
                    </td>

                    <td className="text-gray-600">
                      {animal.peso_actual || 'N/A'} kg
                    </td>

                    <td>
                      <Badge variant={getEstadoBadge(animal.estado_salud) as any}>
                        {animal.estado_salud}
                      </Badge>
                    </td>

                    <td className="text-gray-600">
                      {animal.nombre_finca || 'N/A'}
                    </td>

                    <td className="py-4">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="secondary"
                          onClick={() => handleEditar(animal)}
                        >
                          Editar
                        </Button>

                        <Button
                          variant="danger"
                          onClick={() => handleEliminar(animal.id_animal)}
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
        title={editandoId ? 'Editar animal' : 'Registrar animal'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {!editandoId && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Finca
              </label>

              <select
                value={idFinca}
                onChange={(e) => setIdFinca(e.target.value)}
                className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
              >
                <option value="">Seleccionar finca</option>
                {fincas.map((finca) => (
                  <option key={finca.id_finca} value={finca.id_finca}>
                    {finca.nombre}
                  </option>
                ))}
              </select>
            </div>
          )}

          {editandoId && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Finca
              </label>

              <select
                value={idFinca}
                disabled
                className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-100 text-gray-500"
              >
                {fincas.map((finca) => (
                  <option key={finca.id_finca} value={finca.id_finca}>
                    {finca.nombre}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Código
              </label>

              <input
                type="text"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
                placeholder="A001"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Nombre
              </label>

              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
                placeholder="Toro Bravo"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Raza
              </label>

              <input
                type="text"
                value={raza}
                onChange={(e) => setRaza(e.target.value)}
                className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
                placeholder="Brahman"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Sexo
              </label>

              <select
                value={sexo}
                onChange={(e) => setSexo(e.target.value)}
                className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
              >
                <option value="MACHO">Macho</option>
                <option value="HEMBRA">Hembra</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Fecha de nacimiento
              </label>

              <input
                type="date"
                value={fechaNacimiento}
                onChange={(e) => setFechaNacimiento(e.target.value)}
                className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Peso actual kg
              </label>

              <input
                type="number"
                step="0.01"
                value={pesoActual}
                onChange={(e) => setPesoActual(e.target.value)}
                className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
                placeholder="450"
              />

              {!editandoId && (
                <p className="mt-1 text-xs text-gray-500">
                  Este peso se guardará automáticamente como primer control de peso.
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Estado de salud
            </label>

            <select
              value={estadoSalud}
              onChange={(e) => setEstadoSalud(e.target.value)}
              className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
            >
              <option value="SANO">Sano</option>
              <option value="ENFERMO">Enfermo</option>
              <option value="EN_TRATAMIENTO">En tratamiento</option>
              <option value="VENDIDO">Vendido</option>
              <option value="MUERTO">Muerto</option>
            </select>
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
              {editandoId ? 'Actualizar animal' : 'Guardar animal'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Animales