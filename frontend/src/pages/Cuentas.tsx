import { useEffect, useState } from 'react'

import ModuleSection from '../components/ModuleSection'
import PageHeader from '../components/PageHeader'
import type { FieldOption } from '../components/ModuleSection'
import { getFincas } from '../services/fincaService'
import { ganaderiaService } from '../services/ganaderiaService'

function Cuentas() {
  const [fincas, setFincas] = useState<FieldOption[]>([])
  const [clientes, setClientes] = useState<FieldOption[]>([])
  const [proveedores, setProveedores] = useState<FieldOption[]>([])

  useEffect(() => {
    getFincas().then((data) => setFincas(data.map((finca) => ({ label: finca.nombre, value: finca.id_finca }))))
    ganaderiaService.getClientes().then((data) => setClientes(data.map((item) => ({ label: item.nombre, value: item.id_cliente }))))
    ganaderiaService.getProveedores().then((data) => setProveedores(data.map((item) => ({ label: item.nombre, value: item.id_proveedor }))))
  }, [])

  const estadosPagar = [
    { label: 'Pendiente', value: 'PENDIENTE' },
    { label: 'Pagada', value: 'PAGADA' },
    { label: 'Vencida', value: 'VENCIDA' },
    { label: 'Anulada', value: 'ANULADA' },
  ]

  const estadosCobrar = [
    { label: 'Pendiente', value: 'PENDIENTE' },
    { label: 'Cobrada', value: 'COBRADA' },
    { label: 'Vencida', value: 'VENCIDA' },
    { label: 'Anulada', value: 'ANULADA' },
  ]

  return (
    <div>
      <PageHeader title="Cuentas" description="Controla lo que debes pagar y lo que te deben pagar." />

      <div className="grid gap-6">
        <ModuleSection
          title="Cuentas por pagar"
          description="Deudas con proveedores, veterinarios, alimentos, insumos o servicios."
          buttonLabel="Nueva cuenta por pagar"
          emptyTitle="No hay cuentas por pagar"
          load={ganaderiaService.getCuentasPagar}
          create={ganaderiaService.createCuentaPagar}
          searchKeys={['descripcion', 'estado']}
          fields={[
            { name: 'id_finca', label: 'Finca', type: 'select', options: fincas },
            { name: 'id_proveedor', label: 'Proveedor', type: 'select', options: proveedores },
            { name: 'descripcion', label: 'Descripción', required: true },
            { name: 'monto', label: 'Monto', type: 'number', required: true },
            { name: 'fecha_emision', label: 'Fecha emisión', type: 'date' },
            { name: 'fecha_vencimiento', label: 'Fecha vencimiento', type: 'date', required: true },
            { name: 'estado', label: 'Estado', type: 'select', options: estadosPagar },
            { name: 'observaciones', label: 'Observaciones', type: 'textarea' },
          ]}
          columns={[
            { key: 'descripcion', label: 'Descripción' },
            { key: 'monto', label: 'Monto', render: (item) => `$${Number(item.monto || 0).toLocaleString()}` },
            { key: 'fecha_vencimiento', label: 'Vence' },
            { key: 'estado', label: 'Estado' },
          ]}
        />

        <ModuleSection
          title="Cuentas por cobrar"
          description="Dinero pendiente por ventas de animales, leche u otros ingresos."
          buttonLabel="Nueva cuenta por cobrar"
          emptyTitle="No hay cuentas por cobrar"
          load={ganaderiaService.getCuentasCobrar}
          create={ganaderiaService.createCuentaCobrar}
          searchKeys={['descripcion', 'estado']}
          fields={[
            { name: 'id_finca', label: 'Finca', type: 'select', options: fincas },
            { name: 'id_cliente', label: 'Cliente', type: 'select', options: clientes },
            { name: 'descripcion', label: 'Descripción', required: true },
            { name: 'monto', label: 'Monto', type: 'number', required: true },
            { name: 'fecha_emision', label: 'Fecha emisión', type: 'date' },
            { name: 'fecha_vencimiento', label: 'Fecha vencimiento', type: 'date', required: true },
            { name: 'estado', label: 'Estado', type: 'select', options: estadosCobrar },
            { name: 'observaciones', label: 'Observaciones', type: 'textarea' },
          ]}
          columns={[
            { key: 'descripcion', label: 'Descripción' },
            { key: 'monto', label: 'Monto', render: (item) => `$${Number(item.monto || 0).toLocaleString()}` },
            { key: 'fecha_vencimiento', label: 'Vence' },
            { key: 'estado', label: 'Estado' },
          ]}
        />
      </div>
    </div>
  )
}

export default Cuentas
