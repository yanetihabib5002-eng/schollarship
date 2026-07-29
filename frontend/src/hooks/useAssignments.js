import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as assignmentService from '../services/assignmentService'

export function useAssignments(params = {}) {
  return useQuery({
    queryKey: ['assignments', params],
    queryFn: () => assignmentService.fetchAssignments(params),
  })
}

export function useAssignment(id) {
  return useQuery({
    queryKey: ['assignment', id],
    queryFn: () => assignmentService.fetchAssignment(id),
    enabled: !!id,
  })
}

export function useCreateAssignment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: assignmentService.createAssignment,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['assignments'] }),
  })
}

export function useCreateMultipleAssignments() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: assignmentService.createMultipleAssignments,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['assignments'] }),
  })
}

export function useDeleteAssignment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: assignmentService.deleteAssignment,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['assignments'] }),
  })
}
