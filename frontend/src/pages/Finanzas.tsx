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
    setNombreCategoria('')
    setTipoCategoria('GASTO')
    setEditandoCategoriaId(null)
  }

  const limpiarFormularioMovimiento = () => {
    setIdFinca('')
    setIdCategoria('')
    setDescripcion('')
    setMonto('')
    setFecha('')
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

    try {
      const data = {
        nombre: nombreCategoria,
        tipo: tipoCategoria,
      }

      if (editandoCategoriaId) {
        await updateCategoriaFinanciera(editandoCategoriaId, data)
        setMensaje('Categoría actualizada correctamente')
      } else {
        await createCategoriaFinanciera(data)
        setMensaje('Categoría creada correctamente')
      }

      limpiarFormularioCategoria()
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

      limpiarFormularioMovimiento()
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

  const obtenerNombreCategoriaMovimiento = (
    movimiento: Gasto | Ingreso
  ) => {
    return (
      movimiento.nombre_categoria ||
      movimiento.categoria ||
      'Sin categoría'
    )
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-2">
        Finanzas
      </h1>

      <p className="text-gray-500 mb-6">
        Crea tus propias categorías y registra gastos e ingresos de la finca.
      </p>

      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-4">
          {error}
        </div>
      )}

      {mensaje && (
        <div className="bg-green-100 text-green-700 p-4 rounded-lg mb-4">
          {mensaje}
        </div>
      )}

      {loading && (
        <div className="bg-white rounded-xl shadow p-4 mb-6 text-gray-500">
          Cargando información financiera...
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow p-6">
          <p className="text-sm text-gray-500">Ingresos</p>
          <h2 className="text-2xl font-bold text-green-700">
            ${Number(resumen.total_ingresos).toLocaleString()}
          </h2>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <p className="text-sm text-gray-500">Gastos</p>
          <h2 className="text-2xl font-bold text-red-600">
            ${Number(resumen.total_gastos).toLocaleString()}
          </h2>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <p className="text-sm text-gray-500">Balance</p>
          <h2
            className={`text-2xl font-bold ${
              Number(resumen.balance) >= 0 ? 'text-green-700' : 'text-red-600'
            }`}
          >
            ${Number(resumen.balance).toLocaleString()}
          </h2>
        </div>
      </div>

      <section className="bg-white rounded-xl shadow p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Categorías financieras
        </h2>

        <form
          onSubmit={guardarCategoria}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6"
        >
          <input
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
            placeholder="Nombre de categoría"
            value={nombreCategoria}
            onChange={(e) => setNombreCategoria(e.target.value)}
          />

          <select
            className="border border-gray-300 rounded-lg px-4 py-2"
            value={tipoCategoria}
            onChange={(e) => setTipoCategoria(e.target.value as 'GASTO' | 'INGRESO')}
          >
            <option value="GASTO">Gasto</option>
            <option value="INGRESO">Ingreso</option>
          </select>

          <button className="bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-lg">
            {editandoCategoriaId ? 'Actualizar categoría' : 'Crear categoría'}
          </button>

          {editandoCategoriaId && (
            <button
              type="button"
              onClick={limpiarFormularioCategoria}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
            >
              Cancelar
            </button>
          )}
        </form>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-gray-700 mb-3">
              Categorías de gasto
            </h3>

            {categoriasGasto.length === 0 ? (
              <p className="text-gray-500 text-sm">
                No hay categorías de gasto.
              </p>
            ) : (
              <div className="space-y-2">
                {categoriasGasto.map((categoria) => (
                  <div
                    key={categoria.id_categoria}
                    className="border rounded-lg p-3 flex justify-between items-center"
                  >
                    <span>{categoria.nombre}</span>

                    <div className="flex gap-2">
                      <button
                        onClick={() => editarCategoria(categoria)}
                        className="text-sm bg-blue-600 text-white px-3 py-1 rounded-lg"
                      >
                        Editar
                      </button>

                      <button
                        onClick={() => eliminarCategoria(categoria.id_categoria)}
                        className="text-sm bg-red-600 text-white px-3 py-1 rounded-lg"
                      >
                        Eliminar
                      </button>
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
              <p className="text-gray-500 text-sm">
                No hay categorías de ingreso.
              </p>
            ) : (
              <div className="space-y-2">
                {categoriasIngreso.map((categoria) => (
                  <div
                    key={categoria.id_categoria}
                    className="border rounded-lg p-3 flex justify-between items-center"
                  >
                    <span>{categoria.nombre}</span>

                    <div className="flex gap-2">
                      <button
                        onClick={() => editarCategoria(categoria)}
                        className="text-sm bg-blue-600 text-white px-3 py-1 rounded-lg"
                      >
                        Editar
                      </button>

                      <button
                        onClick={() => eliminarCategoria(categoria.id_categoria)}
                        className="text-sm bg-red-600 text-white px-3 py-1 rounded-lg"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="bg-white rounded-xl shadow p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Registrar movimiento
        </h2>

        <div className="flex gap-2 mb-4">
          <button
            type="button"
            onClick={() => cambiarTipoMovimiento('GASTO')}
            className={`px-4 py-2 rounded-lg ${
              tipoMovimiento === 'GASTO'
                ? 'bg-red-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Gasto
          </button>

          <button
            type="button"
            onClick={() => cambiarTipoMovimiento('INGRESO')}
            className={`px-4 py-2 rounded-lg ${
              tipoMovimiento === 'INGRESO'
                ? 'bg-green-700 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Ingreso
          </button>
        </div>

        {categoriasMovimiento.length === 0 && (
          <div className="bg-yellow-100 text-yellow-800 p-4 rounded-lg mb-4">
            Primero debes crear una categoría de tipo{' '}
            <strong>{tipoMovimiento === 'GASTO' ? 'gasto' : 'ingreso'}</strong>{' '}
            para registrar este movimiento.
          </div>
        )}

        <form
          onSubmit={guardarMovimiento}
          className="grid grid-cols-1 md:grid-cols-5 gap-4"
        >
          <select
            className="border border-gray-300 rounded-lg px-4 py-2"
            value={idFinca}
            onChange={(e) => setIdFinca(e.target.value)}
          >
            <option value="">Seleccionar finca</option>
            {fincas.map((finca) => (
              <option key={finca.id_finca} value={finca.id_finca}>
                {finca.nombre}
              </option>
            ))}
          </select>

          <select
            className="border border-gray-300 rounded-lg px-4 py-2"
            value={idCategoria}
            onChange={(e) => setIdCategoria(e.target.value)}
          >
            <option value="">Seleccionar categoría</option>
            {categoriasMovimiento.map((categoria) => (
              <option key={categoria.id_categoria} value={categoria.id_categoria}>
                {categoria.nombre}
              </option>
            ))}
          </select>

          <input
            className="border border-gray-300 rounded-lg px-4 py-2"
            placeholder="Descripción"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
          />

          <input
            type="number"
            className="border border-gray-300 rounded-lg px-4 py-2"
            placeholder="Monto"
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
          />

          <input
            type="date"
            className="border border-gray-300 rounded-lg px-4 py-2"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
          />

          <button
            disabled={categoriasMovimiento.length === 0}
            className="bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-lg md:col-span-5 disabled:opacity-50"
          >
            Guardar movimiento
          </button>
        </form>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Gastos</h2>

          {gastos.length === 0 ? (
            <p className="text-gray-500">No hay gastos registrados.</p>
          ) : (
            <div className="space-y-3">
              {gastos.map((gasto) => (
                <div
                  key={gasto.id_gasto}
                  className="border-b pb-3 flex justify-between gap-4"
                >
                  <div>
                    <p className="font-semibold">
                      {obtenerNombreCategoriaMovimiento(gasto)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {gasto.descripcion || 'Sin descripción'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {gasto.nombre_finca} - {gasto.fecha?.slice(0, 10)}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-red-600">
                      ${Number(gasto.monto).toLocaleString()}
                    </p>
                    <button
                      onClick={() => eliminarMovimiento('GASTO', gasto.id_gasto)}
                      className="text-sm text-red-600"
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
          <h2 className="text-xl font-semibold mb-4">Ingresos</h2>

          {ingresos.length === 0 ? (
            <p className="text-gray-500">No hay ingresos registrados.</p>
          ) : (
            <div className="space-y-3">
              {ingresos.map((ingreso) => (
                <div
                  key={ingreso.id_ingreso}
                  className="border-b pb-3 flex justify-between gap-4"
                >
                  <div>
                    <p className="font-semibold">
                      {obtenerNombreCategoriaMovimiento(ingreso)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {ingreso.descripcion || 'Sin descripción'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {ingreso.nombre_finca} - {ingreso.fecha?.slice(0, 10)}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-green-700">
                      ${Number(ingreso.monto).toLocaleString()}
                    </p>
                    <button
                      onClick={() => eliminarMovimiento('INGRESO', ingreso.id_ingreso)}
                      className="text-sm text-red-600"
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
    </div>
  )
}

export default Finanzas