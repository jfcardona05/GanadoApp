import api from './api'

export interface Animal {
  id_animal: number
  id_finca: number
  codigo: string
  nombre: string | null
  foto: string | null
  raza: string | null
  sexo: string
  fecha_nacimiento: string | null
  peso_actual: string | number | null
  estado_salud: string
  nombre_finca?: string
}

interface AnimalData {
  id_finca?: number
  codigo: string
  nombre?: string | null
  foto?: string | null
  raza?: string | null
  sexo: string
  fecha_nacimiento?: string | null
  peso_actual?: number | null
  estado_salud: string
}

export const getAnimales = async (): Promise<Animal[]> => {
  const response = await api.get('/animales')
  return response.data
}

export const createAnimal = async (data: AnimalData) => {
  const response = await api.post('/animales', data)
  return response.data
}

export const updateAnimal = async (id: number, data: AnimalData) => {
  const response = await api.put(`/animales/${id}`, data)
  return response.data
}

export const deleteAnimal = async (id: number) => {
  const response = await api.delete(`/animales/${id}`)
  return response.data
}