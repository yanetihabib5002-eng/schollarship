import api from './api'

export async function fetchClasses(params = {}) {
  const { data } = await api.get('/classes', { params })
  return data.data
}

export async function fetchClass(id) {
  const { data } = await api.get(`/classes/${id}`)
  return data.data
}

export async function createClass(body) {
  const { data } = await api.post('/classes', body)
  return data.data
}

export async function updateClass(id, body) {
  const { data } = await api.put(`/classes/${id}`, body)
  return data.data
}

export async function deleteClass(id) {
  const { data } = await api.delete(`/classes/${id}`)
  return data.data
}
