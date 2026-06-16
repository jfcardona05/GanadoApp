import { useEffect, useState } from 'react'

import ModuleSection from '../components/ModuleSection'
import PageHeader from '../components/PageHeader'
import type { FieldOption } from '../components/ModuleSection'
import { getAnimales } from '../services/animalService'
import { ganaderiaService } from '../services/ganaderiaService'

function Sanidad() {
  const [animales, setAnimales] = useState<FieldOption[]>([])
  const [enfermedades, setEnfermedades] = useState<FieldOption[]>([])
  const [medicamentos, setMedicamentos] = useState<FieldOption[]>([])

  useEffect(() => {
    getAnimales().then((data) => setAnimales(data.map((animal) => ({ label: `${animal.codigo} ${animal.nombre || ''}`.trim(), value: animal.id_animal }))))
    ganaderiaService.getEnfermedades().then((data) => setEnfermedades(data.map((item) => ({ label: item.nombre, value: item.id_enfermedad }))))
    ganaderiaService.getMedicamentos().then((data) => setMedicamentos(data.map((item) => ({ label: item.nombre, value: item.id_medicamento }))))
  }, [])

  return (
    <div>
      <PageHeader
        title="Sanidad"
        description="Administra enfermedades, medicamentos, tratamientos y desparasitaciones."
      />

      <div className="grid gap-6">
        <ModuleSection
          title="Tratamientos"
          description="Registra diagnósticos, veterinario, fechas y estado del tratamiento."
          buttonLabel="Nuevo tratamiento"
          emptyTitle="No hay tratamientos"
          load={ganaderiaService.getTratamientos}
          create={ganaderiaService.createTratamiento}
          searchKeys={['codigo', 'nombre_animal', 'diagnostico', 'estado', 'veterinario']}
          fields={[
            { name: 'id_animal', label: 'Animal', type: 'select', required: true, options: animales },
            { name: 'id_enfermedad', label: 'Enfermedad', type: 'select', options: enfermedades },
            { name: 'fecha_inicio', label: 'Fecha inicio', type: 'date', required: true },
            { name: 'fecha_fin', label: 'Fecha fin', type: 'date' },
            { name: 'diagnostico', label: 'Diagnóstico' },
            { name: 'estado', label: 'Estado', type: 'select', options: [
              { label: 'Activo', value: 'ACTIVO' },
              { label: 'Finalizado', value: 'FINALIZADO' },
              { label: 'Suspendido', value: 'SUSPENDIDO' },
            ] },
            { name: 'veterinario', label: 'Veterinario' },
            { name: 'observaciones', label: 'Observaciones', type: 'textarea' },
          ]}
          columns={[
            { key: 'codigo', label: 'Animal', render: (item) => `${item.codigo} ${item.nombre_animal || ''}`.trim() },
            { key: 'nombre_enfermedad', label: 'Enfermedad' },
            { key: 'diagnostico', label: 'Diagnóstico' },
            { key: 'fecha_inicio', label: 'Inicio' },
            { key: 'estado', label: 'Estado' },
            { key: 'veterinario', label: 'Veterinario' },
          ]}
        />

        <ModuleSection
          title="Desparasitaciones"
          description="Controla producto, dosis, responsable y próxima aplicación."
          buttonLabel="Nueva desparasitación"
          emptyTitle="No hay desparasitaciones"
          load={ganaderiaService.getDesparasitaciones}
          create={ganaderiaService.createDesparasitacion}
          searchKeys={['codigo', 'nombre_animal', 'producto', 'responsable']}
          fields={[
            { name: 'id_animal', label: 'Animal', type: 'select', required: true, options: animales },
            { name: 'id_medicamento', label: 'Medicamento', type: 'select', options: medicamentos },
            { name: 'fecha_aplicacion', label: 'Fecha aplicación', type: 'date', required: true },
            { name: 'proxima_fecha', label: 'Próxima fecha', type: 'date' },
            { name: 'producto', label: 'Producto' },
            { name: 'dosis', label: 'Dosis' },
            { name: 'responsable', label: 'Responsable' },
            { name: 'observaciones', label: 'Observaciones', type: 'textarea' },
          ]}
          columns={[
            { key: 'codigo', label: 'Animal', render: (item) => `${item.codigo} ${item.nombre_animal || ''}`.trim() },
            { key: 'producto', label: 'Producto' },
            { key: 'fecha_aplicacion', label: 'Aplicación' },
            { key: 'proxima_fecha', label: 'Próxima' },
            { key: 'responsable', label: 'Responsable' },
          ]}
        />

        <ModuleSection
          title="Medicamentos"
          description="Crea el catálogo sanitario con retiros para leche y carne."
          buttonLabel="Nuevo medicamento"
          emptyTitle="No hay medicamentos"
          load={ganaderiaService.getMedicamentos}
          create={ganaderiaService.createMedicamento}
          searchKeys={['nombre', 'principio_activo']}
          fields={[
            { name: 'nombre', label: 'Nombre', required: true },
            { name: 'principio_activo', label: 'Principio activo' },
            { name: 'unidad_medida', label: 'Unidad de medida' },
            { name: 'periodo_retiro_leche_dias', label: 'Retiro leche días', type: 'number' },
            { name: 'periodo_retiro_carne_dias', label: 'Retiro carne días', type: 'number' },
            { name: 'observaciones', label: 'Observaciones', type: 'textarea' },
          ]}
          columns={[
            { key: 'nombre', label: 'Medicamento' },
            { key: 'principio_activo', label: 'Principio activo' },
            { key: 'unidad_medida', label: 'Unidad' },
            { key: 'periodo_retiro_leche_dias', label: 'Retiro leche' },
            { key: 'periodo_retiro_carne_dias', label: 'Retiro carne' },
          ]}
        />

        <ModuleSection
          title="Enfermedades"
          description="Catálogo simple para clasificar tratamientos."
          buttonLabel="Nueva enfermedad"
          emptyTitle="No hay enfermedades"
          load={ganaderiaService.getEnfermedades}
          create={ganaderiaService.createEnfermedad}
          searchKeys={['nombre', 'descripcion']}
          fields={[
            { name: 'nombre', label: 'Nombre', required: true },
            { name: 'descripcion', label: 'Descripción', type: 'textarea' },
          ]}
          columns={[
            { key: 'nombre', label: 'Enfermedad' },
            { key: 'descripcion', label: 'Descripción' },
          ]}
        />
      </div>
    </div>
  )
}

export default Sanidad
