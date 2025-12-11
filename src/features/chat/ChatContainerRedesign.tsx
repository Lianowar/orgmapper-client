import { useState, useEffect, useCallback, useRef } from 'react'
import type { SessionResponse, Message } from '../../api/types'
import { useSendMessage, useSessionById } from '../../api/hooks'
import { getErrorMessage } from '../../api/client'
import MessageListRedesign from './MessageListRedesign'
import ChatInputRedesign from './ChatInputRedesign'
import FinalScreen from './FinalScreen'
import styles from './ChatRedesign.module.css'

interface Props {
  session: SessionResponse
  token: string
}

const DRAFT_KEY = 'chat_draft_'
const POLLING_TIMEOUT = 60000

function generateIdempotencyKey(): string {
  return crypto.randomUUID()
}

export default function ChatContainerRedesign({ session: initialSession, token }: Props) {
  const [draft, setDraft] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPolling, setIsPolling] = useState(false)
  const [pollingTimedOut, setPollingTimedOut] = useState(false)
  const [optimisticMessage, setOptimisticMessage] = useState<Message | null>(null)
  const pollingStartTime = useRef<number | null>(null)

  const shouldPoll = ['COMPLETED', 'EXTRACTING', 'SUMMARIZING'].includes(initialSession.status)

  const { data: polledSession } = useSessionById(initialSession.id, {
    enabled: (isPolling || shouldPoll) && !pollingTimedOut,
    refetchInterval: 2000,
  })

  const session = polledSession || initialSession
  const sendMessage = useSendMessage(session.id, token)

  // Load draft from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(DRAFT_KEY + token)
    if (saved) setDraft(saved)
  }, [token])

  // Save draft to localStorage
  useEffect(() => {
    const timer = setTimeout(() => {
      if (draft) {
        localStorage.setItem(DRAFT_KEY + token, draft)
      } else {
        localStorage.removeItem(DRAFT_KEY + token)
      }
    }, 2000)
    return () => clearTimeout(timer)
  }, [draft, token])

  // Start polling when session is processing
  useEffect(() => {
    if (['COMPLETED', 'EXTRACTING', 'SUMMARIZING'].includes(session.status)) {
      if (!pollingStartTime.current) {
        pollingStartTime.current = Date.now()
      }
      setIsPolling(true)
    }
    if (session.status === 'FINALIZED' || session.status === 'ERROR') {
      setIsPolling(false)
      pollingStartTime.current = null
    }
  }, [session.status])

  // Check polling timeout
  useEffect(() => {
    if (!isPolling || pollingTimedOut) return
    const interval = setInterval(() => {
      if (pollingStartTime.current && Date.now() - pollingStartTime.current > POLLING_TIMEOUT) {
        setPollingTimedOut(true)
        setIsPolling(false)
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [isPolling, pollingTimedOut])

  const handleSend = useCallback(async (content: string) => {
    setError(null)
    
    // Optimistic UI: show message immediately
    const tempMessage: Message = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content,
      sequence: session.messages.length + 1,
      created_at: new Date().toISOString(),
    }
    setOptimisticMessage(tempMessage)
    setDraft('')
    localStorage.removeItem(DRAFT_KEY + token)
    
    try {
      const result = await sendMessage.mutateAsync({
        content,
        idempotency_key: generateIdempotencyKey(),
      })
      setOptimisticMessage(null)
      if (result.is_complete) {
        setIsPolling(true)
        pollingStartTime.current = Date.now()
      }
    } catch (e) {
      // Remove optimistic message and restore content to input on error
      setOptimisticMessage(null)
      setDraft(content)
      setError(getErrorMessage(e))
    }
  }, [sendMessage, token, session.messages.length])

  const isFinalized = session.status === 'FINALIZED'
  const isError = session.status === 'ERROR'
  const isProcessing = ['COMPLETED', 'EXTRACTING', 'SUMMARIZING'].includes(session.status) && !pollingTimedOut

  if (isFinalized || isError) {
    return <FinalScreen session={session} />
  }

  return (
    <div className={styles.chatWrapper}>
    <div className={styles.chatContainer}>
      <div className={styles.header}>
        <h1 className={styles.headerTitle}>Интервью с сотрудником</h1>
        <p className={styles.headerSubtitle}>
          Расскажите о своей работе и опыте
        </p>
      </div>

      <MessageListRedesign 
        messages={session.messages} 
        optimisticMessage={optimisticMessage}
        isTyping={sendMessage.isPending}
      />
      
      {isProcessing && (
        <div className={`${styles.statusMessage} ${styles.processing}`}>
          <p style={{ margin: 0, fontSize: '14px', color: '#1e40af' }}>
            ✨ Формируем ваше резюме...
          </p>
        </div>
      )}

      {pollingTimedOut && (
        <div className={`${styles.statusMessage} ${styles.timeout}`}>
          <p style={{ margin: 0, fontSize: '14px', color: '#92400e' }}>
            ⏱️ Обработка занимает больше времени. Вы можете вернуться позже.
          </p>
        </div>
      )}
      
      {error && (
        <div className={`${styles.statusMessage} ${styles.error}`}>
          <p style={{ margin: 0, fontSize: '14px', color: '#dc2626' }}>
            ❌ {error}
          </p>
        </div>
      )}
      
      {!isProcessing && !pollingTimedOut && (
        <ChatInputRedesign
          value={draft}
          onChange={setDraft}
          onSend={handleSend}
          disabled={sendMessage.isPending}
        />
      )}
    </div>
    </div>
  )
}
