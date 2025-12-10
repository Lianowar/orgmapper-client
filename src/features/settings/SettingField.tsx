import { TextInput, NumberInput, Select, Slider, Textarea, Badge, ActionIcon, Group, Text, Stack } from '@mantine/core'
import { IconRefresh } from '@tabler/icons-react'
import type { SettingSource } from '../../api/types'
import type { SettingMeta } from './config'

interface Props {
  meta: SettingMeta
  value: unknown
  source: SettingSource
  error: string | null
  onChange: (value: unknown) => void
  onReset: () => void
  isResetting?: boolean
}

const sourceBadgeColor: Record<SettingSource, string> = {
  database: 'blue',
  env: 'green',
  default: 'gray',
}

export default function SettingField({ meta, value, source, error, onChange, onReset, isResetting }: Props) {
  const renderInput = () => {
    switch (meta.type) {
      case 'select':
        return (
          <Select
            data={meta.options || []}
            value={String(value ?? '')}
            onChange={(v) => onChange(v)}
            error={!!error}
          />
        )
      case 'slider':
        return (
          <Slider
            min={meta.min ?? 0}
            max={meta.max ?? 1}
            step={meta.step ?? 0.1}
            value={Number(value ?? 0)}
            onChange={onChange}
            marks={[{ value: meta.min ?? 0, label: String(meta.min ?? 0) }, { value: meta.max ?? 1, label: String(meta.max ?? 1) }]}
          />
        )
      case 'number':
        return (
          <NumberInput
            value={Number(value ?? 0)}
            onChange={onChange}
            error={!!error}
            min={1}
          />
        )
      case 'textarea':
        return (
          <Textarea
            value={String(value ?? '')}
            onChange={(e) => onChange(e.target.value)}
            error={!!error}
            autosize
            minRows={2}
          />
        )
      default:
        return (
          <TextInput
            value={String(value ?? '')}
            onChange={(e) => onChange(e.target.value)}
            error={!!error}
          />
        )
    }
  }

  return (
    <Stack gap="xs">
      <Group justify="space-between">
        <Group gap="xs">
          <Text fw={500}>{meta.label}</Text>
          <Badge size="xs" color={sourceBadgeColor[source]}>{source}</Badge>
        </Group>
        {source === 'database' && (
          <ActionIcon variant="subtle" size="sm" onClick={onReset} loading={isResetting} title="Сбросить">
            <IconRefresh size={16} />
          </ActionIcon>
        )}
      </Group>
      <Text size="xs" c="dimmed">{meta.description}</Text>
      {renderInput()}
      {error && <Text size="xs" c="red">{error}</Text>}
    </Stack>
  )
}
