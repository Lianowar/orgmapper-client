import { Paper, Text } from '@mantine/core'
import Markdown from 'react-markdown'
import type { Message as MessageType } from '../../api/types'
import styles from './Chat.module.css'

interface Props {
  message: MessageType
}

export default function Message({ message }: Props) {
  const isUser = message.role === 'user'

  return (
    <Paper
      className={`${styles.message} ${isUser ? styles.user : styles.assistant}`}
      p="sm"
      radius="md"
    >
      {isUser ? (
        <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>{message.content}</Text>
      ) : (
        <div className={styles.markdown}>
          <Markdown>{message.content}</Markdown>
        </div>
      )}
      <Text size="xs" c="dimmed" mt={4}>
        {new Date(message.created_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
      </Text>
    </Paper>
  )
}
