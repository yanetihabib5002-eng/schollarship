import api from './api'

export async function createBackup() {
  const { data } = await api.post('/backup')
  return data.data
}

export async function restoreBackup(backupId) {
  const { data } = await api.post('/backup/restore', { backupId })
  return data.data
}

export async function fetchBackups() {
  const { data } = await api.get('/backup')
  return data.data
}
