export class ApiRequestError extends Error {
  status: number
  statusText: string
  data?: unknown

  constructor(status: number, statusText: string, data?: unknown) {
    super(`${status} ${statusText}`)
    this.name = 'ApiRequestError'
    this.status = status
    this.statusText = statusText
    this.data = data
  }
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiRequestError) {
    switch (error.status) {
      case 404:
      case 410:
        return 'Ссылка недействительна. Обратитесь к HR.'
      case 409:
        return 'Анкета уже завершена.'
      case 429:
        return 'Слишком много сообщений. Подождите немного.'
      case 503:
        return 'Сервис временно недоступен. Попробуйте позже.'
    }
    if (error.status >= 500) return 'Ошибка сервера. Попробуйте позже.'
    if (error.data && typeof error.data === 'object' && 'detail' in error.data) {
      return String((error.data as { detail: string }).detail)
    }
    return error.message
  }
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return 'Не удалось отправить сообщение. Проверьте соединение.'
  }
  if (error instanceof Error) return error.message
  return 'Неизвестная ошибка'
}

class ApiClient {
  private baseUrl = '/api'

  private async request<T>(path: string, options?: RequestInit): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    })
    
    if (!res.ok) {
      const data = await res.json().catch(() => undefined)
      throw new ApiRequestError(res.status, res.statusText, data)
    }
    
    if (res.status === 204) return undefined as T
    return res.json()
  }

  get<T>(path: string) {
    return this.request<T>(path)
  }

  post<T>(path: string, body?: unknown) {
    return this.request<T>(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined })
  }

  put<T>(path: string, body: unknown) {
    return this.request<T>(path, { method: 'PUT', body: JSON.stringify(body) })
  }

  delete<T>(path: string) {
    return this.request<T>(path, { method: 'DELETE' })
  }
}

export const api = new ApiClient()
