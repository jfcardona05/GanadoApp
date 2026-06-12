import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'

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
  getResumenFinanciero,
} from '../services/finanzaService'
import type { Gasto, Ingreso } from '../services/finanzaService'

import Modal from '../components/Modal'
import Button from '../components/Button'
import PageHeader from '../components/PageHeader'
import EmptyState from '../components/EmptyState'
import Alert from '../components/Alert'
import Badge from '../components/Badge'

function Finanzas() {
  const [fincas, setFincas] = useState<Finca[]>([])
  const [categorias, setCategorias] = useState<CategoriaFinanciera[]>([])
  const [gastos, setGastos] = useState<Gasto[]>([])
  const [ingresos, setIngresos] = useState<Ingreso[]>([])

  const [resumen, setResumen] = useState({
    total_ingresos: 0,
    total_gastos: 0,
    balance: 0,
  })

  const [tipoCategoria, setTipoCategoria] = useState<'GASTO' | 'INGRESO'>('GASTO')
  const [nombreCategoria, setNombreCategoria] = useState('')
  const [editandoCategoriaId, setEditandoCategoriaId] = useState<number | null>(null)

  const [tipoMovimiento, setTipoMovimiento] = useState<'GASTO' | 'INGRESO'>('GASTO')
  const [idFinca, setIdFinca] = useState('')
  const [idCategoria, setIdCategoria] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [monto, setMonto] = useState('')
  const [fecha, setFecha] = useState('')

  const [modalCategoriaAbierto, setModalCategoriaAbierto] = useState(false)
  const [modalMovimientoAbierto, setModalMovimientoAbierto] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')

  const categoriasGasto = categorias.filter((categoria) => categoria.tipo === 'GASTO')
  const categoriasIngreso = categorias.filter((categoria) => categoria.tipo === 'INGRESO')

  const categoriasMovimiento =
    tipoMovimiento === 'GASTO' ? categoriasGasto : categoriasIngreso

  const cargarDatos = async () => {
    try {
      setLoading(true)

      const [
        fincasData,
        categoriasData,
        gastosData,
        ingresosData,
        resumenData,
      ] = await Promise.all([
        getFincas(),
        getCategoriasFinancieras(),
        getGastos(),
        getIngresos(),
        getResumenFinanciero(),
      ])

      setFincas(fincasData)
      setCategorias(categoriasData)
      setGastos(gastosData)
      setIngresos(ingresosData)
      setResumen(resumenData)
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error al cargar finanzas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarDatos()
  }, [])

  const limpiarFormularioCategoria = () => {
    setTipoCategoria('GASTO')
    setNombreCategoria('')
    setEditandoCategoriaId(null)
  }

  const limpiarFormularioMovimiento = () => {
    setTipoMovimiento('GASTO')
    setIdFinca('')
    setIdCategoria('')
    setDescripcion('')
    setMonto('')
    setFecha('')
  }

  const abrirModalCategoria = () => {
    limpiarFormularioCategoria()
    setError('')
    setMensaje('')
    setModalCategoriaAbierto(true)
  }

  const cerrarModalCategoria = () => {
    setModalCategoriaAbierto(false)
    limpiarFormularioCategoria()
  }

  const abrirModalMovimiento = () => {
    limpiarFormularioMovimiento()
    setError('')
    setMensaje('')
    setModalMovimientoAbierto(true)
  }

  const cerrarModalMovimiento = () => {
    setModalMovimientoAbierto(false)
    limpiarFormularioMovimiento()
  }

  const cambiarTipoMovimiento = (tipo: 'GASTO' | 'INGRESO') => {
    setTipoMovimiento(tipo)
    setIdCategoria('')
  }

  const guardarCategoria = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setMensaje('')

    if (!nombreCategoria.trim()) {
      setError('El nombre de la categoría es obligatorio')
      return
    }

    const data = {
      nombre: nombreCategoria,
      tipo: tipoCategoria,
    }

    try {
      if (editandoCategoriaId) {
        await updateCategoriaFinanciera(editandoCategoriaId, data)
        setMensaje('Categoría actualizada correctamente')
      } else {
        await createCategoriaFinanciera(data)
        setMensaje('Categoría creada correctamente')
      }

      cerrarModalCategoria()
      cargarDatos()
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error al guardar categoría')
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
    const confirmar = window.confirm(
      '¿Seguro que deseas eliminar esta categoría? Los movimientos asociados podrían quedar sin categoría.'
    )

    if (!confirmar) return

    try {
      await deleteCategoriaFinanciera(id)
      setMensaje('Categoría eliminada correctamente')
      cargarDatos()
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error al eliminar categoría')
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
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error al guardar movimiento')
    }
  }

  const eliminarMovimiento = async (
    tipo: 'GASTO' | 'INGRESO',
    id: number
  ) => {
    const confirmar = window.confirm('¿Seguro que deseas eliminar este movimiento?')

    if (!confirmar) return

    try {
      if (tipo === 'GASTO') {
        await deleteGasto(id)
        setMensaje('Gasto eliminado correctamente')
      } else {
        await deleteIngreso(id)
        setMensaje('Ingreso eliminado correctamente')
      }

      cargarDatos()
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error al eliminar movimiento')
    }
  }

  const obtenerNombreCategoriaMovimiento = (movimiento: Gasto | Ingreso) => {
    return movimiento.nombre_categoria || movimiento.categoria || 'Sin categoría'
  }

  return (
    <div>
      <PageHeader
        title="Finanzas"
        description="Crea categorías personalizadas y registra gastos e ingresos de tus fincas."
        action={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={abrirModalCategoria}>
              Nueva categoría
            </Button>

            <Button onClick={abrirModalMovimiento}>
              Registrar movimiento
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
          <p className="text-sm text-gray-500">Ingresos</p>
          <h2 className="text-2xl font-bold text-green-700">
            ${Number(resumen.total_ingresos).toLocaleString()}
          </h2>
        </div>

        <div className="bg-white rounded-xl shadow p-5">
          <p className="text-sm text-gray-500">Gastos</p>
          <h2 className="text-2xl font-bold text-red-600">
            ${Number(resumen.total_gastos).toLocaleString()}
          </h2>
        </div>

        <div className="bg-white rounded-xl shadow p-5">
          <p className="text-sm text-gray-500">Balance</p>
          <h2
            className={`text-2xl font-bold ${
              Number(resumen.balance) >= 0 ? 'text-green-700' : 'text-red-600'
            }`}
          >
            ${Number(resumen.balance).toLocaleString()}
          </h2>
        </div>

        <div className="bg-white rounded-xl shadow p-5">
          <p className="text-sm text-gray-500">Categorías</p>
          <h2 className="text-2xl font-bold text-green-700">
            {categorias.length}
          </h2>
        </div>
      </div>

      <section className="bg-white rounded-xl shadow p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Categorías financieras
          </h2>

          <span className="text-sm text-gray-500">
            Total: {categorias.length}
          </span>
        </div>

        {loading ? (
          <p className="text-gray-500">Cargando categorías...</p>
        ) : categorias.length === 0 ? (
          <EmptyState
            title="No hay categorías financieras"
            description="Crea categorías de gasto e ingreso para registrar movimientos financieros de forma organizada."
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-700 mb-3">
                Categorías de gasto
              </h3>

              {categoriasGasto.length === 0 ? (
                <p className="text-sm text-gray-500">
                  No hay categorías de gasto.
                </p>
              ) : (
                <div className="space-y-2">
                  {categoriasGasto.map((categoria) => (
                    <div
                      key={categoria.id_categoria}
                      className="flex items-center justify-between rounded-lg border p-3 hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-2">
                        <Badge variant="red">Gasto</Badge>
                        <span className="font-medium text-gray-800">
                          {categoria.nombre}
                        </span>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="secondary"
                          onClick={() => editarCategoria(categoria)}
                        >
                          Editar
                        </Button>

                        <Button
                          variant="danger"
                          onClick={() => eliminarCategoria(categoria.id_categoria)}
                        >
                          Eliminar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h3 className="font-semibold text-gray-700 mb-3">
                Categorías de ingreso
              </h3>

              {categoriasIngreso.length === 0 ? (
                <p className="text-sm text-gray-500">
                  No hay categorías de ingreso.
                </p>
              ) : (
                <div className="space-y-2">
                  {categoriasIngreso.map((categoria) => (
                    <div
                      key={categoria.id_categoria}
                      className="flex items-center justify-between rounded-lg border p-3 hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-2">
                        <Badge variant="green">Ingreso</Badge>
                        <span className="font-medium text-gray-800">
                          {categoria.nombre}
                        </span>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="secondary"
                          onClick={() => editarCategoria(categoria)}
                        >
                          Editar
                        </Button>

                        <Button
                          variant="danger"
                          onClick={() => eliminarCategoria(categoria.id_categoria)}
                        >
                          Eliminar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">
              Gastos
            </h2>

            <span className="text-sm text-gray-500">
              Total: {gastos.length}
            </span>
          </div>

          {loading ? (
            <p className="text-gray-500">Cargando gastos...</p>
          ) : gastos.length === 0 ? (
            <EmptyState
              title="No hay gastos registrados"
              description="Registra gastos como alimentación, medicamentos, transporte o mano de obra."
            />
          ) : (
            <div className="space-y-3">
              {gastos.map((gasto) => (
                <div
                  key={gasto.id_gasto}
                  className="border-b pb-3 flex justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="red">Gasto</Badge>
                      <p className="font-semibold text-gray-800">
                        {obtenerNombreCategoriaMovimiento(gasto)}
                      </p>
                    </div>

                    <p className="text-sm text-gray-500">
                      {gasto.descripcion || 'Sin descripción'}
                    </p>

                    <p className="text-sm text-gray-500">
                      {gasto.nombre_finca || 'N/A'} - {gasto.fecha?.slice(0, 10)}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-red-600">
                      ${Number(gasto.monto).toLocaleString()}
                    </p>

                    <button
                      onClick={() => eliminarMovimiento('GASTO', gasto.id_gasto)}
                      className="text-sm text-red-600 hover:underline"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">
              Ingresos
            </h2>

            <span className="text-sm text-gray-500">
              Total: {ingresos.length}
            </span>
          </div>

          {loading ? (
            <p className="text-gray-500">Cargando ingresos...</p>
          ) : ingresos.length === 0 ? (
            <EmptyState
              title="No hay ingresos registrados"
              description="Registra ingresos como venta de ganado, venta de leche u otros movimientos."
            />
          ) : (
            <div className="space-y-3">
              {ingresos.map((ingreso) => (
                <div
                  key={ingreso.id_ingreso}
                  className="border-b pb-3 flex justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="green">Ingreso</Badge>
                      <p className="font-semibold text-gray-800">
                        {obtenerNombreCategoriaMovimiento(ingreso)}
                      </p>
                    </div>

                    <p className="text-sm text-gray-500">
                      {ingreso.descripcion || 'Sin descripción'}
                    </p>

                    <p className="text-sm text-gray-500">
                      {ingreso.nombre_finca || 'N/A'} - {ingreso.fecha?.slice(0, 10)}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-green-700">
                      ${Number(ingreso.monto).toLocaleString()}
                    </p>

                    <button
                      onClick={() => eliminarMovimiento('INGRESO', ingreso.id_ingreso)}
                      className="text-sm text-red-600 hover:underline"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Modal
        isOpen={modalCategoriaAbierto}
        onClose={cerrarModalCategoria}
        title={editandoCategoriaId ? 'Editar categoría' : 'Nueva categoría'}
      >
        <form onSubmit={guardarCategoria} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Tipo de categoría
            </label>

            <select
              value={tipoCategoria}
              onChange={(e) => setTipoCategoria(e.target.value as 'GASTO' | 'INGRESO')}
              className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
            >
              <option value="GASTO">Gasto</option>
              <option value="INGRESO">Ingreso</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nombre de la categoría
            </label>

            <input
              type="text"
              value={nombreCategoria}
              onChange={(e) => setNombreCategoria(e.target.value)}
              className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
              placeholder="Concentrado, Veterinario, Venta de leche..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={cerrarModalCategoria}
            >
              Cancelar
            </Button>

            <Button type="submit">
              {editandoCategoriaId ? 'Actualizar categoría' : 'Guardar categoría'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={modalMovimientoAbierto}
        onClose={cerrarModalMovimiento}
        title="Registrar movimiento"
      >
        <form onSubmit={guardarMovimiento} className="space-y-4">
          <div className="flex gap-2">
            <Button
              type="button"
              variant={tipoMovimiento === 'GASTO' ? 'danger' : 'secondary'}
              onClick={() => cambiarTipoMovimiento('GASTO')}
            >
              Gasto
            </Button>

            <Button
              type="button"
              variant={tipoMovimiento === 'INGRESO' ? 'primary' : 'secondary'}
              onClick={() => cambiarTipoMovimiento('INGRESO')}
            >
              Ingreso
            </Button>
          </div>

          {categoriasMovimiento.length === 0 && (
            <Alert
              type="warning"
              message={`Primero debes crear una categoría de tipo ${
                tipoMovimiento === 'GASTO' ? 'gasto' : 'ingreso'
              } para registrar este movimiento.`}
            />
          )}

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

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Categoría
            </label>

            <select
              value={idCategoria}
              onChange={(e) => setIdCategoria(e.target.value)}
              className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
            >
              <option value="">Seleccionar categoría</option>
              {categoriasMovimiento.map((categoria) => (
                <option key={categoria.id_categoria} value={categoria.id_categoria}>
                  {categoria.nombre}
                </option>
              ))}
            </select>
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
              placeholder="Detalle del movimiento"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Monto
            </label>

            <input
              type="number"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
              placeholder="250000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Fecha
            </label>

            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={cerrarModalMovimiento}
            >
              Cancelar
            </Button>

            <Button
              type="submit"
              disabled={categoriasMovimiento.length === 0}
            >
              Guardar movimiento
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Finanzas