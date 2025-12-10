import { Title, Table, Badge, Button, Group, Text } from '@mantine/core'
import { useNavigate } from 'react-router-dom'
import { useEmployees } from '../../api/hooks'
import LoadingSkeleton from '../../components/LoadingSkeleton'
import ErrorMessage from '../../components/ErrorMessage'
import { getErrorMessage } from '../../api/client'
import type { SessionStatus } from '../../api/types'

const statusColors: Record<SessionStatus | 'none', string> = {
  NOT_STARTED: 'gray',
  IN_PROGRESS: 'blue',
  COMPLETED: 'yellow',
  EXTRACTING: 'yellow',
  SUMMARIZING: 'yellow',
  FINALIZED: 'green',
  ERROR: 'red',
  none: 'gray',
}

const statusLabels: Record<SessionStatus | 'none', string> = {
  NOT_STARTED: 'Не начата',
  IN_PROGRESS: 'В процессе',
  COMPLETED: 'Обработка',
  EXTRACTING: 'Обработка',
  SUMMARIZING: 'Обработка',
  FINALIZED: 'Завершена',
  ERROR: 'Ошибка',
  none: 'Новый',
}

export default function EmployeesPage() {
  const navigate = useNavigate()
  const { data: employees, isLoading, error } = useEmployees()

  if (isLoading) return <LoadingSkeleton lines={5} />
  if (error) return <ErrorMessage message={getErrorMessage(error)} />

  return (
    <>
      <Group justify="space-between" mb="md">
        <Title order={2}>Сотрудники</Title>
        <Button onClick={() => navigate('/admin/employees/new')}>Добавить</Button>
      </Group>

      {!employees?.length ? (
        <Text c="dimmed">Нет сотрудников</Text>
      ) : (
        <Table highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>ФИО</Table.Th>
              <Table.Th>Email</Table.Th>
              <Table.Th>Должность</Table.Th>
              <Table.Th>Отдел</Table.Th>
              <Table.Th>Статус</Table.Th>
              <Table.Th>Активность</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {employees.map((emp) => {
              const status = emp.latest_session_status || 'none'
              return (
                <Table.Tr
                  key={emp.id}
                  style={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/admin/employees/${emp.id}`)}
                >
                  <Table.Td>{emp.name}</Table.Td>
                  <Table.Td>{emp.email}</Table.Td>
                  <Table.Td>{emp.position || '—'}</Table.Td>
                  <Table.Td>{emp.department || '—'}</Table.Td>
                  <Table.Td>
                    <Badge color={statusColors[status]}>{statusLabels[status]}</Badge>
                  </Table.Td>
                  <Table.Td>
                    {emp.last_activity_at
                      ? new Date(emp.last_activity_at).toLocaleDateString('ru-RU')
                      : '—'}
                  </Table.Td>
                </Table.Tr>
              )
            })}
          </Table.Tbody>
        </Table>
      )}
    </>
  )
}
