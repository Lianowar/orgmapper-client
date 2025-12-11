import Markdown from 'react-markdown'
import type { Message as MessageType } from '../../api/types'
import styles from './ChatRedesign.module.css'

interface Props {
  message: MessageType
}

export default function MessageRedesign({ message }: Props) {
  const isUser = message.role === 'user'

  return (
    <div className={`${styles.messageWrapper} ${isUser ? styles.user : styles.assistant}`}>
      <div className={`${styles.messageBubble} ${isUser ? styles.user : styles.assistant}`}>
        <div className={styles.messageContent}>
          {isUser ? (
            <p style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{message.content}</p>
          ) : (
            <div className={styles.markdown}>
              <Markdown>{message.content}</Markdown>
            </div>
          )}
        </div>
        <div className={styles.messageTime}>
          {new Date(message.created_at).toLocaleTimeString('ru-RU', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </div>
      </div>
    </div>
  )
}
