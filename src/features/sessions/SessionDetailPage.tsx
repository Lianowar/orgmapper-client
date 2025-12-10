import { useParams } from 'react-router-dom'
import { Title, Tabs, Paper, Text, Stack, Table, Badge, Button, Group } from '@mantine/core'
import Markdown from 'react-markdown'
import { useAdminSession, useReextract, useResummarize } from '../../api/hooks'
import { useNotification } from '../../hooks/useNotification'
import { getErrorMessage } from '../../api/client'
import LoadingSkeleton from '../../components/LoadingSkeleton'
import ErrorMessage from '../../components/ErrorMessage'

export default function SessionDetailPage() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const notification = useNotification()

  const { data: session, isLoading, error } = useAdminSession(sessionId || '')
  const reextract = useReextract(sessionId || '')
  const resummarize = useResummarize(sessionId || '')

  if (isLoading) return <LoadingSkeleton lines={5} />
  if (error) return <ErrorMessage message={getErrorMessage(error)} />
  if (!session) return <Text>Сессия не найдена</Text>

  const handleReextract = async () => {
    try {
      await reextract.mutateAsync()
      notification.success('Переизвлечение запущено')
    } catch (err) {
      notification.error(getErrorMessage(err))
    }
  }

  const handleResummarize = async () => {
    try {
      await resummarize.mutateAsync()
      notification.success('Пересуммаризация запущена')
    } catch (err) {
      notification.error(getErrorMessage(err))
    }
  }

  const sortedMessages = [...session.messages].sort((a, b) => a.sequence - b.sequence)

  return (
    <>
      <Title order={2} mb="md">Сессия #{session.id}</Title>

      <Tabs defaultValue="dialog">
        <Tabs.List mb="md">
          <Tabs.Tab value="dialog">Диалог</Tabs.Tab>
          <Tabs.Tab value="answers">Ответы</Tabs.Tab>
          <Tabs.Tab value="summary">Резюме</Tabs.Tab>
          <Tabs.Tab value="meta">Мета</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="dialog">
          <Stack gap="sm">
            {sortedMessages.map((msg) => (
              <Paper key={msg.id} p="sm" withBorder>
                <Text size="xs" c="dimmed" mb={4}>{msg.role === 'user' ? 'Пользователь' : 'Ассистент'}</Text>
                <Text style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</Text>
              </Paper>
            ))}
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="answers">
          {!session.extracted_answers ? (
            <Text c="dimmed">Ответы ещё не извлечены</Text>
          ) : (
            <Table>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Вопрос</Table.Th>
                  <Table.Th>Ответ</Table.Th>
                  <Table.Th>Уверенность</Table.Th>
                  <Table.Th>Флаги</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {session.extracted_answers.map((a) => (
                  <Table.Tr key={a.question_key}>
                    <Table.Td>{a.question_key}</Table.Td>
                    <Table.Td>{a.answer_text || '—'}</Table.Td>
                    <Table.Td>{a.confidence != null ? `${(a.confidence * 100).toFixed(0)}%` : '—'}</Table.Td>
                    <Table.Td>
                      {a.flags?.map((f) => <Badge key={f} size="xs" mr={4}>{f}</Badge>)}
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          )}
        </Tabs.Panel>

        <Tabs.Panel value="summary">
          {session.summary_text ? (
            <Paper p="md" withBorder>
              <Markdown>{session.summary_text}</Markdown>
            </Paper>
          ) : (
            <Text c="dimmed">Резюме ещё не сгенерировано</Text>
          )}
        </Tabs.Panel>

        <Tabs.Panel value="meta">
          <Stack gap="sm">
            <Text><strong>Статус:</strong> <Badge>{session.status}</Badge></Text>
            <Text><strong>Версия:</strong> {session.version}</Text>
            <Text><strong>Создана:</strong> {new Date(session.created_at).toLocaleString('ru-RU')}</Text>
            {session.started_at && <Text><strong>Начата:</strong> {new Date(session.started_at).toLocaleString('ru-RU')}</Text>}
            {session.completed_at && <Text><strong>Завершена:</strong> {new Date(session.completed_at).toLocaleString('ru-RU')}</Text>}
            {session.finalized_at && <Text><strong>Финализирована:</strong> {new Date(session.finalized_at).toLocaleString('ru-RU')}</Text>}
            {session.error_message && (
              <Paper p="sm" withBorder bg="red.0">
                <Text c="red"><strong>Ошибка ({session.error_stage}):</strong> {session.error_message}</Text>
              </Paper>
            )}
            <Group mt="md">
              <Button variant="light" onClick={handleReextract} loading={reextract.isPending}>
                Переизвлечь ответы
              </Button>
              <Button variant="light" onClick={handleResummarize} loading={resummarize.isPending}>
                Пересуммаризировать
              </Button>
            </Group>
          </Stack>
        </Tabs.Panel>
      </Tabs>
    </>
  )
}
