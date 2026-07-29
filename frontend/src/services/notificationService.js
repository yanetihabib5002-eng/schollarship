import api from './api'

export async function fetchNotifications(params = {}) {
  const { data } = await api.get('/notifications', { params })
  return data.data
}

export async function createNotification(body) {
  const { data } = await api.post('/notifications', body)
  return data.data
}

export async function markNotificationAsRead(id) {
  const { data } = await api.put(`/notifications/${id}/read`)
  return data.data
}

export async function markAllNotificationsAsRead() {
  const { data } = await api.put('/notifications/read-all')
  return data.data
}

export async function deleteNotification(id) {
  const { data } = await api.delete(`/notifications/${id}`)
  return data.data
}
