import { Component, type ReactNode } from 'react'
import { Alert, Button, Stack } from '@mantine/core'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        <Stack p="md">
          <Alert color="red" title="Что-то пошло не так">
            {this.state.error?.message || 'Неизвестная ошибка'}
          </Alert>
          <Button onClick={() => window.location.reload()}>Перезагрузить</Button>
        </Stack>
      )
    }
    return this.props.children
  }
}
