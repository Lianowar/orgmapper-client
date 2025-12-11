# Design Document: Runtime Settings Support

## Overview

Реализация поддержки Runtime Settings API в клиентском приложении orgmapper-client. Включает TypeScript типы, React Query хук для работы с API, и страницу настроек в админ-панели с группировкой по категориям, валидацией и возможностью сброса к значениям по умолчанию.

Референс API документации: #[[file:orgmapper/docs/RUNTIME_SETTINGS_UI.md]]

## Architecture

```mermaid
graph TB
    subgraph "UI Layer"
        SP[SettingsPage]
        SG[SettingsGroup]
        SF[SettingField]
    end
    
    subgraph "State Management"
        US[useSettings Hook]
        RQ[React Query]
    end
    
    subgraph "API Layer"
        AC[ApiClient]
        T[Types]
    end
    
    subgraph "Backend"
        API[/admin/settings]
    end
    
    SP --> SG
    SG --> SF
    SP --> US
    US --> RQ
    RQ --> AC
    AC --> API
    T --> US
    T --> AC
```

## Components and Interfaces

### API Types (src/api/types.ts)

```typescript
// Setting value with source information
export type SettingSource = 'database' | 'env' | 'default'

export interface SettingValue {
  value: unknown
  source: SettingSource
}

export interface SettingsResponse {
  settings: Record<string, SettingValue>
}

export interface SettingsUpdateRequest {
  settings: Record<string, unknown>
}

// Setting keys enum for type safety
export type SettingKey =
  | 'welcome_message'
  | 'chat_provider'
  | 'chat_model'
  | 'chat_temperature'
  | 'chat_max_tokens'
  | 'chat_reasoning_effort'
  | 'extract_provider'
  | 'extract_model'
  | 'extract_temperature'
  | 'extract_max_tokens'
  | 'extract_reasoning_effort'
  | 'summary_provider'
  | 'summary_model'
  | 'summary_temperature'
  | 'summary_max_tokens'
  | 'summary_reasoning_effort'
  | 'llm_timeout_seconds'
  | 'daily_budget_usd'
  | 'rate_limit_messages'
  | 'rate_limit_window'

export type LLMProvider = 'openai' | 'anthropic' | 'mock'
export type ReasoningEffort = 'none' | 'low' | 'medium' | 'high'
```

### useSettings Hook (src/api/hooks/useSettings.ts)

```typescript
interface UseSettingsReturn {
  settings: Record<string, SettingValue> | undefined
  isLoading: boolean
  error: Error | null
  updateSettings: (updates: Record<string, unknown>) => Promise<void>
  resetSetting: (key: string) => Promise<void>
  refetch: () => void
}
```

### SettingsPage Component

Главная страница настроек с группировкой по категориям:
- LLM Chat Settings
- LLM Extract Settings  
- LLM Summary Settings
- Rate Limiting
- Budget
- Messages
- Timeouts

### SettingsGroup Component

Сворачиваемая группа настроек с заголовком.

### SettingField Component

Универсальный компонент поля настройки с:
- Label и description
- Source badge (database/env/default)
- Reset button (только для source=database)
- Соответствующий input control по типу

## Data Models

### Setting Metadata

```typescript
interface SettingMeta {
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

type SettingGroup = 
  | 'llm_chat' 
  | 'llm_extract' 
  | 'llm_summary' 
  | 'rate_limiting' 
  | 'budget' 
  | 'messages' 
  | 'timeouts'
```

### Settings Configuration

```typescript
const SETTINGS_CONFIG: SettingMeta[] = [
  // LLM Chat
  {
    key: 'chat_provider',
    label: 'Provider',
    description: 'LLM provider for chat',
    type: 'select',
    group: 'llm_chat',
    options: [
      { value: 'openai', label: 'OpenAI' },
      { value: 'anthropic', label: 'Anthropic' },
      { value: 'mock', label: 'Mock (Testing)' }
    ]
  },
  {
    key: 'chat_temperature',
    label: 'Temperature',
    description: 'Response creativity (0.0 = precise, 1.0 = creative)',
    type: 'slider',
    group: 'llm_chat',
    min: 0,
    max: 1,
    step: 0.1,
    validation: (v) => (v >= 0 && v <= 1) ? null : 'Must be 0.0-1.0'
  },
  // ... other settings
]
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Setting display completeness
*For any* setting object with key, value, and source, when rendered by SettingField, the output SHALL contain the key label, formatted value, and source indicator.
**Validates: Requirements 1.2**

### Property 2: Pending changes tracking
*For any* setting value change made by the user, the pending state SHALL contain that change with the correct key and new value until save or discard.
**Validates: Requirements 2.1**

### Property 3: Save sends all pending changes
*For any* non-empty pending changes object, when save is triggered, the API call SHALL include all keys and values from pending changes.
**Validates: Requirements 2.2**

### Property 4: Unsaved changes indicator
*For any* state where pending changes is non-empty, the save button SHALL be enabled and unsaved indicator SHALL be visible.
**Validates: Requirements 2.5**

### Property 5: Reset button visibility by source
*For any* setting, the reset button SHALL be visible if and only if source equals "database".
**Validates: Requirements 3.1, 3.4**

### Property 6: Validation rejects invalid values
*For any* temperature value outside [0.0, 1.0], OR any non-positive integer for max_tokens/timeout/rate_limit fields, OR any reasoning_effort not in [none, low, medium, high], the validation function SHALL return an error message.
**Validates: Requirements 4.1, 4.2, 4.3**

### Property 7: Validation errors disable save
*For any* state where at least one field has a validation error, the save button SHALL be disabled.
**Validates: Requirements 4.4**

## Error Handling

### API Errors
- Network errors: показать toast с сообщением об ошибке и кнопкой retry
- Validation errors (400): показать ошибку рядом с соответствующим полем
- Server errors (5xx): показать общее сообщение об ошибке

### Client-side Validation
- Валидация выполняется при каждом изменении значения
- Ошибки отображаются под полем ввода
- Save button disabled пока есть ошибки валидации

## Testing Strategy

### Unit Tests
- Валидаторы для каждого типа настройки
- Форматирование значений для отображения
- Логика определения видимости reset button

### Property-Based Tests
Используем библиотеку fast-check для property-based testing.

- **Property 1**: Генерируем случайные setting objects, проверяем что рендер содержит все необходимые элементы
- **Property 2**: Генерируем последовательность изменений, проверяем что pending state корректно отслеживает все изменения
- **Property 5**: Генерируем settings с разными source values, проверяем корректность видимости reset button
- **Property 6**: Генерируем невалидные значения для каждого типа, проверяем что валидация возвращает ошибку
- **Property 7**: Генерируем состояния с разным количеством ошибок, проверяем состояние save button

### Integration Tests
- Загрузка настроек при открытии страницы
- Сохранение изменений и обновление UI
- Сброс настройки и обновление source

