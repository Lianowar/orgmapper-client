import { notifications } from '@mantine/notifications'

export function useNotification() {
  return {
    success: (message: string) => {
      notifications.show({ message, color: 'green' })
    },
    error: (message: string) => {
      notifications.show({ message, color: 'red' })
    },
  }
}
