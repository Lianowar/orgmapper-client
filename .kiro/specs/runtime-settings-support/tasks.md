# Implementation Plan

- [x] 1. Add TypeScript types for Settings API
  - Add SettingSource, SettingValue, SettingsResponse, SettingsUpdateRequest types to api/types.ts
  - Add SettingKey union type for all setting keys
  - Add LLMProvider and ReasoningEffort types
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [x] 2. Implement useSettings hook
  - [x] 2.1 Create useSettings hook with React Query
    - Implement GET /admin/settings query
    - Implement updateSettings mutation (PUT /admin/settings)
    - Implement resetSetting mutation (DELETE /admin/settings/{key})
    - Auto-refetch after mutations
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_
  - [x] 2.2 Export hook from api/hooks/index.ts
    - _Requirements: 7.1_

- [x] 3. Implement validation utilities
  - [x] 3.1 Create settings validation functions
    - Create src/features/settings/validation.ts
    - Implement validateTemperature (0.0-1.0)
    - Implement validatePositiveInt for max_tokens, timeout, rate_limit fields
    - Implement validateReasoningEffort (none/low/medium/high)
    - Implement validateProvider (openai/anthropic/mock)
    - _Requirements: 4.1, 4.2, 4.3_
  - [ ]* 3.2 Write property test for validation functions
    - **Property 6: Validation rejects invalid values**
    - **Validates: Requirements 4.1, 4.2, 4.3**

- [x] 4. Implement settings configuration
  - Create src/features/settings/config.ts with SETTINGS_CONFIG array
  - Define metadata for each setting (key, label, description, type, group, validation, options)
  - Group settings by category
  - _Requirements: 1.1, 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 5. Implement SettingField component
  - [x] 5.1 Create SettingField component
    - Create src/features/settings/SettingField.tsx
    - Render label, description, source badge
    - Render appropriate input control based on type (select, slider, number, textarea)
    - Show reset button only when source is "database"
    - Show validation error below input
    - _Requirements: 1.2, 3.1, 3.4, 5.1, 5.2, 5.3, 5.4, 5.5_
  - [ ]* 5.2 Write property test for reset button visibility
    - **Property 5: Reset button visibility by source**
    - **Validates: Requirements 3.1, 3.4**

- [x] 6. Implement SettingsGroup component
  - Create src/features/settings/SettingsGroup.tsx
  - Collapsible group with title
  - Render SettingField for each setting in group
  - _Requirements: 1.1_

- [x] 7. Implement SettingsPage
  - [x] 7.1 Create SettingsPage component
    - Create src/features/settings/SettingsPage.tsx
    - Use useSettings hook for data fetching
    - Track pending changes in local state
    - Show loading skeleton while loading
    - Show error message with retry on error
    - Render SettingsGroup for each category
    - _Requirements: 1.1, 1.3, 1.4, 2.1_
  - [x] 7.2 Implement save functionality
    - Save button enabled only when pending changes exist and no validation errors
    - Call updateSettings with all pending changes
    - Clear pending changes on success
    - Show validation errors from API response
    - _Requirements: 2.2, 2.3, 2.4, 2.5, 4.4_
  - [x] 7.3 Implement reset functionality
    - Call resetSetting for specific key
    - Refetch settings after reset
    - _Requirements: 3.2, 3.3_
  - [ ]* 7.4 Write property test for pending changes tracking
    - **Property 2: Pending changes tracking**
    - **Validates: Requirements 2.1**
  - [ ]* 7.5 Write property test for save button state
    - **Property 4: Unsaved changes indicator**
    - **Property 7: Validation errors disable save**
    - **Validates: Requirements 2.5, 4.4**

- [x] 8. Integrate SettingsPage into app
  - [x] 8.1 Add route for settings page
    - Add /admin/settings route in App.tsx
    - _Requirements: 1.1_
  - [x] 8.2 Add navigation link
    - Add "Настройки" link to AdminLayout navbar
    - _Requirements: 1.1_

- [ ] 9. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
