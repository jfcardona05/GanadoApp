import api from './api'

export interface RegistroVacunacion {
  id_registro: number
  id_animal: number
  codigo_animal: string
  nombre_animal: string | null
  id_vacuna: number
  nombre_vacuna: string
  fecha_aplicacion: string
  proxima_fecha: string | null
  veterinario: string | null
  observaciones: string | null
  nombre_finca?: string
}

interface RegistroVacunacionData {
  id_animal: number
  id_vacuna: number
  fecha_aplicacion: string
  veterinario?: string | null
  observaciones?: string | null
}

export const createRegistroVacunacion = async (data: RegistroVacunacionData) => {
  const response = await api.post('/registros-vacunacion', data)
  return response.data
}

export const getRegistrosVacunacion = async (): Promise<RegistroVacunacion[]> => {
  const response = await api.get('/registros-vacunacion')
  return response.data
}

export const deleteRegistroVacunacion = async (id: number) => {
  const response = await api.delete(`/registros-vacunacion/${id}`)
  return response.data
}