import { useEffect, useState } from 'react'

import ModuleSection from '../components/ModuleSection'
import PageHeader from '../components/PageHeader'
import type { FieldOption } from '../components/ModuleSection'
import { getFincas } from '../services/fincaService'
import { ganaderiaService } from '../services/ganaderiaService'

function Inventario() {
  const [fincas, setFincas] = useState<FieldOption[]>([])
  const [insumos, setInsumos] = useState<FieldOption[]>([])
  const [proveedores, setProveedores] = useState<FieldOption[]>([])

  const cargarCatalogos = () => {
    getFincas().then((data) => setFincas(data.map((finca) => ({ label: finca.nombre, value: finca.id_finca }))))
    ganaderiaService.getInsumos().then((data) => setInsumos(data.map((item) => ({ label: item.nombre, value: item.id_insumo }))))
    ganaderiaService.getProveedores().then((data) => setProveedores(data.map((item) => ({ label: item.nombre, value: item.id_proveedor }))))
  }

  useEffect(() => {
    cargarCatalogos()
  }, [])

  return (
    <div>
      <PageHeader title="Inventario" description="Controla insumos, existencias, entradas, salidas, lotes y vencimientos." />

      <div className="grid gap-6">
        <ModuleSection
          title="Existencias"
          description="Vista actual por insumo, finca, lote y fecha de vencimiento."
          buttonLabel="Registrar movimiento"
          emptyTitle="No hay existencias"
          load={ganaderiaService.getInventario}
          create={ganaderiaService.createMovimientoInventario}
          searchKeys={['nombre_insumo', 'nombre_finca', 'tipo', 'lote']}
          fields={[
            { name: 'id_insumo', label: 'Insumo', type: 'select', required: true, options: insumos },
            { name: 'id_finca', label: 'Finca', type: 'select', required: true, options: fincas },
            { name: 'id_proveedor', label: 'Proveedor', type: 'select', options: proveedores },
            { name: 'tipo_movimiento', label: 'Movimiento', type: 'select', required: true, options: [
              { label: 'Entrada', value: 'ENTRADA' },
              { label: 'Salida', value: 'SALIDA' },
              { label: 'Ajuste', value: 'AJUSTE' },
              { label: 'Consumo', value: 'CONSUMO' },
            ] },
            { name: 'cantidad', label: 'Cantidad', type: 'number', required: true },
            { name: 'costo_unitario', label: 'Costo unitario', type: 'number' },
            { name: 'fecha_movimiento', label: 'Fecha movimiento', type: 'date', required: true },
            { name: 'lote', label: 'Lote' },
            { name: 'fecha_vencimiento', label: 'Fecha vencimiento', type: 'date' },
            { name: 'motivo', label: 'Motivo' },
            { name: 'observaciones', label: 'Observaciones', type: 'textarea' },
          ]}
          columns={[
            { key: 'nombre_insumo', label: 'Insumo' },
            { key: 'nombre_finca', label: 'Finca' },
            { key: 'cantidad_actual', label: 'Cantidad' },
            { key: 'unidad_medida', label: 'Unidad' },
            { key: 'stock_minimo', label: 'Mínimo' },
            { key: 'fecha_vencimiento', label: 'Vencimiento' },
            { key: 'lote', label: 'Lote' },
          ]}
        />

        <ModuleSection
          title="Catálogo de insumos"
          description="Crea alimentos, medicamentos, vacunas, suplementos y herramientas."
          buttonLabel="Nuevo insumo"
          emptyTitle="No hay insumos"
          load={ganaderiaService.getInsumos}
          create={ganaderiaService.createInsumo}
          searchKeys={['nombre', 'tipo']}
          fields={[
            { name: 'nombre', label: 'Nombre', required: true },
            { name: 'tipo', label: 'Tipo', type: 'select', required: true, options: [
              { label: 'Alimento', value: 'ALIMENTO' },
              { label: 'Medicamento', value: 'MEDICAMENTO' },
              { label: 'Vacuna', value: 'VACUNA' },
              { label: 'Suplemento', value: 'SUPLEMENTO' },
              { label: 'Herramienta', value: 'HERRAMIENTA' },
              { label: 'Otro', value: 'OTRO' },
            ] },
            { name: 'unidad_medida', label: 'Unidad de medida', required: true },
            { name: 'stock_minimo', label: 'Stock mínimo', type: 'number' },
            { name: 'observaciones', label: 'Observaciones', type: 'textarea' },
          ]}
          columns={[
            { key: 'nombre', label: 'Insumo' },
            { key: 'tipo', label: 'Tipo' },
            { key: 'unidad_medida', label: 'Unidad' },
            { key: 'stock_minimo', label: 'Stock mínimo' },
            { key: 'stock_total', label: 'Stock total' },
          ]}
        />
      </div>
    </div>
  )
}

export default Inventario
