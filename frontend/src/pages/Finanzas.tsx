import {
  ArrowDownCircle,
  ArrowUpCircle,
  Edit3,
  Eye,
  FolderPlus,
  Plus,
  Search,
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
import { getErrorMessage } from '../utils/errors'

type MovimientoEliminar = {
  tipo: 'GASTO' | 'INGRESO'
  id: number
} | null

type PeriodoFiltro = 'MES' | 'SEMANA' | 'ANIO' | 'TODO' | 'PERSONALIZADO'

function startOfToday() {
  const date = new Date()
  date.setHours(0, 0, 0, 0)
  return date
}

function formatDateInput(date: Date) {
  return date.toISOString().slice(0, 10)
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

function Finanzas() {
  const [fincas, setFincas] = useState<Finca[]>([])
  const [categorias, setCategorias] = useState<CategoriaFinanciera[]>([])
  const [gastos, setGastos] = useState<Gasto[]>([])
  const [ingresos, setIngresos] = useState<Ingreso[]>([])

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
  const [modalCategoriasListaAbierto, setModalCategoriasListaAbierto] = useState(false)
  const [modalMovimientoAbierto, setModalMovimientoAbierto] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')

  const categoriasGasto = categorias.filter((categoria) => categoria.tipo === 'GASTO')
  const categoriasIngreso = categorias.filter((categoria) => categoria.tipo === 'INGRESO')
  const categoriasMovimiento = tipoMovimiento === 'GASTO' ? categoriasGasto : categoriasIngreso
  const rangoFecha = getPeriodRange(periodoFiltro, fechaDesde, fechaHasta)
  const fincaSeleccionada = fincas.find((finca) => finca.id_finca === Number(fincaFiltro))

  const cargarDatos = async () => {
    try {
      setLoading(true)
      const [fincasData, categoriasData, gastosData, ingresosData] = await Promise.all([
        getFincas(),
        getCategoriasFinancieras(),
        getGastos(),
        getIngresos(),
      ])
      setFincas(fincasData)
      setCategorias(categoriasData)
      setGastos(gastosData)
      setIngresos(ingresosData)
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

  const obtenerNombreCategoriaMovimiento = (movimiento: Gasto | Ingreso) => {
    return movimiento.nombre_categoria || movimiento.categoria || 'Sin categoría'
  }

  const filtrarMovimiento = (movimiento: Gasto | Ingreso) => {
    const texto = `${obtenerNombreCategoriaMovimiento(movimiento)} ${movimiento.descripcion || ''} ${movimiento.nombre_finca || ''}`.toLowerCase()
    const coincideBusqueda = texto.includes(busquedaMovimiento.toLowerCase())
    const coincideFinca = fincaFiltro ? movimiento.id_finca === Number(fincaFiltro) : true
    const coincideFecha = isDateInRange(movimiento.fecha, rangoFecha.desde, rangoFecha.hasta)
    return coincideBusqueda && coincideFinca && coincideFecha
  }

  const gastosFiltrados = gastos.filter(filtrarMovimiento)
  const ingresosFiltrados = ingresos.filter(filtrarMovimiento)

  const resumenFiltrado = useMemo(() => {
    const totalGastos = gastosFiltrados.reduce((total, gasto) => total + Number(gasto.monto), 0)
    const totalIngresos = ingresosFiltrados.reduce((total, ingreso) => total + Number(ingreso.monto), 0)
    const balance = totalIngresos - totalGastos
    const mayorGasto = gastosFiltrados.reduce<Gasto | null>((mayor, gasto) => {
      if (!mayor || Number(gasto.monto) > Number(mayor.monto)) return gasto
      return mayor
    }, null)

    const gastoPorCategoria = gastosFiltrados.reduce<Record<string, number>>((acc, gasto) => {
      const categoria = obtenerNombreCategoriaMovimiento(gasto)
      acc[categoria] = (acc[categoria] || 0) + Number(gasto.monto)
      return acc
    }, {})

    const categoriaMayorGasto = Object.entries(gastoPorCategoria).sort((a, b) => b[1] - a[1])[0]
    const gastoPromedioPorAnimal = totalGastos > 0 && fincaSeleccionada ? totalGastos / Math.max(1, 1) : totalGastos

    return {
      totalGastos,
      totalIngresos,
      balance,
      mayorGasto,
      categoriaMayorGasto,
      gastoPromedioPorAnimal,
    }
  }, [gastosFiltrados, ingresosFiltrados, fincaSeleccionada])

  const renderCategoria = (categoria: CategoriaFinanciera, variant: 'red' | 'green') => (
    <div key={categoria.id_categoria} className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 p-3 hover:bg-slate-50">
      <div className="flex min-w-0 items-center gap-2">
        <Badge variant={variant}>{categoria.tipo === 'GASTO' ? 'Gasto' : 'Ingreso'}</Badge>
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
      <div key={`${tipo}-${id}`} className="rounded-lg border border-slate-200 p-4 hover:bg-slate-50">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="mb-1 flex items-center gap-2">
              <Badge variant={esGasto ? 'red' : 'green'}>{esGasto ? 'Gasto' : 'Ingreso'}</Badge>
              <p className="truncate font-semibold text-slate-900">{obtenerNombreCategoriaMovimiento(movimiento)}</p>
            </div>
            <p className="text-sm text-slate-500">{movimiento.descripcion || 'Sin descripción'}</p>
            <p className="mt-1 text-xs font-medium text-slate-500">{movimiento.nombre_finca || 'N/A'} · {movimiento.fecha?.slice(0, 10)}</p>
          </div>

          <div className="shrink-0 text-right">
            <p className={`font-bold ${esGasto ? 'text-red-600' : 'text-green-700'}`}>${Number(movimiento.monto).toLocaleString()}</p>
            <button onClick={() => setMovimientoAEliminar({ tipo, id })} className="mt-2 text-xs font-semibold text-red-600 hover:underline">
              Eliminar
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title="Finanzas"
        description="Control económico de tus fincas: gastos, ingresos, balance y categorías."
        action={
          <>
            <Button variant="secondary" onClick={() => setModalCategoriasListaAbierto(true)} icon={<Eye size={17} />}>Ver categorías</Button>
            <Button variant="danger" onClick={() => abrirModalMovimiento('GASTO')} icon={<ArrowDownCircle size={17} />}>Registrar gasto</Button>
            <Button onClick={() => abrirModalMovimiento('INGRESO')} icon={<ArrowUpCircle size={17} />}>Registrar ingreso</Button>
          </>
        }
      />

      {error && <Alert type="error" message={error} />}
      {mensaje && <Alert type="success" message={mensaje} />}
      {resumenFiltrado.balance < 0 && <Alert type="warning" message="El balance filtrado está en negativo. Revisa los gastos para tener claro en qué se está yendo el dinero." />}

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard title="Ingresos" value={`$${resumenFiltrado.totalIngresos.toLocaleString()}`} icon={<ArrowUpCircle size={20} />} />
        <StatCard title="Gastos" value={`$${resumenFiltrado.totalGastos.toLocaleString()}`} icon={<ArrowDownCircle size={20} />} tone="red" />
        <StatCard title="Balance" value={`$${resumenFiltrado.balance.toLocaleString()}`} icon={<Wallet size={20} />} tone={resumenFiltrado.balance >= 0 ? 'green' : 'red'} />
      </div>

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

      <Panel title="Cuentas pendientes" className="mb-6" helper="Aquí puedes revisar deudas por pagar y dinero pendiente por cobrar.">
        <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold text-slate-900">Controla cuentas por pagar y por cobrar</p>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              Útil para saber qué facturas se deben pagar y qué ventas faltan por cobrar.
            </p>
          </div>
          <Link
            to="/cuentas"
            className="inline-flex items-center justify-center rounded-lg bg-green-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-green-800"
          >
            Ver cuentas
          </Link>
        </div>
      </Panel>

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard
          title="Mayor gasto"
          value={resumenFiltrado.mayorGasto ? `$${Number(resumenFiltrado.mayorGasto.monto).toLocaleString()}` : 'N/A'}
          icon={<ArrowDownCircle size={20} />}
          tone="red"
          helper={resumenFiltrado.mayorGasto ? obtenerNombreCategoriaMovimiento(resumenFiltrado.mayorGasto) : 'Sin gastos en el periodo'}
        />
        <StatCard
          title="Categoría con más gasto"
          value={resumenFiltrado.categoriaMayorGasto ? resumenFiltrado.categoriaMayorGasto[0] : 'N/A'}
          icon={<FolderPlus size={20} />}
          tone="slate"
          helper={resumenFiltrado.categoriaMayorGasto ? `$${resumenFiltrado.categoriaMayorGasto[1].toLocaleString()}` : 'Sin gastos en el periodo'}
        />
        <StatCard
          title="Resultado de la finca"
          value={resumenFiltrado.balance >= 0 ? 'Positivo' : 'En pérdida'}
          icon={<Wallet size={20} />}
          tone={resumenFiltrado.balance >= 0 ? 'green' : 'red'}
          helper={fincaSeleccionada ? fincaSeleccionada.nombre : 'Todas las fincas'}
        />
      </div>

      <div className="mb-4">
        <label className="mb-1 block text-sm font-semibold text-slate-700">Buscar movimiento</label>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input type="search" value={busquedaMovimiento} onChange={(e) => setBusquedaMovimiento(e.target.value)} className="w-full pl-10" placeholder="Categoría, descripción o finca" />
        </div>
      </div>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Panel title="Gastos" count={gastosFiltrados.length}>
          {loading ? (
            <p className="text-sm text-slate-500">Cargando gastos...</p>
          ) : gastos.length === 0 ? (
            <EmptyState title="No hay gastos registrados" description="Registra gastos como alimentación, medicamentos, transporte o mano de obra." />
          ) : gastosFiltrados.length === 0 ? (
            <EmptyState title="No encontramos gastos" description="Prueba con otra búsqueda, finca o fecha." />
          ) : (
            <div className="space-y-3">{gastosFiltrados.map((gasto) => renderMovimiento(gasto, 'GASTO'))}</div>
          )}
        </Panel>

        <Panel title="Ingresos" count={ingresosFiltrados.length}>
          {loading ? (
            <p className="text-sm text-slate-500">Cargando ingresos...</p>
          ) : ingresos.length === 0 ? (
            <EmptyState title="No hay ingresos registrados" description="Registra ingresos como venta de ganado, venta de leche u otros movimientos." />
          ) : ingresosFiltrados.length === 0 ? (
            <EmptyState title="No encontramos ingresos" description="Prueba con otra búsqueda, finca o fecha." />
          ) : (
            <div className="space-y-3">{ingresosFiltrados.map((ingreso) => renderMovimiento(ingreso, 'INGRESO'))}</div>
          )}
        </Panel>
      </section>

      <Modal isOpen={modalCategoriasListaAbierto} onClose={() => setModalCategoriasListaAbierto(false)} title="Categorías financieras">
        <div className="mb-4 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => abrirModalCategoria('GASTO')} icon={<Plus size={17} />}>Nueva categoría gasto</Button>
          <Button onClick={() => abrirModalCategoria('INGRESO')} icon={<Plus size={17} />}>Nueva categoría ingreso</Button>
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Gastos</h3>
            <div className="space-y-2">
              {categoriasGasto.length === 0 ? <EmptyState title="No hay categorías de gasto" /> : categoriasGasto.map((categoria) => renderCategoria(categoria, 'red'))}
            </div>
          </div>
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Ingresos</h3>
            <div className="space-y-2">
              {categoriasIngreso.length === 0 ? <EmptyState title="No hay categorías de ingreso" /> : categoriasIngreso.map((categoria) => renderCategoria(categoria, 'green'))}
            </div>
          </div>
        </div>
      </Modal>

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
          <div className={`rounded-lg border p-4 text-sm ${tipoMovimiento === 'GASTO' ? 'border-red-200 bg-red-50 text-red-800' : 'border-green-200 bg-green-50 text-green-800'}`}>
            Estás registrando un <strong>{tipoMovimiento === 'GASTO' ? 'gasto' : 'ingreso'}</strong>.
          </div>

          {categoriasMovimiento.length === 0 && (
            <Alert
              type="warning"
              message={`Primero debes crear una categoría de ${tipoMovimiento === 'GASTO' ? 'gasto' : 'ingreso'} para registrar este movimiento.`}
            />
          )}

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
