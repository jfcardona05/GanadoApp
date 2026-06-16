import api from './api'

export interface Animal {
  id_animal: number
  id_finca: number
  codigo: string
  chapeta?: string | null
  codigo_alterno?: string | null
  nombre: string | null
  foto: string | null
  raza: string | null
  color?: string | null
  procedencia?: string | null
  id_padre?: number | null
  id_madre?: number | null
  sexo: string
  fecha_nacimiento: string | null
  fecha_ingreso?: string | null
  peso_actual: string | number | null
  estado_salud: string
  estado_productivo?: string
  estado_comercial?: string
  valor_estimado?: string | number | null
  precio_compra?: string | number | null
  fecha_salida?: string | null
  motivo_salida?: string | null
  nombre_finca?: string
  codigo_padre?: string | null
  codigo_madre?: string | null
}

export interface AnimalData {
  id_finca?: number
  codigo: string
  chapeta?: string | null
  codigo_alterno?: string | null
  nombre?: string | null
  foto?: string | null
  raza?: string | null
  color?: string | null
  procedencia?: string | null
  id_padre?: number | null
  id_madre?: number | null
  sexo: string
  fecha_nacimiento?: string | null
  fecha_ingreso?: string | null
  peso_actual?: number | null
  estado_salud: string
  estado_productivo?: string
  estado_comercial?: string
  valor_estimado?: number | null
  precio_compra?: number | null
  fecha_salida?: string | null
  motivo_salida?: string | null
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


