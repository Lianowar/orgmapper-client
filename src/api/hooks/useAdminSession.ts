import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../client'
import type { AdminSessionDetail } from '../types'

export function useAdminSession(sessionId: string) {
  return useQuery({
    queryKey: ['admin', 'sessions', sessionId],
    queryFn: () => api.get<AdminSessionDetail>(`/admin/sessions/${sessionId}`),
    enabled: !!sessionId,
  })
}

export function useReextract(sessionId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => api.post(`/admin/sessions/${sessionId}/reextract`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'sessions', sessionId] }),
  })
}

export function useResummarize(sessionId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => api.post(`/admin/sessions/${sessionId}/resummarize`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'sessions', sessionId] }),
  })
}
