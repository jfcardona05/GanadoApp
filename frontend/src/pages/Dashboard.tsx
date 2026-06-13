import {
  Activity,
  AlertTriangle,
  BadgeDollarSign,
  Building2,
  CalendarClock,
  CheckCircle2,
  HeartPulse,
  Wallet,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import Alert from '../components/Alert'
import Badge from '../components/Badge'
import EmptyState from '../components/EmptyState'
import PageHeader from '../components/PageHeader'
import Panel from '../components/Panel'
import StatCard from '../components/StatCard'
import { getDashboardResumen } from '../services/dashboardService'
import { daysUntil, isPastDate, isWithinNextDays } from '../utils/dates'
import { getErrorMessage } from '../utils/errors'

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
    } catch (error: unknown) {
      setError(getErrorMessage(error, 'Error al cargar dashboard'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    cargarDashboard()
  }, [])

  const tareas = useMemo(() => {
    if (!data) return []

    const animalesEnfermos = data.animales_por_salud.find((item) => item.estado_salud === 'ENFERMO')?.total || 0
    const animalesTratamiento = data.animales_por_salud.find((item) => item.estado_salud === 'EN_TRATAMIENTO')?.total || 0
    const vacunasVencidas = data.vacunas_proximas.filter((vacuna) => isPastDate(vacuna.proxima_fecha)).length
    const vacunasProximas = data.vacunas_proximas.filter((vacuna) => isWithinNextDays(vacuna.proxima_fecha, 15)).length

    const lista = []

    if (data.total_fincas === 0) {
      lista.push({
        title: 'Crear tu primera finca',
        detail: 'Es el primer paso para poder registrar animales.',
        to: '/fincas',
        tone: 'yellow',
      })
    }

    if (data.total_fincas > 0 && data.total_animales === 0) {
      lista.push({
        title: 'Registrar tu primer animal',
        detail: 'Con animales registrados podrás controlar peso, vacunas y salud.',
        to: '/animales',
        tone: 'yellow',
      })
    }

    if (vacunasVencidas > 0) {
      lista.push({
        title: `${vacunasVencidas} vacuna(s) vencida(s)`,
        detail: 'Revisa estas aplicaciones lo antes posible.',
        to: '/vacunas',
        tone: 'red',
      })
    }

    if (vacunasVencidas === 0 && vacunasProximas > 0) {
      lista.push({
        title: `${vacunasProximas} vacuna(s) próximas`,
        detail: 'Hay aplicaciones programadas para los siguientes 15 días.',
        to: '/vacunas',
        tone: 'yellow',
      })
    }

    if (animalesEnfermos > 0 || animalesTratamiento > 0) {
      lista.push({
        title: 'Revisar animales con alerta de salud',
        detail: `${animalesEnfermos} enfermo(s), ${animalesTratamiento} en tratamiento.`,
        to: '/animales',
        tone: 'red',
      })
    }

    if (Number(data.finanzas.balance) < 0) {
      lista.push({
        title: 'Revisar balance negativo',
        detail: 'Los gastos superan los ingresos registrados.',
        to: '/finanzas',
        tone: 'red',
      })
    }

    if (lista.length === 0) {
      lista.push({
        title: 'Todo se ve al día',
        detail: 'No hay tareas urgentes por ahora.',
        to: '/dashboard',
        tone: 'green',
      })
    }

    return lista
  }, [data])

  if (loading) {
    return (
      <Panel title="Dashboard">
        <p className="text-sm text-slate-500">Cargando dashboard...</p>
      </Panel>
    )
  }

  if (error) {
    return <Alert type="error" message={error} />
  }

  if (!data) {
    return <EmptyState title="No hay datos disponibles." />
  }

  const vacunasVencidas = data.vacunas_proximas.filter((vacuna) => isPastDate(vacuna.proxima_fecha))
  const vacunasProximas = data.vacunas_proximas.filter((vacuna) => isWithinNextDays(vacuna.proxima_fecha, 15))

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Qué está pasando hoy en tu finca y qué conviene atender primero."
      />

      {vacunasVencidas.length > 0 && <Alert type="error" message={`Atención: tienes ${vacunasVencidas.length} vacuna(s) vencida(s).`} />}
      {vacunasVencidas.length === 0 && vacunasProximas.length > 0 && <Alert type="warning" message={`Tienes ${vacunasProximas.length} vacuna(s) próximas en los siguientes 15 días.`} />}

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total fincas" value={data.total_fincas} icon={<Building2 size={20} />} helper="Predios registrados" />
        <StatCard title="Total animales" value={data.total_animales} icon={<Activity size={20} />} helper="Inventario activo" />
        <StatCard title="Ingresos" value={`$${Number(data.finanzas.total_ingresos).toLocaleString()}`} icon={<Wallet size={20} />} helper="Ingresos acumulados" />
        <StatCard title="Balance" value={`$${Number(data.finanzas.balance).toLocaleString()}`} icon={<BadgeDollarSign size={20} />} tone={Number(data.finanzas.balance) >= 0 ? 'green' : 'red'} helper="Ingresos menos gastos" />
      </div>

      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Panel title="Tareas recomendadas" count={tareas.length}>
          <div className="space-y-3">
            {tareas.map((tarea) => (
              <Link
                key={tarea.title}
                to={tarea.to}
                className="flex items-start gap-3 rounded-lg border border-slate-200 p-4 transition hover:bg-slate-50"
              >
                <span className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                  tarea.tone === 'red'
                    ? 'bg-red-50 text-red-600'
                    : tarea.tone === 'yellow'
                      ? 'bg-yellow-50 text-yellow-700'
                      : 'bg-green-50 text-green-700'
                }`}
                >
                  {tarea.tone === 'green' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
                </span>
                <span>
                  <span className="block font-semibold text-slate-950">{tarea.title}</span>
                  <span className="mt-1 block text-sm text-slate-500">{tarea.detail}</span>
                </span>
              </Link>
            ))}
          </div>
        </Panel>

        <Panel title="Accesos rápidos">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <Link to="/fincas" className="rounded-lg border border-slate-200 p-4 hover:bg-slate-50">
              <p className="font-semibold text-slate-900">Fincas</p>
              <p className="mt-1 text-sm text-slate-500">Crear o editar predios.</p>
            </Link>
            <Link to="/animales" className="rounded-lg border border-slate-200 p-4 hover:bg-slate-50">
              <p className="font-semibold text-slate-900">Animales</p>
              <p className="mt-1 text-sm text-slate-500">Registrar, pesar o vacunar.</p>
            </Link>
            <Link to="/finanzas" className="rounded-lg border border-slate-200 p-4 hover:bg-slate-50">
              <p className="font-semibold text-slate-900">Finanzas</p>
              <p className="mt-1 text-sm text-slate-500">Gastos, ingresos y balance.</p>
            </Link>
          </div>
        </Panel>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Panel title="Estado de salud" count={data.animales_por_salud.length}>
          {data.animales_por_salud.length === 0 ? (
            <EmptyState title="No hay animales registrados" />
          ) : (
            <div className="space-y-3">
              {data.animales_por_salud.map((item) => (
                <div key={item.estado_salud} className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-50 text-green-700">
                      <HeartPulse size={17} />
                    </span>
                    <span className="font-medium text-slate-700">{item.estado_salud}</span>
                  </div>
                  <Badge variant={item.estado_salud === 'ENFERMO' ? 'red' : item.estado_salud === 'EN_TRATAMIENTO' ? 'yellow' : 'green'}>{item.total}</Badge>
                </div>
              ))}
            </div>
          )}
        </Panel>

        <Panel title="Vacunas por atender" count={data.vacunas_proximas.length}>
          {data.vacunas_proximas.length === 0 ? (
            <EmptyState title="No hay vacunas próximas" />
          ) : (
            <div className="space-y-3">
              {data.vacunas_proximas.map((vacuna) => {
                const dias = daysUntil(vacuna.proxima_fecha)
                const vencida = dias < 0
                return (
                  <div key={vacuna.id_registro} className="rounded-lg border border-slate-200 px-4 py-3">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold text-slate-900">{vacuna.nombre_vacuna}</p>
                        <p className="mt-1 text-sm text-slate-500">Animal: {vacuna.nombre_animal || vacuna.codigo_animal}</p>
                      </div>
                      <Badge variant={vencida ? 'red' : dias <= 15 ? 'yellow' : 'green'}>
                        <span className="inline-flex items-center gap-1">
                          <CalendarClock size={13} />
                          {vencida ? `Vencida hace ${Math.abs(dias)} días` : `En ${dias} días`}
                        </span>
                      </Badge>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </Panel>

        <Panel title="Últimos animales registrados" count={data.ultimos_animales.length} className="lg:col-span-2">
          {data.ultimos_animales.length === 0 ? (
            <EmptyState title="No hay animales registrados" />
          ) : (
            <>
              <div className="grid gap-3 md:hidden">
                {data.ultimos_animales.map((animal) => (
                  <div key={animal.id_animal} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <p className="font-semibold text-slate-950">{animal.nombre || animal.codigo}</p>
                    <p className="mt-1 text-sm text-slate-500">{animal.nombre_finca} · {animal.peso_actual || 'N/A'} kg</p>
                    <p className="mt-1 text-sm text-slate-500">{animal.raza || 'Raza no registrada'} · {animal.sexo}</p>
                  </div>
                ))}
              </div>

              <div className="hidden overflow-x-auto rounded-lg border border-slate-200 md:block">
                <table className="w-full min-w-[760px] text-left">
                  <thead>
                    <tr>
                      <th>Código</th>
                      <th>Nombre</th>
                      <th>Raza</th>
                      <th>Sexo</th>
                      <th>Peso</th>
                      <th>Estado</th>
                      <th>Finca</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {data.ultimos_animales.map((animal) => (
                      <tr key={animal.id_animal} className="hover:bg-slate-50">
                        <td className="font-semibold text-slate-900">{animal.codigo}</td>
                        <td className="text-slate-600">{animal.nombre || 'Sin nombre'}</td>
                        <td className="text-slate-600">{animal.raza || 'No registrada'}</td>
                        <td className="text-slate-600">{animal.sexo}</td>
                        <td><Badge variant="green">{animal.peso_actual || 'N/A'} kg</Badge></td>
                        <td className="text-slate-600">{animal.estado_salud}</td>
                        <td className="text-slate-600">{animal.nombre_finca}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </Panel>
      </div>
    </div>
  )
}

export default Dashboard
