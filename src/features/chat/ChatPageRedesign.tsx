import { useParams } from 'react-router-dom'
import { LoadingOverlay, Text } from '@mantine/core'
import { useSession } from '../../api/hooks'
import ChatContainerRedesign from './ChatContainerRedesign'

export default function ChatPageRedesign() {
  const { token } = useParams<{ token: string }>()
  const { data: session, isLoading, error } = useSession(token!)

  if (isLoading) {
    return <LoadingOverlay visible />
  }

  if (error || !session) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh',
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'
      }}>
        <Text c="red">Сессия не найдена или истекла</Text>
      </div>
    )
  }

  return <ChatContainerRedesign session={session} token={token!} />
}
