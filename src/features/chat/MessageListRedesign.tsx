import { useEffect, useRef } from 'react'
import type { Message } from '../../api/types'
import MessageRedesign from './MessageRedesign'
import TypingIndicatorRedesign from './TypingIndicatorRedesign'
import styles from './ChatRedesign.module.css'

interface Props {
  messages: Message[]
  optimisticMessage?: Message | null
  isTyping?: boolean
}

export default function MessageListRedesign({ messages, optimisticMessage, isTyping }: Props) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, optimisticMessage, isTyping])

  return (
    <div className={styles.messagesContainer}>
      {messages.map((message) => (
        <MessageRedesign key={message.id} message={message} />
      ))}
      {optimisticMessage && (
        <MessageRedesign key={optimisticMessage.id} message={optimisticMessage} />
      )}
      {isTyping && <TypingIndicatorRedesign />}
      <div ref={messagesEndRef} />
    </div>
  )
}
