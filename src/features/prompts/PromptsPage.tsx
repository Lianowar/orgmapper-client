import { useState, useEffect, useCallback, useRef } from 'react'
import { Title, Tabs, Paper, Textarea, Button, Group, Text, Stack, Badge, Code, Tooltip, Box } from '@mantine/core'
import { usePrompts, useCreatePrompt, useActivatePrompt } from '../../api/hooks'
import { useNotification } from '../../hooks/useNotification'
import { getErrorMessage } from '../../api/client'
import LoadingSkeleton from '../../components/LoadingSkeleton'
import ErrorMessage from '../../components/ErrorMessage'
import ConfirmDialog from '../../components/ConfirmDialog'

type PromptType = 'chat' | 'extractor' | 'summary'

const variableDescriptions: Record<string, string> = {
  employee_name: 'Полное имя сотрудника',
  employee_position: 'Должность (или "не указана" если не задана)',
  employee_department: 'Отдел (или "не указан" если не задан)',
  questions: 'JSON-массив вопросов опроса',
  answers: 'JSON-массив извлечённых ответов (только для summary)',
}

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
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const { data: prompts, isLoading, error } = usePrompts(type)
  const createPrompt = useCreatePrompt()
  const activatePrompt = useActivatePrompt(activateId || '')

  const insertVariable = useCallback((variable: string) => {
    const textarea = textareaRef.current
    if (!textarea) return
    
    const varText = `{${variable}}`
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const newContent = content.slice(0, start) + varText + content.slice(end)
    setContent(newContent)
    
    // Restore focus and cursor position after the inserted variable
    setTimeout(() => {
      textarea.focus()
      const newPos = start + varText.length
      textarea.setSelectionRange(newPos, newPos)
    }, 0)
  }, [content])

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
          </Group>
          {variables.length > 0 && (
            <Box mb="sm">
              <Text size="xs" c="dimmed" mb={4}>Доступные переменные (кликните для вставки):</Text>
              <Group gap="xs">
                {variables.map((v) => (
                  <Tooltip key={v} label={variableDescriptions[v] || v} withArrow>
                    <Code
                      style={{ cursor: 'pointer' }}
                      onClick={() => insertVariable(v)}
                    >
                      {`{${v}}`}
                    </Code>
                  </Tooltip>
                ))}
              </Group>
            </Box>
          )}
          <Textarea
            ref={textareaRef}
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
