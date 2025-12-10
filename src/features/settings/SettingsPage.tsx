import { useState, useMemo } from 'react'
import { Title, Button, Group, Alert, Accordion, Skeleton, Stack } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { useSettings } from '../../api/hooks'
import { SETTINGS_CONFIG, type SettingGroup } from './config'
import SettingsGroup from './SettingsGroup'

const GROUPS: SettingGroup[] = ['llm_chat', 'llm_extract', 'llm_summary', 'rate_limiting', 'budget', 'messages', 'timeouts']

export default function SettingsPage() {
  const { settings, isLoading, error, updateSettings, resetSetting, isUpdating, isResetting, refetch } = useSettings()
  const [pendingChanges, setPendingChanges] = useState<Record<string, unknown>>({})
  const [errors, setErrors] = useState<Record<string, string | null>>({})

  const settingsByGroup = useMemo(() => {
    const map: Record<SettingGroup, typeof SETTINGS_CONFIG> = {} as never
    GROUPS.forEach((g) => (map[g] = []))
    SETTINGS_CONFIG.forEach((s) => map[s.group].push(s))
    return map
  }, [])

  const handleChange = (key: string, value: unknown) => {
    setPendingChanges((prev) => ({ ...prev, [key]: value }))
    const meta = SETTINGS_CONFIG.find((s) => s.key === key)
    const err = meta?.validation?.(value) ?? null
    setErrors((prev) => ({ ...prev, [key]: err }))
  }

  const handleReset = async (key: string) => {
    await resetSetting(key)
    setPendingChanges((prev) => {
      const next = { ...prev }
      delete next[key]
      return next
    })
    setErrors((prev) => {
      const next = { ...prev }
      delete next[key]
      return next
    })
  }

  const handleSave = async () => {
    try {
      await updateSettings(pendingChanges)
      setPendingChanges({})
      setErrors({})
      notifications.show({ message: 'Настройки сохранены', color: 'green' })
    } catch {
      notifications.show({ message: 'Ошибка сохранения', color: 'red' })
    }
  }

  const hasChanges = Object.keys(pendingChanges).length > 0
  const hasErrors = Object.values(errors).some((e) => e !== null)

  if (isLoading) {
    return <Stack><Skeleton height={40} /><Skeleton height={200} /><Skeleton height={200} /></Stack>
  }

  if (error) {
    return <Alert color="red" title="Ошибка загрузки"><Button onClick={() => refetch()}>Повторить</Button></Alert>
  }

  return (
    <>
      <Group justify="space-between" mb="md">
        <Title order={2}>Настройки</Title>
        <Button onClick={handleSave} disabled={!hasChanges || hasErrors} loading={isUpdating}>
          Сохранить {hasChanges && `(${Object.keys(pendingChanges).length})`}
        </Button>
      </Group>
      <Accordion multiple defaultValue={GROUPS}>
        {GROUPS.map((group) => (
          <SettingsGroup
            key={group}
            group={group}
            settings={settingsByGroup[group]}
            values={settings ?? {}}
            pendingChanges={pendingChanges}
            errors={errors}
            onChange={handleChange}
            onReset={handleReset}
            isResetting={isResetting}
          />
        ))}
      </Accordion>
    </>
  )
}
