import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'

import { getFincas } from '../services/fincaService'
import type { Finca } from '../services/fincaService'

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
  const [gastos, setGastos] = useState<Gasto[]>([])
  const [ingresos, setIngresos] = useState<Ingreso[]>([])
  const [resumen, setResumen] = useState({
    total_ingresos: 0,
    total_gastos: 0,
    balance: 0,
  })

  const [tipo, setTipo] = useState<'GASTO' | 'INGRESO'>('GASTO')
  const [idFinca, setIdFinca] = useState('')
  const [categoria, setCategoria] = useState('ALIMENTACION')
  const [descripcion, setDescripcion] = useState('')
  const [monto, setMonto] = useState('')
  const [fecha, setFecha] = useState('')

  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')

  const cargarDatos = async () => {
    try {
      const [fincasData, gastosData, ingresosData, resumenData] = await Promise.all([
        getFincas(),
        getGastos(),
        getIngresos(),
        getResumenFinanciero(),
      ])

      setFincas(fincasData)
      setGastos(gastosData)
      setIngresos(ingresosData)
      setResumen(resumenData)
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error al cargar finanzas')
    }
  }

  useEffect(() => {
    cargarDatos()
  }, [])

  const limpiarFormulario = () => {
    setIdFinca('')
    setDescripcion('')
    setMonto('')
    setFecha('')
    setCategoria(tipo === 'GASTO' ? 'ALIMENTACION' : 'VENTA_GANADO')
  }

  const cambiarTipo = (nuevoTipo: 'GASTO' | 'INGRESO') => {
    setTipo(nuevoTipo)
    setCategoria(nuevoTipo === 'GASTO' ? 'ALIMENTACION' : 'VENTA_GANADO')
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setMensaje('')

    if (!idFinca || !categoria || !monto || !fecha) {
      setError('Finca, categoría, monto y fecha son obligatorios')
      return
    }

    const data = {
      id_finca: Number(idFinca),
      categoria,
      descripcion: descripcion || null,
      monto: Number(monto),
      fecha,
    }

    try {
      if (tipo === 'GASTO') {
        await createGasto(data)
        setMensaje('Gasto registrado correctamente')
      } else {
        await createIngreso(data)
        setMensaje('Ingreso registrado correctamente')
      }

      limpiarFormulario()
      cargarDatos()
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error al guardar movimiento')
    }
  }

  const eliminarMovimiento = async (tipoMovimiento: 'GASTO' | 'INGRESO', id: number) => {
    if (!window.confirm('¿Eliminar este movimiento?')) return

    try {
      if (tipoMovimiento === 'GASTO') {
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

  const categoriasGasto = ['ALIMENTACION', 'MEDICAMENTOS', 'MANO_OBRA', 'TRANSPORTE', 'OTRO']
  const categoriasIngreso = ['VENTA_GANADO', 'VENTA_LECHE', 'OTRO']

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Finanzas</h1>
      <p className="text-gray-500 mb-6">Controla gastos, ingresos y balance general.</p>

      {error && <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-4">{error}</div>}
      {mensaje && <div className="bg-green-100 text-green-700 p-4 rounded-lg mb-4">{mensaje}</div>}

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
          <h2 className="text-2xl font-bold text-green-700">
            ${Number(resumen.balance).toLocaleString()}
          </h2>
        </div>
      </div>

      <section className="bg-white rounded-xl shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Registrar movimiento</h2>

        <div className="flex gap-2 mb-4">
          <button onClick={() => cambiarTipo('GASTO')} className={`px-4 py-2 rounded-lg ${tipo === 'GASTO' ? 'bg-red-600 text-white' : 'bg-gray-200'}`}>
            Gasto
          </button>
          <button onClick={() => cambiarTipo('INGRESO')} className={`px-4 py-2 rounded-lg ${tipo === 'INGRESO' ? 'bg-green-700 text-white' : 'bg-gray-200'}`}>
            Ingreso
          </button>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <select className="border rounded-lg px-4 py-2" value={idFinca} onChange={(e) => setIdFinca(e.target.value)}>
            <option value="">Seleccionar finca</option>
            {fincas.map((finca) => (
              <option key={finca.id_finca} value={finca.id_finca}>
                {finca.nombre}
              </option>
            ))}
          </select>

          <select className="border rounded-lg px-4 py-2" value={categoria} onChange={(e) => setCategoria(e.target.value)}>
            {(tipo === 'GASTO' ? categoriasGasto : categoriasIngreso).map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <input className="border rounded-lg px-4 py-2" placeholder="Descripción" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
          <input type="number" className="border rounded-lg px-4 py-2" placeholder="Monto" value={monto} onChange={(e) => setMonto(e.target.value)} />
          <input type="date" className="border rounded-lg px-4 py-2" value={fecha} onChange={(e) => setFecha(e.target.value)} />

          <button className="bg-green-700 text-white px-4 py-2 rounded-lg md:col-span-5">
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
                <div key={gasto.id_gasto} className="border-b pb-3 flex justify-between gap-4">
                  <div>
                    <p className="font-semibold">{gasto.categoria}</p>
                    <p className="text-sm text-gray-500">{gasto.descripcion || 'Sin descripción'}</p>
                    <p className="text-sm text-gray-500">{gasto.nombre_finca} - {gasto.fecha?.slice(0, 10)}</p>
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-red-600">${Number(gasto.monto).toLocaleString()}</p>
                    <button onClick={() => eliminarMovimiento('GASTO', gasto.id_gasto)} className="text-sm text-red-600">
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
                <div key={ingreso.id_ingreso} className="border-b pb-3 flex justify-between gap-4">
                  <div>
                    <p className="font-semibold">{ingreso.categoria}</p>
                    <p className="text-sm text-gray-500">{ingreso.descripcion || 'Sin descripción'}</p>
                    <p className="text-sm text-gray-500">{ingreso.nombre_finca} - {ingreso.fecha?.slice(0, 10)}</p>
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-green-700">${Number(ingreso.monto).toLocaleString()}</p>
                    <button onClick={() => eliminarMovimiento('INGRESO', ingreso.id_ingreso)} className="text-sm text-red-600">
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