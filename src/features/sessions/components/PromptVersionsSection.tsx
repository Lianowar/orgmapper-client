import { Table } from '@mantine/core'

interface PromptVersionsSectionProps {
  promptVersionsSnapshot: Record<string, unknown>
}

export default function PromptVersionsSection({ promptVersionsSnapshot }: PromptVersionsSectionProps) {
  const getVersion = (key: string): string => {
    const version = promptVersionsSnapshot[key]
    return version != null ? String(version) : '—'
  }

  return (
    <Table>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Prompt Type</Table.Th>
          <Table.Th>Version</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        <Table.Tr>
          <Table.Td>Chat</Table.Td>
          <Table.Td>{getVersion('chat')}</Table.Td>
        </Table.Tr>
        <Table.Tr>
          <Table.Td>Extractor</Table.Td>
          <Table.Td>{getVersion('extractor')}</Table.Td>
        </Table.Tr>
        <Table.Tr>
          <Table.Td>Summary</Table.Td>
          <Table.Td>{getVersion('summary')}</Table.Td>
        </Table.Tr>
      </Table.Tbody>
    </Table>
  )
}
