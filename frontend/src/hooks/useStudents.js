import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as studentService from '../services/studentService'

export function useStudents(params = {}) {
  return useQuery({
    queryKey: ['students', params],
    queryFn: () => studentService.fetchStudents(params),
    keepPreviousData: true,
  })
}

export function useStudent(id) {
  return useQuery({
    queryKey: ['student', id],
    queryFn: () => studentService.fetchStudent(id),
    enabled: !!id,
  })
}

export function useCreateStudent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: studentService.createStudent,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['students'] }),
  })
}

export function useUpdateStudent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...body }) => studentService.updateStudent(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['students'] }),
  })
}

export function useDeleteStudent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: studentService.deleteStudent,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['students'] }),
  })
}