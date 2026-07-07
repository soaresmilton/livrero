import { api } from '@/services/api'
import { DashboardSummary, HeatmapResponse } from '../types'

export const dashboardService = {
  getSummary: async (year: number): Promise<DashboardSummary> => {
    const response = await api.get('/dashboard/summary', { params: { year } })
    return response.data
  },

  getHeatmap: async (year: number): Promise<HeatmapResponse> => {
    const response = await api.get('/dashboard/heatmap', { params: { year } })
    return response.data
  },
}
