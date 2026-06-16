import { useEffect, useState } from 'react'

import ModuleSection from '../components/ModuleSection'
import PageHeader from '../components/PageHeader'
import type { FieldOption } from '../components/ModuleSection'
import { getAnimales } from '../services/animalService'
import { getFincas } from '../services/fincaService'
import { ganaderiaService } from '../services/ganaderiaService'

function Produccion() {
  const [fincas, setFincas] = useState<FieldOption[]>([])
  const [animales, setAnimales] = useState<FieldOption[]>([])

  useEffect(() => {
    getFincas().then((data) => setFincas(data.map((finca) => ({ label: finca.nombre, value: finca.id_finca }))))
    getAnimales().then((data) => setAnimales(data.map((animal) => ({ label: `${animal.codigo} ${animal.nombre || ''}`.trim(), value: animal.id_animal }))))
  }, [])

  return (
    <div>
      <PageHeader title="Producción" description="Registra producción de leche y lotes de ceba." />

      <div className="grid gap-6">
        <ModuleSection
          title="Producción de leche"
          description="Control diario por finca, animal, turno, litros y destino."
          buttonLabel="Registrar leche"
          emptyTitle="No hay producción de leche"
          load={ganaderiaService.getProduccionLeche}
          create={ganaderiaService.createProduccionLeche}
          searchKeys={['nombre_finca', 'codigo', 'nombre_animal', 'destino']}
          fields={[
            { name: 'id_finca', label: 'Finca', type: 'select', required: true, options: fincas },
            { name: 'id_animal', label: 'Animal', type: 'select', options: animales },
            { name: 'fecha', label: 'Fecha', type: 'date', required: true },
            { name: 'turno', label: 'Turno', type: 'select', options: [
              { label: 'Mañana', value: 'MANANA' },
              { label: 'Tarde', value: 'TARDE' },
              { label: 'Noche', value: 'NOCHE' },
              { label: 'Total día', value: 'TOTAL_DIA' },
            ] },
            { name: 'litros', label: 'Litros', type: 'number', required: true },
            { name: 'destino', label: 'Destino', type: 'select', options: [
              { label: 'Venta', value: 'VENTA' },
              { label: 'Consumo interno', value: 'CONSUMO_INTERNO' },
              { label: 'Cría', value: 'CRIA' },
              { label: 'Descarte', value: 'DESCARTE' },
              { label: 'Otro', value: 'OTRO' },
            ] },
            { name: 'observaciones', label: 'Observaciones', type: 'textarea' },
          ]}
          columns={[
            { key: 'fecha', label: 'Fecha' },
            { key: 'nombre_finca', label: 'Finca' },
            { key: 'codigo', label: 'Animal' },
            { key: 'turno', label: 'Turno' },
            { key: 'litros', label: 'Litros' },
            { key: 'destino', label: 'Destino' },
          ]}
        />

        <ModuleSection
          title="Lotes de ceba"
          description="Agrupa animales de engorde por finca y periodo."
          buttonLabel="Nuevo lote"
          emptyTitle="No hay lotes de ceba"
          load={ganaderiaService.getLotesCeba}
          create={ganaderiaService.createLoteCeba}
          searchKeys={['nombre', 'nombre_finca', 'estado']}
          fields={[
            { name: 'id_finca', label: 'Finca', type: 'select', required: true, options: fincas },
            { name: 'nombre', label: 'Nombre del lote', required: true },
            { name: 'fecha_inicio', label: 'Fecha inicio', type: 'date', required: true },
            { name: 'fecha_fin', label: 'Fecha fin', type: 'date' },
            { name: 'estado', label: 'Estado', type: 'select', options: [
              { label: 'Activo', value: 'ACTIVO' },
              { label: 'Finalizado', value: 'FINALIZADO' },
              { label: 'Cancelado', value: 'CANCELADO' },
            ] },
            { name: 'observaciones', label: 'Observaciones', type: 'textarea' },
          ]}
          columns={[
            { key: 'nombre', label: 'Lote' },
            { key: 'nombre_finca', label: 'Finca' },
            { key: 'fecha_inicio', label: 'Inicio' },
            { key: 'fecha_fin', label: 'Fin' },
            { key: 'estado', label: 'Estado' },
            { key: 'total_animales', label: 'Animales' },
          ]}
        />
      </div>
    </div>
  )
}

export default Produccion


