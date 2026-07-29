import api from './api'

export async function fetchSubjects(params = {}) {
  const { data } = await api.get('/subjects', { params })
  return data.data
}

export async function fetchSubject(id) {
  const { data } = await api.get(`/subjects/${id}`)
  return data.data
}

export async function createSubject(body) {
  const { data } = await api.post('/subjects', body)
  return data.data
}

export async function updateSubject(id, body) {
  const { data } = await api.put(`/subjects/${id}`, body)
  return data.data
}

export async function deleteSubject(id) {
  const { data } = await api.delete(`/subjects/${id}`)
  return data.data
}
