import api from './api'

export interface CategoriaFinanciera {
  id_categoria: number
  id_usuario: number
  nombre: string
  tipo: 'GASTO' | 'INGRESO'
  fecha_creacion?: string
}

interface CategoriaData {
  nombre: string
  tipo: 'GASTO' | 'INGRESO'
}

export const getCategoriasFinancieras = async (): Promise<CategoriaFinanciera[]> => {
  const response = await api.get('/categorias-financieras')
  return response.data
}

export const createCategoriaFinanciera = async (data: CategoriaData) => {
  const response = await api.post('/categorias-financieras', data)
  return response.data
}

export const updateCategoriaFinanciera = async (
  id: number,
  data: CategoriaData
) => {
  const response = await api.put(`/categorias-financieras/${id}`, data)
  return response.data
}

export const deleteCategoriaFinanciera = async (id: number) => {
  const response = await api.delete(`/categorias-financieras/${id}`)
  return response.data
}