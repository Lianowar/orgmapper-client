import { useEffect, useRef } from 'react'
import { ScrollArea, Stack, Paper } from '@mantine/core'
import Markdown from 'react-markdown'
import type { Message as MessageType } from '../../api/types'
import Message from './Message'
import styles from './Chat.module.css'

interface Props {
  messages: MessageType[]
  welcomeMessage?: string | null
}

export default function MessageList({ messages, welcomeMessage }: Props) {
  const viewport = useRef<HTMLDivElement>(null)

  // Sort by sequence
  const sortedMessages = [...messages].sort((a, b) => a.sequence - b.sequence)

  useEffect(() => {
    viewport.current?.scrollTo({ top: viewport.current.scrollHeight, behavior: 'smooth' })
  }, [messages.length])

  return (
    <ScrollArea style={{ flex: 1 }} viewportRef={viewport}>
      <Stack gap="md" p="xs">
        {/* Show welcome message if no messages yet */}
        {welcomeMessage && sortedMessages.length === 0 && (
          <Paper
            className={`${styles.message} ${styles.assistant}`}
            p="sm"
            radius="md"
          >
            <div className={styles.markdown}>
              <Markdown>{welcomeMessage}</Markdown>
            </div>
          </Paper>
        )}
        {sortedMessages.map((msg) => (
          <Message key={msg.id} message={msg} />
        ))}
      </Stack>
    </ScrollArea>
  )
}
