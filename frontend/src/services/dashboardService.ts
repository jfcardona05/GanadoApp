import api from './api'

export const getDashboardResumen = async () => {
  const response = await api.get('/dashboard/resumen')
  return response.data
}