import api from './api'

export async function fetchAssignments(params = {}) {
  const { data } = await api.get('/assignments', { params })
  return data.data
}

export async function fetchAssignment(id) {
  const { data } = await api.get(`/assignments/${id}`)
  return data.data
}

export async function createAssignment(body) {
  const { data } = await api.post('/assignments', body)
  return data.data
}

export async function createMultipleAssignments(body) {
  const { data } = await api.post('/assignments/batch', body)
  return data.data
}

export async function deleteAssignment(id) {
  const { data } = await api.delete(`/assignments/${id}`)
  return data.data
}
