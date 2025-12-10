# Requirements Document

## Introduction

Фронтенд-клиент для системы "OrgMapper" — веб-приложение для проведения анкетирования сотрудников через диалог с ИИ-ботом. Приложение состоит из двух частей:

1. **Публичный интерфейс сотрудника** — чат-интерфейс для прохождения анкеты по уникальной ссылке
2. **Админский интерфейс** — панель управления для HR-администратора

**Технологический стек:**
- React 18 + TypeScript
- Vite (сборка)
- Mantine v7 (UI-библиотека для админки)
- CSS Modules (кастомные стили для чата)
- React Query (TanStack Query) для работы с API
- React Router v6 (роутинг)

**Ограничения PoC:**
- Язык интерфейса — только русский
- Авторизация админки — Basic Auth на уровне reverse proxy (Caddy)
- Адаптивность — desktop-first, корректное отображение на планшетах
- Публичный чат — полная мобильная адаптивность

**Интеграция:**
- Бэкенд API: OrgMapper (FastAPI)
- Деплой: статика через Caddy на том же сервере

## Glossary

- **Employee (Сотрудник)** — пользователь, проходящий анкету по уникальной ссылке
- **Admin (Администратор)** — HR-специалист, управляющий системой через админку
- **Session (Сессия)** — одна попытка прохождения анкеты сотрудником
- **Invite (Приглашение)** — уникальный токен для доступа к сессии
- **Question (Вопрос)** — вопрос анкеты с текстом и подсказкой для ИИ
- **Prompt (Промпт)** — текстовая инструкция для LLM
- **Summary (Резюме)** — итоговый текст для сотрудника после завершения анкеты
- **Extracted Answers** — структурированные ответы, извлечённые из диалога

## Requirements

### Requirement 1: Доступ к анкете по ссылке

**User Story:** As an Employee, I want to access my survey via unique link, so that I can participate in the survey without registration.

#### Acceptance Criteria

1. WHEN an Employee opens URL `/i/{token}` with valid non-revoked token, THEN THE Frontend SHALL display the chat interface with session history.
2. WHEN an Employee opens URL with invalid or non-existent token, THEN THE Frontend SHALL display error message "Ссылка недействительна. Обратитесь к HR." without technical details.
3. WHEN an Employee opens URL with revoked token (HTTP 410), THEN THE Frontend SHALL display error message "Ссылка недействительна. Обратитесь к HR."
4. WHEN an Employee returns to an IN_PROGRESS session, THEN THE Frontend SHALL restore and display all previous messages in chronological order.
5. WHEN the page is loading session data, THEN THE Frontend SHALL display a loading skeleton without blocking user interaction.

### Requirement 2: Ведение диалога в чате

**User Story:** As an Employee, I want to chat with AI bot in a natural conversation format, so that I can answer survey questions comfortably.

#### Acceptance Criteria

1. WHEN an Employee types a message and presses Enter or clicks Send button, THEN THE Frontend SHALL send the message to API and display it in the chat immediately (optimistic update).
2. WHEN a message is being sent, THEN THE Frontend SHALL disable the input field and display typing indicator animation.
3. WHEN API returns assistant response, THEN THE Frontend SHALL display the response with smooth appearance animation.
4. WHEN API returns error, THEN THE Frontend SHALL display user-friendly error message and enable retry.
5. WHEN an Employee types message exceeding 2000 characters, THEN THE Frontend SHALL display character counter in red and disable Send button.
6. WHEN an Employee types message, THEN THE Frontend SHALL display character counter in format "X/2000".
7. WHEN API returns HTTP 429 (rate limit), THEN THE Frontend SHALL display message "Слишком много сообщений. Подождите немного." and disable input temporarily.
8. WHEN API returns HTTP 503 (budget exceeded), THEN THE Frontend SHALL display message "Сервис временно недоступен. Попробуйте позже."
9. WHEN network error occurs, THEN THE Frontend SHALL display message "Не удалось отправить сообщение. Проверьте соединение." with retry button.
10. THE Frontend SHALL generate and send unique idempotency_key with each message to prevent duplicates on retry.


### Requirement 3: Завершение анкеты и отображение резюме

**User Story:** As an Employee, I want to see my personalized summary after completing the survey, so that I can understand my results.

#### Acceptance Criteria

1. WHEN API returns `is_complete=true`, THEN THE Frontend SHALL display message "Формируем ваше резюме..." and start polling session status.
2. WHILE session status is COMPLETED, EXTRACTING, or SUMMARIZING, THE Frontend SHALL poll GET /sessions/{id} every 3 seconds.
3. WHEN session status becomes FINALIZED, THEN THE Frontend SHALL display summary text with safe markdown rendering.
4. WHEN polling continues for more than 60 seconds without FINALIZED status, THEN THE Frontend SHALL display message "Обработка занимает больше времени. Вы можете вернуться позже."
5. WHEN session status is FINALIZED, THEN THE Frontend SHALL hide input field and display message "Анкета завершена".
6. WHEN session status is ERROR, THEN THE Frontend SHALL display message "Обработка результатов временно недоступна. Попробуйте обновить страницу позже." and show dialog history.
7. WHEN an Employee attempts to send message to FINALIZED session (HTTP 409), THEN THE Frontend SHALL display message "Анкета уже завершена."

### Requirement 4: Сохранение состояния чата

**User Story:** As an Employee, I want my chat state to be preserved, so that I don't lose my progress if I accidentally close the browser.

#### Acceptance Criteria

1. WHEN an Employee types message but hasn't sent it, THEN THE Frontend SHALL save draft to localStorage every 2 seconds.
2. WHEN an Employee returns to the chat page, THEN THE Frontend SHALL restore draft from localStorage if exists.
3. WHEN message is successfully sent, THEN THE Frontend SHALL clear the draft from localStorage.
4. WHEN an Employee refreshes the page, THEN THE Frontend SHALL load session history from API and display all messages.

### Requirement 5: Список сотрудников в админке

**User Story:** As an Admin, I want to see list of all employees with their survey status, so that I can track survey progress.

#### Acceptance Criteria

1. WHEN an Admin opens `/admin/employees` page, THEN THE Frontend SHALL display table with columns: ФИО, Email, Должность, Отдел, Статус сессии, Последняя активность, Действия.
2. WHEN employee has active session, THEN THE Frontend SHALL display session status as colored badge (NOT_STARTED=серый, IN_PROGRESS=синий, COMPLETED/EXTRACTING/SUMMARIZING=жёлтый, FINALIZED=зелёный, ERROR=красный).
3. WHEN employee has no sessions, THEN THE Frontend SHALL display "—" in status column.
4. WHEN an Admin clicks on employee row, THEN THE Frontend SHALL navigate to employee detail page.
5. WHEN an Admin clicks "Добавить сотрудника" button, THEN THE Frontend SHALL open employee creation form.
6. WHEN data is loading, THEN THE Frontend SHALL display skeleton loader for table rows.
7. WHEN no employees exist, THEN THE Frontend SHALL display empty state with message "Нет сотрудников" and button to create first employee.

### Requirement 6: Создание и редактирование сотрудника

**User Story:** As an Admin, I want to create and edit employees, so that I can manage survey participants.

#### Acceptance Criteria

1. WHEN an Admin submits employee creation form with name, email, position, department, THEN THE Frontend SHALL call POST /admin/employees and display success notification.
2. WHEN an Admin submits form with invalid data, THEN THE Frontend SHALL display validation errors inline.
3. WHEN an Admin opens employee detail page, THEN THE Frontend SHALL display employee data with edit button.
4. WHEN an Admin clicks edit button, THEN THE Frontend SHALL enable inline editing of employee fields.
5. WHEN an Admin saves changes, THEN THE Frontend SHALL call PUT /admin/employees/{id} and display success notification.
6. WHEN an Admin clicks delete button, THEN THE Frontend SHALL display confirmation dialog "Удалить сотрудника {name}?".
7. WHEN an Admin confirms deletion, THEN THE Frontend SHALL call DELETE /admin/employees/{id} and navigate to employees list.

### Requirement 7: Управление ссылками-приглашениями

**User Story:** As an Admin, I want to generate and manage invite links, so that I can send survey access to employees.

#### Acceptance Criteria

1. WHEN an Admin views employee without active invite, THEN THE Frontend SHALL display "Создать ссылку" button.
2. WHEN an Admin views employee with active invite, THEN THE Frontend SHALL display full invite URL and "Копировать" button.
3. WHEN an Admin clicks "Копировать", THEN THE Frontend SHALL copy URL to clipboard and display toast "Ссылка скопирована".
4. WHEN an Admin clicks "Создать ссылку", THEN THE Frontend SHALL call POST /admin/employees/{id}/invites and display new link.
5. WHEN an Admin clicks "Перегенерировать ссылку", THEN THE Frontend SHALL display confirmation dialog warning that previous link will be revoked.
6. WHEN an Admin confirms regeneration, THEN THE Frontend SHALL call POST /admin/employees/{id}/invites (which revokes previous) and display new link.
7. WHEN an Admin clicks "Отозвать ссылку", THEN THE Frontend SHALL call POST /admin/invites/{id}/revoke and update UI.

### Requirement 8: Просмотр сессий сотрудника

**User Story:** As an Admin, I want to view all sessions for an employee, so that I can track their survey history.

#### Acceptance Criteria

1. WHEN an Admin views employee detail page, THEN THE Frontend SHALL display list of all sessions with status, dates, and "Открыть" action.
2. WHEN an Admin clicks "Открыть" on session, THEN THE Frontend SHALL navigate to session detail page.
3. WHEN employee has no sessions, THEN THE Frontend SHALL display message "Нет сессий".

### Requirement 9: Просмотр деталей сессии

**User Story:** As an Admin, I want to view detailed session information, so that I can review employee responses and AI-generated content.

#### Acceptance Criteria

1. WHEN an Admin opens session detail page, THEN THE Frontend SHALL display tabs: Диалог, Ответы, Резюме, Мета.
2. WHEN "Диалог" tab is active, THEN THE Frontend SHALL display all messages in chat-like format (read-only).
3. WHEN "Ответы" tab is active, THEN THE Frontend SHALL display extracted answers with question text, answer, confidence percentage, and flags as chips.
4. WHEN extracted answers are not available, THEN THE Frontend SHALL display message "Ответы ещё не извлечены".
5. WHEN "Резюме" tab is active, THEN THE Frontend SHALL display summary text with safe markdown rendering.
6. WHEN summary is not available, THEN THE Frontend SHALL display message "Резюме ещё не сформировано".
7. WHEN "Мета" tab is active, THEN THE Frontend SHALL display session metadata: status, dates, prompt versions, questions snapshot version.
8. WHEN session status is ERROR, THEN THE Frontend SHALL display error_stage and error_message with "Пересчитать" buttons.
9. WHEN an Admin clicks "Пересчитать извлечение", THEN THE Frontend SHALL call POST /admin/sessions/{id}/reextract.
10. WHEN an Admin clicks "Пересчитать резюме", THEN THE Frontend SHALL call POST /admin/sessions/{id}/resummarize.

### Requirement 10: Управление вопросами анкеты

**User Story:** As an Admin, I want to manage survey questions, so that I can customize what information is collected.

#### Acceptance Criteria

1. WHEN an Admin opens `/admin/questions` page, THEN THE Frontend SHALL display list of questions ordered by sort_order.
2. WHEN an Admin drags question to new position, THEN THE Frontend SHALL call PUT /admin/questions/reorder with new order.
3. WHEN an Admin clicks "Добавить вопрос", THEN THE Frontend SHALL open question creation form.
4. WHEN an Admin submits question form with question_key, title, text, answer_guidance, sort_order, THEN THE Frontend SHALL call POST /admin/questions.
5. WHEN an Admin clicks edit on question, THEN THE Frontend SHALL open question edit form (question_key is read-only).
6. WHEN an Admin saves question changes, THEN THE Frontend SHALL call PUT /admin/questions/{id}.
7. WHEN an Admin clicks delete on question, THEN THE Frontend SHALL display confirmation dialog.
8. WHEN an Admin confirms deletion, THEN THE Frontend SHALL call DELETE /admin/questions/{id}.
9. WHEN questionnaire_version changes, THEN THE Frontend SHALL display current version number.


### Requirement 11: Управление промптами

**User Story:** As an Admin, I want to manage prompt templates, so that I can customize AI behavior.

#### Acceptance Criteria

1. WHEN an Admin opens `/admin/prompts` page, THEN THE Frontend SHALL display prompts grouped by type: Chat, Extractor, Summary.
2. WHEN an Admin selects prompt type tab, THEN THE Frontend SHALL display list of versions with version number, date, and active badge.
3. WHEN an Admin clicks on prompt version, THEN THE Frontend SHALL display prompt content in editor.
4. WHEN an Admin edits prompt and clicks "Сохранить как новую версию", THEN THE Frontend SHALL call POST /admin/prompts with type and content.
5. WHEN an Admin clicks "Сделать активной" on version, THEN THE Frontend SHALL display confirmation and call POST /admin/prompts/{id}/activate.
6. WHEN prompt type is selected, THEN THE Frontend SHALL display list of supported variables for that type.
7. WHEN an Admin saves prompt with invalid variables, THEN THE Frontend SHALL display validation error from API.

### Requirement 12: Просмотр бюджета

**User Story:** As an Admin, I want to see current LLM budget status, so that I can monitor costs.

#### Acceptance Criteria

1. WHEN an Admin views admin panel, THEN THE Frontend SHALL display budget widget showing spent/limit for today.
2. WHEN budget is close to limit (>80%), THEN THE Frontend SHALL display warning indicator.
3. WHEN budget is exceeded, THEN THE Frontend SHALL display error indicator.

### Requirement 13: Навигация и layout админки

**User Story:** As an Admin, I want intuitive navigation, so that I can easily access all admin functions.

#### Acceptance Criteria

1. WHEN an Admin opens any admin page, THEN THE Frontend SHALL display sidebar with menu items: Сотрудники, Вопросы, Промпты, Дашборды.
2. WHEN an Admin clicks "Дашборды", THEN THE Frontend SHALL display placeholder page with message "Будет доступно на следующем этапе".
3. WHEN an Admin is on a page, THEN THE Frontend SHALL highlight corresponding menu item.
4. THE Frontend SHALL display current page title in header.
5. THE Frontend SHALL display budget status widget in header or sidebar.

### Requirement 14: Обработка ошибок и состояний загрузки

**User Story:** As a User, I want clear feedback on loading and errors, so that I understand what's happening.

#### Acceptance Criteria

1. WHEN any page is loading data, THEN THE Frontend SHALL display appropriate skeleton loaders.
2. WHEN API request fails, THEN THE Frontend SHALL display user-friendly error message with retry option.
3. WHEN network connection is lost, THEN THE Frontend SHALL display notification "Нет соединения с сервером".
4. WHEN action succeeds (create, update, delete), THEN THE Frontend SHALL display success toast notification.
5. WHEN action fails, THEN THE Frontend SHALL display error toast notification with message from API.
6. WHEN user performs destructive action, THEN THE Frontend SHALL require confirmation via dialog.

### Requirement 15: Визуальный дизайн чата сотрудника

**User Story:** As an Employee, I want a beautiful and comfortable chat interface, so that I enjoy the survey experience.

#### Acceptance Criteria

1. THE Frontend SHALL display user messages aligned to the right with distinct background color.
2. THE Frontend SHALL display assistant messages aligned to the left with different background color.
3. THE Frontend SHALL animate new messages appearing with smooth fade-in and slide-up effect.
4. THE Frontend SHALL display typing indicator as animated dots when waiting for assistant response.
5. THE Frontend SHALL auto-scroll to latest message when new message appears.
6. THE Frontend SHALL support multiline input with auto-resize up to 5 lines.
7. THE Frontend SHALL display timestamps on messages (time only, e.g., "14:32").
8. THE Frontend SHALL render markdown in assistant messages safely (bold, italic, lists, links).
9. THE Frontend SHALL be fully functional on mobile devices with touch-friendly controls.
10. THE Frontend SHALL use clean, minimalist design with soft shadows and rounded corners.

### Requirement 16: Keyboard shortcuts

**User Story:** As a User, I want keyboard shortcuts, so that I can work more efficiently.

#### Acceptance Criteria

1. WHEN user presses Enter in chat input (without Shift), THEN THE Frontend SHALL send the message.
2. WHEN user presses Shift+Enter in chat input, THEN THE Frontend SHALL insert new line.
3. WHEN user presses Escape in modal dialog, THEN THE Frontend SHALL close the dialog.
4. WHEN user presses Ctrl+S in prompt editor, THEN THE Frontend SHALL save prompt as new version.
