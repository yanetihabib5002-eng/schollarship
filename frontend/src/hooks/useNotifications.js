import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as notificationService from '../services/notificationService'

export function useNotifications(params = {}) {
  return useQuery({
    queryKey: ['notifications', params],
    queryFn: () => notificationService.fetchNotifications(params),
    refetchInterval: 15000,
  })
}

export function useUnreadCount() {
  const { data } = useQuery({
    queryKey: ['notifications', { unread: 'true' }],
    queryFn: () => notificationService.fetchNotifications({ unread: 'true' }),
    refetchInterval: 15000,
  })
  return data?.length || 0
}

export function useCreateNotification() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: notificationService.createNotification,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  })
}

export function useMarkAsRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: notificationService.markNotificationAsRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  })
}

export function useMarkAllAsRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: notificationService.markAllNotificationsAsRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  })
}

export function useDeleteNotification() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: notificationService.deleteNotification,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  })
}
