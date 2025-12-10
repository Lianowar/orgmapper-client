import { useState, useEffect, useCallback } from 'react'
import { Title, Tabs, Paper, Textarea, Button, Group, Text, Stack, Badge } from '@mantine/core'
import { usePrompts, useCreatePrompt, useActivatePrompt } from '../../api/hooks'
import { useNotification } from '../../hooks/useNotification'
import { getErrorMessage } from '../../api/client'
import LoadingSkeleton from '../../components/LoadingSkeleton'
import ErrorMessage from '../../components/ErrorMessage'
import ConfirmDialog from '../../components/ConfirmDialog'

type PromptType = 'chat' | 'extractor' | 'summary'

const typeLabels: Record<PromptType, string> = {
  chat: 'Chat',
  extractor: 'Extractor',
  summary: 'Summary',
}

export default function PromptsPage() {
  const notification = useNotification()
  const [type, setType] = useState<PromptType>('chat')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [content, setContent] = useState('')
  const [activateId, setActivateId] = useState<string | null>(null)

  const { data: prompts, isLoading, error } = usePrompts(type)
  const createPrompt = useCreatePrompt()
  const activatePrompt = useActivatePrompt(activateId || '')

  const filtered = prompts?.filter((p) => p.type === type).sort((a, b) => b.version - a.version) || []
  const selected = filtered.find((p) => p.id === selectedId)

  useEffect(() => {
    if (filtered.length && !selectedId) {
      setSelectedId(filtered[0].id)
    }
  }, [filtered, selectedId])

  useEffect(() => {
    if (selected) {
      setContent(selected.content)
    }
  }, [selected])

  const handleSaveNew = useCallback(async () => {
    try {
      await createPrompt.mutateAsync({ type, content })
      notification.success('Новая версия сохранена')
    } catch (err) {
      notification.error(getErrorMessage(err))
    }
  }, [createPrompt, type, content, notification])

  const handleActivate = async () => {
    try {
      await activatePrompt.mutateAsync()
      notification.success('Промпт активирован')
      setActivateId(null)
    } catch (err) {
      notification.error(getErrorMessage(err))
    }
  }

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault()
      handleSaveNew()
    }
  }, [handleSaveNew])

  if (isLoading) return <LoadingSkeleton lines={5} />
  if (error) return <ErrorMessage message={getErrorMessage(error)} />

  const variables = selected?.supported_variables || []

  return (
    <>
      <Title order={2} mb="md">Промпты</Title>

      <Tabs value={type} onChange={(v) => { setType(v as PromptType); setSelectedId(null) }}>
        <Tabs.List mb="md">
          {(['chat', 'extractor', 'summary'] as PromptType[]).map((t) => (
            <Tabs.Tab key={t} value={t}>{typeLabels[t]}</Tabs.Tab>
          ))}
        </Tabs.List>
      </Tabs>

      <Group align="flex-start" gap="md">
        <Paper p="md" withBorder w={200}>
          <Text fw={500} mb="sm">Версии</Text>
          <Stack gap="xs">
            {filtered.map((p) => (
              <Button
                key={p.id}
                variant={p.id === selectedId ? 'filled' : 'light'}
                size="xs"
                onClick={() => setSelectedId(p.id)}
                rightSection={p.is_active && <Badge size="xs" color="green">active</Badge>}
              >
                v{p.version}
              </Button>
            ))}
          </Stack>
        </Paper>

        <Paper p="md" withBorder style={{ flex: 1 }}>
          <Group justify="space-between" mb="sm">
            <Text fw={500}>Редактор</Text>
            {variables.length > 0 && (
              <Text size="xs" c="dimmed">Переменные: {variables.join(', ')}</Text>
            )}
          </Group>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            minRows={15}
            autosize
            mb="md"
          />
          <Group>
            <Button onClick={handleSaveNew} loading={createPrompt.isPending}>
              Сохранить как новую версию
            </Button>
            {selected && !selected.is_active && (
              <Button variant="light" onClick={() => setActivateId(selected.id)}>
                Активировать
              </Button>
            )}
          </Group>
          <Text size="xs" c="dimmed" mt="xs">Ctrl+S для сохранения</Text>
        </Paper>
      </Group>

      <ConfirmDialog
        opened={!!activateId}
        onClose={() => setActivateId(null)}
        onConfirm={handleActivate}
        title="Активировать промпт?"
        message="Эта версия станет активной для всех новых сессий."
        confirmLabel="Активировать"
        loading={activatePrompt.isPending}
      />
    </>
  )
}
