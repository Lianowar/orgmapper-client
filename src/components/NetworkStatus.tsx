import { useEffect } from 'react'
import { notifications } from '@mantine/notifications'
import { useNetworkStatus } from '../hooks/useNetworkStatus'

export default function NetworkStatus() {
  const isOnline = useNetworkStatus()

  useEffect(() => {
    if (!isOnline) {
      notifications.show({
        id: 'offline',
        message: 'Нет соединения с сервером',
        color: 'red',
        autoClose: false,
      })
    } else {
      notifications.hide('offline')
    }
  }, [isOnline])

  return null
}
