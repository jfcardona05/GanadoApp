import api from './api'

export interface Finca {
  id_finca: number
  id_usuario: number
  nombre: string
  ubicacion: string | null
  hectareas: string | number | null
  fecha_creacion?: string
}

interface FincaData {
  nombre: string
  ubicacion?: string | null
  hectareas?: number | null
}

export const getFincas = async (): Promise<Finca[]> => {
  const response = await api.get('/fincas')
  return response.data
}

export const createFinca = async (data: FincaData) => {
  const response = await api.post('/fincas', data)
  return response.data
}

export const updateFinca = async (id: number, data: FincaData) => {
  const response = await api.put(`/fincas/${id}`, data)
  return response.data
}

export const deleteFinca = async (id: number) => {
  const response = await api.delete(`/fincas/${id}`)
  return response.data
}