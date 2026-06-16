import api from './api'

interface RegisterData {
  nombre: string
  correo: string
  password: string
  rol?: string
}

interface LoginData {
  correo: string
  password: string
}

export const registerUser = async (data: RegisterData) => {
  const response = await api.post('/auth/register', data)
  return response.data
}

export const loginUser = async (data: LoginData) => {
  const response = await api.post('/auth/login', data)
  return response.data
}

