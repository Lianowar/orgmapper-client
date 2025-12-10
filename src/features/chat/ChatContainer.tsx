import { useState, useEffect, useCallback, useRef } from 'react'
import { Stack, Text, Paper } from '@mantine/core'
import type { SessionResponse } from '../../api/types'
import { useSendMessage, useSessionById } from '../../api/hooks'
import { getErrorMessage } from '../../api/client'
import MessageList from './MessageList'
import ChatInput from './ChatInput'
import TypingIndicator from './TypingIndicator'
import FinalScreen from './FinalScreen'

interface Props {
  session: SessionResponse
  token: string
}

const DRAFT_KEY = 'chat_draft_'
const POLLING_TIMEOUT = 60000

function generateIdempotencyKey(): string {
  return crypto.randomUUID()
}

export default function ChatContainer({ session: initialSession, token }: Props) {
  const [draft, setDraft] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPolling, setIsPolling] = useState(false)
  const [pollingTimedOut, setPollingTimedOut] = useState(false)
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
    try {
      const result = await sendMessage.mutateAsync({
        content,
        idempotency_key: generateIdempotencyKey(),
      })
      setDraft('')
      localStorage.removeItem(DRAFT_KEY + token)
      if (result.is_complete) {
        setIsPolling(true)
        pollingStartTime.current = Date.now()
      }
    } catch (e) {
      setError(getErrorMessage(e))
    }
  }, [sendMessage, token])

  const isFinalized = session.status === 'FINALIZED'
  const isError = session.status === 'ERROR'
  const isProcessing = ['COMPLETED', 'EXTRACTING', 'SUMMARIZING'].includes(session.status) && !pollingTimedOut

  if (isFinalized) {
    return <FinalScreen session={session} />
  }

  if (isError) {
    return <FinalScreen session={session} />
  }

  return (
    <Stack style={{ flex: 1, minHeight: 0 }}>
      <MessageList messages={session.messages} />
      
      {sendMessage.isPending && <TypingIndicator />}
      
      {isProcessing && (
        <Paper p="sm" withBorder>
          <Text size="sm" c="dimmed">Формируем ваше резюме...</Text>
        </Paper>
      )}

      {pollingTimedOut && (
        <Paper p="sm" withBorder>
          <Text size="sm" c="dimmed">
            Обработка занимает больше времени. Вы можете вернуться позже.
          </Text>
        </Paper>
      )}
      
      {error && (
        <Text c="red" size="sm">{error}</Text>
      )}
      
      {!isProcessing && !pollingTimedOut && (
        <ChatInput
          value={draft}
          onChange={setDraft}
          onSend={handleSend}
          disabled={sendMessage.isPending}
        />
      )}
    </Stack>
  )
}
