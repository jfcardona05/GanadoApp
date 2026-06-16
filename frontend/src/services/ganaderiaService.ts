import api from './api'

export type Registro = Record<string, any>

const get = async <T = Registro[]>(url: string): Promise<T> => {
  const response = await api.get(url)
  return response.data
}

const post = async (url: string, data: Registro) => {
  const response = await api.post(url, data)
  return response.data
}

export const ganaderiaService = {
  getPotreros: () => get('/ganaderia/potreros'),
  createPotrero: (data: Registro) => post('/ganaderia/potreros', data),
  getMovimientosPotrero: () => get('/ganaderia/movimientos-potrero'),
  createMovimientoPotrero: (data: Registro) => post('/ganaderia/movimientos-potrero', data),

  getEventos: () => get('/ganaderia/eventos-animales'),

  getServicios: () => get('/ganaderia/reproduccion/servicios'),
  createServicio: (data: Registro) => post('/ganaderia/reproduccion/servicios', data),
  getDiagnosticos: () => get('/ganaderia/reproduccion/diagnosticos'),
  createDiagnostico: (data: Registro) => post('/ganaderia/reproduccion/diagnosticos', data),
  getPartos: () => get('/ganaderia/reproduccion/partos'),
  createParto: (data: Registro) => post('/ganaderia/reproduccion/partos', data),

  getEnfermedades: () => get('/ganaderia/sanidad/enfermedades'),
  createEnfermedad: (data: Registro) => post('/ganaderia/sanidad/enfermedades', data),
  getMedicamentos: () => get('/ganaderia/sanidad/medicamentos'),
  createMedicamento: (data: Registro) => post('/ganaderia/sanidad/medicamentos', data),
  getTratamientos: () => get('/ganaderia/sanidad/tratamientos'),
  createTratamiento: (data: Registro) => post('/ganaderia/sanidad/tratamientos', data),
  getDesparasitaciones: () => get('/ganaderia/sanidad/desparasitaciones'),
  createDesparasitacion: (data: Registro) => post('/ganaderia/sanidad/desparasitaciones', data),

  getProduccionLeche: () => get('/ganaderia/produccion/leche'),
  createProduccionLeche: (data: Registro) => post('/ganaderia/produccion/leche', data),
  getLotesCeba: () => get('/ganaderia/produccion/lotes-ceba'),
  createLoteCeba: (data: Registro) => post('/ganaderia/produccion/lotes-ceba', data),

  getClientes: () => get('/ganaderia/clientes'),
  createCliente: (data: Registro) => post('/ganaderia/clientes', data),
  getProveedores: () => get('/ganaderia/proveedores'),
  createProveedor: (data: Registro) => post('/ganaderia/proveedores', data),

  getComprasAnimales: () => get('/ganaderia/comercial/compras-animales'),
  createCompraAnimal: (data: Registro) => post('/ganaderia/comercial/compras-animales', data),
  getVentasAnimales: () => get('/ganaderia/comercial/ventas-animales'),
  createVentaAnimal: (data: Registro) => post('/ganaderia/comercial/ventas-animales', data),
  getVentasLeche: () => get('/ganaderia/comercial/ventas-leche'),
  createVentaLeche: (data: Registro) => post('/ganaderia/comercial/ventas-leche', data),

  getInsumos: () => get('/ganaderia/inventario/insumos'),
  createInsumo: (data: Registro) => post('/ganaderia/inventario/insumos', data),
  getInventario: () => get('/ganaderia/inventario/existencias'),
  createMovimientoInventario: (data: Registro) => post('/ganaderia/inventario/movimientos', data),

  getCuentasPagar: () => get('/ganaderia/cuentas/pagar'),
  createCuentaPagar: (data: Registro) => post('/ganaderia/cuentas/pagar', data),
  getCuentasCobrar: () => get('/ganaderia/cuentas/cobrar'),
  createCuentaCobrar: (data: Registro) => post('/ganaderia/cuentas/cobrar', data),

  getAlertas: () => get('/ganaderia/alertas'),
}
