import type { SettingKey } from '../../api/types'
import { validateTemperature, validatePositiveInt, validateReasoningEffort, validateProvider } from './validation'

export type SettingGroup = 'llm_chat' | 'llm_extract' | 'llm_summary' | 'rate_limiting' | 'budget' | 'messages' | 'timeouts'

export interface SettingMeta {
  key: SettingKey
  label: string
  description: string
  type: 'string' | 'number' | 'select' | 'slider' | 'textarea'
  group: SettingGroup
  validation?: (value: unknown) => string | null
  options?: { value: string; label: string }[]
  min?: number
  max?: number
  step?: number
}

const providerOptions = [
  { value: 'openai', label: 'OpenAI' },
  { value: 'anthropic', label: 'Anthropic' },
  { value: 'mock', label: 'Mock (Testing)' },
]

const reasoningOptions = [
  { value: 'minimal', label: 'Minimal' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
]

export const SETTINGS_CONFIG: SettingMeta[] = [
  // LLM Chat
  { key: 'chat_provider', label: 'Provider', description: 'LLM провайдер для чата', type: 'select', group: 'llm_chat', options: providerOptions, validation: validateProvider },
  { key: 'chat_model', label: 'Model', description: 'Модель LLM', type: 'string', group: 'llm_chat' },
  { key: 'chat_temperature', label: 'Temperature', description: 'Креативность (0.0 = точно, 1.0 = креативно)', type: 'slider', group: 'llm_chat', min: 0, max: 1, step: 0.1, validation: validateTemperature },
  { key: 'chat_max_tokens', label: 'Max Tokens', description: 'Максимум токенов в ответе', type: 'number', group: 'llm_chat', validation: validatePositiveInt },
  { key: 'chat_reasoning_effort', label: 'Reasoning Effort', description: 'Глубина рассуждений', type: 'select', group: 'llm_chat', options: reasoningOptions, validation: validateReasoningEffort },
  // LLM Extract
  { key: 'extract_provider', label: 'Provider', description: 'LLM провайдер для экстракции', type: 'select', group: 'llm_extract', options: providerOptions, validation: validateProvider },
  { key: 'extract_model', label: 'Model', description: 'Модель LLM', type: 'string', group: 'llm_extract' },
  { key: 'extract_temperature', label: 'Temperature', description: 'Креативность (0.0 = точно, 1.0 = креативно)', type: 'slider', group: 'llm_extract', min: 0, max: 1, step: 0.1, validation: validateTemperature },
  { key: 'extract_max_tokens', label: 'Max Tokens', description: 'Максимум токенов в ответе', type: 'number', group: 'llm_extract', validation: validatePositiveInt },
  { key: 'extract_reasoning_effort', label: 'Reasoning Effort', description: 'Глубина рассуждений', type: 'select', group: 'llm_extract', options: reasoningOptions, validation: validateReasoningEffort },
  // LLM Summary
  { key: 'summary_provider', label: 'Provider', description: 'LLM провайдер для саммари', type: 'select', group: 'llm_summary', options: providerOptions, validation: validateProvider },
  { key: 'summary_model', label: 'Model', description: 'Модель LLM', type: 'string', group: 'llm_summary' },
  { key: 'summary_temperature', label: 'Temperature', description: 'Креативность (0.0 = точно, 1.0 = креативно)', type: 'slider', group: 'llm_summary', min: 0, max: 1, step: 0.1, validation: validateTemperature },
  { key: 'summary_max_tokens', label: 'Max Tokens', description: 'Максимум токенов в ответе', type: 'number', group: 'llm_summary', validation: validatePositiveInt },
  { key: 'summary_reasoning_effort', label: 'Reasoning Effort', description: 'Глубина рассуждений', type: 'select', group: 'llm_summary', options: reasoningOptions, validation: validateReasoningEffort },
  // Rate Limiting
  { key: 'rate_limit_messages', label: 'Лимит сообщений', description: 'Максимум сообщений за период', type: 'number', group: 'rate_limiting', validation: validatePositiveInt },
  { key: 'rate_limit_window', label: 'Окно (сек)', description: 'Период для rate limit в секундах', type: 'number', group: 'rate_limiting', validation: validatePositiveInt },
  // Budget
  { key: 'daily_budget_usd', label: 'Дневной бюджет (USD)', description: 'Лимит расходов в день', type: 'number', group: 'budget', validation: validatePositiveInt },
  // Messages
  { key: 'welcome_message', label: 'Приветственное сообщение', description: 'Сообщение при начале чата', type: 'textarea', group: 'messages' },
  // Timeouts
  { key: 'llm_timeout_seconds', label: 'Таймаут LLM (сек)', description: 'Таймаут запроса к LLM', type: 'number', group: 'timeouts', validation: validatePositiveInt },
]

export const GROUP_LABELS: Record<SettingGroup, string> = {
  llm_chat: 'LLM Chat',
  llm_extract: 'LLM Extract',
  llm_summary: 'LLM Summary',
  rate_limiting: 'Rate Limiting',
  budget: 'Бюджет',
  messages: 'Сообщения',
  timeouts: 'Таймауты',
}
