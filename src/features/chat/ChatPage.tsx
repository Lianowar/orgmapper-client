import { useParams } from 'react-router-dom'
import { Center, Loader, Text } from '@mantine/core'
import { useSession } from '../../api/hooks'
import { getErrorMessage } from '../../api/client'
import PublicLayout from '../../components/PublicLayout'
import ErrorMessage from '../../components/ErrorMessage'
import ChatContainer from './ChatContainer'

export default function ChatPage() {
  const { token } = useParams<{ token: string }>()
  const { data: session, isLoading, error } = useSession(token || '')

  if (!token) {
    return (
      <PublicLayout>
        <ErrorMessage message="Неверная ссылка" />
      </PublicLayout>
    )
  }

  if (isLoading) {
    return (
      <PublicLayout>
        <Center style={{ flex: 1 }}>
          <Loader />
        </Center>
      </PublicLayout>
    )
  }

  if (error) {
    return (
      <PublicLayout>
        <ErrorMessage message={getErrorMessage(error)} />
      </PublicLayout>
    )
  }

  if (!session) {
    return (
      <PublicLayout>
        <Text c="dimmed">Сессия не найдена</Text>
      </PublicLayout>
    )
  }

  return (
    <PublicLayout>
      <ChatContainer session={session} token={token} />
    </PublicLayout>
  )
}
