import api from './api'

export async function fetchGrades(params = {}) {
  const { data } = await api.get('/grades', { params })
  return data.data
}

export async function batchUpsertGrades(body) {
  const { data } = await api.put('/grades/batch', body)
  return data.data
}

export async function submitGrade(id) {
  const { data } = await api.patch(`/grades/${id}/submit`)
  return data.data
}

export async function validateBatch(body) {
  const { data } = await api.post('/grades/validate-batch', body)
  return data.data
}

export async function reopenGrade(id) {
  const { data } = await api.patch(`/grades/${id}/reopen`)
  return data.data
}

export async function validateGrade(id) {
  const { data } = await api.patch(`/grades/${id}/validate`)
  return data.data
}
