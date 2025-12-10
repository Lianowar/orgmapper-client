import { Textarea, Button, Group, Text } from '@mantine/core'
import { useCallback, type KeyboardEvent } from 'react'

interface Props {
  value: string
  onChange: (value: string) => void
  onSend: (content: string) => void
  disabled?: boolean
  maxLength?: number
}

export default function ChatInput({ value, onChange, onSend, disabled, maxLength = 2000 }: Props) {
  const canSend = value.trim().length > 0 && value.length <= maxLength && !disabled

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (canSend) onSend(value.trim())
    }
  }, [canSend, onSend, value])

  const handleSend = useCallback(() => {
    if (canSend) onSend(value.trim())
  }, [canSend, onSend, value])

  return (
    <div>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Введите сообщение..."
        autosize
        minRows={2}
        maxRows={6}
        disabled={disabled}
      />
      <Group justify="space-between" mt="xs">
        <Text size="xs" c={value.length > maxLength ? 'red' : 'dimmed'}>
          {value.length}/{maxLength}
        </Text>
        <Button onClick={handleSend} disabled={!canSend} loading={disabled}>
          Отправить
        </Button>
      </Group>
    </div>
  )
}
