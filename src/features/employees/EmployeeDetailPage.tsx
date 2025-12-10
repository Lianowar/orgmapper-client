import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Title, Paper, Stack, TextInput, Button, Group, Text, Table, Badge,
  CopyButton, ActionIcon, Tooltip,
} from '@mantine/core'
import { useEmployee, useUpdateEmployee, useDeleteEmployee, useEmployeeSessions, useCreateInvite, useRevokeInvite } from '../../api/hooks'
import { useNotification } from '../../hooks/useNotification'
import { getErrorMessage } from '../../api/client'
import LoadingSkeleton from '../../components/LoadingSkeleton'
import ErrorMessage from '../../components/ErrorMessage'
import ConfirmDialog from '../../components/ConfirmDialog'

export default function EmployeeDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const notification = useNotification()

  const { data: employee, isLoading, error } = useEmployee(id || '')
  const { data: sessions } = useEmployeeSessions(id || '')
  const updateEmployee = useUpdateEmployee(id || '')
  const deleteEmployee = useDeleteEmployee(id || '')
  const createInvite = useCreateInvite(id || '')
  const revokeInvite = useRevokeInvite(id || '')

  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', position: '', department: '' })
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [revokeOpen, setRevokeOpen] = useState(false)

  if (isLoading) return <LoadingSkeleton lines={5} />
  if (error) return <ErrorMessage message={getErrorMessage(error)} />
  if (!employee) return <Text>Сотрудник не найден</Text>

  const startEdit = () => {
    setForm({
      name: employee.name,
      email: employee.email,
      position: employee.position || '',
      department: employee.department || '',
    })
    setEditing(true)
  }

  const saveEdit = async () => {
    try {
      await updateEmployee.mutateAsync({
        name: form.name,
        email: form.email,
        position: form.position || undefined,
        department: form.department || undefined,
      })
      notification.success('Сохранено')
      setEditing(false)
    } catch (err) {
      notification.error(getErrorMessage(err))
    }
  }

  const handleDelete = async () => {
    try {
      await deleteEmployee.mutateAsync()
      notification.success('Сотрудник удалён')
      navigate('/admin/employees')
    } catch (err) {
      notification.error(getErrorMessage(err))
    }
  }

  const handleCreateInvite = async () => {
    try {
      await createInvite.mutateAsync()
      notification.success('Приглашение создано')
    } catch (err) {
      notification.error(getErrorMessage(err))
    }
  }

  const handleRevokeInvite = async () => {
    try {
      await revokeInvite.mutateAsync()
      notification.success('Приглашение отозвано')
      setRevokeOpen(false)
    } catch (err) {
      notification.error(getErrorMessage(err))
    }
  }

  const inviteUrl = employee.active_invite 
    ? `${window.location.origin}/i/${employee.active_invite.token}`
    : null

  return (
    <>
      <Group justify="space-between" mb="md">
        <Title order={2}>{employee.name}</Title>
        <Group>
          {!editing && <Button variant="light" onClick={startEdit}>Редактировать</Button>}
          <Button color="red" variant="light" onClick={() => setDeleteOpen(true)}>Удалить</Button>
        </Group>
      </Group>

      <Paper p="md" withBorder mb="md">
        {editing ? (
          <Stack>
            <TextInput label="ФИО" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <TextInput label="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <TextInput label="Должность" value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} />
            <TextInput label="Отдел" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
            <Group>
              <Button onClick={saveEdit} loading={updateEmployee.isPending}>Сохранить</Button>
              <Button variant="default" onClick={() => setEditing(false)}>Отмена</Button>
            </Group>
          </Stack>
        ) : (
          <Stack gap="xs">
            <Text><strong>Email:</strong> {employee.email}</Text>
            <Text><strong>Должность:</strong> {employee.position || '—'}</Text>
            <Text><strong>Отдел:</strong> {employee.department || '—'}</Text>
          </Stack>
        )}
      </Paper>

      <Paper p="md" withBorder mb="md">
        <Title order={4} mb="sm">Приглашение</Title>
        {inviteUrl ? (
          <Stack gap="xs">
            <Group>
              <Text size="sm" style={{ wordBreak: 'break-all' }}>{inviteUrl}</Text>
              <CopyButton value={inviteUrl}>
                {({ copied, copy }) => (
                  <Tooltip label={copied ? 'Скопировано' : 'Копировать'}>
                    <ActionIcon variant="light" onClick={copy}>{copied ? '✓' : '📋'}</ActionIcon>
                  </Tooltip>
                )}
              </CopyButton>
            </Group>
            <Group>
              <Button size="xs" variant="light" onClick={handleCreateInvite} loading={createInvite.isPending}>
                Перегенерировать
              </Button>
              <Button size="xs" color="red" variant="light" onClick={() => setRevokeOpen(true)}>
                Отозвать
              </Button>
            </Group>
          </Stack>
        ) : (
          <Button onClick={handleCreateInvite} loading={createInvite.isPending}>
            Создать приглашение
          </Button>
        )}
      </Paper>

      <Paper p="md" withBorder>
        <Title order={4} mb="sm">Сессии</Title>
        {!sessions?.length ? (
          <Text c="dimmed">Нет сессий</Text>
        ) : (
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>ID</Table.Th>
                <Table.Th>Статус</Table.Th>
                <Table.Th>Дата</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {sessions.map((s) => (
                <Table.Tr
                  key={s.id}
                  style={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/admin/employees/${id}/sessions/${s.id}`)}
                >
                  <Table.Td>{s.id}</Table.Td>
                  <Table.Td><Badge>{s.status}</Badge></Table.Td>
                  <Table.Td>{new Date(s.created_at).toLocaleDateString('ru-RU')}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        )}
      </Paper>

      <ConfirmDialog
        opened={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Удалить сотрудника?"
        message="Это действие нельзя отменить."
        confirmLabel="Удалить"
        loading={deleteEmployee.isPending}
      />

      <ConfirmDialog
        opened={revokeOpen}
        onClose={() => setRevokeOpen(false)}
        onConfirm={handleRevokeInvite}
        title="Отозвать приглашение?"
        message="Ссылка перестанет работать."
        confirmLabel="Отозвать"
        loading={revokeInvite.isPending}
      />
    </>
  )
}
