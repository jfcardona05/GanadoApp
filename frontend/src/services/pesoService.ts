import api from './api'

export interface RegistroPeso {
  id_peso: number
  id_animal: number
  codigo_animal: string
  nombre_animal: string | null
  peso: string | number
  fecha_registro: string
  observaciones: string | null
  nombre_finca?: string
}

interface PesoData {
  id_animal: number
  peso: number
  fecha_registro: string
  observaciones?: string | null
}

export const createPeso = async (data: PesoData) => {
  const response = await api.post('/pesos', data)
  return response.data
}

export const getPesos = async (): Promise<RegistroPeso[]> => {
  const response = await api.get('/pesos')
  return response.data
}

export const deletePeso = async (id: number) => {
  const response = await api.delete(`/pesos/${id}`)
  return response.data
}