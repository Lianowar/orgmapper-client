# Implementation Plan

## Phase 1: Project Setup

- [x] 1. Initialize project and configure tooling
  - [x] 1.1 Create Vite + React + TypeScript project
    - Run `npm create vite@latest` with React + TypeScript template
    - Configure `vite.config.ts` with API proxy for development
    - _Requirements: N/A (setup)_
  - [x] 1.2 Install and configure dependencies
    - Install: `@tanstack/react-query`, `react-router-dom`, `@mantine/core`, `@mantine/hooks`
    - Configure React Query provider in `main.tsx`
    - Configure Mantine provider with theme
    - _Requirements: N/A (setup)_
  - [x] 1.3 Set up project structure
    - Create folder structure: `api/`, `components/`, `features/`, `hooks/`, `utils/`
    - Create base CSS variables in `index.css`
    - _Requirements: N/A (setup)_
  - [x] 1.4 Configure routing
    - Set up React Router with routes: `/i/:token`, `/admin/*`
    - Create placeholder pages for all routes
    - _Requirements: 13.1_

## Phase 2: API Layer and Mock Server

- [x] 2. Implement API client, types, and mock server
  - [x] 2.0 Set up MSW (Mock Service Worker) for development
    - Install `msw` package
    - Create mock handlers for all API endpoints
    - Create mock data fixtures (employees, sessions, questions, prompts)
    - Configure MSW to run in development mode
    - Add npm script `dev:mock` to run with mocks enabled
    - _Requirements: N/A (development tooling)_
  - [x] 2.1 Create API client with error handling
    - Implement `ApiClient` class with GET, POST, PUT, DELETE methods
    - Implement `ApiRequestError` class
    - Implement `getErrorMessage` helper function
    - _Requirements: 14.2, 14.5_
  - [x] 2.2 Define TypeScript types for API responses
    - Create types: `SessionResponse`, `Message`, `Employee`, `Question`, `Prompt`, etc.
    - _Requirements: N/A (types)_
  - [x] 2.3 Implement public API hooks
    - `useSession(token)` - fetch session by invite token
    - `useSessionById(id)` - fetch session by ID (for polling)
    - `useSendMessage(sessionId)` - send message mutation
    - _Requirements: 1.1, 2.1_
  - [ ]* 2.4 Write property test for idempotency key generation
    - **Property 4: Idempotency key uniqueness**
    - **Validates: Requirements 2.10**
  - [x] 2.5 Implement admin API hooks
    - Employee hooks: `useEmployees`, `useEmployee`, `useCreateEmployee`, `useUpdateEmployee`, `useDeleteEmployee`
    - Session hooks: `useEmployeeSessions`, `useAdminSession`, `useReextract`, `useResummarize`
    - Question hooks: `useQuestions`, `useCreateQuestion`, `useUpdateQuestion`, `useDeleteQuestion`, `useReorderQuestions`
    - Prompt hooks: `usePrompts`, `useCreatePrompt`, `useActivatePrompt`
    - Budget hook: `useBudget`
    - Invite hooks: `useCreateInvite`, `useRevokeInvite`
    - _Requirements: 5.1, 6.1, 7.4, 9.1, 10.1, 11.1, 12.1_

## Phase 3: Shared Components

- [x] 3. Create shared UI components
  - [x] 3.1 Implement layout components
    - `PublicLayout` - minimal layout for chat page
    - `AdminLayout` - sidebar + header layout for admin
    - _Requirements: 13.1, 13.4_
  - [x] 3.2 Implement loading and error components
    - `LoadingSkeleton` - generic skeleton loader
    - `ErrorBoundary` - React error boundary
    - `ErrorMessage` - error display component
    - _Requirements: 14.1, 14.2_
  - [x] 3.3 Implement notification system
    - `NotificationProvider` using Mantine notifications
    - `useNotification` hook for success/error toasts
    - _Requirements: 14.4, 14.5_
  - [x] 3.4 Implement confirmation dialog
    - `ConfirmDialog` component using Mantine Modal
    - _Requirements: 14.6_

## Phase 4: Employee Chat Feature

- [x] 4. Implement chat page for employees
  - [x] 4.1 Create ChatPage and ChatContainer
    - Route: `/i/:token`
    - Fetch session by token
    - Handle loading, error, and different session states
    - _Requirements: 1.1, 1.2, 1.3, 1.5_
  - [ ]* 4.2 Write property test for message ordering
    - **Property 1: Message ordering consistency**
    - **Validates: Requirements 1.4**
  - [x] 4.3 Implement MessageList and Message components
    - Display messages with user/assistant styling
    - Render timestamps
    - Smooth appearance animation
    - _Requirements: 15.1, 15.2, 15.3, 15.7_
  - [x] 4.3.1 Add safe markdown rendering for assistant messages
    - Install markdown library (e.g., `react-markdown` with `rehype-sanitize`)
    - Render markdown in assistant messages safely (bold, italic, lists, links)
    - _Requirements: 15.8_
  - [x] 4.4 Implement TypingIndicator component
    - Animated dots indicator
    - _Requirements: 15.4_
  - [x] 4.5 Implement ChatInput component
    - Multiline textarea with auto-resize
    - Character counter
    - Send button with disabled states
    - Keyboard shortcuts (Enter to send, Shift+Enter for newline)
    - _Requirements: 2.1, 2.5, 2.6, 15.5, 15.6, 16.1, 16.2_
  - [ ]* 4.6 Write property tests for ChatInput
    - **Property 2: Character counter accuracy**
    - **Property 3: Send button validation**
    - **Validates: Requirements 2.5, 2.6**
  - [x] 4.7 Implement message sending flow
    - Optimistic update
    - Idempotency key generation
    - Error handling with retry
    - Disable input while sending
    - _Requirements: 2.1, 2.2, 2.4, 2.9, 2.10_
  - [ ]* 4.8 Write property test for optimistic updates
    - **Property 8: Optimistic update consistency**
    - **Validates: Requirements 2.1**
  - [x] 4.9 Refine error message handling
    - Update `getErrorMessage` to map HTTP status codes per requirements:
    - 404 → "Ссылка недействительна. Обратитесь к HR."
    - 410 → "Ссылка недействительна. Обратитесь к HR."
    - 429 → "Слишком много сообщений. Подождите немного."
    - 503 → "Сервис временно недоступен. Попробуйте позже."
    - 409 → "Анкета уже завершена."
    - Network error → "Не удалось отправить сообщение. Проверьте соединение."
    - _Requirements: 1.2, 1.3, 2.7, 2.8, 2.9, 3.7_
  - [ ]* 4.10 Write property test for error message mapping
    - **Property 6: Error message mapping**
    - **Validates: Requirements 1.2, 1.3, 2.7, 2.8, 3.7**
  - [x] 4.11 Implement draft persistence
    - Save draft to localStorage every 2 seconds
    - Restore draft on page load
    - Clear draft after successful send
    - _Requirements: 4.1, 4.2, 4.3_
  - [ ]* 4.12 Write property test for draft persistence
    - **Property 7: Draft persistence round-trip**
    - **Validates: Requirements 4.1, 4.2**
  - [x] 4.13 Implement session completion flow
    - Detect `is_complete=true`
    - Start polling session status
    - Display "Формируем ваше резюме..." message
    - _Requirements: 3.1, 3.2_
  - [x] 4.13.1 Add polling timeout handling
    - Handle polling timeout (60 seconds) with message "Обработка занимает больше времени. Вы можете вернуться позже."
    - _Requirements: 3.4_
  - [ ]* 4.14 Write property test for session status mapping
    - **Property 5: Session status to UI state mapping**
    - **Validates: Requirements 3.3, 3.5, 3.6**
  - [x] 4.15 Implement FinalScreen component
    - Display summary
    - Hide input, show "Анкета завершена"
    - Handle ERROR status display
    - _Requirements: 3.3, 3.5, 3.6, 3.7_
  - [x] 4.16 Apply chat visual styles
    - Implement CSS module with all chat styles
    - Mobile responsive adjustments
    - _Requirements: 15.1, 15.2, 15.3, 15.9, 15.10_

- [x] 5. Checkpoint - Verify chat feature works
  - Run `npm run dev:mock` and test chat flow with mock data
  - Verify: page loads, messages display, sending works, completion flow works
  - Ensure all tests pass, ask the user if questions arise.

## Phase 5: Admin Layout and Navigation

- [x] 6. Implement admin layout and navigation
  - [x] 6.1 Create AdminLayout with sidebar
    - Sidebar with menu items: Сотрудники, Вопросы, Промпты, Дашборды
    - Header with page title
    - Budget widget in header/sidebar
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5_
  - [x] 6.2 Implement BudgetWidget component
    - Display spent/limit
    - Warning indicator when >80%
    - Error indicator when exceeded
    - _Requirements: 12.1, 12.2, 12.3_
  - [x] 6.3 Create DashboardPage placeholder
    - Display "Будет доступно на следующем этапе"
    - _Requirements: 13.2_

## Phase 6: Employees Management

- [x] 7. Implement employees management
  - [x] 7.1 Create EmployeesPage with table
    - Display table with columns: ФИО, Email, Должность, Отдел, Статус, Активность, Действия
    - Status badges with colors
    - Loading skeleton
    - Empty state
    - _Requirements: 5.1, 5.2, 5.3, 5.6, 5.7_
  - [x] 7.2 Implement employee row click navigation
    - Navigate to employee detail page
    - _Requirements: 5.4_
  - [x] 7.3 Create EmployeeCreatePage/Modal
    - Form with fields: name, email, position, department
    - Validation
    - Success notification
    - _Requirements: 5.5, 6.1, 6.2_
  - [x] 7.4 Create EmployeeDetailPage
    - Display employee data
    - Edit button with inline editing
    - Delete button with confirmation
    - _Requirements: 6.3, 6.4, 6.5, 6.6, 6.7_
  - [x] 7.5 Implement invite management on employee page
    - Display invite URL if exists
    - Copy button with toast
    - Create/Regenerate invite buttons
    - Revoke invite button
    - Confirmation dialogs
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7_
  - [x] 7.6 Implement employee sessions list
    - Display sessions table on employee detail page
    - Navigate to session detail
    - _Requirements: 8.1, 8.2, 8.3_

## Phase 7: Session Viewing

- [x] 8. Implement session detail page
  - [x] 8.1 Create SessionDetailPage with tabs
    - Tabs: Диалог, Ответы, Резюме, Мета
    - _Requirements: 9.1_
  - [x] 8.2 Implement Dialog tab
    - Display messages in chat-like format (read-only)
    - _Requirements: 9.2_
  - [x] 8.3 Implement Answers tab
    - Display extracted answers with question, answer, confidence, flags
    - Handle "not extracted" state
    - _Requirements: 9.3, 9.4_
  - [x] 8.4 Implement Summary tab
    - Display summary text
    - Handle "not generated" state
    - _Requirements: 9.5, 9.6_
  - [x] 8.4.1 Add safe markdown rendering for summary
    - Render summary with safe markdown
    - _Requirements: 9.5_
  - [x] 8.5 Implement Meta tab
    - Display session metadata
    - Display error info for ERROR status
    - Reextract/Resummarize buttons
    - _Requirements: 9.7, 9.8, 9.9, 9.10_

- [x] 9. Checkpoint - Verify admin features work
  - Run `npm run dev:mock` and test admin flows with mock data
  - Verify: employees CRUD, session viewing, questions/prompts management
  - Ensure all tests pass, ask the user if questions arise.

## Phase 8: Questions Management

- [x] 10. Implement questions management
  - [x] 10.1 Create QuestionsPage with list
    - Display questions ordered by sort_order
    - Show questionnaire_version
    - _Requirements: 10.1, 10.9_
  - [ ] 10.2 Implement drag-and-drop reorder
    - Install and configure @dnd-kit or similar library
    - Call reorder API on drop
    - _Requirements: 10.2_
  - [x] 10.3 Create question create/edit form
    - Fields: question_key (readonly on edit), title, text, answer_guidance, sort_order
    - _Requirements: 10.3, 10.4, 10.5, 10.6_
  - [x] 10.4 Implement question deletion
    - Confirmation dialog
    - _Requirements: 10.7, 10.8_

## Phase 9: Prompts Management

- [x] 11. Implement prompts management
  - [x] 11.1 Create PromptsPage with type tabs
    - Tabs: Chat, Extractor, Summary
    - _Requirements: 11.1, 11.2_
  - [x] 11.2 Implement version list and selection
    - Display versions with active badge
    - Select version to view/edit
    - _Requirements: 11.2, 11.3_
  - [x] 11.3 Implement prompt editor
    - Textarea for content
    - Display supported variables
    - Save as new version button
    - Keyboard shortcut Ctrl+S
    - _Requirements: 11.4, 11.6, 16.4_
  - [x] 11.4 Implement prompt activation
    - Activate button with confirmation
    - Handle validation errors
    - _Requirements: 11.5, 11.7_

## Phase 10: Polish and Deployment

- [x] 12. Final polish and deployment setup
  - [x] 12.1 Implement network status detection
    - Create `useNetworkStatus` hook
    - Show notification when offline: "Нет соединения с сервером"
    - _Requirements: 14.3_
  - [x] 12.2 Add keyboard shortcut for modal close
    - Escape to close modals (Mantine Modal handles this by default)
    - _Requirements: 16.3_
  - [ ] 12.3 Review and fix accessibility
    - ARIA labels
    - Focus management
    - _Requirements: N/A (quality)_
  - [ ] 12.4 Create production build configuration
    - Optimize bundle size
    - Configure environment variables
    - _Requirements: N/A (deployment)_
  - [ ] 12.5 Create Docker configuration
    - Dockerfile for frontend
    - Update docker-compose for full stack
    - _Requirements: N/A (deployment)_
  - [ ] 12.6 Create Caddyfile for production
    - Static file serving
    - SPA fallback
    - API proxy
    - Basic auth for admin
    - _Requirements: N/A (deployment)_

- [ ] 13. Final Checkpoint - Integration test with real backend
  - Start backend API (orgmapper)
  - Run frontend with `npm run dev` (without mocks)
  - Test full integration: chat flow, admin operations
  - Ensure all tests pass, ask the user if questions arise.
