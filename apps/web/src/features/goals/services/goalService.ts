import { api } from '@/services/api'
import { ReadingGoal, UpsertGoalRequest } from '../types'

export const goalService = {
  getGoal: async (year: number): Promise<ReadingGoal> => {
    const response = await api.get('/goals', { params: { year } })
    return response.data
  },

  upsertGoal: async (year: number, data: UpsertGoalRequest): Promise<ReadingGoal> => {
    const response = await api.put(`/goals/${year}`, data)
    return response.data
  },
}
