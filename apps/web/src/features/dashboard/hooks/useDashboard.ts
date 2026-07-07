import { useQuery } from '@tanstack/react-query'
import { dashboardService } from '../services/dashboardService'

export const useDashboardSummary = (year: number) => {
  return useQuery({
    queryKey: ['dashboard', 'summary', year],
    queryFn: () => dashboardService.getSummary(year),
  })
}

export const useHeatmap = (year: number) => {
  return useQuery({
    queryKey: ['dashboard', 'heatmap', year],
    queryFn: () => dashboardService.getHeatmap(year),
  })
}
