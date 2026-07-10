import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { goalService } from '../services/goalService'
import { UpsertGoalRequest } from '../types'
import { toast } from '@/store/toastStore'

export const useGoal = (year: number) => {
  return useQuery({
    queryKey: ['goals', year],
    queryFn: () => goalService.getGoal(year),
  })
}

export const useUpsertGoal = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ year, data }: { year: number; data: UpsertGoalRequest }) =>
      goalService.upsertGoal(year, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['goals', variables.year] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Reading goal saved')
    },
    onError: () => {
      toast.error("Couldn't save your goal. Try again.")
    },
  })
}
