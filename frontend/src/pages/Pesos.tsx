import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'

import { getAnimales } from '../services/animalService'
import type { Animal } from '../services/animalService'

import { createPeso, deletePeso, getPesos } from '../services/pesoService'
import type { RegistroPeso } from '../services/pesoService'

function Pesos() {
  const [animales, setAnimales] = useState<Animal[]>([])
  const [pesos, setPesos] = useState<RegistroPeso[]>([])

  const [idAnimal, setIdAnimal] = useState('')
  const [peso, setPeso] = useState('')
  const [fechaRegistro, setFechaRegistro] = useState('')
  const [observaciones, setObservaciones] = useState('')

  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')

  const cargarDatos = async () => {
    try {
      const [animalesData, pesosData] = await Promise.all([
        getAnimales(),
        getPesos(),
      ])

      setAnimales(animalesData)
      setPesos(pesosData)
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error al cargar datos')
    }
  }

  useEffect(() => {
    cargarDatos()
  }, [])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setMensaje('')

    if (!idAnimal || !peso || !fechaRegistro) {
      setError('Animal, peso y fecha son obligatorios')
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
      setIdAnimal('')
      setPeso('')
      setFechaRegistro('')
      setObservaciones('')
      cargarDatos()
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error al registrar peso')
    }
  }

  const handleEliminar = async (id: number) => {
    if (!window.confirm('¿Eliminar este registro de peso?')) return

    try {
      await deletePeso(id)
      setMensaje('Registro eliminado correctamente')
      cargarDatos()
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error al eliminar registro')
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Control de peso</h1>
      <p className="text-gray-500 mb-6">Registra y consulta el historial de peso del ganado.</p>

      {error && <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-4">{error}</div>}
      {mensaje && <div className="bg-green-100 text-green-700 p-4 rounded-lg mb-4">{mensaje}</div>}

      <section className="bg-white rounded-xl shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Registrar peso</h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <select className="border rounded-lg px-4 py-2" value={idAnimal} onChange={(e) => setIdAnimal(e.target.value)}>
            <option value="">Seleccionar animal</option>
            {animales.map((animal) => (
              <option key={animal.id_animal} value={animal.id_animal}>
                {animal.codigo} - {animal.nombre || 'Sin nombre'}
              </option>
            ))}
          </select>

          <input type="number" step="0.01" className="border rounded-lg px-4 py-2" placeholder="Peso kg" value={peso} onChange={(e) => setPeso(e.target.value)} />
          <input type="date" className="border rounded-lg px-4 py-2" value={fechaRegistro} onChange={(e) => setFechaRegistro(e.target.value)} />
          <input className="border rounded-lg px-4 py-2" placeholder="Observaciones" value={observaciones} onChange={(e) => setObservaciones(e.target.value)} />

          <button className="bg-green-700 text-white px-4 py-2 rounded-lg md:col-span-4">
            Registrar peso
          </button>
        </form>
      </section>

      <section className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Historial de peso</h2>

        {pesos.length === 0 ? (
          <p className="text-gray-500">No hay registros de peso.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b text-gray-600">
                  <th className="py-2">Animal</th>
                  <th>Peso</th>
                  <th>Fecha</th>
                  <th>Finca</th>
                  <th>Observaciones</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {pesos.map((registro) => (
                  <tr key={registro.id_peso} className="border-b">
                    <td className="py-3">{registro.nombre_animal || registro.codigo_animal}</td>
                    <td>{registro.peso} kg</td>
                    <td>{registro.fecha_registro?.slice(0, 10)}</td>
                    <td>{registro.nombre_finca || 'N/A'}</td>
                    <td>{registro.observaciones || 'N/A'}</td>
                    <td>
                      <button onClick={() => handleEliminar(registro.id_peso)} className="bg-red-600 text-white px-3 py-1 rounded-lg text-sm">
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

export default Pesos