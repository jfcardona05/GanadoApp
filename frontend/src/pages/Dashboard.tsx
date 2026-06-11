import { useEffect, useState } from 'react'
import { getDashboardResumen } from '../services/dashboardService'

interface AnimalSalud {
  estado_salud: string
  total: number
}

interface VacunaProxima {
  id_registro: number
  codigo_animal: string
  nombre_animal: string | null
  nombre_vacuna: string
  proxima_fecha: string
}

interface UltimoAnimal {
  id_animal: number
  codigo: string
  nombre: string | null
  raza: string | null
  sexo: string
  peso_actual: string | null
  estado_salud: string
  nombre_finca: string
}

interface DashboardData {
  total_fincas: number
  total_animales: number
  animales_por_salud: AnimalSalud[]
  vacunas_proximas: VacunaProxima[]
  ultimos_animales: UltimoAnimal[]
  finanzas: {
    total_ingresos: number
    total_gastos: number
    balance: number
  }
}

function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const cargarDashboard = async () => {
    try {
      setLoading(true)
      const resumen = await getDashboardResumen()
      setData(resumen)
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error al cargar dashboard')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarDashboard()
  }, [])

  if (loading) {
    return <p className="text-gray-600">Cargando dashboard...</p>
  }

  if (error) {
    return (
      <div className="bg-red-100 text-red-700 p-4 rounded-lg">
        {error}
      </div>
    )
  }

  if (!data) {
    return <p>No hay datos disponibles.</p>
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow p-6">
          <p className="text-sm text-gray-500">Total fincas</p>
          <h2 className="text-3xl font-bold text-green-700">
            {data.total_fincas}
          </h2>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <p className="text-sm text-gray-500">Total animales</p>
          <h2 className="text-3xl font-bold text-green-700">
            {data.total_animales}
          </h2>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <p className="text-sm text-gray-500">Ingresos</p>
          <h2 className="text-2xl font-bold text-green-700">
            ${data.finanzas.total_ingresos.toLocaleString()}
          </h2>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <p className="text-sm text-gray-500">Balance</p>
          <h2 className="text-2xl font-bold text-green-700">
            ${data.finanzas.balance.toLocaleString()}
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Estado de salud
          </h2>

          {data.animales_por_salud.length === 0 ? (
            <p className="text-gray-500">No hay animales registrados.</p>
          ) : (
            <div className="space-y-3">
              {data.animales_por_salud.map((item) => (
                <div
                  key={item.estado_salud}
                  className="flex justify-between border-b pb-2"
                >
                  <span>{item.estado_salud}</span>
                  <strong>{item.total}</strong>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Vacunas próximas
          </h2>

          {data.vacunas_proximas.length === 0 ? (
            <p className="text-gray-500">No hay vacunas próximas.</p>
          ) : (
            <div className="space-y-3">
              {data.vacunas_proximas.map((vacuna) => (
                <div key={vacuna.id_registro} className="border-b pb-3">
                  <p className="font-semibold">{vacuna.nombre_vacuna}</p>
                  <p className="text-sm text-gray-600">
                    Animal: {vacuna.nombre_animal || vacuna.codigo_animal}
                  </p>
                  <p className="text-sm text-gray-500">
                    Próxima fecha: {new Date(vacuna.proxima_fecha).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="bg-white rounded-xl shadow p-6 lg:col-span-2">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Últimos animales registrados
          </h2>

          {data.ultimos_animales.length === 0 ? (
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
                  </tr>
                </thead>
                <tbody>
                  {data.ultimos_animales.map((animal) => (
                    <tr key={animal.id_animal} className="border-b">
                      <td className="py-2">{animal.codigo}</td>
                      <td>{animal.nombre || 'Sin nombre'}</td>
                      <td>{animal.raza || 'No registrada'}</td>
                      <td>{animal.sexo}</td>
                      <td>{animal.peso_actual || 'N/A'} kg</td>
                      <td>{animal.estado_salud}</td>
                      <td>{animal.nombre_finca}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

export default Dashboard