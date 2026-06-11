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
      setError(error.response?.data?.message || 'Error al cargar datos')
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

      limpiarFormulario()
      cargarDatos()
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error al guardar animal')
    }
  }

  const formatDateInput = (date: string | null) => {
    if (!date) return ''
    return date.slice(0, 10)
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

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Animales</h1>
      <p className="text-gray-500 mb-6">Gestiona el inventario de ganado.</p>

      {error && <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-4">{error}</div>}
      {mensaje && <div className="bg-green-100 text-green-700 p-4 rounded-lg mb-4">{mensaje}</div>}

      <section className="bg-white rounded-xl shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">
          {editandoId ? 'Editar animal' : 'Registrar animal'}
        </h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <select
            value={idFinca}
            onChange={(e) => setIdFinca(e.target.value)}
            disabled={!!editandoId}
            className="border rounded-lg px-4 py-2"
          >
            <option value="">Seleccionar finca</option>
            {fincas.map((finca) => (
              <option key={finca.id_finca} value={finca.id_finca}>
                {finca.nombre}
              </option>
            ))}
          </select>

          <input className="border rounded-lg px-4 py-2" placeholder="Código" value={codigo} onChange={(e) => setCodigo(e.target.value)} />
          <input className="border rounded-lg px-4 py-2" placeholder="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} />
          <input className="border rounded-lg px-4 py-2" placeholder="Raza" value={raza} onChange={(e) => setRaza(e.target.value)} />

          <select className="border rounded-lg px-4 py-2" value={sexo} onChange={(e) => setSexo(e.target.value)}>
            <option value="MACHO">Macho</option>
            <option value="HEMBRA">Hembra</option>
          </select>

          <input type="date" className="border rounded-lg px-4 py-2" value={fechaNacimiento} onChange={(e) => setFechaNacimiento(e.target.value)} />
          <input type="number" step="0.01" className="border rounded-lg px-4 py-2" placeholder="Peso actual" value={pesoActual} onChange={(e) => setPesoActual(e.target.value)} />

          <select className="border rounded-lg px-4 py-2" value={estadoSalud} onChange={(e) => setEstadoSalud(e.target.value)}>
            <option value="SANO">Sano</option>
            <option value="ENFERMO">Enfermo</option>
            <option value="EN_TRATAMIENTO">En tratamiento</option>
            <option value="VENDIDO">Vendido</option>
            <option value="MUERTO">Muerto</option>
          </select>

          <div className="flex gap-2 md:col-span-4">
            <button className="bg-green-700 text-white px-4 py-2 rounded-lg">
              {editandoId ? 'Actualizar' : 'Guardar'}
            </button>

            {editandoId && (
              <button type="button" onClick={limpiarFormulario} className="bg-gray-500 text-white px-4 py-2 rounded-lg">
                Cancelar
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Listado de animales</h2>

        {loading ? (
          <p>Cargando animales...</p>
        ) : animales.length === 0 ? (
          <p className="text-gray-500">No hay animales registrados.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b text-gray-600">
                  <th className="py-2">Código</th>
                  <th>Nombre</th>
                  <th>Raza</th>
                  <th>Sexo</th>
                  <th>Peso</th>
                  <th>Estado</th>
                  <th>Finca</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {animales.map((animal) => (
                  <tr key={animal.id_animal} className="border-b">
                    <td className="py-3">{animal.codigo}</td>
                    <td>{animal.nombre || 'Sin nombre'}</td>
                    <td>{animal.raza || 'N/A'}</td>
                    <td>{animal.sexo}</td>
                    <td>{animal.peso_actual || 'N/A'} kg</td>
                    <td>{animal.estado_salud}</td>
                    <td>{animal.nombre_finca || 'N/A'}</td>
                    <td className="flex gap-2 py-3">
                      <button onClick={() => handleEditar(animal)} className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm">Editar</button>
                      <button onClick={() => handleEliminar(animal.id_animal)} className="bg-red-600 text-white px-3 py-1 rounded-lg text-sm">Eliminar</button>
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

export default Animales