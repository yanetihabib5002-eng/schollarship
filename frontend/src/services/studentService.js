import api from './api'

export async function fetchStudents(params = {}) {
  const { data } = await api.get('/students', { params })
  return data
}

export async function fetchStudent(id) {
  const { data } = await api.get(`/students/${id}`)
  return data.data
}

export async function createStudent(body) {
  const { data } = await api.post('/students', body)
  return data.data
}

export async function updateStudent(id, body) {
  const { data } = await api.put(`/students/${id}`, body)
  return data.data
}

export async function deleteStudent(id) {
  const { data } = await api.delete(`/students/${id}`)
  return data.data
}