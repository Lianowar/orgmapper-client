import { useEffect, useRef } from 'react'
import { ScrollArea, Stack } from '@mantine/core'
import type { Message as MessageType } from '../../api/types'
import Message from './Message'

interface Props {
  messages: MessageType[]
}

export default function MessageList({ messages }: Props) {
  const viewport = useRef<HTMLDivElement>(null)

  // Sort by sequence
  const sortedMessages = [...messages].sort((a, b) => a.sequence - b.sequence)

  useEffect(() => {
    viewport.current?.scrollTo({ top: viewport.current.scrollHeight, behavior: 'smooth' })
  }, [messages.length])

  return (
    <ScrollArea style={{ flex: 1 }} viewportRef={viewport}>
      <Stack gap="md" p="xs">
        {sortedMessages.map((msg) => (
          <Message key={msg.id} message={msg} />
        ))}
      </Stack>
    </ScrollArea>
  )
}
