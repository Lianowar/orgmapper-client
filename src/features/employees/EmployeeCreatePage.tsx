import { useState } from 'react'
import { Title, TextInput, Button, Stack, Paper } from '@mantine/core'
import { useNavigate } from 'react-router-dom'
import { useCreateEmployee } from '../../api/hooks'
import { useNotification } from '../../hooks/useNotification'
import { getErrorMessage } from '../../api/client'

export default function EmployeeCreatePage() {
  const navigate = useNavigate()
  const notification = useNotification()
  const createEmployee = useCreateEmployee()

  const [form, setForm] = useState({
    name: '',
    email: '',
    position: '',
    department: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const emp = await createEmployee.mutateAsync({
        name: form.name,
        email: form.email,
        position: form.position || undefined,
        department: form.department || undefined,
      })
      notification.success('Сотрудник создан')
      navigate(`/admin/employees/${emp.id}`)
    } catch (err) {
      notification.error(getErrorMessage(err))
    }
  }

  return (
    <>
      <Title order={2} mb="md">Новый сотрудник</Title>
      <Paper p="md" withBorder maw={500}>
        <form onSubmit={handleSubmit}>
          <Stack>
            <TextInput
              label="ФИО"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <TextInput
              label="Email"
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <TextInput
              label="Должность"
              value={form.position}
              onChange={(e) => setForm({ ...form, position: e.target.value })}
            />
            <TextInput
              label="Отдел"
              value={form.department}
              onChange={(e) => setForm({ ...form, department: e.target.value })}
            />
            <Button type="submit" loading={createEmployee.isPending}>
              Создать
            </Button>
          </Stack>
        </form>
      </Paper>
    </>
  )
}
