import { Title, Text, Paper } from '@mantine/core'

export default function DashboardPage() {
  return (
    <>
      <Title order={2} mb="md">Дашборды</Title>
      <Paper p="xl" withBorder>
        <Text c="dimmed">Будет доступно на следующем этапе</Text>
      </Paper>
    </>
  )
}
