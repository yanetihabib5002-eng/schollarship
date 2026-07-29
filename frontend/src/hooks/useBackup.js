import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as backupService from '../services/backupService'

export function useBackups() {
  return useQuery({
    queryKey: ['backups'],
    queryFn: () => backupService.fetchBackups(),
  })
}

export function useCreateBackup() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: backupService.createBackup,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['backups'] }),
  })
}

export function useRestoreBackup() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: backupService.restoreBackup,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['backups'] }),
  })
}
