import { Accordion, Code } from '@mantine/core'
import type { PromptContentsSnapshot } from '../../../api/types'

interface PromptContentsSectionProps {
  promptContentsSnapshot: PromptContentsSnapshot | null
}

export default function PromptContentsSection({ promptContentsSnapshot }: PromptContentsSectionProps) {
  const getPromptContent = (content: string | null): string => {
    return content || 'Не задан'
  }

  const prompts = [
    { key: 'chat', label: 'Chat Prompt', content: promptContentsSnapshot?.chat ?? null },
    { key: 'extractor', label: 'Extractor Prompt', content: promptContentsSnapshot?.extractor ?? null },
    { key: 'summary', label: 'Summary Prompt', content: promptContentsSnapshot?.summary ?? null },
  ]

  return (
    <Accordion>
      {prompts.map(({ key, label, content }) => (
        <Accordion.Item key={key} value={key}>
          <Accordion.Control>{label}</Accordion.Control>
          <Accordion.Panel>
            <Code block>{getPromptContent(content)}</Code>
          </Accordion.Panel>
        </Accordion.Item>
      ))}
    </Accordion>
  )
}
