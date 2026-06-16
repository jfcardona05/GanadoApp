import api from './api'

export interface Vacuna {
  id_vacuna: number
  nombre: string
  descripcion: string | null
  frecuencia_dias: number | null
  obligatoria: boolean | number
}

interface VacunaData {
  nombre: string
  descripcion?: string | null
  frecuencia_dias?: number | null
  obligatoria: boolean
}

export const getVacunas = async (): Promise<Vacuna[]> => {
  const response = await api.get('/vacunas')
  return response.data
}

export const createVacuna = async (data: VacunaData) => {
  const response = await api.post('/vacunas', data)
  return response.data
}

export const updateVacuna = async (id: number, data: VacunaData) => {
  const response = await api.put(`/vacunas/${id}`, data)
  return response.data
}

export const deleteVacuna = async (id: number) => {
  const response = await api.delete(`/vacunas/${id}`)
  return response.data
}

