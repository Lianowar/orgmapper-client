# Requirements Document

## Introduction

Данный документ описывает требования к реализации поддержки Runtime Settings API в клиентском приложении orgmapper-client. Бэкенд orgmapper уже предоставляет API для динамического управления настройками системы (LLM параметры, rate limiting, бюджет и т.д.). Клиент должен предоставить админ-интерфейс для просмотра и редактирования этих настроек.

## Glossary

- **Runtime Settings**: Динамические настройки системы, которые можно изменять без перезапуска сервера
- **Setting Source**: Источник значения настройки (database, env, default)
- **LLM Provider**: Провайдер языковой модели (openai, anthropic, mock)
- **Temperature**: Параметр креативности LLM (0.0-1.0)
- **Reasoning Effort**: Глубина рассуждений LLM (none, low, medium, high)
- **Admin Panel**: Административная панель для управления системой

## Requirements

### Requirement 1

**User Story:** As an administrator, I want to view all runtime settings with their current values and sources, so that I can understand the current system configuration.

#### Acceptance Criteria

1. WHEN an administrator opens the settings page THEN the System SHALL display all available settings grouped by category (LLM Chat, LLM Extract, LLM Summary, Rate Limiting, Budget, Messages, Timeouts)
2. WHEN displaying a setting THEN the System SHALL show the setting key, current value, and source indicator (database/env/default)
3. WHEN settings are loading THEN the System SHALL display a loading indicator
4. IF settings fail to load THEN the System SHALL display an error message with retry option

### Requirement 2

**User Story:** As an administrator, I want to update runtime settings through the UI, so that I can tune system behavior without server restart.

#### Acceptance Criteria

1. WHEN an administrator changes a setting value THEN the System SHALL track the change as pending until saved
2. WHEN an administrator clicks save THEN the System SHALL send all pending changes to the API
3. WHEN the API returns success THEN the System SHALL update the displayed values and clear pending changes
4. IF the API returns a validation error THEN the System SHALL display the error message near the affected field
5. WHEN there are unsaved changes THEN the System SHALL display a visual indicator and enable the save button

### Requirement 3

**User Story:** As an administrator, I want to reset individual settings to their default values, so that I can revert custom configurations.

#### Acceptance Criteria

1. WHEN a setting has source "database" THEN the System SHALL display a reset button for that setting
2. WHEN an administrator clicks reset THEN the System SHALL call DELETE endpoint for that setting key
3. WHEN reset succeeds THEN the System SHALL refresh the setting value showing the new source (env or default)
4. WHEN a setting has source "env" or "default" THEN the System SHALL hide the reset button

### Requirement 4

**User Story:** As an administrator, I want client-side validation of settings before submission, so that I can catch errors early.

#### Acceptance Criteria

1. WHEN an administrator enters a temperature value outside 0.0-1.0 THEN the System SHALL display a validation error immediately
2. WHEN an administrator enters a non-positive integer for max_tokens, timeout, or rate_limit fields THEN the System SHALL display a validation error immediately
3. WHEN an administrator enters an invalid reasoning_effort value THEN the System SHALL display a validation error immediately
4. WHILE any field has a validation error THEN the System SHALL disable the save button

### Requirement 5

**User Story:** As an administrator, I want appropriate input controls for different setting types, so that I can easily enter valid values.

#### Acceptance Criteria

1. WHEN displaying a provider setting THEN the System SHALL render a select dropdown with options (openai, anthropic, mock)
2. WHEN displaying a temperature setting THEN the System SHALL render a slider with range 0.0-1.0 and step 0.1
3. WHEN displaying a reasoning_effort setting THEN the System SHALL render a select dropdown with options (low, medium, high)
4. WHEN displaying an integer setting THEN the System SHALL render a number input with appropriate constraints
5. WHEN displaying the welcome_message setting THEN the System SHALL render a textarea input

### Requirement 6

**User Story:** As a developer, I want TypeScript types for the settings API, so that I can safely integrate with the backend.

#### Acceptance Criteria

1. THE System SHALL define TypeScript types for SettingValue with value (any) and source (database|env|default)
2. THE System SHALL define TypeScript types for SettingsResponse with settings dictionary
3. THE System SHALL define TypeScript types for SettingsUpdateRequest with settings dictionary
4. THE System SHALL export all settings-related types from the api/types module

### Requirement 7

**User Story:** As a developer, I want a React hook for settings management, so that I can easily integrate settings functionality into components.

#### Acceptance Criteria

1. THE System SHALL provide a useSettings hook that returns settings data, loading state, and error state
2. THE System SHALL provide an updateSettings function that accepts a partial settings object
3. THE System SHALL provide a resetSetting function that accepts a setting key
4. THE System SHALL provide a refetch function to manually refresh settings
5. WHEN updateSettings or resetSetting completes THEN the hook SHALL automatically refetch all settings

