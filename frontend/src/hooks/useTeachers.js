import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as teacherService from '../services/teacherService'

export function useTeachers(params = {}) {
  return useQuery({
    queryKey: ['teachers', params],
    queryFn: () => teacherService.fetchTeachers(params),
    keepPreviousData: true,
  })
}

export function useTeacher(id) {
  return useQuery({
    queryKey: ['teacher', id],
    queryFn: () => teacherService.fetchTeacher(id),
    enabled: !!id,
  })
}

export function useCreateTeacher() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: teacherService.createTeacher,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['teachers'] }),
  })
}

export function useUpdateTeacher() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...body }) => teacherService.updateTeacher(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['teachers'] }),
  })
}

export function useDeleteTeacher() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: teacherService.deleteTeacher,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['teachers'] }),
  })
}

export function useToggleTeacherActive() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: teacherService.toggleTeacherActive,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['teachers'] }),
  })
}