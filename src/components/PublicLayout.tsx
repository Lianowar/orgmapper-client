import { Container } from '@mantine/core'
import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
}

export default function PublicLayout({ children }: Props) {
  return (
    <Container size="sm" py="md" style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {children}
    </Container>
  )
}
