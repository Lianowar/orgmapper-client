import { Alert } from '@mantine/core'

interface Props {
  message: string
}

export default function ErrorMessage({ message }: Props) {
  return (
    <Alert color="red" title="Ошибка">
      {message}
    </Alert>
  )
}
