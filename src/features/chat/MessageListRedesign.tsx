import { useEffect, useRef } from 'react'
import type { Message } from '../../api/types'
import MessageRedesign from './MessageRedesign'
import styles from './ChatRedesign.module.css'

interface Props {
  messages: Message[]
}

export default function MessageListRedesign({ messages }: Props) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className={styles.messagesContainer}>
      {messages.map((message) => (
        <MessageRedesign key={message.id} message={message} />
      ))}
      <div ref={messagesEndRef} />
    </div>
  )
}
