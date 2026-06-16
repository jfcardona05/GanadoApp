import { CalendarClock, Edit3, Plus, Search, ShieldCheck, Syringe, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'

import Alert from '../components/Alert'
import Badge from '../components/Badge'
import Button from '../components/Button'
import ConfirmDialog from '../components/ConfirmDialog'
import EmptyState from '../components/EmptyState'
import Modal from '../components/Modal'
import PageHeader from '../components/PageHeader'
import Panel from '../components/Panel'
import StatCard from '../components/StatCard'
import { getAnimales } from '../services/animalService'
import type { Animal } from '../services/animalService'
import {
  createVacuna,
  deleteVacuna,
  getVacunas,
  updateVacuna,
} from '../services/vacunaService'
import type { Vacuna } from '../services/vacunaService'
import {
  createRegistroVacunacion,
  deleteRegistroVacunacion,
  getRegistrosVacunacion,
} from '../services/registroVacunacionService'
import type { RegistroVacunacion } from '../services/registroVacunacionService'
import { daysUntil, isPastDate, isWithinNextDays } from '../utils/dates'
import { getErrorMessage } from '../utils/errors'

function Vacunas() {
  const [vacunas, setVacunas] = useState<Vacuna[]>([])
  const [animales, setAnimales] = useState<Animal[]>([])
  const [registros, setRegistros] = useState<RegistroVacunacion[]>([])

  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [frecuenciaDias, setFrecuenciaDias] = useState('')
  const [obligatoria, setObligatoria] = useState(false)
  const [editandoVacunaId, setEditandoVacunaId] = useState<number | null>(null)

  const [idAnimal, setIdAnimal] = useState('')
  const [idVacuna, setIdVacuna] = useState('')
  const [fechaAplicacion, setFechaAplicacion] = useState('')
  const [veterinario, setVeterinario] = useState('')
  const [observaciones, setObservaciones] = useState('')

  const [busquedaVacuna, setBusquedaVacuna] = useState('')
  const [busquedaRegistro, setBusquedaRegistro] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('')

  const [modalVacunaAbierto, setModalVacunaAbierto] = useState(false)
  const [modalRegistroAbierto, setModalRegistroAbierto] = useState(false)
  const [vacunaAEliminar, setVacunaAEliminar] = useState<number | null>(null)
  const [registroAEliminar, setRegistroAEliminar] = useState<number | null>(null)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')

  const cargarDatos = async () => {
    try {
      setLoading(true)
      const [vacunasData, animalesData, registrosData] = await Promise.all([
        getVacunas(),
        getAnimales(),
        getRegistrosVacunacion(),
      ])
      setVacunas(vacunasData)
      setAnimales(animalesData)
      setRegistros(registrosData)
    } catch (error: unknown) {
      setError(getErrorMessage(error, 'Error al cargar vacunas'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    cargarDatos()
  }, [])

  const limpiarFormularioVacuna = () => {
    setNombre('')
    setDescripcion('')
    setFrecuenciaDias('')
    setObligatoria(false)
    setEditandoVacunaId(null)
  }

  const limpiarFormularioRegistro = () => {
    setIdAnimal('')
    setIdVacuna('')
    setFechaAplicacion('')
    setVeterinario('')
    setObservaciones('')
  }

  const abrirModalCrearVacuna = () => {
    limpiarFormularioVacuna()
    setError('')
    setMensaje('')
    setModalVacunaAbierto(true)
  }

  const cerrarModalVacuna = () => {
    setModalVacunaAbierto(false)
    limpiarFormularioVacuna()
  }

  const abrirModalRegistro = () => {
    limpiarFormularioRegistro()
    setError('')
    setMensaje('')
    setModalRegistroAbierto(true)
  }

  const cerrarModalRegistro = () => {
    setModalRegistroAbierto(false)
    limpiarFormularioRegistro()
  }

  const guardarVacuna = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setMensaje('')

    if (!nombre.trim()) {
      setError('El nombre de la vacuna es obligatorio')
      return
    }

    const data = {
      nombre,
      descripcion: descripcion || null,
      frecuencia_dias: frecuenciaDias ? Number(frecuenciaDias) : null,
      obligatoria,
    }

    try {
      if (editandoVacunaId) {
        await updateVacuna(editandoVacunaId, data)
        setMensaje('Vacuna actualizada correctamente')
      } else {
        await createVacuna(data)
        setMensaje('Vacuna creada correctamente')
      }

      cerrarModalVacuna()
      cargarDatos()
    } catch (error: unknown) {
      setError(getErrorMessage(error, 'Error al guardar vacuna'))
    }
  }

  const editarVacuna = (vacuna: Vacuna) => {
    setEditandoVacunaId(vacuna.id_vacuna)
    setNombre(vacuna.nombre)
    setDescripcion(vacuna.descripcion || '')
    setFrecuenciaDias(vacuna.frecuencia_dias ? String(vacuna.frecuencia_dias) : '')
    setObligatoria(Boolean(vacuna.obligatoria))
    setError('')
    setMensaje('')
    setModalVacunaAbierto(true)
  }

  const eliminarVacuna = async (id: number) => {
    try {
      await deleteVacuna(id)
      setMensaje('Vacuna eliminada correctamente')
      cargarDatos()
    } catch (error: unknown) {
      setError(getErrorMessage(error, 'Error al eliminar vacuna'))
    }
  }

  const registrarVacunacion = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setMensaje('')

    if (!idAnimal || !idVacuna || !fechaAplicacion) {
      setError('Animal, vacuna y fecha de aplicación son obligatorios')
      return
    }

    try {
      const respuesta = await createRegistroVacunacion({
        id_animal: Number(idAnimal),
        id_vacuna: Number(idVacuna),
        fecha_aplicacion: fechaAplicacion,
        veterinario: veterinario || null,
        observaciones: observaciones || null,
      })

      setMensaje(
        respuesta.proxima_fecha
          ? `Vacunación registrada correctamente. Próxima aplicación: ${respuesta.proxima_fecha}`
          : 'Vacunación registrada correctamente. Esta vacuna no tiene frecuencia definida.'
      )

      cerrarModalRegistro()
      cargarDatos()
    } catch (error: unknown) {
      setError(getErrorMessage(error, 'Error al registrar vacunación'))
    }
  }

  const eliminarRegistro = async (id: number) => {
    try {
      await deleteRegistroVacunacion(id)
      setMensaje('Registro eliminado correctamente')
      cargarDatos()
    } catch (error: unknown) {
      setError(getErrorMessage(error, 'Error al eliminar registro'))
    }
  }

  const calcularProximaFechaVisual = () => {
    const vacuna = vacunas.find((item) => item.id_vacuna === Number(idVacuna))
    if (!fechaAplicacion || !vacuna?.frecuencia_dias) return null
    const fecha = new Date(fechaAplicacion)
    fecha.setDate(fecha.getDate() + Number(vacuna.frecuencia_dias))
    return fecha.toISOString().slice(0, 10)
  }

  const getEstadoRegistro = (registro: RegistroVacunacion) => {
    if (!registro.proxima_fecha) return 'sin-frecuencia'
    if (isPastDate(registro.proxima_fecha)) return 'vencida'
    if (isWithinNextDays(registro.proxima_fecha, 15)) return 'proxima'
    return 'al-dia'
  }

  const vacunasFiltradas = vacunas.filter((vacuna) => {
    const texto = `${vacuna.nombre} ${vacuna.descripcion || ''}`.toLowerCase()
    return texto.includes(busquedaVacuna.toLowerCase())
  })

  const registrosFiltrados = registros.filter((registro) => {
    const texto = `${registro.nombre_animal || ''} ${registro.codigo_animal} ${registro.nombre_vacuna} ${registro.nombre_finca || ''}`.toLowerCase()
    const coincideBusqueda = texto.includes(busquedaRegistro.toLowerCase())
    const coincideEstado = filtroEstado ? getEstadoRegistro(registro) === filtroEstado : true
    return coincideBusqueda && coincideEstado
  })

  const proximaFechaCalculada = calcularProximaFechaVisual()
  const totalObligatorias = vacunas.filter((vacuna) => Boolean(vacuna.obligatoria)).length
  const totalProximas = registros.filter((registro) => registro.proxima_fecha && isWithinNextDays(registro.proxima_fecha, 15)).length
  const totalVencidas = registros.filter((registro) => registro.proxima_fecha && isPastDate(registro.proxima_fecha)).length

  const renderEstadoVacuna = (registro: RegistroVacunacion) => {
    const estado = getEstadoRegistro(registro)
    if (estado === 'vencida') return <Badge variant="red">Vencida</Badge>
    if (estado === 'proxima') return <Badge variant="yellow">Próxima</Badge>
    if (estado === 'sin-frecuencia') return <Badge variant="gray">Sin frecuencia</Badge>
    return <Badge variant="green">Al día</Badge>
  }

  return (
    <div>
      <PageHeader
        title="Vacunas y salud"
        description="Administra la lista de vacunas y consulta el historial sanitario del ganado."
        action={
          <>
            <Button variant="secondary" onClick={abrirModalRegistro} icon={<Syringe size={17} />}>Registrar vacunación</Button>
            <Button onClick={abrirModalCrearVacuna} icon={<Plus size={17} />}>Crear vacuna</Button>
          </>
        }
      />

      {error && <Alert type="error" message={error} />}
      {mensaje && <Alert type="success" message={mensaje} />}
      {totalVencidas > 0 && <Alert type="error" message={`Tienes ${totalVencidas} vacunación(es) vencida(s). Revísalas lo antes posible.`} />}
      {totalVencidas === 0 && totalProximas > 0 && <Alert type="warning" message={`Tienes ${totalProximas} vacuna(s) próximas en los siguientes 15 días.`} />}

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Vacunas registradas" value={vacunas.length} icon={<ShieldCheck size={20} />} />
        <StatCard title="Obligatorias" value={totalObligatorias} icon={<ShieldCheck size={20} />} tone="blue" />
        <StatCard title="Próximas 15 días" value={totalProximas} icon={<CalendarClock size={20} />} tone="yellow" />
        <StatCard title="Vencidas" value={totalVencidas} icon={<CalendarClock size={20} />} tone="red" />
      </div>

      <div className="space-y-6">
        <Panel title="Lista de vacunas" count={vacunasFiltradas.length}>
          <div className="mb-4">
            <label className="mb-1 block text-sm font-semibold text-slate-700">Buscar vacuna</label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input type="search" value={busquedaVacuna} onChange={(e) => setBusquedaVacuna(e.target.value)} className="w-full pl-10" placeholder="Nombre o descripción" />
            </div>
          </div>

          {loading ? (
            <p className="text-sm text-slate-500">Cargando vacunas...</p>
          ) : vacunas.length === 0 ? (
            <EmptyState title="No hay vacunas registradas" description="Crea vacunas con frecuencia en días para calcular automáticamente la próxima aplicación." />
          ) : vacunasFiltradas.length === 0 ? (
            <EmptyState title="No encontramos vacunas" description="Prueba con otro nombre o descripción." />
          ) : (
            <>
              <div className="grid gap-3 md:hidden">
                {vacunasFiltradas.map((vacuna) => (
                  <div key={vacuna.id_vacuna} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-950">{vacuna.nombre}</p>
                        <p className="mt-1 text-sm text-slate-500">{vacuna.descripcion || 'Sin descripción'}</p>
                        <p className="mt-1 text-sm text-slate-500">{vacuna.frecuencia_dias ? `${vacuna.frecuencia_dias} días` : 'Sin frecuencia'}</p>
                      </div>
                      {vacuna.obligatoria ? <Badge variant="blue">Obligatoria</Badge> : <Badge variant="gray">Opcional</Badge>}
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <Button variant="secondary" size="sm" icon={<Edit3 size={15} />} onClick={() => editarVacuna(vacuna)}>Editar</Button>
                      <Button variant="danger" size="sm" icon={<Trash2 size={15} />} onClick={() => setVacunaAEliminar(vacuna.id_vacuna)}>Eliminar</Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="hidden overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm md:block">
                <table className="w-full min-w-[820px] text-left">
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Descripción</th>
                      <th>Frecuencia</th>
                      <th>Tipo</th>
                      <th className="text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {vacunasFiltradas.map((vacuna) => (
                      <tr key={vacuna.id_vacuna} className="hover:bg-slate-50">
                        <td className="font-semibold text-slate-900">{vacuna.nombre}</td>
                        <td className="text-slate-600">{vacuna.descripcion || 'Sin descripción'}</td>
                        <td className="text-slate-600">{vacuna.frecuencia_dias ? `${vacuna.frecuencia_dias} días` : 'N/A'}</td>
                        <td>{vacuna.obligatoria ? <Badge variant="blue">Obligatoria</Badge> : <Badge variant="gray">Opcional</Badge>}</td>
                        <td>
                          <div className="flex justify-end gap-2">
                            <Button variant="secondary" size="sm" icon={<Edit3 size={15} />} onClick={() => editarVacuna(vacuna)}>Editar</Button>
                            <Button variant="danger" size="sm" icon={<Trash2 size={15} />} onClick={() => setVacunaAEliminar(vacuna.id_vacuna)}>Eliminar</Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </Panel>

        <Panel title="Historial de vacunación" count={registrosFiltrados.length}>
          <div className="mb-4 grid gap-3 md:grid-cols-[1fr_220px]">
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Buscar registro</label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input type="search" value={busquedaRegistro} onChange={(e) => setBusquedaRegistro(e.target.value)} className="w-full pl-10" placeholder="Animal, código, vacuna o finca" />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Estado</label>
              <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)} className="w-full">
                <option value="">Todos</option>
                <option value="vencida">Vencidas</option>
                <option value="proxima">Próximas</option>
                <option value="al-dia">Al día</option>
                <option value="sin-frecuencia">Sin frecuencia</option>
              </select>
            </div>
          </div>

          {loading ? (
            <p className="text-sm text-slate-500">Cargando historial...</p>
          ) : registros.length === 0 ? (
            <EmptyState title="No hay registros de vacunación" description="Registra la aplicación de una vacuna para construir el historial sanitario." />
          ) : registrosFiltrados.length === 0 ? (
            <EmptyState title="No encontramos registros" description="Prueba con otro filtro o búsqueda." />
          ) : (
            <>
              <div className="grid gap-3 md:hidden">
                {registrosFiltrados.map((registro) => (
                  <div key={registro.id_registro} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-950">{registro.nombre_animal || registro.codigo_animal}</p>
                        <p className="mt-1 text-sm text-slate-500">{registro.nombre_vacuna}</p>
                        <p className="mt-1 text-sm text-slate-500">Próxima: {registro.proxima_fecha ? `${registro.proxima_fecha.slice(0, 10)} (${daysUntil(registro.proxima_fecha)} días)` : 'Sin frecuencia'}</p>
                      </div>
                      {renderEstadoVacuna(registro)}
                    </div>
                    <div className="mt-4">
                      <Button variant="danger" size="sm" icon={<Trash2 size={15} />} onClick={() => setRegistroAEliminar(registro.id_registro)}>Eliminar</Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="hidden overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm md:block">
                <table className="w-full min-w-[920px] text-left">
                  <thead>
                    <tr>
                      <th>Animal</th>
                      <th>Vacuna</th>
                      <th>Aplicación</th>
                      <th>Próxima</th>
                      <th>Estado</th>
                      <th>Veterinario</th>
                      <th className="text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {registrosFiltrados.map((registro) => (
                      <tr key={registro.id_registro} className="hover:bg-slate-50">
                        <td className="font-semibold text-slate-900">{registro.nombre_animal || registro.codigo_animal}</td>
                        <td className="text-slate-600">{registro.nombre_vacuna}</td>
                        <td className="text-slate-600">{registro.fecha_aplicacion?.slice(0, 10)}</td>
                        <td>{registro.proxima_fecha ? <Badge variant="yellow">{registro.proxima_fecha.slice(0, 10)}</Badge> : <Badge variant="gray">Sin frecuencia</Badge>}</td>
                        <td>{renderEstadoVacuna(registro)}</td>
                        <td className="text-slate-600">{registro.veterinario || 'N/A'}</td>
                        <td><div className="flex justify-end"><Button variant="danger" size="sm" icon={<Trash2 size={15} />} onClick={() => setRegistroAEliminar(registro.id_registro)}>Eliminar</Button></div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </Panel>
      </div>

      <Modal isOpen={modalVacunaAbierto} onClose={cerrarModalVacuna} title={editandoVacunaId ? 'Editar vacuna' : 'Crear vacuna'}>
        <form onSubmit={guardarVacuna} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700">Nombre de la vacuna</label>
            <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} className="mt-1 w-full" placeholder="Fiebre Aftosa" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700">Descripción</label>
            <input type="text" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} className="mt-1 w-full" placeholder="Vacuna obligatoria aplicada cada 6 meses" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700">Frecuencia en días</label>
            <input type="number" value={frecuenciaDias} onChange={(e) => setFrecuenciaDias(e.target.value)} className="mt-1 w-full" placeholder="180" />
            <p className="mt-1 text-xs text-slate-500">Esta frecuencia se usará para calcular automáticamente la próxima aplicación.</p>
          </div>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <input type="checkbox" checked={obligatoria} onChange={(e) => setObligatoria(e.target.checked)} className="h-4 w-4" />
            Marcar como obligatoria
          </label>
          <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
            <Button type="button" variant="secondary" onClick={cerrarModalVacuna}>Cancelar</Button>
            <Button type="submit">{editandoVacunaId ? 'Actualizar vacuna' : 'Guardar vacuna'}</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={modalRegistroAbierto} onClose={cerrarModalRegistro} title="Registrar vacunación">
        <form onSubmit={registrarVacunacion} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700">Animal</label>
            <select value={idAnimal} onChange={(e) => setIdAnimal(e.target.value)} className="mt-1 w-full">
              <option value="">Seleccionar animal</option>
              {animales.map((animal) => <option key={animal.id_animal} value={animal.id_animal}>{animal.codigo} - {animal.nombre || 'Sin nombre'}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700">Vacuna</label>
            <select value={idVacuna} onChange={(e) => setIdVacuna(e.target.value)} className="mt-1 w-full">
              <option value="">Seleccionar vacuna</option>
              {vacunas.map((vacuna) => <option key={vacuna.id_vacuna} value={vacuna.id_vacuna}>{vacuna.nombre}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700">Fecha de aplicación</label>
            <input type="date" value={fechaAplicacion} onChange={(e) => setFechaAplicacion(e.target.value)} className="mt-1 w-full" />
          </div>
          {idVacuna && fechaAplicacion && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
              {proximaFechaCalculada ? <p>Próxima aplicación calculada automáticamente: <strong>{proximaFechaCalculada}</strong></p> : <p>Esta vacuna no tiene frecuencia definida.</p>}
            </div>
          )}
          <div>
            <label className="block text-sm font-semibold text-slate-700">Veterinario</label>
            <input type="text" value={veterinario} onChange={(e) => setVeterinario(e.target.value)} className="mt-1 w-full" placeholder="Dr. Carlos Pérez" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700">Observaciones</label>
            <textarea value={observaciones} onChange={(e) => setObservaciones(e.target.value)} className="mt-1 w-full" placeholder="Aplicación normal sin reacciones" rows={3} />
          </div>
          <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
            <Button type="button" variant="secondary" onClick={cerrarModalRegistro}>Cancelar</Button>
            <Button type="submit">Registrar vacunación</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={vacunaAEliminar !== null}
        title="Eliminar vacuna"
        message="Vas a eliminar esta vacuna. Si tiene registros asociados, el sistema podría impedir la eliminación para proteger el historial."
        onCancel={() => setVacunaAEliminar(null)}
        onConfirm={() => {
          if (vacunaAEliminar !== null) {
            eliminarVacuna(vacunaAEliminar)
            setVacunaAEliminar(null)
          }
        }}
      />

      <ConfirmDialog
        isOpen={registroAEliminar !== null}
        title="Eliminar registro"
        message="Vas a eliminar este registro de vacunación. Esta acción no se puede deshacer."
        onCancel={() => setRegistroAEliminar(null)}
        onConfirm={() => {
          if (registroAEliminar !== null) {
            eliminarRegistro(registroAEliminar)
            setRegistroAEliminar(null)
          }
        }}
      />
    </div>
  )
}

export default Vacunas


