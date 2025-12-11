import { Table, Text } from '@mantine/core'
import type { LLMConfigSnapshot } from '../../../api/types'

interface LLMConfigSectionProps {
  llmConfigSnapshot: LLMConfigSnapshot | null
}

export default function LLMConfigSection({ llmConfigSnapshot }: LLMConfigSectionProps) {
  if (!llmConfigSnapshot) {
    return <Text c="dimmed">Конфигурация LLM недоступна для этой сессии</Text>
  }

  const configs = [
    { purpose: 'Chat', config: llmConfigSnapshot.chat },
    { purpose: 'Extract', config: llmConfigSnapshot.extract },
    { purpose: 'Summary', config: llmConfigSnapshot.summary },
  ]

  return (
    <Table>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Purpose</Table.Th>
          <Table.Th>Provider</Table.Th>
          <Table.Th>Model</Table.Th>
          <Table.Th>Temperature</Table.Th>
          <Table.Th>Max Tokens</Table.Th>
          <Table.Th>Reasoning</Table.Th>
          <Table.Th>Timeout</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {configs.map(({ purpose, config }) => (
          <Table.Tr key={purpose}>
            <Table.Td>{purpose}</Table.Td>
            <Table.Td>{config.provider}</Table.Td>
            <Table.Td>{config.model}</Table.Td>
            <Table.Td>{config.temperature}</Table.Td>
            <Table.Td>{config.max_tokens}</Table.Td>
            <Table.Td>{config.reasoning_effort}</Table.Td>
            <Table.Td>{config.timeout}s</Table.Td>
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  )
}
