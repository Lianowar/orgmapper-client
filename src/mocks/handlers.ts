import { http, HttpResponse, delay } from 'msw'
import { mockEmployeesList, mockEmployees, mockSessions, mockAdminSessions, mockQuestions, mockPrompts, mockBudget, mockMessages, mockSettings } from './data'
import type { Employee, EmployeeListItem, Question, Prompt, Message, SessionResponse, AdminSessionDetail } from '../api/types'

let employeesList = [...mockEmployeesList]
let employees = { ...mockEmployees }
let sessions = { ...mockSessions }
let adminSessions = { ...mockAdminSessions }
let questions = [...mockQuestions]
let prompts = [...mockPrompts]
let settings = { ...mockSettings }
let messageSeq = mockMessages.length + 1

export const handlers = [
  // Public: Get session by token
  http.get('/api/i/:token', async ({ params }) => {
    await delay(200)
    const session = sessions[params.token as string]
    if (!session) return new HttpResponse(null, { status: 404 })
    return HttpResponse.json(session)
  }),

  // Public: Send message
  http.post('/api/sessions/:id/message', async ({ params, request }) => {
    await delay(500)
    const body = await request.json() as { content: string; idempotency_key: string }
    const sessionId = params.id as string
    
    // Find session by id
    const sessionEntry = Object.entries(sessions).find(([, s]) => s.id === sessionId)
    if (!sessionEntry) return new HttpResponse(null, { status: 404 })
    
    const [token, session] = sessionEntry
    
    const userMsg: Message = { 
      id: `m${messageSeq++}`, 
      role: 'user', 
      content: body.content, 
      sequence: session.messages.length + 1,
      created_at: new Date().toISOString() 
    }
    
    const assistantMsg: Message = { 
      id: `m${messageSeq++}`, 
      role: 'assistant', 
      content: 'Спасибо за ответ! Продолжим.', 
      sequence: session.messages.length + 2,
      created_at: new Date().toISOString() 
    }
    
    sessions[token] = {
      ...session,
      messages: [...session.messages, userMsg, assistantMsg],
    }
    
    return HttpResponse.json({
      user_message: userMsg,
      assistant_message: assistantMsg,
      is_complete: false,
    }, { status: 201 })
  }),

  // Admin: Employees list
  http.get('/api/admin/employees', async () => {
    await delay(200)
    return HttpResponse.json(employeesList)
  }),

  // Admin: Get employee
  http.get('/api/admin/employees/:id', async ({ params }) => {
    await delay(200)
    const emp = employees[params.id as string]
    if (!emp) return new HttpResponse(null, { status: 404 })
    return HttpResponse.json(emp)
  }),

  // Admin: Create employee
  http.post('/api/admin/employees', async ({ request }) => {
    await delay(200)
    const body = await request.json() as Partial<Employee>
    const id = String(Object.keys(employees).length + 1)
    const newEmp: Employee = {
      id,
      name: body.name || '',
      email: body.email || '',
      position: body.position || null,
      department: body.department || null,
      created_at: new Date().toISOString(),
      active_invite: null,
    }
    employees[id] = newEmp
    employeesList.push({
      id,
      name: newEmp.name,
      email: newEmp.email,
      position: newEmp.position,
      department: newEmp.department,
      created_at: newEmp.created_at,
      latest_session_status: null,
      last_activity_at: null,
      has_active_invite: false,
    })
    return HttpResponse.json(newEmp, { status: 201 })
  }),

  // Admin: Update employee
  http.put('/api/admin/employees/:id', async ({ params, request }) => {
    await delay(200)
    const body = await request.json() as Partial<Employee>
    const id = params.id as string
    if (!employees[id]) return new HttpResponse(null, { status: 404 })
    employees[id] = { ...employees[id], ...body }
    const listIdx = employeesList.findIndex(e => e.id === id)
    if (listIdx >= 0) {
      employeesList[listIdx] = { ...employeesList[listIdx], ...body }
    }
    return HttpResponse.json(employees[id])
  }),

  // Admin: Delete employee
  http.delete('/api/admin/employees/:id', async ({ params }) => {
    await delay(200)
    const id = params.id as string
    delete employees[id]
    employeesList = employeesList.filter(e => e.id !== id)
    return new HttpResponse(null, { status: 204 })
  }),

  // Admin: Employee sessions
  http.get('/api/admin/employees/:id/sessions', async ({ params }) => {
    await delay(200)
    const empSessions = Object.values(adminSessions).filter(s => s.employee_id === params.id)
    return HttpResponse.json(empSessions)
  }),

  // Admin: Create invite
  http.post('/api/admin/employees/:id/invite', async ({ params }) => {
    await delay(200)
    const id = params.id as string
    if (!employees[id]) return new HttpResponse(null, { status: 404 })
    
    const token = Math.random().toString(36).slice(2)
    const sessionId = `sess${Date.now()}`
    
    employees[id].active_invite = {
      id: `inv${Date.now()}`,
      token,
      session_id: sessionId,
      is_revoked: false,
      created_at: new Date().toISOString(),
    }
    
    // Create session for this invite
    sessions[token] = {
      id: sessionId,
      status: 'NOT_STARTED',
      messages: [{ id: 'm1', role: 'assistant', content: 'Здравствуйте! Давайте начнём заполнение анкеты.', sequence: 1, created_at: new Date().toISOString() }],
      summary: null,
    }
    
    const listIdx = employeesList.findIndex(e => e.id === id)
    if (listIdx >= 0) {
      employeesList[listIdx].has_active_invite = true
    }
    
    return HttpResponse.json({ id: employees[id].active_invite.id, token, session_id: sessionId })
  }),

  // Admin: Revoke invite
  http.delete('/api/admin/employees/:id/invite', async ({ params }) => {
    await delay(200)
    const id = params.id as string
    if (!employees[id]) return new HttpResponse(null, { status: 404 })
    
    if (employees[id].active_invite) {
      delete sessions[employees[id].active_invite.token]
    }
    employees[id].active_invite = null
    
    const listIdx = employeesList.findIndex(e => e.id === id)
    if (listIdx >= 0) {
      employeesList[listIdx].has_active_invite = false
    }
    
    return new HttpResponse(null, { status: 204 })
  }),

  // Admin: Get session detail
  http.get('/api/admin/sessions/:id', async ({ params }) => {
    await delay(200)
    const session = adminSessions[params.id as string]
    if (!session) return new HttpResponse(null, { status: 404 })
    return HttpResponse.json(session)
  }),

  // Admin: Questions
  http.get('/api/admin/questions', async () => {
    await delay(200)
    return HttpResponse.json(questions)
  }),

  http.post('/api/admin/questions', async ({ request }) => {
    await delay(200)
    const body = await request.json() as Partial<Question>
    const newQ: Question = {
      id: `q${questions.length + 1}`,
      question_key: body.question_key || '',
      title: body.title || null,
      text: body.text || '',
      answer_guidance: body.answer_guidance || null,
      sort_order: body.sort_order || questions.length + 1,
      is_active: true,
      questionnaire_version: 1,
    }
    questions.push(newQ)
    return HttpResponse.json(newQ, { status: 201 })
  }),

  http.put('/api/admin/questions/:id', async ({ params, request }) => {
    await delay(200)
    const body = await request.json() as Partial<Question>
    const idx = questions.findIndex(q => q.id === params.id)
    if (idx === -1) return new HttpResponse(null, { status: 404 })
    questions[idx] = { ...questions[idx], ...body }
    return HttpResponse.json(questions[idx])
  }),

  http.delete('/api/admin/questions/:id', async ({ params }) => {
    await delay(200)
    questions = questions.filter(q => q.id !== params.id)
    return new HttpResponse(null, { status: 204 })
  }),

  // Admin: Prompts
  http.get('/api/admin/prompts', async ({ request }) => {
    await delay(200)
    const url = new URL(request.url)
    const type = url.searchParams.get('type')
    const filtered = type ? prompts.filter(p => p.type === type) : prompts
    return HttpResponse.json(filtered)
  }),

  http.post('/api/admin/prompts', async ({ request }) => {
    await delay(200)
    const body = await request.json() as { type: Prompt['type']; content: string }
    const sameType = prompts.filter(p => p.type === body.type)
    const maxVersion = Math.max(0, ...sameType.map(p => p.version))
    const newP: Prompt = {
      id: `p${prompts.length + 1}`,
      type: body.type,
      version: maxVersion + 1,
      content: body.content,
      is_active: false,
      created_at: new Date().toISOString(),
      supported_variables: sameType[0]?.supported_variables || [],
    }
    prompts.push(newP)
    return HttpResponse.json(newP, { status: 201 })
  }),

  http.post('/api/admin/prompts/:id/activate', async ({ params }) => {
    await delay(200)
    const prompt = prompts.find(p => p.id === params.id)
    if (!prompt) return new HttpResponse(null, { status: 404 })
    prompts.forEach(p => { if (p.type === prompt.type) p.is_active = false })
    prompt.is_active = true
    return HttpResponse.json(prompt)
  }),

  // Admin: Budget
  http.get('/api/admin/budget', async () => {
    await delay(200)
    return HttpResponse.json(mockBudget)
  }),

  // Admin: Settings
  http.get('/api/admin/settings', async () => {
    await delay(200)
    return HttpResponse.json({ settings })
  }),

  http.put('/api/admin/settings', async ({ request }) => {
    await delay(200)
    const body = await request.json() as { settings: Record<string, unknown> }
    for (const [key, value] of Object.entries(body.settings)) {
      settings[key] = { value, source: 'database' }
    }
    return HttpResponse.json({ settings })
  }),

  http.delete('/api/admin/settings/:key', async ({ params }) => {
    await delay(200)
    const key = params.key as string
    if (mockSettings[key]) {
      settings[key] = { ...mockSettings[key] }
      if (settings[key].source === 'database') {
        settings[key] = { value: settings[key].value, source: 'default' }
      }
    }
    return new HttpResponse(null, { status: 204 })
  }),
]
