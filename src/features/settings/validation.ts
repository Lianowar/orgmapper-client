export function validateTemperature(value: unknown): string | null {
  const num = Number(value)
  if (isNaN(num) || num < 0 || num > 1) {
    return 'Значение должно быть от 0.0 до 1.0'
  }
  return null
}

export function validatePositiveInt(value: unknown): string | null {
  const num = Number(value)
  if (isNaN(num) || !Number.isInteger(num) || num <= 0) {
    return 'Значение должно быть положительным целым числом'
  }
  return null
}

export function validateReasoningEffort(value: unknown): string | null {
  if (!['low', 'medium', 'high'].includes(String(value))) {
    return 'Допустимые значения: low, medium, high'
  }
  return null
}

export function validateProvider(value: unknown): string | null {
  if (!['openai', 'anthropic', 'mock'].includes(String(value))) {
    return 'Допустимые значения: openai, anthropic, mock'
  }
  return null
}
