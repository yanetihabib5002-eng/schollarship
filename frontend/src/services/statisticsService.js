import api from './api'

export async function fetchOverview() {
  const { data } = await api.get('/statistics/overview')
  return data.data
}

export async function fetchClassTrimesterStats(classId, trimester) {
  const { data } = await api.get(`/statistics/class/${classId}/trimester/${trimester}`)
  return data.data
}
