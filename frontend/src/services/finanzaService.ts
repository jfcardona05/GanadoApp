import api from './api'

export interface Gasto {
  id_gasto: number
  id_finca: number
  id_categoria: number | null
  id_animal?: number | null
  id_proveedor?: number | null
  origen?: string | null
  id_referencia?: number | null
  categoria?: string | null
  nombre_categoria?: string | null
  descripcion: string | null
  monto: string | number
  fecha: string
  nombre_finca?: string
}

export interface Ingreso {
  id_ingreso: number
  id_finca: number
  id_categoria: number | null
  id_animal?: number | null
  id_cliente?: number | null
  origen?: string | null
  id_referencia?: number | null
  categoria?: string | null
  nombre_categoria?: string | null
  descripcion: string | null
  monto: string | number
  fecha: string
  nombre_finca?: string
}

interface MovimientoData {
  id_finca: number
  id_categoria: number
  descripcion?: string | null
  monto: number
  fecha: string
}

export const createGasto = async (data: MovimientoData) => {
  const response = await api.post('/finanzas/gastos', data)
  return response.data
}

export const getGastos = async (): Promise<Gasto[]> => {
  const response = await api.get('/finanzas/gastos')
  return response.data
}

export const deleteGasto = async (id: number) => {
  const response = await api.delete(`/finanzas/gastos/${id}`)
  return response.data
}

export const createIngreso = async (data: MovimientoData) => {
  const response = await api.post('/finanzas/ingresos', data)
  return response.data
}

export const getIngresos = async (): Promise<Ingreso[]> => {
  const response = await api.get('/finanzas/ingresos')
  return response.data
}

export const deleteIngreso = async (id: number) => {
  const response = await api.delete(`/finanzas/ingresos/${id}`)
  return response.data
}

export const getResumenFinanciero = async () => {
  const response = await api.get('/finanzas/resumen')
  return response.data
}




