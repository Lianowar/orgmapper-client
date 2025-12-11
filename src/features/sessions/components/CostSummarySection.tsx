import { Table, Text } from '@mantine/core'
import type { Message } from '../../../api/types'

interface CostSummarySectionProps {
  messages: Message[]
}

export default function CostSummarySection({ messages }: CostSummarySectionProps) {
  const assistantMessages = messages.filter(msg => msg.role === 'assistant')
  
  const totalTokens = assistantMessages.reduce((sum, msg) => {
    return sum + (msg.tokens_used || 0)
  }, 0)
  
  const totalCost = assistantMessages.reduce((sum, msg) => {
    return sum + (msg.cost_usd || 0)
  }, 0)

  return (
    <Table>
      <Table.Tbody>
        <Table.Tr>
          <Table.Td><Text fw={500}>Total Tokens</Text></Table.Td>
          <Table.Td>{totalTokens.toLocaleString()}</Table.Td>
        </Table.Tr>
        <Table.Tr>
          <Table.Td><Text fw={500}>Total Cost</Text></Table.Td>
          <Table.Td>${totalCost.toFixed(4)}</Table.Td>
        </Table.Tr>
      </Table.Tbody>
    </Table>
  )
}
