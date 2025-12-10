export type SessionStatus =
  | 'NOT_STARTED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'EXTRACTING'
  | 'SUMMARIZING'
  | 'FINALIZED'
  | 'ERROR'

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  sequence: number
  created_at: string
}

export interface SessionResponse {
  id: string
  status: SessionStatus
  messages: Message[]
  summary: string | null
}

export interface SendMessageRequest {
  content: string
  idempotency_key: string
}

export interface SendMessageResponse {
  user_message: Message
  assistant_message: Message
  is_complete: boolean
}

export interface Invite {
  id: string
  token: string
  session_id: string
  is_revoked: boolean
  created_at: string
}

export interface Employee {
  id: string
  name: string
  email: string
  position: string | null
  department: string | null
  created_at: string
  active_invite: Invite | null
}

export interface EmployeeListItem {
  id: string
  name: string
  email: string
  position: string | null
  department: string | null
  created_at: string
  latest_session_status: SessionStatus | null
  last_activity_at: string | null
  has_active_invite: boolean
}

export interface EmployeeCreate {
  name: string
  email: string
  position?: string
  department?: string
}

export interface EmployeeUpdate {
  name?: string
  email?: string
  position?: string
  department?: string
}

export interface Question {
  id: string
  question_key: string
  title: string | null
  text: string
  answer_guidance: string | null
  sort_order: number
  is_active: boolean
  questionnaire_version: number
}

export interface QuestionCreate {
  question_key: string
  title?: string
  text: string
  answer_guidance?: string
  sort_order: number
}

export interface QuestionUpdate {
  title?: string
  text?: string
  answer_guidance?: string
  sort_order?: number
  is_active?: boolean
}

export interface Prompt {
  id: string
  type: 'chat' | 'extractor' | 'summary'
  version: number
  content: string
  is_active: boolean
  created_at: string
  supported_variables: string[]
}

export interface PromptCreate {
  type: 'chat' | 'extractor' | 'summary'
  content: string
}

export interface ExtractedAnswer {
  question_key: string
  answer_text: string
  confidence: number | null
  flags: string[] | null
}

export interface AdminSessionDetail {
  id: string
  employee_id: string
  status: SessionStatus
  version: number
  started_at: string | null
  completed_at: string | null
  finalized_at: string | null
  error_stage: string | null
  error_message: string | null
  created_at: string
  questions_snapshot: Record<string, unknown>
  prompt_versions_snapshot: Record<string, unknown>
  messages: Message[]
  extracted_answers: ExtractedAnswer[] | null
  summary_text: string | null
}

export interface BudgetStatus {
  date: string
  spent_usd: number
  reserved_usd: number
  limit_usd: number
  remaining_usd: number
  is_exceeded: boolean
}

export interface InviteResponse {
  id: string
  token: string
  session_id: string
}

// Settings API types
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
export type ReasoningEffort = 'low' | 'medium' | 'high'
