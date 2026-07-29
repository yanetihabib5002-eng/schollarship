import api from './api'

export async function fetchReportCards(params = {}) {
  const { data } = await api.get('/report-cards', { params })
  return data.data
}

export async function generateReportCards(body) {
  const { data } = await api.post('/report-cards/generate', body)
  return data.data
}

export async function deleteReportCard(id) {
  const { data } = await api.delete(`/report-cards/${id}`)
  return data.data
}

export async function downloadPdf(id) {
  const { data } = await api.get(`/report-cards/${id}/pdf`, { responseType: 'blob' })
  const url = URL.createObjectURL(data)
  window.open(url, '_blank')
  setTimeout(() => URL.revokeObjectURL(url), 60000)
}
