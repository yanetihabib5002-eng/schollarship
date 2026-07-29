import api from './api'

export async function fetchPeriods(params = {}) {
  const { data } = await api.get('/periods', { params })
  return data.data
}
