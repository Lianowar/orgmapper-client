import { Paper, Text, Title, Stack, Alert } from '@mantine/core'
import Markdown from 'react-markdown'
import type { SessionResponse } from '../../api/types'

interface Props {
  session: SessionResponse
}

export default function FinalScreen({ session }: Props) {
  if (session.status === 'ERROR') {
    return (
      <Stack>
        <Alert color="red" title="Ошибка">
          Произошла ошибка при обработке анкеты. Обратитесь к HR.
        </Alert>
      </Stack>
    )
  }

  return (
    <Stack>
      <Title order={3}>Анкета завершена</Title>
      {session.summary && (
        <Paper p="md" withBorder>
          <Markdown>{session.summary}</Markdown>
        </Paper>
      )}
      <Text c="dimmed" size="sm">Спасибо за участие!</Text>
    </Stack>
  )
}
