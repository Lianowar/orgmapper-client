import { Accordion, Stack } from '@mantine/core'
import type { SettingValue } from '../../api/types'
import type { SettingMeta, SettingGroup } from './config'
import { GROUP_LABELS } from './config'
import SettingField from './SettingField'

interface Props {
  group: SettingGroup
  settings: SettingMeta[]
  values: Record<string, SettingValue>
  pendingChanges: Record<string, unknown>
  errors: Record<string, string | null>
  onChange: (key: string, value: unknown) => void
  onReset: (key: string) => void
  isResetting?: boolean
}

export default function SettingsGroup({ group, settings, values, pendingChanges, errors, onChange, onReset, isResetting }: Props) {
  return (
    <Accordion.Item value={group}>
      <Accordion.Control>{GROUP_LABELS[group]}</Accordion.Control>
      <Accordion.Panel>
        <Stack gap="md">
          {settings.map((meta) => {
            const settingValue = values[meta.key]
            const currentValue = meta.key in pendingChanges ? pendingChanges[meta.key] : settingValue?.value
            return (
              <SettingField
                key={meta.key}
                meta={meta}
                value={currentValue}
                source={settingValue?.source ?? 'default'}
                error={errors[meta.key] ?? null}
                onChange={(v) => onChange(meta.key, v)}
                onReset={() => onReset(meta.key)}
                isResetting={isResetting}
              />
            )
          })}
        </Stack>
      </Accordion.Panel>
    </Accordion.Item>
  )
}
