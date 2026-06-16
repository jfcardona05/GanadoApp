import {
  ArrowDownCircle,
  ArrowUpCircle,
  Banknote,
  BarChart3,
  Edit3,
  HandCoins,
  Landmark,
  Plus,
  ReceiptText,
  Search,
  Tags,
  Trash2,
  Wallet,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'

import Alert from '../components/Alert'
import Badge from '../components/Badge'
import Button from '../components/Button'
import ConfirmDialog from '../components/ConfirmDialog'
import EmptyState from '../components/EmptyState'
import Modal from '../components/Modal'
import PageHeader from '../components/PageHeader'
import Panel from '../components/Panel'
import StatCard from '../components/StatCard'
import { getFincas } from '../services/fincaService'
import type { Finca } from '../services/fincaService'
import {
  createCategoriaFinanciera,
  deleteCategoriaFinanciera,
  getCategoriasFinancieras,
  updateCategoriaFinanciera,
} from '../services/categoriaFinancieraService'
import type { CategoriaFinanciera } from '../services/categoriaFinancieraService'
import {
  createGasto,
  createIngreso,
  deleteGasto,
  deleteIngreso,
  getGastos,
  getIngresos,
} from '../services/finanzaService'
import type { Gasto, Ingreso } from '../services/finanzaService'
import { ganaderiaService } from '../services/ganaderiaService'
import { getErrorMessage } from '../utils/errors'

type MovimientoEliminar = {
  tipo: 'GASTO' | 'INGRESO'
  id: number
} | null

type PeriodoFiltro = 'MES' | 'SEMANA' | 'ANIO' | 'TODO' | 'PERSONALIZADO'
type TabFinanzas = 'resumen' | 'movimientos' | 'comercial' | 'cuentas' | 'categorias' | 'reportes'
type Registro = Record<string, any>

function startOfToday() {
  const date = new Date()
  date.setHours(0, 0, 0, 0)
  return date
}

function formatDateInput(date: Date) {
  return date.toISOString().slice(0, 10)
}

function money(value: number | string | null | undefined) {
  return `$${Number(value || 0).toLocaleString('es-CO', { maximumFractionDigits: 0 })}`
}

function isDateInRange(value: string, desde: string, hasta: string) {
  const date = new Date(value)
  date.setHours(0, 0, 0, 0)
  if (desde && date < new Date(`${desde}T00:00:00`)) return false
  if (hasta && date > new Date(`${hasta}T23:59:59`)) return false
  return true
}

function getPeriodRange(periodo: PeriodoFiltro, fechaDesde: string, fechaHasta: string) {
  const today = startOfToday()
  const desde = new Date(today)

  if (periodo === 'TODO') return { desde: '', hasta: '' }
  if (periodo === 'PERSONALIZADO') return { desde: fechaDesde, hasta: fechaHasta }
  if (periodo === 'SEMANA') desde.setDate(today.getDate() - 6)
  if (periodo === 'MES') desde.setDate(1)
  if (periodo === 'ANIO') {
    desde.setMonth(0)
    desde.setDate(1)
  }

  return {
    desde: formatDateInput(desde),
    hasta: formatDateInput(today),
  }
}

function origenLabel(origen?: string | null) {
  const labels: Record<string, string> = {
    MANUAL: 'Manual',
    COMPRA_ANIMAL: 'Compra de animal',
    VENTA_ANIMAL: 'Venta de animal',
    VENTA_LECHE: 'Venta de leche',
    COMPRA_INSUMO: 'Compra de insumos',
  }
  return origen ? labels[origen] || origen : 'Manual'
}

function Finanzas() {
  const [activeTab, setActiveTab] = useState<TabFinanzas>('resumen')
  const [fincas, setFincas] = useState<Finca[]>([])
  const [categorias, setCategorias] = useState<CategoriaFinanciera[]>([])
  const [gastos, setGastos] = useState<Gasto[]>([])
  const [ingresos, setIngresos] = useState<Ingreso[]>([])
  const [comprasAnimales, setComprasAnimales] = useState<Registro[]>([])
  const [ventasAnimales, setVentasAnimales] = useState<Registro[]>([])
  const [ventasLeche, setVentasLeche] = useState<Registro[]>([])
  const [cuentasPagar, setCuentasPagar] = useState<Registro[]>([])
  const [cuentasCobrar, setCuentasCobrar] = useState<Registro[]>([])

  const [tipoCategoria, setTipoCategoria] = useState<'GASTO' | 'INGRESO'>('GASTO')
  const [nombreCategoria, setNombreCategoria] = useState('')
  const [editandoCategoriaId, setEditandoCategoriaId] = useState<number | null>(null)
  const [categoriaAEliminar, setCategoriaAEliminar] = useState<number | null>(null)

  const [tipoMovimiento, setTipoMovimiento] = useState<'GASTO' | 'INGRESO'>('GASTO')
  const [idFinca, setIdFinca] = useState('')
  const [idCategoria, setIdCategoria] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [monto, setMonto] = useState('')
  const [fecha, setFecha] = useState('')
  const [movimientoAEliminar, setMovimientoAEliminar] = useState<MovimientoEliminar>(null)

  const [busquedaMovimiento, setBusquedaMovimiento] = useState('')
  const [fincaFiltro, setFincaFiltro] = useState('')
  const [periodoFiltro, setPeriodoFiltro] = useState<PeriodoFiltro>('MES')
  const [fechaDesde, setFechaDesde] = useState('')
  const [fechaHasta, setFechaHasta] = useState('')

  const [modalCategoriaAbierto, setModalCategoriaAbierto] = useState(false)
  const [modalMovimientoAbierto, setModalMovimientoAbierto] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')

  const categoriasGasto = categorias.filter((categoria) => categoria.tipo === 'GASTO')
  const categoriasIngreso = categorias.filter((categoria) => categoria.tipo === 'INGRESO')
  const categoriasMovimiento = tipoMovimiento === 'GASTO' ? categoriasGasto : categoriasIngreso
  const rangoFecha = getPeriodRange(periodoFiltro, fechaDesde, fechaHasta)

  const cargarDatos = async () => {
    try {
      setLoading(true)
      const [
        fincasData,
        categoriasData,
        gastosData,
        ingresosData,
        comprasData,
        ventasAnimalesData,
        ventasLecheData,
        cuentasPagarData,
        cuentasCobrarData,
      ] = await Promise.all([
        getFincas(),
        getCategoriasFinancieras(),
        getGastos(),
        getIngresos(),
        ganaderiaService.getComprasAnimales(),
        ganaderiaService.getVentasAnimales(),
        ganaderiaService.getVentasLeche(),
        ganaderiaService.getCuentasPagar(),
        ganaderiaService.getCuentasCobrar(),
      ])
      setFincas(fincasData)
      setCategorias(categoriasData)
      setGastos(gastosData)
      setIngresos(ingresosData)
      setComprasAnimales(comprasData)
      setVentasAnimales(ventasAnimalesData)
      setVentasLeche(ventasLecheData)
      setCuentasPagar(cuentasPagarData)
      setCuentasCobrar(cuentasCobrarData)
    } catch (error: unknown) {
      setError(getErrorMessage(error, 'Error al cargar finanzas'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    cargarDatos()
  }, [])

  const obtenerNombreCategoriaMovimiento = (movimiento: Gasto | Ingreso) => {
    return movimiento.nombre_categoria || movimiento.categoria || 'Sin categoría'
  }

  const filtrarPorFincaFecha = (item: { id_finca?: number | string; fecha?: string; fecha_compra?: string; fecha_venta?: string; fecha_vencimiento?: string }) => {
    const fechaItem = item.fecha || item.fecha_compra || item.fecha_venta || item.fecha_vencimiento || ''
    const coincideFinca = fincaFiltro ? Number(item.id_finca) === Number(fincaFiltro) : true
    const coincideFecha = fechaItem ? isDateInRange(fechaItem, rangoFecha.desde, rangoFecha.hasta) : true
    return coincideFinca && coincideFecha
  }

  const filtrarMovimiento = (movimiento: Gasto | Ingreso) => {
    const texto = `${obtenerNombreCategoriaMovimiento(movimiento)} ${movimiento.descripcion || ''} ${movimiento.nombre_finca || ''} ${origenLabel(movimiento.origen)}`.toLowerCase()
    return texto.includes(busquedaMovimiento.toLowerCase()) && filtrarPorFincaFecha(movimiento)
  }

  const gastosFiltrados = gastos.filter(filtrarMovimiento)
  const ingresosFiltrados = ingresos.filter(filtrarMovimiento)
  const comprasFiltradas = comprasAnimales.filter(filtrarPorFincaFecha)
  const ventasAnimalesFiltradas = ventasAnimales.filter(filtrarPorFincaFecha)
  const ventasLecheFiltradas = ventasLeche.filter(filtrarPorFincaFecha)
  const cuentasPagarPendientes = cuentasPagar.filter((cuenta) => cuenta.estado === 'PENDIENTE')
  const cuentasCobrarPendientes = cuentasCobrar.filter((cuenta) => cuenta.estado === 'PENDIENTE')

  const resumen = useMemo(() => {
    const totalGastos = gastosFiltrados.reduce((total, gasto) => total + Number(gasto.monto), 0)
    const totalIngresos = ingresosFiltrados.reduce((total, ingreso) => total + Number(ingreso.monto), 0)
    const balance = totalIngresos - totalGastos
    const totalComprasAnimales = comprasFiltradas.reduce((total, compra) => total + Number(compra.precio || 0), 0)
    const totalVentasAnimales = ventasAnimalesFiltradas.reduce((total, venta) => total + Number(venta.precio || 0), 0)
    const totalVentasLeche = ventasLecheFiltradas.reduce((total, venta) => total + Number(venta.total || 0), 0)
    const cuentasPorPagar = cuentasPagarPendientes.reduce((total, cuenta) => total + Number(cuenta.monto || 0), 0)
    const cuentasPorCobrar = cuentasCobrarPendientes.reduce((total, cuenta) => total + Number(cuenta.monto || 0), 0)

    const gastoPorCategoria = gastosFiltrados.reduce<Record<string, number>>((acc, gasto) => {
      const categoria = obtenerNombreCategoriaMovimiento(gasto)
      acc[categoria] = (acc[categoria] || 0) + Number(gasto.monto)
      return acc
    }, {})

    const ingresoPorCategoria = ingresosFiltrados.reduce<Record<string, number>>((acc, ingreso) => {
      const categoria = obtenerNombreCategoriaMovimiento(ingreso)
      acc[categoria] = (acc[categoria] || 0) + Number(ingreso.monto)
      return acc
    }, {})

    const categoriaMayorGasto = Object.entries(gastoPorCategoria).sort((a, b) => b[1] - a[1])[0]
    const categoriaMayorIngreso = Object.entries(ingresoPorCategoria).sort((a, b) => b[1] - a[1])[0]

    return {
      totalGastos,
      totalIngresos,
      balance,
      totalComprasAnimales,
      totalVentasAnimales,
      totalVentasLeche,
      cuentasPorPagar,
      cuentasPorCobrar,
      categoriaMayorGasto,
      categoriaMayorIngreso,
      margen: totalIngresos > 0 ? (balance / totalIngresos) * 100 : 0,
    }
  }, [gastosFiltrados, ingresosFiltrados, comprasFiltradas, ventasAnimalesFiltradas, ventasLecheFiltradas, cuentasPagarPendientes, cuentasCobrarPendientes])

  const limpiarFormularioCategoria = () => {
    setTipoCategoria('GASTO')
    setNombreCategoria('')
    setEditandoCategoriaId(null)
  }

  const limpiarFormularioMovimiento = (tipo: 'GASTO' | 'INGRESO') => {
    setTipoMovimiento(tipo)
    setIdFinca(fincaFiltro || '')
    setIdCategoria('')
    setDescripcion('')
    setMonto('')
    setFecha(formatDateInput(startOfToday()))
  }

  const abrirModalCategoria = (tipo: 'GASTO' | 'INGRESO' = 'GASTO') => {
    limpiarFormularioCategoria()
    setTipoCategoria(tipo)
    setError('')
    setMensaje('')
    setModalCategoriaAbierto(true)
  }

  const cerrarModalCategoria = () => {
    setModalCategoriaAbierto(false)
    limpiarFormularioCategoria()
  }

  const abrirModalMovimiento = (tipo: 'GASTO' | 'INGRESO') => {
    limpiarFormularioMovimiento(tipo)
    setError('')
    setMensaje('')
    setModalMovimientoAbierto(true)
  }

  const cerrarModalMovimiento = () => {
    setModalMovimientoAbierto(false)
    limpiarFormularioMovimiento('GASTO')
  }

  const guardarCategoria = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setMensaje('')

    if (!nombreCategoria.trim()) {
      setError('El nombre de la categoría es obligatorio')
      return
    }

    try {
      if (editandoCategoriaId) {
        await updateCategoriaFinanciera(editandoCategoriaId, { nombre: nombreCategoria, tipo: tipoCategoria })
        setMensaje('Categoría actualizada correctamente')
      } else {
        await createCategoriaFinanciera({ nombre: nombreCategoria, tipo: tipoCategoria })
        setMensaje('Categoría creada correctamente')
      }

      cerrarModalCategoria()
      cargarDatos()
    } catch (error: unknown) {
      setError(getErrorMessage(error, 'Error al guardar categoría'))
    }
  }

  const editarCategoria = (categoria: CategoriaFinanciera) => {
    setEditandoCategoriaId(categoria.id_categoria)
    setNombreCategoria(categoria.nombre)
    setTipoCategoria(categoria.tipo)
    setError('')
    setMensaje('')
    setModalCategoriaAbierto(true)
  }

  const eliminarCategoria = async (id: number) => {
    try {
      await deleteCategoriaFinanciera(id)
      setMensaje('Categoría eliminada correctamente')
      cargarDatos()
    } catch (error: unknown) {
      setError(getErrorMessage(error, 'Error al eliminar categoría'))
    }
  }

  const guardarMovimiento = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setMensaje('')

    if (!idFinca || !idCategoria || !monto || !fecha) {
      setError('Finca, categoría, monto y fecha son obligatorios')
      return
    }

    if (Number(monto) <= 0) {
      setError('El monto debe ser mayor a cero')
      return
    }

    const data = {
      id_finca: Number(idFinca),
      id_categoria: Number(idCategoria),
      descripcion: descripcion || null,
      monto: Number(monto),
      fecha,
    }

    try {
      if (tipoMovimiento === 'GASTO') {
        await createGasto(data)
        setMensaje('Gasto registrado correctamente')
      } else {
        await createIngreso(data)
        setMensaje('Ingreso registrado correctamente')
      }

      cerrarModalMovimiento()
      cargarDatos()
    } catch (error: unknown) {
      setError(getErrorMessage(error, 'Error al guardar movimiento'))
    }
  }

  const eliminarMovimiento = async (tipo: 'GASTO' | 'INGRESO', id: number) => {
    try {
      if (tipo === 'GASTO') {
        await deleteGasto(id)
        setMensaje('Gasto eliminado correctamente')
      } else {
        await deleteIngreso(id)
        setMensaje('Ingreso eliminado correctamente')
      }
      cargarDatos()
    } catch (error: unknown) {
      setError(getErrorMessage(error, 'Error al eliminar movimiento'))
    }
  }

  const renderCategoria = (categoria: CategoriaFinanciera, variant: 'red' | 'green') => (
    <div key={categoria.id_categoria} className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="flex min-w-0 items-center gap-2">
        <Badge variant={variant}>{categoria.tipo === 'GASTO' ? 'Gasto' : 'Ingreso'}</Badge>
        {categoria.es_sistema ? <Badge variant="blue">Base</Badge> : null}
        <span className="truncate font-semibold text-slate-800">{categoria.nombre}</span>
      </div>
      <div className="flex shrink-0 gap-2">
        <Button variant="secondary" size="sm" icon={<Edit3 size={15} />} onClick={() => editarCategoria(categoria)}>Editar</Button>
        <Button variant="danger" size="sm" icon={<Trash2 size={15} />} onClick={() => setCategoriaAEliminar(categoria.id_categoria)}>Eliminar</Button>
      </div>
    </div>
  )

  const renderMovimiento = (movimiento: Gasto | Ingreso, tipo: 'GASTO' | 'INGRESO') => {
    const esGasto = tipo === 'GASTO'
    const id = esGasto ? (movimiento as Gasto).id_gasto : (movimiento as Ingreso).id_ingreso

    return (
      <div key={`${tipo}-${id}`} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <Badge variant={esGasto ? 'red' : 'green'}>{esGasto ? 'Gasto' : 'Ingreso'}</Badge>
              <Badge variant={movimiento.origen && movimiento.origen !== 'MANUAL' ? 'blue' : 'gray'}>{origenLabel(movimiento.origen)}</Badge>
              <p className="truncate font-semibold text-slate-900">{obtenerNombreCategoriaMovimiento(movimiento)}</p>
            </div>
            <p className="text-sm text-slate-500">{movimiento.descripcion || 'Sin descripción'}</p>
            <p className="mt-1 text-xs font-medium text-slate-500">{movimiento.nombre_finca || 'N/A'} · {movimiento.fecha?.slice(0, 10)}</p>
          </div>

          <div className="shrink-0 text-right">
            <p className={`shrink-0 whitespace-nowrap text-right font-bold tabular-nums ${esGasto ? 'text-red-600' : 'text-emerald-700'}`}>{money(movimiento.monto)}</p>
            {(!movimiento.origen || movimiento.origen === 'MANUAL') && (
              <button onClick={() => setMovimientoAEliminar({ tipo, id })} className="mt-2 text-xs font-semibold text-red-600 hover:underline">
                Eliminar
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  const tabs: Array<{ id: TabFinanzas; label: string; icon: typeof Wallet }> = [
    { id: 'resumen', label: 'Resumen', icon: Wallet },
    { id: 'movimientos', label: 'Movimientos', icon: ReceiptText },
    { id: 'comercial', label: 'Compras y ventas', icon: HandCoins },
    { id: 'cuentas', label: 'Cuentas', icon: Landmark },
    { id: 'categorias', label: 'Categorías', icon: Tags },
    { id: 'reportes', label: 'Reportes', icon: BarChart3 },
  ]

  return (
    <div>
      <PageHeader
        title="Finanzas"
        description="Responde rápido si la finca está ganando, perdiendo, qué debe pagar, qué falta por cobrar y de dónde sale cada movimiento."
        action={
          <>
            <Button variant="danger" onClick={() => abrirModalMovimiento('GASTO')} icon={<ArrowDownCircle size={17} />}>Registrar gasto</Button>
            <Button onClick={() => abrirModalMovimiento('INGRESO')} icon={<ArrowUpCircle size={17} />}>Registrar ingreso</Button>
          </>
        }
      />

      {error && <Alert type="error" message={error} />}
      {mensaje && <Alert type="success" message={mensaje} />}
      {resumen.balance < 0 && <Alert type="warning" message="El balance filtrado está en negativo. Revisa primero los gastos grandes y cuentas pendientes." />}

      <Panel title="Vista por finca y fecha" className="mb-6">
        <div className="grid gap-3 lg:grid-cols-[1fr_190px_160px_160px]">
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">Finca</label>
            <select value={fincaFiltro} onChange={(e) => setFincaFiltro(e.target.value)} className="w-full">
              <option value="">Todas las fincas</option>
              {fincas.map((finca) => <option key={finca.id_finca} value={finca.id_finca}>{finca.nombre}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">Periodo</label>
            <select value={periodoFiltro} onChange={(e) => setPeriodoFiltro(e.target.value as PeriodoFiltro)} className="w-full">
              <option value="MES">Este mes</option>
              <option value="SEMANA">Últimos 7 días</option>
              <option value="ANIO">Este año</option>
              <option value="TODO">Todo</option>
              <option value="PERSONALIZADO">Personalizado</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">Desde</label>
            <input type="date" value={rangoFecha.desde} disabled={periodoFiltro !== 'PERSONALIZADO'} onChange={(e) => setFechaDesde(e.target.value)} className="w-full" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">Hasta</label>
            <input type="date" value={rangoFecha.hasta} disabled={periodoFiltro !== 'PERSONALIZADO'} onChange={(e) => setFechaHasta(e.target.value)} className="w-full" />
          </div>
        </div>
      </Panel>

      <div className="mb-6 flex gap-2 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-2">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const active = activeTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition ${
                active ? 'bg-emerald-700 text-white' : 'text-slate-600 hover:bg-emerald-50 hover:text-emerald-800'
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {activeTab === 'resumen' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            <StatCard title="Ingresos" value={money(resumen.totalIngresos)} icon={<ArrowUpCircle size={20} />} />
            <StatCard title="Gastos" value={money(resumen.totalGastos)} icon={<ArrowDownCircle size={20} />} tone="red" />
            <StatCard title="Balance" value={money(resumen.balance)} icon={<Wallet size={20} />} tone={resumen.balance >= 0 ? 'green' : 'red'} />
            <StatCard title="Por cobrar" value={money(resumen.cuentasPorCobrar)} icon={<Banknote size={20} />} tone="blue" />
            <StatCard title="Por pagar" value={money(resumen.cuentasPorPagar)} icon={<Landmark size={20} />} tone="yellow" />
            <StatCard title="Margen" value={`${resumen.margen.toFixed(1)}%`} icon={<BarChart3 size={20} />} tone={resumen.margen >= 0 ? 'green' : 'red'} />
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <Panel title="Lo más importante">
              <div className="grid gap-3">
                <div className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-sm font-semibold text-slate-500">Mayor gasto</p>
                  <p className="mt-1 text-lg font-bold text-slate-950">{resumen.categoriaMayorGasto?.[0] || 'Sin gastos'}</p>
                  <p className="text-sm text-red-600">{resumen.categoriaMayorGasto ? money(resumen.categoriaMayorGasto[1]) : money(0)}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-sm font-semibold text-slate-500">Mayor ingreso</p>
                  <p className="mt-1 text-lg font-bold text-slate-950">{resumen.categoriaMayorIngreso?.[0] || 'Sin ingresos'}</p>
                  <p className="text-sm text-emerald-700">{resumen.categoriaMayorIngreso ? money(resumen.categoriaMayorIngreso[1]) : money(0)}</p>
                </div>
              </div>
            </Panel>

            <Panel title="Resumen ganadero">
              <div className="grid gap-3">
                <div className="flex justify-between rounded-2xl border border-slate-200 p-4">
                  <span className="text-sm font-semibold text-slate-600">Compra de animales</span>
                  <span className="font-bold text-red-600">{money(resumen.totalComprasAnimales)}</span>
                </div>
                <div className="flex justify-between rounded-2xl border border-slate-200 p-4">
                  <span className="text-sm font-semibold text-slate-600">Venta de animales</span>
                  <span className="font-bold text-emerald-700">{money(resumen.totalVentasAnimales)}</span>
                </div>
                <div className="flex justify-between rounded-2xl border border-slate-200 p-4">
                  <span className="text-sm font-semibold text-slate-600">Venta de leche</span>
                  <span className="font-bold text-emerald-700">{money(resumen.totalVentasLeche)}</span>
                </div>
              </div>
            </Panel>
          </div>
        </div>
      )}

      {activeTab === 'movimientos' && (
        <div className="space-y-6">
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">Buscar movimiento</label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input type="search" value={busquedaMovimiento} onChange={(e) => setBusquedaMovimiento(e.target.value)} className="w-full pl-10" placeholder="Categoría, descripción, finca u origen" />
            </div>
          </div>

          <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Panel title="Gastos" count={gastosFiltrados.length}>
              {loading ? <p className="text-sm text-slate-500">Cargando gastos...</p> : gastosFiltrados.length === 0 ? <EmptyState title="No encontramos gastos" /> : <div className="space-y-3">{gastosFiltrados.map((gasto) => renderMovimiento(gasto, 'GASTO'))}</div>}
            </Panel>
            <Panel title="Ingresos" count={ingresosFiltrados.length}>
              {loading ? <p className="text-sm text-slate-500">Cargando ingresos...</p> : ingresosFiltrados.length === 0 ? <EmptyState title="No encontramos ingresos" /> : <div className="space-y-3">{ingresosFiltrados.map((ingreso) => renderMovimiento(ingreso, 'INGRESO'))}</div>}
            </Panel>
          </section>
        </div>
      )}

      {activeTab === 'comercial' && (
        <div className="grid gap-6 xl:grid-cols-3">
          <Panel title="Compras de animales" count={comprasFiltradas.length}>
            <div className="space-y-3">
              {comprasFiltradas.length === 0 ? <EmptyState title="No hay compras en el periodo" /> : comprasFiltradas.slice(0, 8).map((compra) => (
                <div key={compra.id_compra_animal} className="rounded-2xl border border-slate-200 p-4">
                  <p className="font-semibold text-slate-950">{compra.codigo_animal || compra.codigo || compra.descripcion || 'Animal comprado'}</p>
                  <p className="mt-1 text-sm text-slate-500">{compra.nombre_proveedor || 'Sin proveedor'} · {compra.fecha_compra}</p>
                  <p className="mt-2 font-bold text-red-600">{money(compra.precio)}</p>
                </div>
              ))}
            </div>
          </Panel>
          <Panel title="Ventas de animales" count={ventasAnimalesFiltradas.length}>
            <div className="space-y-3">
              {ventasAnimalesFiltradas.length === 0 ? <EmptyState title="No hay ventas de animales" /> : ventasAnimalesFiltradas.slice(0, 8).map((venta) => (
                <div key={venta.id_venta_animal} className="rounded-2xl border border-slate-200 p-4">
                  <p className="font-semibold text-slate-950">{venta.codigo || venta.nombre_animal || 'Animal vendido'}</p>
                  <p className="mt-1 text-sm text-slate-500">{venta.nombre_cliente || 'Sin cliente'} · {venta.fecha_venta}</p>
                  <p className="mt-2 font-bold text-emerald-700">{money(venta.precio)}</p>
                </div>
              ))}
            </div>
          </Panel>
          <Panel title="Ventas de leche" count={ventasLecheFiltradas.length}>
            <div className="space-y-3">
              {ventasLecheFiltradas.length === 0 ? <EmptyState title="No hay ventas de leche" /> : ventasLecheFiltradas.slice(0, 8).map((venta) => (
                <div key={venta.id_venta_leche} className="rounded-2xl border border-slate-200 p-4">
                  <p className="font-semibold text-slate-950">{Number(venta.litros || 0).toLocaleString()} litros</p>
                  <p className="mt-1 text-sm text-slate-500">{venta.nombre_cliente || 'Sin cliente'} · {venta.fecha_venta}</p>
                  <p className="mt-2 font-bold text-emerald-700">{money(venta.total)}</p>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      )}

      {activeTab === 'cuentas' && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Panel title="Cuentas por pagar" count={cuentasPagarPendientes.length} helper="Dinero que la finca debe pagar.">
            <div className="space-y-3">
              {cuentasPagarPendientes.length === 0 ? <EmptyState title="No hay cuentas por pagar pendientes" /> : cuentasPagarPendientes.map((cuenta) => (
                <div key={cuenta.id_cuenta_pagar} className="rounded-2xl border border-slate-200 p-4">
                  <p className="font-semibold text-slate-950">{cuenta.descripcion}</p>
                  <p className="mt-1 text-sm text-slate-500">Vence: {cuenta.fecha_vencimiento}</p>
                  <p className="mt-2 font-bold text-red-600">{money(cuenta.monto)}</p>
                </div>
              ))}
            </div>
          </Panel>
          <Panel title="Cuentas por cobrar" count={cuentasCobrarPendientes.length} helper="Dinero pendiente por entrar.">
            <div className="space-y-3">
              {cuentasCobrarPendientes.length === 0 ? <EmptyState title="No hay cuentas por cobrar pendientes" /> : cuentasCobrarPendientes.map((cuenta) => (
                <div key={cuenta.id_cuenta_cobrar} className="rounded-2xl border border-slate-200 p-4">
                  <p className="font-semibold text-slate-950">{cuenta.descripcion}</p>
                  <p className="mt-1 text-sm text-slate-500">Vence: {cuenta.fecha_vencimiento}</p>
                  <p className="mt-2 font-bold text-emerald-700">{money(cuenta.monto)}</p>
                </div>
              ))}
            </div>
          </Panel>
          <div className="lg:col-span-2">
            <Link to="/cuentas" className="inline-flex rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800">
              Administrar cuentas
            </Link>
          </div>
        </div>
      )}

      {activeTab === 'categorias' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Panel title="Categorías de gasto" count={categoriasGasto.length}>
            <div className="mb-4">
              <Button onClick={() => abrirModalCategoria('GASTO')} icon={<Plus size={17} />}>Nueva categoría gasto</Button>
            </div>
            <div className="space-y-2">
              {categoriasGasto.length === 0 ? <EmptyState title="No hay categorías de gasto" /> : categoriasGasto.map((categoria) => renderCategoria(categoria, 'red'))}
            </div>
          </Panel>
          <Panel title="Categorías de ingreso" count={categoriasIngreso.length}>
            <div className="mb-4">
              <Button onClick={() => abrirModalCategoria('INGRESO')} icon={<Plus size={17} />}>Nueva categoría ingreso</Button>
            </div>
            <div className="space-y-2">
              {categoriasIngreso.length === 0 ? <EmptyState title="No hay categorías de ingreso" /> : categoriasIngreso.map((categoria) => renderCategoria(categoria, 'green'))}
            </div>
          </Panel>
        </div>
      )}

      {activeTab === 'reportes' && (
        <div className="grid gap-6 xl:grid-cols-2">
          <Panel title="Reporte del periodo" helper="Resumen listo para tomar decisiones rápidas.">
            <div className="space-y-3">
              <p className="flex justify-between rounded-2xl border border-slate-200 p-4"><span>Resultado financiero</span><strong className="whitespace-nowrap tabular-nums">{money(resumen.balance)}</strong></p>
              <p className="flex justify-between rounded-2xl border border-slate-200 p-4"><span>Ingresos ganaderos</span><strong className="whitespace-nowrap tabular-nums">{money(resumen.totalVentasAnimales + resumen.totalVentasLeche)}</strong></p>
              <p className="flex justify-between rounded-2xl border border-slate-200 p-4"><span>Compra de animales</span><strong className="whitespace-nowrap tabular-nums">{money(resumen.totalComprasAnimales)}</strong></p>
              <p className="flex justify-between rounded-2xl border border-slate-200 p-4"><span>Saldo pendiente neto</span><strong className="whitespace-nowrap tabular-nums">{money(resumen.cuentasPorCobrar - resumen.cuentasPorPagar)}</strong></p>
            </div>
          </Panel>
          <Panel title="Lectura rápida">
            <div className="space-y-3 text-sm leading-6 text-slate-700">
              <p className="rounded-2xl border border-slate-200 p-4">
                {resumen.balance >= 0 ? 'La finca está con balance positivo en el periodo filtrado.' : 'La finca está con balance negativo en el periodo filtrado.'}
              </p>
              <p className="rounded-2xl border border-slate-200 p-4">
                El mayor gasto es {resumen.categoriaMayorGasto?.[0] || 'no registrado'} y el mayor ingreso es {resumen.categoriaMayorIngreso?.[0] || 'no registrado'}.
              </p>
              <p className="rounded-2xl border border-slate-200 p-4">
                Tienes {money(resumen.cuentasPorCobrar)} por cobrar y {money(resumen.cuentasPorPagar)} por pagar.
              </p>
            </div>
          </Panel>
        </div>
      )}

      <Modal isOpen={modalCategoriaAbierto} onClose={cerrarModalCategoria} title={editandoCategoriaId ? 'Editar categoría' : 'Nueva categoría'}>
        <form onSubmit={guardarCategoria} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700">Tipo de categoría</label>
            <select value={tipoCategoria} onChange={(e) => setTipoCategoria(e.target.value as 'GASTO' | 'INGRESO')} className="mt-1 w-full">
              <option value="GASTO">Gasto</option>
              <option value="INGRESO">Ingreso</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700">Nombre de la categoría</label>
            <input type="text" value={nombreCategoria} onChange={(e) => setNombreCategoria(e.target.value)} className="mt-1 w-full" placeholder="Concentrado, Veterinario, Venta de leche..." />
          </div>
          <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
            <Button type="button" variant="secondary" onClick={cerrarModalCategoria}>Cancelar</Button>
            <Button type="submit">{editandoCategoriaId ? 'Actualizar categoría' : 'Guardar categoría'}</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={modalMovimientoAbierto} onClose={cerrarModalMovimiento} title={tipoMovimiento === 'GASTO' ? 'Registrar gasto' : 'Registrar ingreso'}>
        <form onSubmit={guardarMovimiento} className="space-y-4">
          <Alert type="info" message={`Estás registrando un movimiento manual de tipo ${tipoMovimiento === 'GASTO' ? 'gasto' : 'ingreso'}.`} />
          {categoriasMovimiento.length === 0 && <Alert type="warning" message={`Primero debes crear una categoría de ${tipoMovimiento === 'GASTO' ? 'gasto' : 'ingreso'}.`} />}
          <div>
            <label className="block text-sm font-semibold text-slate-700">Finca</label>
            <select value={idFinca} onChange={(e) => setIdFinca(e.target.value)} className="mt-1 w-full">
              <option value="">Seleccionar finca</option>
              {fincas.map((finca) => <option key={finca.id_finca} value={finca.id_finca}>{finca.nombre}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700">Categoría</label>
            <select value={idCategoria} onChange={(e) => setIdCategoria(e.target.value)} className="mt-1 w-full">
              <option value="">Seleccionar categoría</option>
              {categoriasMovimiento.map((categoria) => <option key={categoria.id_categoria} value={categoria.id_categoria}>{categoria.nombre}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700">Monto</label>
            <input type="number" value={monto} onChange={(e) => setMonto(e.target.value)} className="mt-1 w-full" placeholder="250000" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700">Fecha</label>
            <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} className="mt-1 w-full" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700">Descripción opcional</label>
            <input type="text" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} className="mt-1 w-full" placeholder="Ej: concentrado, venta de leche, veterinario..." />
          </div>
          <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
            <Button type="button" variant="secondary" onClick={cerrarModalMovimiento}>Cancelar</Button>
            <Button type="submit" disabled={categoriasMovimiento.length === 0}>{tipoMovimiento === 'GASTO' ? 'Guardar gasto' : 'Guardar ingreso'}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={categoriaAEliminar !== null}
        title="Eliminar categoría"
        message="Vas a eliminar esta categoría. Los movimientos asociados podrían quedar sin categoría."
        onCancel={() => setCategoriaAEliminar(null)}
        onConfirm={() => {
          if (categoriaAEliminar !== null) {
            eliminarCategoria(categoriaAEliminar)
            setCategoriaAEliminar(null)
          }
        }}
      />

      <ConfirmDialog
        isOpen={movimientoAEliminar !== null}
        title="Eliminar movimiento"
        message="Vas a eliminar este movimiento financiero. Esta acción no se puede deshacer."
        onCancel={() => setMovimientoAEliminar(null)}
        onConfirm={() => {
          if (movimientoAEliminar) {
            eliminarMovimiento(movimientoAEliminar.tipo, movimientoAEliminar.id)
            setMovimientoAEliminar(null)
          }
        }}
      />
    </div>
  )
}

export default Finanzas










