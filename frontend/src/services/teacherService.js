import api from './api'

export async function fetchTeachers(params = {}) {
  const { data } = await api.get('/teachers', { params })
  return data
}

export async function fetchTeacher(id) {
  const { data } = await api.get(`/teachers/${id}`)
  return data.data
}

export async function createTeacher(body) {
  const { data } = await api.post('/teachers', body)
  return data.data
}

export async function updateTeacher(id, body) {
  const { data } = await api.put(`/teachers/${id}`, body)
  return data.data
}

export async function deleteTeacher(id) {
  const { data } = await api.delete(`/teachers/${id}`)
  return data.data
}

export async function toggleTeacherActive(id) {
  const { data } = await api.patch(`/teachers/${id}/toggle-active`)
  return data.data
}