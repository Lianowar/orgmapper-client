import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../client'
import type { SessionResponse, SendMessageRequest, SendMessageResponse } from '../types'

export function useSession(token: string) {
  return useQuery({
    queryKey: ['session', token],
    queryFn: () => api.get<SessionResponse>(`/i/${token}`),
    enabled: !!token,
    retry: false,
  })
}

export function useSessionById(sessionId: string, options?: { enabled?: boolean; refetchInterval?: number }) {
  return useQuery({
    queryKey: ['session', 'id', sessionId],
    queryFn: () => api.get<SessionResponse>(`/sessions/${sessionId}`),
    enabled: options?.enabled ?? !!sessionId,
    refetchInterval: options?.refetchInterval,
  })
}

export function useSendMessage(sessionId: string, token: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: SendMessageRequest) =>
      api.post<SendMessageResponse>(`/sessions/${sessionId}/message`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['session', token] })
    },
  })
}
