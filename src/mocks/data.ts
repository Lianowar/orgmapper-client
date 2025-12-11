import type { EmployeeListItem, Employee, SessionResponse, AdminSessionDetail, Question, Prompt, BudgetStatus, Message } from '../api/types'

export const mockEmployeesList: EmployeeListItem[] = [
  {
    id: '1',
    name: 'Иван Петров',
    email: 'ivan@example.com',
    position: 'Разработчик',
    department: 'IT',
    created_at: '2024-12-01T10:00:00Z',
    latest_session_status: 'IN_PROGRESS',
    last_activity_at: '2024-12-10T10:00:00Z',
    has_active_invite: true,
  },
  {
    id: '2',
    name: 'Мария Сидорова',
    email: 'maria@example.com',
    position: 'Менеджер',
    department: 'HR',
    created_at: '2024-12-05T10:00:00Z',
    latest_session_status: null,
    last_activity_at: null,
    has_active_invite: false,
  },
]

export const mockEmployees: Record<string, Employee> = {
  '1': {
    id: '1',
    name: 'Иван Петров',
    email: 'ivan@example.com',
    position: 'Разработчик',
    department: 'IT',
    created_at: '2024-12-01T10:00:00Z',
    active_invite: {
      id: 'inv1',
      token: 'abc123',
      session_id: 'sess1',
      is_revoked: false,
      created_at: '2024-12-01T10:00:00Z',
    },
  },
  '2': {
    id: '2',
    name: 'Мария Сидорова',
    email: 'maria@example.com',
    position: 'Менеджер',
    department: 'HR',
    created_at: '2024-12-05T10:00:00Z',
    active_invite: null,
  },
}

export const mockMessages: Message[] = [
  { id: 'm1', role: 'assistant', content: 'Здравствуйте! Я помогу вам заполнить анкету. Расскажите о вашей текущей роли в компании.', sequence: 1, created_at: '2024-12-10T10:00:00Z' },
  { id: 'm2', role: 'user', content: 'Я работаю разработчиком уже 3 года.', sequence: 2, created_at: '2024-12-10T10:01:00Z' },
  { id: 'm3', role: 'assistant', content: 'Отлично! Какие основные задачи вы выполняете?', sequence: 3, created_at: '2024-12-10T10:01:30Z' },
]

export const mockSessions: Record<string, SessionResponse> = {
  'abc123': {
    id: 'sess1',
    status: 'IN_PROGRESS',
    messages: mockMessages,
    summary: null,
  },
}

export const mockAdminSessions: Record<string, AdminSessionDetail> = {
  'sess1': {
    id: 'sess1',
    employee_id: '1',
    status: 'IN_PROGRESS',
    version: 1,
    started_at: '2024-12-10T10:00:00Z',
    completed_at: null,
    finalized_at: null,
    error_stage: null,
    error_message: null,
    created_at: '2024-12-10T10:00:00Z',
    questions_snapshot: {},
    prompt_versions_snapshot: {},
    llm_config_snapshot: null,
    prompt_contents_snapshot: null,
    messages: mockMessages,
    extracted_answers: null,
    summary_text: null,
  },
}

export const mockQuestions: Question[] = [
  { id: 'q1', question_key: 'role', title: 'Роль', text: 'Опишите вашу текущую роль в компании', answer_guidance: 'Укажите должность и основные обязанности', sort_order: 1, is_active: true, questionnaire_version: 1 },
  { id: 'q2', question_key: 'tasks', title: 'Задачи', text: 'Какие основные задачи вы выполняете?', answer_guidance: null, sort_order: 2, is_active: true, questionnaire_version: 1 },
  { id: 'q3', question_key: 'goals', title: 'Цели', text: 'Какие у вас цели на ближайший год?', answer_guidance: null, sort_order: 3, is_active: true, questionnaire_version: 1 },
]

export const mockPrompts: Prompt[] = [
  { id: 'p1', type: 'chat', version: 1, content: 'You are a helpful assistant...', is_active: true, created_at: '2024-12-01T10:00:00Z', supported_variables: ['employee_name', 'employee_position', 'employee_department', 'questions'] },
  { id: 'p2', type: 'chat', version: 2, content: 'You are a helpful assistant v2...', is_active: false, created_at: '2024-12-05T10:00:00Z', supported_variables: ['employee_name', 'employee_position', 'employee_department', 'questions'] },
  { id: 'p3', type: 'extractor', version: 1, content: 'Extract answers from conversation...', is_active: true, created_at: '2024-12-01T10:00:00Z', supported_variables: ['employee_name', 'employee_position', 'employee_department', 'questions'] },
  { id: 'p4', type: 'summary', version: 1, content: 'Summarize the employee profile...', is_active: true, created_at: '2024-12-01T10:00:00Z', supported_variables: ['employee_name', 'employee_position', 'employee_department', 'answers'] },
]

export const mockBudget: BudgetStatus = {
  date: '2024-12-10',
  spent_usd: 45.50,
  reserved_usd: 5.00,
  limit_usd: 100.00,
  remaining_usd: 49.50,
  is_exceeded: false,
}
export const mockSettings: Record<string, { value: unknown; source: 'database' | 'env' | 'default' }> = {
  welcome_message: { value: 'Здравствуйте! Давайте начнём заполнение анкеты.', source: 'database' },
  chat_provider: { value: 'openai', source: 'env' },
  chat_model: { value: 'gpt-4o', source: 'default' },
  chat_temperature: { value: 0.7, source: 'default' },
  chat_max_tokens: { value: 4096, source: 'default' },
  chat_reasoning_effort: { value: 'medium', source: 'default' },
  extract_provider: { value: 'openai', source: 'env' },
  extract_model: { value: 'gpt-4o', source: 'default' },
  extract_temperature: { value: 0.3, source: 'default' },
  extract_max_tokens: { value: 4096, source: 'default' },
  extract_reasoning_effort: { value: 'high', source: 'default' },
  summary_provider: { value: 'openai', source: 'env' },
  summary_model: { value: 'gpt-4o', source: 'default' },
  summary_temperature: { value: 0.5, source: 'default' },
  summary_max_tokens: { value: 2048, source: 'default' },
  summary_reasoning_effort: { value: 'medium', source: 'default' },
  llm_timeout_seconds: { value: 60, source: 'default' },
  daily_budget_usd: { value: 100, source: 'database' },
  rate_limit_messages: { value: 30, source: 'default' },
  rate_limit_window: { value: 60, source: 'default' },
}
