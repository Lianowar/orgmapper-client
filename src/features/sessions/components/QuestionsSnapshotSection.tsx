import { Text, Stack, Badge, Group } from '@mantine/core'
import type { QuestionSnapshotItem } from '../../../api/types'

interface QuestionsSnapshotSectionProps {
  questionsSnapshot: Record<string, unknown>
}

export default function QuestionsSnapshotSection({ questionsSnapshot }: QuestionsSnapshotSectionProps) {
  // Convert the snapshot to QuestionSnapshotItem array
  const questions: QuestionSnapshotItem[] = Object.entries(questionsSnapshot).map(([key, value]) => {
    const item = value as any
    return {
      question_key: key,
      text: item?.text || '',
      is_required: item?.is_required || false,
    }
  })

  if (questions.length === 0) {
    return <Text c="dimmed">Вопросы не были настроены для этой сессии</Text>
  }

  return (
    <Stack gap="sm">
      {questions.map((question, index) => (
        <Group key={question.question_key} align="flex-start" gap="sm">
          <Text fw={500}>{index + 1}.</Text>
          <Stack gap={4} style={{ flex: 1 }}>
            <Group gap="xs">
              <Text size="sm" c="dimmed">{question.question_key}</Text>
              {question.is_required && <Badge size="xs" color="red">Required</Badge>}
            </Group>
            <Text>{question.text}</Text>
          </Stack>
        </Group>
      ))}
    </Stack>
  )
}
