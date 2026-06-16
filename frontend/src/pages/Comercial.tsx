import { useEffect, useState } from 'react'

import ModuleSection from '../components/ModuleSection'
import PageHeader from '../components/PageHeader'
import type { FieldOption } from '../components/ModuleSection'
import { getAnimales } from '../services/animalService'
import { getFincas } from '../services/fincaService'
import { ganaderiaService } from '../services/ganaderiaService'

function Comercial() {
  const [fincas, setFincas] = useState<FieldOption[]>([])
  const [animales, setAnimales] = useState<FieldOption[]>([])
  const [clientes, setClientes] = useState<FieldOption[]>([])
  const [proveedores, setProveedores] = useState<FieldOption[]>([])

  useEffect(() => {
    getFincas().then((data) => setFincas(data.map((finca) => ({ label: finca.nombre, value: finca.id_finca }))))
    getAnimales().then((data) => setAnimales(data.map((animal) => ({ label: `${animal.codigo} ${animal.nombre || ''}`.trim(), value: animal.id_animal }))))
    ganaderiaService.getClientes().then((data) => setClientes(data.map((item) => ({ label: item.nombre, value: item.id_cliente }))))
    ganaderiaService.getProveedores().then((data) => setProveedores(data.map((item) => ({ label: item.nombre, value: item.id_proveedor }))))
  }, [])

  const crearCompraConDatosAnimal = (data: Record<string, any>) => {
    const detallesAnimal = [
      data.codigo_animal ? `Código: ${data.codigo_animal}` : '',
      data.nombre_animal ? `Nombre: ${data.nombre_animal}` : '',
      data.raza ? `Raza: ${data.raza}` : '',
      data.sexo ? `Sexo: ${data.sexo}` : '',
    ].filter(Boolean).join(' · ')

    const descripcion = [
      detallesAnimal ? `Animal comprado (${detallesAnimal})` : 'Animal comprado',
      data.descripcion,
    ].filter(Boolean).join(' - ')

    return ganaderiaService.createCompraAnimal({
      id_finca: data.id_finca,
      id_proveedor: data.id_proveedor,
      fecha_compra: data.fecha_compra,
      precio: data.precio,
      peso_compra: data.peso_compra,
      descripcion,
      observaciones: data.observaciones,
    })
  }

  return (
    <div>
      <PageHeader title="Comercial" description="Clientes, proveedores, compras y ventas ganaderas." />

      <div className="grid gap-6">
        <ModuleSection
          title="Ventas de animales"
          description="Registra ventas de ganado y cambia el estado comercial del animal a vendido."
          buttonLabel="Registrar venta"
          emptyTitle="No hay ventas de animales"
          load={ganaderiaService.getVentasAnimales}
          create={ganaderiaService.createVentaAnimal}
          searchKeys={['nombre_cliente', 'nombre_finca', 'codigo', 'descripcion']}
          fields={[
            { name: 'id_finca', label: 'Finca', type: 'select', required: true, options: fincas },
            { name: 'id_animal', label: 'Animal vendido', type: 'select', options: animales },
            { name: 'id_cliente', label: 'Cliente', type: 'select', options: clientes },
            { name: 'fecha_venta', label: 'Fecha', type: 'date', required: true },
            { name: 'precio', label: 'Precio', type: 'number', required: true },
            { name: 'peso_venta', label: 'Peso venta', type: 'number' },
            { name: 'utilidad_estimada', label: 'Utilidad estimada', type: 'number' },
            { name: 'descripcion', label: 'Descripción' },
            { name: 'observaciones', label: 'Observaciones', type: 'textarea' },
          ]}
          columns={[
            { key: 'fecha_venta', label: 'Fecha' },
            { key: 'codigo', label: 'Animal' },
            { key: 'nombre_cliente', label: 'Cliente' },
            { key: 'precio', label: 'Precio', render: (item) => `$${Number(item.precio || 0).toLocaleString()}` },
            { key: 'peso_venta', label: 'Peso' },
            { key: 'nombre_finca', label: 'Finca' },
          ]}
        />

        <ModuleSection
          title="Compras de animales"
          description="Registra compras de ganado con proveedor, finca, precio y peso de compra."
          buttonLabel="Registrar compra"
          emptyTitle="No hay compras de animales"
          load={ganaderiaService.getComprasAnimales}
          create={crearCompraConDatosAnimal}
          searchKeys={['nombre_proveedor', 'nombre_finca', 'descripcion']}
          simpleHint="Registra el animal que estás comprando. Aquí no se selecciona un animal existente porque todavía está entrando a la finca."
          fields={[
            { name: 'id_finca', label: 'Finca', type: 'select', required: true, options: fincas },
            { name: 'id_proveedor', label: 'Proveedor', type: 'select', options: proveedores },
            { name: 'fecha_compra', label: 'Fecha', type: 'date', required: true },
            { name: 'precio', label: 'Precio', type: 'number', required: true },
            { name: 'codigo_animal', label: 'Código del animal comprado', placeholder: 'Ej: A-102' },
            { name: 'nombre_animal', label: 'Nombre del animal', placeholder: 'Opcional' },
            { name: 'raza', label: 'Raza', placeholder: 'Brahman, Gyr, Angus...' },
            { name: 'sexo', label: 'Sexo', type: 'select', options: [{ label: 'Macho', value: 'MACHO' }, { label: 'Hembra', value: 'HEMBRA' }] },
            { name: 'peso_compra', label: 'Peso compra', type: 'number' },
            { name: 'descripcion', label: 'Descripción adicional' },
            { name: 'observaciones', label: 'Observaciones', type: 'textarea' },
          ]}
          columns={[
            { key: 'fecha_compra', label: 'Fecha' },
            { key: 'descripcion', label: 'Animal comprado' },
            { key: 'nombre_proveedor', label: 'Proveedor' },
            { key: 'precio', label: 'Precio', render: (item) => `$${Number(item.precio || 0).toLocaleString()}` },
            { key: 'peso_compra', label: 'Peso' },
            { key: 'nombre_finca', label: 'Finca' },
          ]}
        />

        <ModuleSection
          title="Ventas de leche"
          description="Registra litros vendidos, precio por litro y cliente."
          buttonLabel="Registrar venta de leche"
          emptyTitle="No hay ventas de leche"
          load={ganaderiaService.getVentasLeche}
          create={ganaderiaService.createVentaLeche}
          searchKeys={['nombre_cliente', 'nombre_finca']}
          fields={[
            { name: 'id_finca', label: 'Finca', type: 'select', required: true, options: fincas },
            { name: 'id_cliente', label: 'Cliente', type: 'select', options: clientes },
            { name: 'fecha_venta', label: 'Fecha', type: 'date', required: true },
            { name: 'litros', label: 'Litros', type: 'number', required: true },
            { name: 'precio_litro', label: 'Precio por litro', type: 'number', required: true },
            { name: 'observaciones', label: 'Observaciones', type: 'textarea' },
          ]}
          columns={[
            { key: 'fecha_venta', label: 'Fecha' },
            { key: 'nombre_cliente', label: 'Cliente' },
            { key: 'litros', label: 'Litros' },
            { key: 'precio_litro', label: 'Precio litro' },
            { key: 'total', label: 'Total', render: (item) => `$${Number(item.total || 0).toLocaleString()}` },
            { key: 'nombre_finca', label: 'Finca' },
          ]}
        />

        <ModuleSection
          title="Clientes"
          description="Personas o empresas a quienes vendes animales, leche u otros productos."
          buttonLabel="Nuevo cliente"
          emptyTitle="No hay clientes"
          load={ganaderiaService.getClientes}
          create={ganaderiaService.createCliente}
          searchKeys={['nombre', 'telefono', 'tipo']}
          fields={[
            { name: 'nombre', label: 'Nombre', required: true },
            { name: 'telefono', label: 'Teléfono' },
            { name: 'correo', label: 'Correo' },
            { name: 'direccion', label: 'Dirección' },
            { name: 'tipo', label: 'Tipo' },
            { name: 'observaciones', label: 'Observaciones', type: 'textarea' },
          ]}
          columns={[
            { key: 'nombre', label: 'Cliente' },
            { key: 'telefono', label: 'Teléfono' },
            { key: 'correo', label: 'Correo' },
            { key: 'tipo', label: 'Tipo' },
          ]}
        />

        <ModuleSection
          title="Proveedores"
          description="Personas o empresas a quienes compras animales, insumos o servicios."
          buttonLabel="Nuevo proveedor"
          emptyTitle="No hay proveedores"
          load={ganaderiaService.getProveedores}
          create={ganaderiaService.createProveedor}
          searchKeys={['nombre', 'telefono', 'tipo']}
          fields={[
            { name: 'nombre', label: 'Nombre', required: true },
            { name: 'telefono', label: 'Teléfono' },
            { name: 'correo', label: 'Correo' },
            { name: 'direccion', label: 'Dirección' },
            { name: 'tipo', label: 'Tipo' },
            { name: 'observaciones', label: 'Observaciones', type: 'textarea' },
          ]}
          columns={[
            { key: 'nombre', label: 'Proveedor' },
            { key: 'telefono', label: 'Teléfono' },
            { key: 'correo', label: 'Correo' },
            { key: 'tipo', label: 'Tipo' },
          ]}
        />
      </div>
    </div>
  )
}

export default Comercial


