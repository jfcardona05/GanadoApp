import { useEffect, useMemo, useState } from 'react'

import ModuleSection from '../components/ModuleSection'
import PageHeader from '../components/PageHeader'
import type { FieldOption } from '../components/ModuleSection'
import { getFincas } from '../services/fincaService'
import { getAnimales } from '../services/animalService'
import { ganaderiaService } from '../services/ganaderiaService'

function Potreros() {
  const [fincas, setFincas] = useState<FieldOption[]>([])
  const [animales, setAnimales] = useState<FieldOption[]>([])
  const [potreros, setPotreros] = useState<FieldOption[]>([])

  useEffect(() => {
    getFincas().then((data) => setFincas(data.map((finca) => ({ label: finca.nombre, value: finca.id_finca }))))
    getAnimales().then((data) => setAnimales(data.map((animal) => ({ label: `${animal.codigo} ${animal.nombre || ''}`.trim(), value: animal.id_animal }))))
    ganaderiaService.getPotreros().then((data) => setPotreros(data.map((potrero) => ({ label: `${potrero.nombre} - ${potrero.nombre_finca}`, value: potrero.id_potrero }))))
  }, [])

  const estadoOptions = useMemo(() => [
    { label: 'Disponible', value: 'DISPONIBLE' },
    { label: 'Ocupado', value: 'OCUPADO' },
    { label: 'Descanso', value: 'DESCANSO' },
    { label: 'Mantenimiento', value: 'MANTENIMIENTO' },
  ], [])

  return (
    <div>
      <PageHeader
        title="Potreros"
        description="Controla divisiones, capacidad, agua, sombra y movimientos de animales entre potreros."
      />

      <div className="grid gap-6">
        <ModuleSection
          title="Potreros registrados"
          description="Crea potreros por finca para organizar rotación, descanso y disponibilidad."
          buttonLabel="Nuevo potrero"
          emptyTitle="No hay potreros registrados"
          load={ganaderiaService.getPotreros}
          create={ganaderiaService.createPotrero}
          searchKeys={['nombre', 'nombre_finca', 'tipo_pasto', 'estado']}
          fields={[
            { name: 'id_finca', label: 'Finca', type: 'select', required: true, options: fincas },
            { name: 'nombre', label: 'Nombre del potrero', required: true },
            { name: 'area_hectareas', label: 'Área en hectáreas', type: 'number' },
            { name: 'tipo_pasto', label: 'Tipo de pasto' },
            { name: 'capacidad_animales', label: 'Capacidad de animales', type: 'number' },
            { name: 'estado', label: 'Estado', type: 'select', options: estadoOptions },
            { name: 'agua_disponible', label: 'Tiene agua disponible', type: 'checkbox' },
            { name: 'sombra_disponible', label: 'Tiene sombra disponible', type: 'checkbox' },
            { name: 'observaciones', label: 'Observaciones', type: 'textarea' },
          ]}
          columns={[
            { key: 'nombre', label: 'Potrero' },
            { key: 'nombre_finca', label: 'Finca' },
            { key: 'area_hectareas', label: 'Hectáreas' },
            { key: 'tipo_pasto', label: 'Pasto' },
            { key: 'capacidad_animales', label: 'Capacidad' },
            { key: 'estado', label: 'Estado' },
          ]}
        />

        <ModuleSection
          title="Movimientos de potrero"
          description="Registra cambios de ubicación para saber dónde estuvo cada animal."
          buttonLabel="Mover animal"
          emptyTitle="No hay movimientos de potrero"
          load={ganaderiaService.getMovimientosPotrero}
          create={ganaderiaService.createMovimientoPotrero}
          searchKeys={['codigo', 'nombre_animal', 'potrero_destino', 'motivo']}
          fields={[
            { name: 'id_animal', label: 'Animal', type: 'select', required: true, options: animales },
            { name: 'id_potrero_origen', label: 'Potrero origen', type: 'select', options: potreros },
            { name: 'id_potrero_destino', label: 'Potrero destino', type: 'select', required: true, options: potreros },
            { name: 'fecha_movimiento', label: 'Fecha', type: 'date', required: true },
            { name: 'motivo', label: 'Motivo' },
            { name: 'observaciones', label: 'Observaciones', type: 'textarea' },
          ]}
          columns={[
            { key: 'codigo', label: 'Animal', render: (item) => `${item.codigo} ${item.nombre_animal || ''}`.trim() },
            { key: 'potrero_origen', label: 'Origen' },
            { key: 'potrero_destino', label: 'Destino' },
            { key: 'fecha_movimiento', label: 'Fecha' },
            { key: 'motivo', label: 'Motivo' },
          ]}
        />
      </div>
    </div>
  )
}

export default Potreros
