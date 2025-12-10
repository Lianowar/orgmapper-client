import { useQuery } from '@tanstack/react-query'
import { api } from '../client'
import type { BudgetStatus } from '../types'

export function useBudget() {
  return useQuery({
    queryKey: ['budget'],
    queryFn: () => api.get<BudgetStatus>('/admin/budget'),
    refetchInterval: 60000,
  })
}
