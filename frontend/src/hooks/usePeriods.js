import { useQuery } from '@tanstack/react-query'
import * as periodService from '../services/periodService'

export function usePeriods(params = {}) {
  return useQuery({
    queryKey: ['periods', params],
    queryFn: () => periodService.fetchPeriods(params),
  })
}
