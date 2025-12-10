import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../client'
import type { Prompt, PromptCreate } from '../types'

export function usePrompts(type?: 'chat' | 'extractor' | 'summary') {
  return useQuery({
    queryKey: ['prompts', type],
    queryFn: () => api.get<Prompt[]>(type ? `/admin/prompts?type=${type}` : '/admin/prompts'),
  })
}

export function useCreatePrompt() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: PromptCreate) => api.post<Prompt>('/admin/prompts', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['prompts'] }),
  })
}

export function useActivatePrompt(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => api.post(`/admin/prompts/${id}/activate`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['prompts'] }),
  })
}
