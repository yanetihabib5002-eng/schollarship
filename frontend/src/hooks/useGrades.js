import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as gradeService from '../services/gradeService'

export function useGrades(params = {}) {
  return useQuery({
    queryKey: ['grades', params],
    queryFn: () => gradeService.fetchGrades(params),
  })
}

export function useBatchUpsertGrades() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: gradeService.batchUpsertGrades,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['grades'] }),
  })
}

export function useSubmitGrade() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: gradeService.submitGrade,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['grades'] }),
  })
}

export function useValidateBatch() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: gradeService.validateBatch,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['grades'] }),
  })
}

export function useReopenGrade() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: gradeService.reopenGrade,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['grades'] }),
  })
}

export function useValidateGrade() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: gradeService.validateGrade,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['grades'] }),
  })
}
