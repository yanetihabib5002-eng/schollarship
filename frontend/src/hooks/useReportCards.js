import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as reportCardService from '../services/reportCardService'

export function useReportCards(params) {
  return useQuery({
    queryKey: ['reportCards', params],
    queryFn: () => reportCardService.fetchReportCards(params),
    enabled: !!params?.classId && !!params?.trimester && !!params?.schoolYear,
  })
}

export function useGenerateReportCards() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: reportCardService.generateReportCards,
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['reportCards'] })
    },
  })
}

export function useDeleteReportCard() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: reportCardService.deleteReportCard,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reportCards'] })
    },
  })
}
