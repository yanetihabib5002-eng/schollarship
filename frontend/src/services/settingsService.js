import api from './api'

export async function fetchSettings() {
  const { data } = await api.get('/settings')
  return data.data
}

export async function updateSettings(body) {
  const { data } = await api.put('/settings', body)
  return data.data
}
