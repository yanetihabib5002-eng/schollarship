import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as subjectService from '../services/subjectService'

export function useSubjects(params = {}) {
  return useQuery({
    queryKey: ['subjects', params],
    queryFn: () => subjectService.fetchSubjects(params),
  })
}

export function useSubject(id) {
  return useQuery({
    queryKey: ['subject', id],
    queryFn: () => subjectService.fetchSubject(id),
    enabled: !!id,
  })
}

export function useCreateSubject() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: subjectService.createSubject,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['subjects'] }),
  })
}

export function useUpdateSubject() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...body }) => subjectService.updateSubject(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['subjects'] }),
  })
}

export function useDeleteSubject() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: subjectService.deleteSubject,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['subjects'] }),
  })
}
