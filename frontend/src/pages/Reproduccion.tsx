import { useEffect, useState } from 'react'

import ModuleSection from '../components/ModuleSection'
import PageHeader from '../components/PageHeader'
import type { FieldOption } from '../components/ModuleSection'
import { getAnimales } from '../services/animalService'
import { ganaderiaService } from '../services/ganaderiaService'

function Reproduccion() {
  const [animales, setAnimales] = useState<FieldOption[]>([])
  const [servicios, setServicios] = useState<FieldOption[]>([])

  useEffect(() => {
    getAnimales().then((data) => setAnimales(data.map((animal) => ({ label: `${animal.codigo} ${animal.nombre || ''}`.trim(), value: animal.id_animal }))))
    ganaderiaService.getServicios().then((data) => setServicios(data.map((servicio) => ({ label: `${servicio.codigo_hembra} - ${servicio.fecha_servicio}`, value: servicio.id_servicio }))))
  }, [])

  return (
    <div>
      <PageHeader
        title="Reproducción"
        description="Registra celos, montas, inseminaciones, diagnósticos de preñez y partos."
      />

      <div className="grid gap-6">
        <ModuleSection
          title="Servicios reproductivos"
          description="Controla cuándo fue servida una hembra, por qué método y con qué resultado."
          buttonLabel="Nuevo servicio"
          emptyTitle="No hay servicios reproductivos"
          load={ganaderiaService.getServicios}
          create={ganaderiaService.createServicio}
          searchKeys={['codigo_hembra', 'nombre_hembra', 'tipo', 'resultado']}
          fields={[
            { name: 'id_hembra', label: 'Hembra', type: 'select', required: true, options: animales },
            { name: 'id_macho', label: 'Macho o toro', type: 'select', options: animales },
            { name: 'tipo', label: 'Tipo', type: 'select', required: true, options: [
              { label: 'Celo', value: 'CELO' },
              { label: 'Monta natural', value: 'MONTA_NATURAL' },
              { label: 'Inseminación', value: 'INSEMINACION' },
              { label: 'Transferencia embrionaria', value: 'TRANSFERENCIA_EMBRIONARIA' },
            ] },
            { name: 'fecha_servicio', label: 'Fecha', type: 'date', required: true },
            { name: 'pajilla_codigo', label: 'Código de pajilla' },
            { name: 'responsable', label: 'Responsable' },
            { name: 'resultado', label: 'Resultado', type: 'select', options: [
              { label: 'Pendiente', value: 'PENDIENTE' },
              { label: 'Preñada', value: 'PRENADA' },
              { label: 'No preñada', value: 'NO_PRENADA' },
              { label: 'Repetición de celo', value: 'REPETICION_CELO' },
              { label: 'Aborto', value: 'ABORTO' },
            ] },
            { name: 'observaciones', label: 'Observaciones', type: 'textarea' },
          ]}
          columns={[
            { key: 'codigo_hembra', label: 'Hembra', render: (item) => `${item.codigo_hembra} ${item.nombre_hembra || ''}`.trim() },
            { key: 'tipo', label: 'Tipo' },
            { key: 'fecha_servicio', label: 'Fecha' },
            { key: 'resultado', label: 'Resultado' },
            { key: 'responsable', label: 'Responsable' },
          ]}
        />

        <ModuleSection
          title="Diagnósticos de preñez"
          description="Confirma preñez, vacía o dudosa y registra fecha probable de parto."
          buttonLabel="Nuevo diagnóstico"
          emptyTitle="No hay diagnósticos"
          load={ganaderiaService.getDiagnosticos}
          create={ganaderiaService.createDiagnostico}
          searchKeys={['codigo', 'nombre_animal', 'resultado', 'veterinario']}
          fields={[
            { name: 'id_servicio', label: 'Servicio', type: 'select', required: true, options: servicios },
            { name: 'id_hembra', label: 'Hembra', type: 'select', required: true, options: animales },
            { name: 'fecha_diagnostico', label: 'Fecha diagnóstico', type: 'date', required: true },
            { name: 'resultado', label: 'Resultado', type: 'select', required: true, options: [
              { label: 'Preñada', value: 'PRENADA' },
              { label: 'Vacía', value: 'VACIA' },
              { label: 'Dudosa', value: 'DUDOSA' },
            ] },
            { name: 'metodo', label: 'Método' },
            { name: 'fecha_probable_parto', label: 'Fecha probable de parto', type: 'date' },
            { name: 'veterinario', label: 'Veterinario' },
            { name: 'observaciones', label: 'Observaciones', type: 'textarea' },
          ]}
          columns={[
            { key: 'codigo', label: 'Animal', render: (item) => `${item.codigo} ${item.nombre_animal || ''}`.trim() },
            { key: 'resultado', label: 'Resultado' },
            { key: 'fecha_diagnostico', label: 'Fecha' },
            { key: 'fecha_probable_parto', label: 'Probable parto' },
            { key: 'veterinario', label: 'Veterinario' },
          ]}
        />

        <ModuleSection
          title="Partos"
          description="Registra nacimientos, abortos y estado de la cría."
          buttonLabel="Nuevo parto"
          emptyTitle="No hay partos registrados"
          load={ganaderiaService.getPartos}
          create={ganaderiaService.createParto}
          searchKeys={['codigo_madre', 'nombre_madre', 'codigo_cria', 'tipo_parto']}
          fields={[
            { name: 'id_madre', label: 'Madre', type: 'select', required: true, options: animales },
            { name: 'id_servicio', label: 'Servicio relacionado', type: 'select', options: servicios },
            { name: 'id_cria', label: 'Cría registrada', type: 'select', options: animales },
            { name: 'fecha_parto', label: 'Fecha de parto', type: 'date', required: true },
            { name: 'tipo_parto', label: 'Tipo de parto', type: 'select', options: [
              { label: 'Normal', value: 'NORMAL' },
              { label: 'Asistido', value: 'ASISTIDO' },
              { label: 'Cesárea', value: 'CESAREA' },
              { label: 'Aborto', value: 'ABORTO' },
            ] },
            { name: 'sexo_cria', label: 'Sexo cría', type: 'select', options: [
              { label: 'Macho', value: 'MACHO' },
              { label: 'Hembra', value: 'HEMBRA' },
            ] },
            { name: 'peso_cria', label: 'Peso cría', type: 'number' },
            { name: 'estado_cria', label: 'Estado cría', type: 'select', options: [
              { label: 'Viva', value: 'VIVA' },
              { label: 'Muerta', value: 'MUERTA' },
              { label: 'Débil', value: 'DEBIL' },
            ] },
            { name: 'observaciones', label: 'Observaciones', type: 'textarea' },
          ]}
          columns={[
            { key: 'codigo_madre', label: 'Madre', render: (item) => `${item.codigo_madre} ${item.nombre_madre || ''}`.trim() },
            { key: 'fecha_parto', label: 'Fecha' },
            { key: 'tipo_parto', label: 'Tipo' },
            { key: 'estado_cria', label: 'Estado cría' },
            { key: 'codigo_cria', label: 'Cría' },
          ]}
        />
      </div>
    </div>
  )
}

export default Reproduccion
