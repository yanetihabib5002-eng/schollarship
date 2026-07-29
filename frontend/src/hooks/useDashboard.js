import { useQuery } from '@tanstack/react-query'
import {
  fetchDashboardOverview, fetchDashboardCharts,
  fetchDashboardActivities, fetchDashboardAlerts, fetchDashboardCalendar
} from '../services/dashboardService'

export function useDashboard() {
  const overviewQuery = useQuery({
    queryKey: ['dashboardOverview'],
    queryFn: fetchDashboardOverview,
    refetchInterval: 30000,
  })

  const chartsQuery = useQuery({
    queryKey: ['dashboardCharts'],
    queryFn: fetchDashboardCharts,
    staleTime: 60000,
  })

  const activitiesQuery = useQuery({
    queryKey: ['dashboardActivities'],
    queryFn: fetchDashboardActivities,
    refetchInterval: 15000,
  })

  const alertsQuery = useQuery({
    queryKey: ['dashboardAlerts'],
    queryFn: fetchDashboardAlerts,
    refetchInterval: 30000,
  })

  const calendarQuery = useQuery({
    queryKey: ['dashboardCalendar'],
    queryFn: fetchDashboardCalendar,
    staleTime: 60000,
  })

  return {
    overview: overviewQuery.data,
    charts: chartsQuery.data,
    activities: activitiesQuery.data || [],
    alerts: alertsQuery.data || [],
    calendar: calendarQuery.data || [],
    loading: overviewQuery.isLoading,
    error: overviewQuery.error,
  }
}
