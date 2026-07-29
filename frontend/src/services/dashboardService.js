import api from './api'

export async function fetchDashboardOverview() {
  const { data } = await api.get('/dashboard/overview')
  return data.data
}

export async function fetchDashboardCharts() {
  const { data } = await api.get('/dashboard/charts')
  return data.data
}

export async function fetchDashboardActivities() {
  const { data } = await api.get('/dashboard/activities')
  return data.data
}

export async function fetchDashboardAlerts() {
  const { data } = await api.get('/dashboard/alerts')
  return data.data
}

export async function fetchDashboardCalendar() {
  const { data } = await api.get('/dashboard/calendar')
  return data.data
}
