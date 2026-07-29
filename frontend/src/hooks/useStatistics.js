import { useQuery } from '@tanstack/react-query'
import * as statisticsService from '../services/statisticsService'

export function useOverview() {
  return useQuery({
    queryKey: ['statistics', 'overview'],
    queryFn: () => statisticsService.fetchOverview(),
  })
}

export function useClassTrimesterStats(classId, trimester) {
  return useQuery({
    queryKey: ['statistics', 'class', classId, trimester],
    queryFn: () => statisticsService.fetchClassTrimesterStats(classId, trimester),
    enabled: !!classId && !!trimester,
  })
}
