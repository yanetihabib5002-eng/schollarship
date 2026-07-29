import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as settingsService from '../services/settingsService'

export function useSettings() {
  return useQuery({
    queryKey: ['settings'],
    queryFn: () => settingsService.fetchSettings(),
  })
}

export function useUpdateSettings() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: settingsService.updateSettings,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['settings'] }),
  })
}
