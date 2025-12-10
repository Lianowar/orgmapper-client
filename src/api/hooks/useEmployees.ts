import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../client'
import type { Employee, EmployeeListItem, EmployeeCreate, EmployeeUpdate, InviteResponse, AdminSessionDetail } from '../types'

export function useEmployees() {
  return useQuery({
    queryKey: ['employees'],
    queryFn: () => api.get<EmployeeListItem[]>('/admin/employees'),
  })
}

export function useEmployee(id: string) {
  return useQuery({
    queryKey: ['employees', id],
    queryFn: () => api.get<Employee>(`/admin/employees/${id}`),
    enabled: !!id,
  })
}

export function useCreateEmployee() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: EmployeeCreate) => api.post<Employee>('/admin/employees', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['employees'] }),
  })
}

export function useUpdateEmployee(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: EmployeeUpdate) => api.put<Employee>(`/admin/employees/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] })
      queryClient.invalidateQueries({ queryKey: ['employees', id] })
    },
  })
}

export function useDeleteEmployee(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => api.delete(`/admin/employees/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['employees'] }),
  })
}

export function useEmployeeSessions(employeeId: string) {
  return useQuery({
    queryKey: ['employees', employeeId, 'sessions'],
    queryFn: () => api.get<AdminSessionDetail[]>(`/admin/employees/${employeeId}/sessions`),
    enabled: !!employeeId,
  })
}

export function useCreateInvite(employeeId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => api.post<InviteResponse>(`/admin/employees/${employeeId}/invites`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['employees', employeeId] }),
  })
}

export function useRevokeInvite(employeeId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => api.delete(`/admin/employees/${employeeId}/invite`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['employees', employeeId] }),
  })
}
