import { Paper, Text, Progress } from '@mantine/core'
import { useBudget } from '../api/hooks'

export default function BudgetWidget() {
  const { data: budget } = useBudget()

  if (!budget) return null

  const percent = (budget.spent_usd / budget.limit_usd) * 100
  const color = budget.is_exceeded ? 'red' : percent > 80 ? 'yellow' : 'blue'

  return (
    <Paper p="xs" withBorder>
      <Text size="xs" c="dimmed" mb={4}>Бюджет</Text>
      <Progress value={Math.min(percent, 100)} color={color} size="sm" mb={4} />
      <Text size="xs">
        ${budget.spent_usd.toFixed(2)} / ${budget.limit_usd.toFixed(2)}
      </Text>
      <Text size="xs" c="dimmed">
        Осталось: ${budget.remaining_usd.toFixed(2)}
      </Text>
    </Paper>
  )
}
