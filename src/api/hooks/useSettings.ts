import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../client'
import type { SettingsResponse, SettingValue } from '../types'

export function useSettings() {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['settings'],
    queryFn: () => api.get<SettingsResponse>('/admin/settings'),
  })

  const updateMutation = useMutation({
    mutationFn: (settings: Record<string, unknown>) =>
      api.put<SettingsResponse>('/admin/settings', { settings }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['settings'] }),
  })

  const resetMutation = useMutation({
    mutationFn: (key: string) => api.delete(`/admin/settings/${key}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['settings'] }),
  })

  return {
    settings: query.data?.settings as Record<string, SettingValue> | undefined,
    isLoading: query.isLoading,
    error: query.error,
    updateSettings: updateMutation.mutateAsync,
    resetSetting: resetMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    isResetting: resetMutation.isPending,
    updateError: updateMutation.error,
    refetch: query.refetch,
  }
}
