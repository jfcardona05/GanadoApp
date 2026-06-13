import {
  Activity,
  Edit3,
  HeartPulse,
  Plus,
  Scale,
  Search,
  ShieldAlert,
  Stethoscope,
  Syringe,
  Trash2,
} from 'lucide-react'
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
import { getFincas } from '../services/fincaService'
import type { Finca } from '../services/fincaService'
import {
  createAnimal,
  deleteAnimal,
  getAnimales,
  updateAnimal,
} from '../services/animalService'
import type { Animal } from '../services/animalService'
import { createPeso } from '../services/pesoService'
import { getVacunas } from '../services/vacunaService'
import type { Vacuna } from '../services/vacunaService'
import { createRegistroVacunacion } from '../services/registroVacunacionService'
import { getErrorMessage } from '../utils/errors'

type BadgeVariant = 'green' | 'red' | 'yellow' | 'blue' | 'gray'

function Animales() {
  const [animales, setAnimales] = useState<Animal[]>([])
  const [fincas, setFincas] = useState<Finca[]>([])
  const [vacunas, setVacunas] = useState<Vacuna[]>([])

  const [idFinca, setIdFinca] = useState('')
  const [codigo, setCodigo] = useState('')
  const [nombre, setNombre] = useState('')
  const [raza, setRaza] = useState('')
  const [sexo, setSexo] = useState('MACHO')
  const [fechaNacimiento, setFechaNacimiento] = useState('')
  const [pesoActual, setPesoActual] = useState('')
  const [estadoSalud, setEstadoSalud] = useState('SANO')

  const [busqueda, setBusqueda] = useState('')
  const [filtroFinca, setFiltroFinca] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('')

  const [editandoId, setEditandoId] = useState<number | null>(null)
  const [modalAbierto, setModalAbierto] = useState(false)
  const [animalAEliminar, setAnimalAEliminar] = useState<number | null>(null)

  const [animalAccion, setAnimalAccion] = useState<Animal | null>(null)
  const [modalPesoAbierto, setModalPesoAbierto] = useState(false)
  const [modalVacunaAbierto, setModalVacunaAbierto] = useState(false)
  const [pesoRegistro, setPesoRegistro] = useState('')
  const [fechaPeso, setFechaPeso] = useState('')
  const [observacionesPeso, setObservacionesPeso] = useState('')
  const [idVacuna, setIdVacuna] = useState('')
  const [fechaAplicacion, setFechaAplicacion] = useState('')
  const [veterinario, setVeterinario] = useState('')
  const [observacionesVacuna, setObservacionesVacuna] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')

  const cargarDatos = async () => {
    try {
      setLoading(true)
      const [animalesData, fincasData, vacunasData] = await Promise.all([
        getAnimales(),
        getFincas(),
        getVacunas(),
      ])
      setAnimales(animalesData)
      setFincas(fincasData)
      setVacunas(vacunasData)
    } catch (error: unknown) {
      setError(getErrorMessage(error, 'Error al cargar animales'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    cargarDatos()
  }, [])

  const limpiarFormulario = () => {
    setIdFinca('')
    setCodigo('')
    setNombre('')
    setRaza('')
    setSexo('MACHO')
    setFechaNacimiento('')
    setPesoActual('')
    setEstadoSalud('SANO')
    setEditandoId(null)
  }

  const abrirModalCrear = () => {
    limpiarFormulario()
    setError('')
    setMensaje('')
    setModalAbierto(true)
  }

  const cerrarModal = () => {
    setModalAbierto(false)
    limpiarFormulario()
  }

  const formatDateInput = (date: string | null) => {
    if (!date) return ''
    return date.slice(0, 10)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setMensaje('')

    if (!editandoId && !idFinca) {
      setError('Debes seleccionar una finca')
      return
    }

    if (!codigo.trim()) {
      setError('El código del animal es obligatorio')
      return
    }

    const animalData = {
      id_finca: idFinca ? Number(idFinca) : undefined,
      codigo,
      nombre: nombre || null,
      foto: null,
      raza: raza || null,
      sexo,
      fecha_nacimiento: fechaNacimiento || null,
      peso_actual: pesoActual ? Number(pesoActual) : null,
      estado_salud: estadoSalud,
    }

    try {
      if (editandoId) {
        await updateAnimal(editandoId, animalData)
        setMensaje('Animal actualizado correctamente')
      } else {
        await createAnimal(animalData)
        setMensaje('Animal registrado correctamente')
      }

      cerrarModal()
      cargarDatos()
    } catch (error: unknown) {
      setError(getErrorMessage(error, 'Error al guardar animal'))
    }
  }

  const handleEditar = (animal: Animal) => {
    setEditandoId(animal.id_animal)
    setIdFinca(String(animal.id_finca))
    setCodigo(animal.codigo)
    setNombre(animal.nombre || '')
    setRaza(animal.raza || '')
    setSexo(animal.sexo)
    setFechaNacimiento(formatDateInput(animal.fecha_nacimiento))
    setPesoActual(animal.peso_actual ? String(animal.peso_actual) : '')
    setEstadoSalud(animal.estado_salud)
    setError('')
    setMensaje('')
    setModalAbierto(true)
  }

  const handleEliminar = async (id: number) => {
    try {
      await deleteAnimal(id)
      setMensaje('Animal eliminado correctamente')
      cargarDatos()
    } catch (error: unknown) {
      setError(getErrorMessage(error, 'Error al eliminar animal'))
    }
  }

  const abrirRegistroPeso = (animal: Animal) => {
    setAnimalAccion(animal)
    setPesoRegistro('')
    setFechaPeso('')
    setObservacionesPeso('')
    setError('')
    setMensaje('')
    setModalPesoAbierto(true)
  }

  const guardarPesoRapido = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setMensaje('')

    if (!animalAccion || !pesoRegistro || !fechaPeso) {
      setError('Animal, peso y fecha son obligatorios')
      return
    }

    if (Number(pesoRegistro) <= 0) {
      setError('El peso debe ser mayor a cero')
      return
    }

    try {
      await createPeso({
        id_animal: animalAccion.id_animal,
        peso: Number(pesoRegistro),
        fecha_registro: fechaPeso,
        observaciones: observacionesPeso || null,
      })
      setMensaje('Peso registrado correctamente')
      setModalPesoAbierto(false)
      setAnimalAccion(null)
      cargarDatos()
    } catch (error: unknown) {
      setError(getErrorMessage(error, 'Error al registrar peso'))
    }
  }

  const abrirRegistroVacuna = (animal: Animal) => {
    setAnimalAccion(animal)
    setIdVacuna('')
    setFechaAplicacion('')
    setVeterinario('')
    setObservacionesVacuna('')
    setError('')
    setMensaje('')
    setModalVacunaAbierto(true)
  }

  const guardarVacunaRapida = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setMensaje('')

    if (!animalAccion || !idVacuna || !fechaAplicacion) {
      setError('Animal, vacuna y fecha de aplicación son obligatorios')
      return
    }

    try {
      const respuesta = await createRegistroVacunacion({
        id_animal: animalAccion.id_animal,
        id_vacuna: Number(idVacuna),
        fecha_aplicacion: fechaAplicacion,
        veterinario: veterinario || null,
        observaciones: observacionesVacuna || null,
      })

      setMensaje(
        respuesta.proxima_fecha
          ? `Vacunación registrada. Próxima aplicación: ${respuesta.proxima_fecha}`
          : 'Vacunación registrada correctamente.'
      )
      setModalVacunaAbierto(false)
      setAnimalAccion(null)
      cargarDatos()
    } catch (error: unknown) {
      setError(getErrorMessage(error, 'Error al registrar vacunación'))
    }
  }

  const getEstadoBadge = (estado: string): BadgeVariant => {
    if (estado === 'SANO') return 'green'
    if (estado === 'ENFERMO') return 'red'
    if (estado === 'EN_TRATAMIENTO') return 'yellow'
    if (estado === 'VENDIDO') return 'blue'
    return 'gray'
  }

  const animalesFiltrados = animales.filter((animal) => {
    const texto = `${animal.codigo} ${animal.nombre || ''} ${animal.raza || ''} ${animal.nombre_finca || ''}`.toLowerCase()
    const coincideBusqueda = texto.includes(busqueda.toLowerCase())
    const coincideFinca = filtroFinca ? animal.id_finca === Number(filtroFinca) : true
    const coincideEstado = filtroEstado ? animal.estado_salud === filtroEstado : true
    return coincideBusqueda && coincideFinca && coincideEstado
  })

  const totalSanos = animales.filter((animal) => animal.estado_salud === 'SANO').length
  const totalEnfermos = animales.filter((animal) => animal.estado_salud === 'ENFERMO').length
  const totalTratamiento = animales.filter((animal) => animal.estado_salud === 'EN_TRATAMIENTO').length

  const renderAccionesAnimal = (animal: Animal) => (
    <>
      <Button variant="secondary" size="sm" icon={<Scale size={15} />} onClick={() => abrirRegistroPeso(animal)}>
        Peso
      </Button>
      <Button variant="secondary" size="sm" icon={<Syringe size={15} />} onClick={() => abrirRegistroVacuna(animal)}>
        Vacuna
      </Button>
      <Button variant="secondary" size="sm" icon={<Edit3 size={15} />} onClick={() => handleEditar(animal)}>
        Editar
      </Button>
      <Button variant="danger" size="sm" icon={<Trash2 size={15} />} onClick={() => setAnimalAEliminar(animal.id_animal)}>
        Eliminar
      </Button>
    </>
  )

  return (
    <div>
      <PageHeader
        title="Animales"
        description="Gestiona el inventario ganadero por finca, estado de salud y datos productivos."
        action={<Button onClick={abrirModalCrear} icon={<Plus size={17} />}>Registrar animal</Button>}
      />

      {error && <Alert type="error" message={error} />}
      {mensaje && <Alert type="success" message={mensaje} />}

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total animales" value={animales.length} icon={<Activity size={20} />} />
        <StatCard title="Sanos" value={totalSanos} icon={<HeartPulse size={20} />} />
        <StatCard title="Enfermos" value={totalEnfermos} icon={<ShieldAlert size={20} />} tone="red" />
        <StatCard title="En tratamiento" value={totalTratamiento} icon={<Stethoscope size={20} />} tone="yellow" />
      </div>

      <Panel title="Listado de animales" count={animalesFiltrados.length}>
        <div className="mb-4 grid gap-3 lg:grid-cols-[1fr_220px_220px]">
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">Buscar animal</label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input type="search" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} className="w-full pl-10" placeholder="Código, nombre, raza o finca" />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">Finca</label>
            <select value={filtroFinca} onChange={(e) => setFiltroFinca(e.target.value)} className="w-full">
              <option value="">Todas</option>
              {fincas.map((finca) => <option key={finca.id_finca} value={finca.id_finca}>{finca.nombre}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">Estado</label>
            <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)} className="w-full">
              <option value="">Todos</option>
              <option value="SANO">Sano</option>
              <option value="ENFERMO">Enfermo</option>
              <option value="EN_TRATAMIENTO">En tratamiento</option>
              <option value="VENDIDO">Vendido</option>
              <option value="MUERTO">Muerto</option>
            </select>
          </div>
        </div>

        {loading ? (
          <p className="text-sm text-slate-500">Cargando animales...</p>
        ) : animales.length === 0 ? (
          <EmptyState title="No hay animales registrados" description="Registra tu primer animal para empezar a controlar vacunas, peso, salud y trazabilidad." />
        ) : animalesFiltrados.length === 0 ? (
          <EmptyState title="No encontramos animales" description="Prueba con otro código, finca o estado." />
        ) : (
          <>
            <div className="grid gap-3 md:hidden">
              {animalesFiltrados.map((animal) => (
                <div key={animal.id_animal} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-950">{animal.nombre || animal.codigo}</p>
                      <p className="text-sm text-slate-500">Código: {animal.codigo}</p>
                      <p className="text-sm text-slate-500">{animal.nombre_finca || 'Sin finca'} · {animal.peso_actual || 'N/A'} kg</p>
                    </div>
                    <Badge variant={getEstadoBadge(animal.estado_salud)}>{animal.estado_salud}</Badge>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    {renderAccionesAnimal(animal)}
                  </div>
                </div>
              ))}
            </div>

            <div className="hidden overflow-x-auto rounded-lg border border-slate-200 md:block">
              <table className="w-full min-w-[980px] text-left">
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Nombre</th>
                    <th>Raza</th>
                    <th>Sexo</th>
                    <th>Peso</th>
                    <th>Estado</th>
                    <th>Finca</th>
                    <th className="text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {animalesFiltrados.map((animal) => (
                    <tr key={animal.id_animal} className="hover:bg-slate-50">
                      <td className="font-semibold text-slate-900">{animal.codigo}</td>
                      <td className="text-slate-600">{animal.nombre || 'Sin nombre'}</td>
                      <td className="text-slate-600">{animal.raza || 'N/A'}</td>
                      <td className="text-slate-600">{animal.sexo}</td>
                      <td className="text-slate-600">{animal.peso_actual || 'N/A'} kg</td>
                      <td><Badge variant={getEstadoBadge(animal.estado_salud)}>{animal.estado_salud}</Badge></td>
                      <td className="text-slate-600">{animal.nombre_finca || 'N/A'}</td>
                      <td>
                        <div className="flex justify-end gap-2">{renderAccionesAnimal(animal)}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </Panel>

      <Modal isOpen={modalAbierto} onClose={cerrarModal} title={editandoId ? 'Editar animal' : 'Registrar animal'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700">Finca</label>
            <select value={idFinca} disabled={Boolean(editandoId)} onChange={(e) => setIdFinca(e.target.value)} className="mt-1 w-full">
              <option value="">Seleccionar finca</option>
              {fincas.map((finca) => <option key={finca.id_finca} value={finca.id_finca}>{finca.nombre}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold text-slate-700">Código</label>
              <input type="text" value={codigo} onChange={(e) => setCodigo(e.target.value)} className="mt-1 w-full" placeholder="A001" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700">Nombre</label>
              <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} className="mt-1 w-full" placeholder="Toro Bravo" />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold text-slate-700">Raza</label>
              <input type="text" value={raza} onChange={(e) => setRaza(e.target.value)} className="mt-1 w-full" placeholder="Brahman" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700">Sexo</label>
              <select value={sexo} onChange={(e) => setSexo(e.target.value)} className="mt-1 w-full">
                <option value="MACHO">Macho</option>
                <option value="HEMBRA">Hembra</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold text-slate-700">Fecha de nacimiento</label>
              <input type="date" value={fechaNacimiento} onChange={(e) => setFechaNacimiento(e.target.value)} className="mt-1 w-full" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700">Peso actual kg</label>
              <input type="number" step="0.01" value={pesoActual} onChange={(e) => setPesoActual(e.target.value)} className="mt-1 w-full" placeholder="450" />
              {!editandoId && <p className="mt-1 text-xs text-slate-500">Este peso se guardará automáticamente como primer control de peso.</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700">Estado de salud</label>
            <select value={estadoSalud} onChange={(e) => setEstadoSalud(e.target.value)} className="mt-1 w-full">
              <option value="SANO">Sano</option>
              <option value="ENFERMO">Enfermo</option>
              <option value="EN_TRATAMIENTO">En tratamiento</option>
              <option value="VENDIDO">Vendido</option>
              <option value="MUERTO">Muerto</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
            <Button type="button" variant="secondary" onClick={cerrarModal}>Cancelar</Button>
            <Button type="submit">{editandoId ? 'Actualizar animal' : 'Guardar animal'}</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={modalPesoAbierto} onClose={() => setModalPesoAbierto(false)} title={`Registrar peso${animalAccion ? `: ${animalAccion.nombre || animalAccion.codigo}` : ''}`}>
        <form onSubmit={guardarPesoRapido} className="space-y-4">
          <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
            Peso actual registrado: <strong>{animalAccion?.peso_actual || 'N/A'} kg</strong>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700">Nuevo peso kg</label>
            <input type="number" step="0.01" value={pesoRegistro} onChange={(e) => setPesoRegistro(e.target.value)} className="mt-1 w-full" placeholder="480.5" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700">Fecha</label>
            <input type="date" value={fechaPeso} onChange={(e) => setFechaPeso(e.target.value)} className="mt-1 w-full" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700">Observaciones</label>
            <textarea value={observacionesPeso} onChange={(e) => setObservacionesPeso(e.target.value)} className="mt-1 w-full" rows={3} placeholder="Control mensual, después de alimentación..." />
          </div>
          <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
            <Button type="button" variant="secondary" onClick={() => setModalPesoAbierto(false)}>Cancelar</Button>
            <Button type="submit">Guardar peso</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={modalVacunaAbierto} onClose={() => setModalVacunaAbierto(false)} title={`Registrar vacuna${animalAccion ? `: ${animalAccion.nombre || animalAccion.codigo}` : ''}`}>
        <form onSubmit={guardarVacunaRapida} className="space-y-4">
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
          <div>
            <label className="block text-sm font-semibold text-slate-700">Veterinario</label>
            <input type="text" value={veterinario} onChange={(e) => setVeterinario(e.target.value)} className="mt-1 w-full" placeholder="Nombre del veterinario" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700">Observaciones</label>
            <textarea value={observacionesVacuna} onChange={(e) => setObservacionesVacuna(e.target.value)} className="mt-1 w-full" rows={3} placeholder="Aplicación normal, lote, reacción..." />
          </div>
          <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
            <Button type="button" variant="secondary" onClick={() => setModalVacunaAbierto(false)}>Cancelar</Button>
            <Button type="submit">Registrar vacuna</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={animalAEliminar !== null}
        title="Eliminar animal"
        message="Vas a eliminar este animal. Si tiene pesos o vacunas registradas, el sistema podría impedir la eliminación para proteger el historial."
        onCancel={() => setAnimalAEliminar(null)}
        onConfirm={() => {
          if (animalAEliminar !== null) {
            handleEliminar(animalAEliminar)
            setAnimalAEliminar(null)
          }
        }}
      />
    </div>
  )
}

export default Animales
