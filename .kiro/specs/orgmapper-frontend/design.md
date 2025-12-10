# Design Document

## Overview

Фронтенд OrgMapper — SPA на React для проведения анкетирования сотрудников. Приложение разделено на две независимые части:

1. **Public App** (`/i/{token}`) — чат-интерфейс для сотрудников
2. **Admin App** (`/admin/*`) — панель управления для HR

Обе части собираются в единый bundle и деплоятся как статика через Caddy.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Browser                                  │
├─────────────────────────────────────────────────────────────────┤
│                      React Application                           │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                    React Router                              ││
│  │  ┌─────────────────┐  ┌────────────────────────────────────┐││
│  │  │   Public Routes │  │         Admin Routes               │││
│  │  │   /i/{token}    │  │  /admin/employees                  │││
│  │  │                 │  │  /admin/employees/{id}             │││
│  │  │                 │  │  /admin/sessions/{id}              │││
│  │  │                 │  │  /admin/questions                  │││
│  │  │                 │  │  /admin/prompts                    │││
│  │  │                 │  │  /admin/dashboards                 │││
│  │  └─────────────────┘  └────────────────────────────────────┘││
│  └─────────────────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                    State Management                          ││
│  │  ┌─────────────────────┐  ┌───────────────────────────────┐ ││
│  │  │   React Query       │  │   Local State (useState)      │ ││
│  │  │   (Server State)    │  │   (UI State, Forms)           │ ││
│  │  └─────────────────────┘  └───────────────────────────────┘ ││
│  └─────────────────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                      API Layer                               ││
│  │  ┌─────────────────────────────────────────────────────────┐││
│  │  │              HTTP Client (fetch + interceptors)         │││
│  │  └─────────────────────────────────────────────────────────┘││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                         Caddy Server                             │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  Static Files (/*)  │  Basic Auth (/admin/*)  │  API Proxy  ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      OrgMapper Backend API                       │
└─────────────────────────────────────────────────────────────────┘
```


## Project Structure

```
orgmapper-client/
├── public/
│   └── favicon.ico
├── src/
│   ├── api/                    # API client and hooks
│   │   ├── client.ts           # HTTP client with interceptors
│   │   ├── types.ts            # API response types
│   │   ├── public.ts           # Public API hooks (useSession, useSendMessage)
│   │   └── admin.ts            # Admin API hooks (useEmployees, useQuestions, etc.)
│   │
│   ├── components/             # Shared components
│   │   ├── ui/                 # Generic UI components
│   │   │   ├── ErrorBoundary.tsx
│   │   │   ├── LoadingSkeleton.tsx
│   │   │   └── ConfirmDialog.tsx
│   │   └── layout/             # Layout components
│   │       ├── AdminLayout.tsx
│   │       └── PublicLayout.tsx
│   │
│   ├── features/               # Feature modules
│   │   ├── chat/               # Employee chat feature
│   │   │   ├── components/
│   │   │   │   ├── ChatContainer.tsx
│   │   │   │   ├── MessageList.tsx
│   │   │   │   ├── Message.tsx
│   │   │   │   ├── ChatInput.tsx
│   │   │   │   ├── TypingIndicator.tsx
│   │   │   │   └── FinalScreen.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useChat.ts
│   │   │   │   ├── useDraft.ts
│   │   │   │   └── usePolling.ts
│   │   │   ├── styles/
│   │   │   │   └── chat.module.css
│   │   │   └── ChatPage.tsx
│   │   │
│   │   ├── employees/          # Admin: employees management
│   │   │   ├── components/
│   │   │   ├── EmployeesPage.tsx
│   │   │   └── EmployeeDetailPage.tsx
│   │   │
│   │   ├── sessions/           # Admin: session viewing
│   │   │   ├── components/
│   │   │   └── SessionDetailPage.tsx
│   │   │
│   │   ├── questions/          # Admin: questions management
│   │   │   ├── components/
│   │   │   └── QuestionsPage.tsx
│   │   │
│   │   ├── prompts/            # Admin: prompts management
│   │   │   ├── components/
│   │   │   └── PromptsPage.tsx
│   │   │
│   │   └── dashboard/          # Admin: placeholder dashboard
│   │       └── DashboardPage.tsx
│   │
│   ├── hooks/                  # Shared hooks
│   │   ├── useNotification.ts
│   │   └── useKeyboardShortcut.ts
│   │
│   ├── utils/                  # Utilities
│   │   ├── formatters.ts       # Date, number formatters
│   │   ├── validators.ts       # Form validation
│   │   └── markdown.ts         # Safe markdown renderer
│   │
│   ├── App.tsx                 # Root component with router
│   ├── main.tsx                # Entry point
│   └── index.css               # Global styles
│
├── index.html
├── vite.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

## Components and Interfaces

### API Client

```typescript
// src/api/client.ts
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new ApiRequestError(response.status, error.detail || error);
    }

    return response.json();
  }

  get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  put<T>(endpoint: string, data: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
```

### API Types

```typescript
// src/api/types.ts
export type SessionStatus =
  | 'NOT_STARTED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'EXTRACTING'
  | 'SUMMARIZING'
  | 'FINALIZED'
  | 'ERROR';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sequence: number;
  created_at: string;
}

export interface SessionResponse {
  id: string;
  status: SessionStatus;
  messages: Message[];
  summary: string | null;
}

export interface SendMessageRequest {
  content: string;
  idempotency_key: string;
}

export interface SendMessageResponse {
  user_message: Message;
  assistant_message: Message;
  is_complete: boolean;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  position: string | null;
  department: string | null;
  created_at: string;
  active_invite: Invite | null;
}

export interface EmployeeListItem {
  id: string;
  name: string;
  email: string;
  position: string | null;
  department: string | null;
  created_at: string;
  latest_session_status: SessionStatus | null;
  last_activity_at: string | null;
  has_active_invite: boolean;
}

export interface Invite {
  id: string;
  token: string;
  session_id: string;
  is_revoked: boolean;
  created_at: string;
}

export interface Question {
  id: string;
  question_key: string;
  title: string | null;
  text: string;
  answer_guidance: string | null;
  sort_order: number;
  is_active: boolean;
  questionnaire_version: number;
}

export interface Prompt {
  id: string;
  type: 'chat' | 'extractor' | 'summary';
  version: number;
  content: string;
  is_active: boolean;
  created_at: string;
  supported_variables: string[];
}

export interface ExtractedAnswer {
  question_key: string;
  answer_text: string;
  confidence: number | null;
  flags: string[] | null;
}

export interface AdminSessionDetail {
  id: string;
  employee_id: string;
  status: SessionStatus;
  version: number;
  started_at: string | null;
  completed_at: string | null;
  finalized_at: string | null;
  error_stage: string | null;
  error_message: string | null;
  created_at: string;
  questions_snapshot: Record<string, unknown>;
  prompt_versions_snapshot: Record<string, unknown>;
  messages: Array<{ role: string; content: string; created_at: string }>;
  extracted_answers: ExtractedAnswer[] | null;
  summary_text: string | null;
}

export interface BudgetStatus {
  date: string;
  spent_usd: number;
  reserved_usd: number;
  limit_usd: number;
  remaining_usd: number;
  is_exceeded: boolean;
}
```


### React Query Hooks

```typescript
// src/api/public.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';
import type { SessionResponse, SendMessageRequest, SendMessageResponse } from './types';

export function useSession(token: string) {
  return useQuery({
    queryKey: ['session', token],
    queryFn: () => apiClient.get<SessionResponse>(`/i/${token}`),
    retry: false,
  });
}

export function useSessionById(sessionId: string) {
  return useQuery({
    queryKey: ['session', sessionId],
    queryFn: () => apiClient.get<SessionResponse>(`/sessions/${sessionId}`),
    enabled: !!sessionId,
  });
}

export function useSendMessage(sessionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SendMessageRequest) =>
      apiClient.post<SendMessageResponse>(`/sessions/${sessionId}/message`, data),
    onSuccess: (data) => {
      // Update session cache with new messages
      queryClient.setQueryData(['session', sessionId], (old: SessionResponse | undefined) => {
        if (!old) return old;
        return {
          ...old,
          messages: [...old.messages, data.user_message, data.assistant_message],
        };
      });
    },
  });
}

// src/api/admin.ts
export function useEmployees() {
  return useQuery({
    queryKey: ['employees'],
    queryFn: () => apiClient.get<EmployeeListItem[]>('/admin/employees'),
  });
}

export function useEmployee(id: string) {
  return useQuery({
    queryKey: ['employee', id],
    queryFn: () => apiClient.get<Employee>(`/admin/employees/${id}`),
    enabled: !!id,
  });
}

export function useCreateEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateEmployeeRequest) =>
      apiClient.post<Employee>('/admin/employees', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
}

export function useQuestions() {
  return useQuery({
    queryKey: ['questions'],
    queryFn: () => apiClient.get<Question[]>('/admin/questions'),
  });
}

export function usePrompts() {
  return useQuery({
    queryKey: ['prompts'],
    queryFn: () => apiClient.get<Prompt[]>('/admin/prompts'),
  });
}

export function useBudget() {
  return useQuery({
    queryKey: ['budget'],
    queryFn: () => apiClient.get<BudgetStatus>('/admin/budget'),
    refetchInterval: 60000, // Refresh every minute
  });
}
```

### Chat Components

```typescript
// src/features/chat/components/ChatContainer.tsx
interface ChatContainerProps {
  token: string;
}

export function ChatContainer({ token }: ChatContainerProps) {
  const { data: session, isLoading, error } = useSession(token);
  const [isPolling, setIsPolling] = useState(false);

  // Handle different session states
  if (isLoading) return <ChatSkeleton />;
  if (error) return <ChatError error={error} />;
  if (!session) return <ChatError message="Сессия не найдена" />;

  const isFinalized = session.status === 'FINALIZED';
  const isProcessing = ['COMPLETED', 'EXTRACTING', 'SUMMARIZING'].includes(session.status);
  const isError = session.status === 'ERROR';

  return (
    <div className={styles.container}>
      <ChatHeader />
      <MessageList messages={session.messages} />
      {isProcessing && <ProcessingIndicator />}
      {isFinalized && <FinalScreen summary={session.summary} />}
      {isError && <ErrorScreen />}
      {!isFinalized && !isError && (
        <ChatInput
          sessionId={session.id}
          disabled={isProcessing}
          onComplete={() => setIsPolling(true)}
        />
      )}
    </div>
  );
}
```

```typescript
// src/features/chat/components/Message.tsx
interface MessageProps {
  message: Message;
  isNew?: boolean;
}

export function Message({ message, isNew }: MessageProps) {
  const isUser = message.role === 'user';

  return (
    <div
      className={cn(
        styles.message,
        isUser ? styles.userMessage : styles.assistantMessage,
        isNew && styles.newMessage
      )}
    >
      <div className={styles.content}>
        {isUser ? (
          message.content
        ) : (
          <SafeMarkdown content={message.content} />
        )}
      </div>
      <div className={styles.time}>
        {formatTime(message.created_at)}
      </div>
    </div>
  );
}
```

```typescript
// src/features/chat/components/ChatInput.tsx
interface ChatInputProps {
  sessionId: string;
  disabled?: boolean;
  onComplete?: () => void;
}

const MAX_LENGTH = 2000;

export function ChatInput({ sessionId, disabled, onComplete }: ChatInputProps) {
  const [text, setText] = useState('');
  const { draft, saveDraft, clearDraft } = useDraft(sessionId);
  const sendMessage = useSendMessage(sessionId);

  // Restore draft on mount
  useEffect(() => {
    if (draft) setText(draft);
  }, [draft]);

  // Auto-save draft
  useEffect(() => {
    const timer = setTimeout(() => saveDraft(text), 2000);
    return () => clearTimeout(timer);
  }, [text, saveDraft]);

  const handleSend = async () => {
    if (!text.trim() || text.length > MAX_LENGTH || sendMessage.isPending) return;

    const idempotencyKey = crypto.randomUUID();
    try {
      const result = await sendMessage.mutateAsync({
        content: text.trim(),
        idempotency_key: idempotencyKey,
      });
      setText('');
      clearDraft();
      if (result.is_complete) {
        onComplete?.();
      }
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isOverLimit = text.length > MAX_LENGTH;

  return (
    <div className={styles.inputContainer}>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Введите сообщение..."
        disabled={disabled || sendMessage.isPending}
        className={styles.textarea}
        rows={1}
      />
      <div className={styles.footer}>
        <span className={cn(styles.counter, isOverLimit && styles.overLimit)}>
          {text.length}/{MAX_LENGTH}
        </span>
        <button
          onClick={handleSend}
          disabled={disabled || sendMessage.isPending || !text.trim() || isOverLimit}
          className={styles.sendButton}
        >
          {sendMessage.isPending ? <Spinner size="sm" /> : 'Отправить'}
        </button>
      </div>
      {sendMessage.isError && (
        <div className={styles.error}>
          {getErrorMessage(sendMessage.error)}
          <button onClick={handleSend}>Повторить</button>
        </div>
      )}
    </div>
  );
}
```

## Data Models

### Local State

```typescript
// Draft storage
interface DraftState {
  sessionId: string;
  text: string;
  savedAt: number;
}

// Chat UI state
interface ChatUIState {
  isTyping: boolean;
  isPolling: boolean;
  pollStartedAt: number | null;
  error: string | null;
}
```

### Form Schemas

```typescript
// Employee form
interface EmployeeFormData {
  name: string;
  email: string;
  position: string;
  department: string;
}

// Question form
interface QuestionFormData {
  question_key: string;
  title: string;
  text: string;
  answer_guidance: string;
  sort_order: number;
}

// Prompt form
interface PromptFormData {
  type: 'chat' | 'extractor' | 'summary';
  content: string;
}
```


## Visual Design

### Color Palette

```css
:root {
  /* Primary */
  --color-primary: #228be6;
  --color-primary-light: #4dabf7;
  --color-primary-dark: #1971c2;

  /* Neutral */
  --color-bg: #ffffff;
  --color-bg-secondary: #f8f9fa;
  --color-bg-tertiary: #f1f3f5;
  --color-text: #212529;
  --color-text-secondary: #868e96;
  --color-border: #dee2e6;

  /* Status */
  --color-success: #40c057;
  --color-warning: #fab005;
  --color-error: #fa5252;

  /* Chat specific */
  --color-user-bubble: #228be6;
  --color-user-text: #ffffff;
  --color-assistant-bubble: #f1f3f5;
  --color-assistant-text: #212529;

  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.07);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);

  /* Border radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 16px;
  --radius-full: 9999px;
}
```

### Typography

```css
:root {
  --font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-size-xs: 0.75rem;   /* 12px */
  --font-size-sm: 0.875rem;  /* 14px */
  --font-size-md: 1rem;      /* 16px */
  --font-size-lg: 1.125rem;  /* 18px */
  --font-size-xl: 1.25rem;   /* 20px */
  --line-height: 1.5;
}
```

### Chat Styles

```css
/* src/features/chat/styles/chat.module.css */

.container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  max-width: 800px;
  margin: 0 auto;
  background: var(--color-bg);
}

.header {
  padding: 16px 20px;
  border-bottom: 1px solid var(--color-border);
  text-align: center;
}

.header h1 {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--color-text);
  margin: 0;
}

.messageList {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.message {
  max-width: 80%;
  padding: 12px 16px;
  border-radius: var(--radius-lg);
  animation: messageAppear 0.3s ease-out;
}

.userMessage {
  align-self: flex-end;
  background: var(--color-user-bubble);
  color: var(--color-user-text);
  border-bottom-right-radius: var(--radius-sm);
}

.assistantMessage {
  align-self: flex-start;
  background: var(--color-assistant-bubble);
  color: var(--color-assistant-text);
  border-bottom-left-radius: var(--radius-sm);
}

.time {
  font-size: var(--font-size-xs);
  opacity: 0.7;
  margin-top: 4px;
}

.inputContainer {
  padding: 16px 20px;
  border-top: 1px solid var(--color-border);
  background: var(--color-bg);
}

.textarea {
  width: 100%;
  min-height: 44px;
  max-height: 120px;
  padding: 12px 16px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--font-size-md);
  resize: none;
  outline: none;
  transition: border-color 0.2s;
}

.textarea:focus {
  border-color: var(--color-primary);
}

.footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
}

.counter {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.counter.overLimit {
  color: var(--color-error);
}

.sendButton {
  padding: 8px 20px;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--font-size-md);
  cursor: pointer;
  transition: background 0.2s;
}

.sendButton:hover:not(:disabled) {
  background: var(--color-primary-dark);
}

.sendButton:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Typing indicator */
.typingIndicator {
  display: flex;
  gap: 4px;
  padding: 12px 16px;
  background: var(--color-assistant-bubble);
  border-radius: var(--radius-lg);
  width: fit-content;
}

.typingDot {
  width: 8px;
  height: 8px;
  background: var(--color-text-secondary);
  border-radius: 50%;
  animation: typingBounce 1.4s infinite ease-in-out;
}

.typingDot:nth-child(1) { animation-delay: 0s; }
.typingDot:nth-child(2) { animation-delay: 0.2s; }
.typingDot:nth-child(3) { animation-delay: 0.4s; }

@keyframes messageAppear {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes typingBounce {
  0%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-6px); }
}

/* Mobile responsive */
@media (max-width: 640px) {
  .message {
    max-width: 90%;
  }

  .inputContainer {
    padding: 12px 16px;
  }
}
```

### Session Status Badges

```typescript
const STATUS_CONFIG: Record<SessionStatus, { label: string; color: string }> = {
  NOT_STARTED: { label: 'Не начата', color: 'gray' },
  IN_PROGRESS: { label: 'В процессе', color: 'blue' },
  COMPLETED: { label: 'Завершается', color: 'yellow' },
  EXTRACTING: { label: 'Обработка', color: 'yellow' },
  SUMMARIZING: { label: 'Обработка', color: 'yellow' },
  FINALIZED: { label: 'Завершена', color: 'green' },
  ERROR: { label: 'Ошибка', color: 'red' },
};
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Message ordering consistency
*For any* session with messages, the messages displayed in the chat SHALL be ordered by their `sequence` field in ascending order.
**Validates: Requirements 1.4**

### Property 2: Character counter accuracy
*For any* text input in the chat, the character counter SHALL display the exact length of the input text followed by "/2000".
**Validates: Requirements 2.6**

### Property 3: Send button validation
*For any* text input exceeding 2000 characters, the Send button SHALL be disabled and the counter SHALL be displayed in error color.
**Validates: Requirements 2.5**

### Property 4: Idempotency key uniqueness
*For any* message sent, the idempotency_key SHALL be a valid UUID v4 and SHALL be unique across all messages sent in the session.
**Validates: Requirements 2.10**

### Property 5: Session status to UI state mapping
*For any* session status, the UI SHALL display the correct state:
- FINALIZED → input hidden, summary displayed
- ERROR → error message displayed, history visible
- COMPLETED/EXTRACTING/SUMMARIZING → polling active, processing indicator shown
- IN_PROGRESS → input enabled
- NOT_STARTED → input enabled
**Validates: Requirements 3.3, 3.5, 3.6**

### Property 6: Error message mapping
*For any* HTTP error status, the UI SHALL display the corresponding user-friendly message:
- 404 → "Ссылка недействительна. Обратитесь к HR."
- 410 → "Ссылка недействительна. Обратитесь к HR."
- 429 → "Слишком много сообщений. Подождите немного."
- 503 → "Сервис временно недоступен. Попробуйте позже."
- 409 → "Анкета уже завершена."
**Validates: Requirements 1.2, 1.3, 2.7, 2.8, 3.7**

### Property 7: Draft persistence round-trip
*For any* draft text saved to localStorage, loading the same session SHALL restore the exact same text.
**Validates: Requirements 4.1, 4.2**

### Property 8: Optimistic update consistency
*For any* message sent successfully, the message SHALL appear in the UI before the API response is received, and SHALL remain after the response.
**Validates: Requirements 2.1**

## Error Handling

### API Error Handling

```typescript
// src/api/errors.ts
export class ApiRequestError extends Error {
  constructor(
    public status: number,
    public detail: { code?: string; message?: string } | string
  ) {
    super(typeof detail === 'string' ? detail : detail.message || 'Unknown error');
    this.name = 'ApiRequestError';
  }
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiRequestError) {
    switch (error.status) {
      case 400:
        return typeof error.detail === 'object' && error.detail.message
          ? error.detail.message
          : 'Некорректные данные';
      case 404:
        return 'Ссылка недействительна. Обратитесь к HR.';
      case 409:
        return 'Анкета уже завершена.';
      case 410:
        return 'Ссылка недействительна. Обратитесь к HR.';
      case 429:
        return 'Слишком много сообщений. Подождите немного.';
      case 503:
        return 'Сервис временно недоступен. Попробуйте позже.';
      default:
        return 'Произошла ошибка. Попробуйте позже.';
    }
  }

  if (error instanceof TypeError && error.message.includes('fetch')) {
    return 'Не удалось отправить сообщение. Проверьте соединение.';
  }

  return 'Произошла ошибка. Попробуйте позже.';
}
```

### Error Boundary

```typescript
// src/components/ui/ErrorBoundary.tsx
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="error-fallback">
          <h2>Что-то пошло не так</h2>
          <button onClick={() => window.location.reload()}>
            Обновить страницу
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### Network Status Detection

```typescript
// src/hooks/useNetworkStatus.ts
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
```

## Testing Strategy

### Testing Framework

- **Unit tests**: Vitest
- **Component tests**: Vitest + React Testing Library
- **Property-based tests**: fast-check (optional for PoC)

### Test Categories

#### 1. Component Tests
- Chat components render correctly with different states
- Form validation works as expected
- Error states display correct messages

#### 2. Hook Tests
- useSession fetches and caches data correctly
- useSendMessage handles optimistic updates
- useDraft persists and restores drafts

#### 3. Integration Tests
- Full chat flow from load to send message
- Admin CRUD operations

### Example Tests

```typescript
// src/features/chat/components/__tests__/ChatInput.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { ChatInput } from '../ChatInput';

describe('ChatInput', () => {
  it('disables send button when text exceeds 2000 characters', () => {
    render(<ChatInput sessionId="test" />);
    const textarea = screen.getByPlaceholderText('Введите сообщение...');
    const longText = 'a'.repeat(2001);

    fireEvent.change(textarea, { target: { value: longText } });

    const sendButton = screen.getByText('Отправить');
    expect(sendButton).toBeDisabled();
    expect(screen.getByText('2001/2000')).toHaveClass('overLimit');
  });

  it('displays correct character count', () => {
    render(<ChatInput sessionId="test" />);
    const textarea = screen.getByPlaceholderText('Введите сообщение...');

    fireEvent.change(textarea, { target: { value: 'Hello' } });

    expect(screen.getByText('5/2000')).toBeInTheDocument();
  });
});
```

## Deployment

### Build Configuration

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});
```

### Caddy Configuration

```
# Caddyfile
{$DOMAIN:localhost} {
    # Static frontend files
    root * /srv/frontend
    file_server

    # SPA fallback - serve index.html for all non-file routes
    @notStatic {
        not file
        not path /api/*
    }
    rewrite @notStatic /index.html

    # API proxy
    handle /api/* {
        reverse_proxy backend:8000 {
            header_up X-Real-IP {remote_host}
        }
    }

    # Basic auth for admin routes (browser will show login dialog)
    @admin path /admin/*
    basicauth @admin {
        {$ADMIN_USER} {$ADMIN_PASSWORD_HASH}
    }
}
```

### Docker Build

```dockerfile
# Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM caddy:2-alpine
COPY --from=builder /app/dist /srv/frontend
COPY Caddyfile /etc/caddy/Caddyfile
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `` (same origin) |
| `DOMAIN` | Production domain | `localhost` |
| `ADMIN_USER` | Basic auth username | `admin` |
| `ADMIN_PASSWORD_HASH` | Caddy password hash | - |
