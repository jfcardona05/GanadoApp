import {
  Activity,
  AlertTriangle,
  BadgeDollarSign,
  Bell,
  Building2,
  CalendarClock,
  CheckCircle2,
  HeartPulse,
  Package,
  ShieldPlus,
  Wallet,
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'

import Alert from '../components/Alert'
import Badge from '../components/Badge'
import EmptyState from '../components/EmptyState'
import PageHeader from '../components/PageHeader'
import Panel from '../components/Panel'
import StatCard from '../components/StatCard'
import { getDashboardResumen } from '../services/dashboardService'
import { ganaderiaService } from '../services/ganaderiaService'
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

const actionLinks = [
  {
    title: 'Registrar animal',
    detail: 'Agregar una res nueva al inventario.',
    to: '/animales',
    icon: Activity,
  },
  {
    title: 'Revisar alertas',
    detail: 'Ver vacunas, stock o cuentas pendientes.',
    to: '/alertas',
    icon: Bell,
  },
  {
    title: 'Anotar peso',
    detail: 'Guardar el control de peso de un animal.',
    to: '/pesos',
    icon: BadgeDollarSign,
  },
  {
    title: 'Registrar gasto o ingreso',
    detail: 'Llevar cuentas de la finca.',
    to: '/finanzas',
    icon: Wallet,
  },
  {
    title: 'Anotar tratamiento',
    detail: 'Guardar salud, medicamentos o desparasitación.',
    to: '/sanidad',
    icon: ShieldPlus,
  },
  {
    title: 'Registrar producción',
    detail: 'Leche, lotes de ceba o producción diaria.',
    to: '/produccion',
    icon: Package,
  },
]

function Dashboard() {
  const navigate = useNavigate()
  const [data, setData] = useState<DashboardData | null>(null)
  const [alertas, setAlertas] = useState<Record<string, any>[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const cargarDashboard = async () => {
    try {
      setLoading(true)
      const [resumen, alertasData] = await Promise.all([
        getDashboardResumen(),
        ganaderiaService.getAlertas(),
      ])
      setData(resumen)
      setAlertas(alertasData)
    } catch (error: unknown) {
      setError(getErrorMessage(error, 'Error al cargar el inicio'))
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
    const alertasAltas = alertas.filter((alerta) => alerta.prioridad === 'ALTA' || alerta.prioridad === 'CRITICA').length

    const lista = []

    if (data.total_fincas === 0) {
      lista.push({
        title: 'Primero crea una finca',
        detail: 'Sin finca no se pueden registrar animales ni movimientos.',
        to: '/fincas',
        tone: 'yellow',
      })
    }

    if (data.total_fincas > 0 && data.total_animales === 0) {
      lista.push({
        title: 'Registra el primer animal',
        detail: 'Después podrás anotar peso, vacunas, salud y ventas.',
        to: '/animales',
        tone: 'yellow',
      })
    }

    if (vacunasVencidas > 0) {
      lista.push({
        title: `${vacunasVencidas} vacuna(s) vencida(s)`,
        detail: 'Conviene revisarlas hoy.',
        to: '/vacunas',
        tone: 'red',
      })
    }

    if (vacunasVencidas === 0 && vacunasProximas > 0) {
      lista.push({
        title: `${vacunasProximas} vacuna(s) próximas`,
        detail: 'Hay aplicaciones para los siguientes 15 días.',
        to: '/vacunas',
        tone: 'yellow',
      })
    }

    if (animalesEnfermos > 0 || animalesTratamiento > 0) {
      lista.push({
        title: 'Revisar salud del ganado',
        detail: `${animalesEnfermos} enfermo(s), ${animalesTratamiento} en tratamiento.`,
        to: '/sanidad',
        tone: 'red',
      })
    }

    if (alertasAltas > 0) {
      lista.push({
        title: `${alertasAltas} alerta(s) importantes`,
        detail: 'Puede haber bajo stock, cuentas próximas o tareas críticas.',
        to: '/alertas',
        tone: 'red',
      })
    }

    if (Number(data.finanzas.balance) < 0) {
      lista.push({
        title: 'Balance negativo',
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
  }, [data, alertas])

  if (loading) {
    return (
      <Panel title="Cargando inicio">
        <p className="text-sm text-slate-500">Estamos revisando tus fincas, animales y alertas...</p>
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
        title="Qué hacer hoy"
        description="Aquí ves lo más importante primero. Si no sabes por dónde empezar, revisa las tareas recomendadas."
      />

      {vacunasVencidas.length > 0 && <Alert type="error" message={`Atención: tienes ${vacunasVencidas.length} vacuna(s) vencida(s).`} />}
      {vacunasVencidas.length === 0 && vacunasProximas.length > 0 && <Alert type="warning" message={`Tienes ${vacunasProximas.length} vacuna(s) próximas en los siguientes 15 días.`} />}

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard title="Fincas" value={data.total_fincas} icon={<Building2 size={20} />} helper="Predios guardados" />
        <StatCard title="Animales" value={data.total_animales} icon={<Activity size={20} />} helper="Ganado registrado" />
        <StatCard title="Ingresos" value={`$${Number(data.finanzas.total_ingresos).toLocaleString()}`} icon={<Wallet size={20} />} helper="Dinero que entró" />
        <StatCard title="Balance" value={`$${Number(data.finanzas.balance).toLocaleString()}`} icon={<BadgeDollarSign size={20} />} tone={Number(data.finanzas.balance) >= 0 ? 'green' : 'red'} helper="Ingresos menos gastos" />
        <StatCard title="Alertas" value={alertas.length} icon={<Bell size={20} />} tone={alertas.length > 0 ? 'yellow' : 'green'} helper="Por revisar" />
      </div>

      <div className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-[1fr_1fr]">
        <Panel title="Tareas recomendadas" count={tareas.length} helper="Presiona una tarea para ir directo a resolverla.">
          <div className="space-y-3">
            {tareas.map((tarea) => (
              <Link
                key={tarea.title}
                to={tarea.to}
                className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 transition hover:border-green-300 hover:bg-green-50"
              >
                <span className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                  tarea.tone === 'red'
                    ? 'bg-red-50 text-red-600'
                    : tarea.tone === 'yellow'
                      ? 'bg-yellow-50 text-yellow-700'
                      : 'bg-green-50 text-green-700'
                }`}
                >
                  {tarea.tone === 'green' ? <CheckCircle2 size={19} /> : <AlertTriangle size={19} />}
                </span>
                <span>
                  <span className="block font-semibold text-slate-950">{tarea.title}</span>
                  <span className="mt-1 block text-sm leading-6 text-slate-500">{tarea.detail}</span>
                </span>
              </Link>
            ))}
          </div>
        </Panel>

        <Panel title="Botones rápidos" helper="Usa estos botones para las acciones más comunes.">
          <div className="grid gap-3 sm:grid-cols-2">
            {actionLinks.map((action) => {
              const Icon = action.icon
              return (
                <Link
                  key={action.to}
                  to={action.to}
                  className="rounded-xl border border-slate-200 bg-white p-4 transition hover:border-green-300 hover:bg-green-50"
                >
                  <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 text-green-700">
                    <Icon size={18} />
                  </span>
                  <p className="font-semibold text-slate-900">{action.title}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-500">{action.detail}</p>
                </Link>
              )
            })}
          </div>
        </Panel>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Panel title="Salud del ganado" count={data.animales_por_salud.length} helper="Resumen rápido para saber si hay animales enfermos o en tratamiento.">
          {data.animales_por_salud.length === 0 ? (
            <EmptyState title="No hay animales registrados" actionLabel="Registrar animal" onAction={() => navigate('/animales')} />
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

        <Panel title="Vacunas por atender" count={data.vacunas_proximas.length} helper="Muestra vencidas y próximas para no dejar pasar fechas importantes.">
          {data.vacunas_proximas.length === 0 ? (
            <EmptyState title="No hay vacunas próximas" actionLabel="Ir a vacunas" onAction={() => navigate('/vacunas')} />
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

        <Panel title="Últimos animales registrados" count={data.ultimos_animales.length} className="lg:col-span-2" helper="Los animales agregados más recientemente.">
          {data.ultimos_animales.length === 0 ? (
            <EmptyState title="No hay animales registrados" actionLabel="Registrar animal" onAction={() => navigate('/animales')} />
          ) : (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {data.ultimos_animales.map((animal) => (
                <div key={animal.id_animal} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <p className="font-semibold text-slate-950">{animal.nombre || animal.codigo}</p>
                  <p className="mt-1 text-sm text-slate-500">{animal.nombre_finca} · {animal.peso_actual || 'N/A'} kg</p>
                  <p className="mt-1 text-sm text-slate-500">{animal.raza || 'Raza no registrada'} · {animal.sexo}</p>
                  <div className="mt-3">
                    <Badge variant={animal.estado_salud === 'ENFERMO' ? 'red' : animal.estado_salud === 'EN_TRATAMIENTO' ? 'yellow' : 'green'}>
                      {animal.estado_salud}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>
    </div>
  )
}

export default Dashboard
