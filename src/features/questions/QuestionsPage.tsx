import { useState } from 'react'
import { Title, Table, Button, Group, Text, Modal, TextInput, Textarea, NumberInput, Stack, ActionIcon, Switch } from '@mantine/core'
import { useQuestions, useCreateQuestion, useUpdateQuestion, useDeleteQuestion } from '../../api/hooks'
import { useNotification } from '../../hooks/useNotification'
import { getErrorMessage } from '../../api/client'
import LoadingSkeleton from '../../components/LoadingSkeleton'
import ErrorMessage from '../../components/ErrorMessage'
import ConfirmDialog from '../../components/ConfirmDialog'
import type { Question } from '../../api/types'

export default function QuestionsPage() {
  const notification = useNotification()
  const { data: questions, isLoading, error } = useQuestions()

  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [form, setForm] = useState({
    question_key: '',
    title: '',
    text: '',
    answer_guidance: '',
    sort_order: 0,
    is_active: true,
  })

  const createQuestion = useCreateQuestion()
  const updateQuestion = useUpdateQuestion(editingId || '')
  const deleteQuestion = useDeleteQuestion(deleteId || '')

  if (isLoading) return <LoadingSkeleton lines={5} />
  if (error) return <ErrorMessage message={getErrorMessage(error)} />

  const openCreate = () => {
    setEditingId(null)
    setForm({ question_key: '', title: '', text: '', answer_guidance: '', sort_order: (questions?.length || 0) + 1, is_active: true })
    setModalOpen(true)
  }

  const openEdit = (q: Question) => {
    setEditingId(q.id)
    setForm({
      question_key: q.question_key,
      title: q.title || '',
      text: q.text,
      answer_guidance: q.answer_guidance || '',
      sort_order: q.sort_order,
      is_active: q.is_active,
    })
    setModalOpen(true)
  }

  const handleSave = async () => {
    try {
      if (editingId) {
        await updateQuestion.mutateAsync({
          title: form.title || undefined,
          text: form.text,
          answer_guidance: form.answer_guidance || undefined,
          sort_order: form.sort_order,
          is_active: form.is_active,
        })
        notification.success('Вопрос обновлён')
      } else {
        await createQuestion.mutateAsync({
          question_key: form.question_key,
          title: form.title || undefined,
          text: form.text,
          answer_guidance: form.answer_guidance || undefined,
          sort_order: form.sort_order,
        })
        notification.success('Вопрос создан')
      }
      setModalOpen(false)
    } catch (err) {
      notification.error(getErrorMessage(err))
    }
  }

  const handleDelete = async () => {
    try {
      await deleteQuestion.mutateAsync()
      notification.success('Вопрос удалён')
      setDeleteId(null)
    } catch (err) {
      notification.error(getErrorMessage(err))
    }
  }

  const sorted = [...(questions || [])].sort((a, b) => a.sort_order - b.sort_order)
  const version = questions?.[0]?.questionnaire_version

  return (
    <>
      <Group justify="space-between" mb="md">
        <Group>
          <Title order={2}>Вопросы</Title>
          {version && <Text c="dimmed" size="sm">v{version}</Text>}
        </Group>
        <Button onClick={openCreate}>Добавить</Button>
      </Group>

      {!sorted.length ? (
        <Text c="dimmed">Нет вопросов</Text>
      ) : (
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>№</Table.Th>
              <Table.Th>Ключ</Table.Th>
              <Table.Th>Заголовок</Table.Th>
              <Table.Th>Активен</Table.Th>
              <Table.Th>Действия</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {sorted.map((q) => (
              <Table.Tr key={q.id}>
                <Table.Td>{q.sort_order}</Table.Td>
                <Table.Td>{q.question_key}</Table.Td>
                <Table.Td>{q.title || q.text.slice(0, 50)}</Table.Td>
                <Table.Td>{q.is_active ? '✓' : '—'}</Table.Td>
                <Table.Td>
                  <Group gap="xs">
                    <ActionIcon variant="light" onClick={() => openEdit(q)}>✏️</ActionIcon>
                    <ActionIcon variant="light" color="red" onClick={() => setDeleteId(q.id)}>🗑️</ActionIcon>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      )}

      <Modal opened={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Редактировать вопрос' : 'Новый вопрос'}>
        <Stack>
          <TextInput
            label="Ключ"
            required
            disabled={!!editingId}
            value={form.question_key}
            onChange={(e) => setForm({ ...form, question_key: e.target.value })}
          />
          <TextInput
            label="Заголовок"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <Textarea
            label="Текст вопроса"
            required
            minRows={3}
            value={form.text}
            onChange={(e) => setForm({ ...form, text: e.target.value })}
          />
          <Textarea
            label="Подсказка для ответа"
            minRows={2}
            value={form.answer_guidance}
            onChange={(e) => setForm({ ...form, answer_guidance: e.target.value })}
          />
          <NumberInput
            label="Порядок"
            value={form.sort_order}
            onChange={(v) => setForm({ ...form, sort_order: Number(v) || 0 })}
          />
          {editingId && (
            <Switch
              label="Активен"
              checked={form.is_active}
              onChange={(e) => setForm({ ...form, is_active: e.currentTarget.checked })}
            />
          )}
          <Button onClick={handleSave} loading={createQuestion.isPending || updateQuestion.isPending}>
            Сохранить
          </Button>
        </Stack>
      </Modal>

      <ConfirmDialog
        opened={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Удалить вопрос?"
        message="Это действие нельзя отменить."
        confirmLabel="Удалить"
        loading={deleteQuestion.isPending}
      />
    </>
  )
}
