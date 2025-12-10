import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../client'
import type { Question, QuestionCreate, QuestionUpdate } from '../types'

export function useQuestions() {
  return useQuery({
    queryKey: ['questions'],
    queryFn: () => api.get<Question[]>('/admin/questions'),
  })
}

export function useCreateQuestion() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: QuestionCreate) => api.post<Question>('/admin/questions', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['questions'] }),
  })
}

export function useUpdateQuestion(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: QuestionUpdate) => api.put<Question>(`/admin/questions/${id}`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['questions'] }),
  })
}

export function useDeleteQuestion(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => api.delete(`/admin/questions/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['questions'] }),
  })
}

export function useReorderQuestions() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (order: string[]) => api.post('/admin/questions/reorder', { order }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['questions'] }),
  })
}
