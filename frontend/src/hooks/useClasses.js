import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as classService from '../services/classService'

export function useClasses() {
  return useQuery({
    queryKey: ['classes'],
    queryFn: () => classService.fetchClasses(),
  })
}

export function useClass(id) {
  return useQuery({
    queryKey: ['class', id],
    queryFn: () => classService.fetchClass(id),
    enabled: !!id,
  })
}

export function useCreateClass() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: classService.createClass,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['classes'] }),
  })
}

export function useUpdateClass() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...body }) => classService.updateClass(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['classes'] }),
  })
}

export function useDeleteClass() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: classService.deleteClass,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['classes'] }),
  })
}
