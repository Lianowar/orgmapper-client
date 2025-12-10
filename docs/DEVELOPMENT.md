# Документация для разработчика

## Архитектура

### Стек технологий
- **React 19** — UI библиотека
- **TypeScript** — типизация
- **Vite** — сборщик
- **Mantine 8** — UI компоненты
- **TanStack Query** — управление серверным состоянием
- **React Router 7** — маршрутизация
- **MSW** — моки для разработки

### Структура проекта

```
src/
├── api/                    # Слой работы с API
│   ├── client.ts           # HTTP клиент, обработка ошибок
│   ├── types.ts            # TypeScript типы для API
│   ├── hooks/              # React Query хуки
│   │   ├── useSession.ts   # Публичные хуки (чат)
│   │   ├── useEmployees.ts # Хуки сотрудников
│   │   ├── useQuestions.ts # Хуки вопросов
│   │   ├── usePrompts.ts   # Хуки промптов
│   │   └── useBudget.ts    # Хук бюджета
│   └── index.ts
├── components/             # Переиспользуемые компоненты
│   ├── AdminLayout.tsx     # Layout админки с сайдбаром
│   ├── PublicLayout.tsx    # Layout публичных страниц
│   ├── ConfirmDialog.tsx   # Диалог подтверждения
│   ├── ErrorBoundary.tsx   # Обработка ошибок React
│   ├── ErrorMessage.tsx    # Отображение ошибок
│   ├── LoadingSkeleton.tsx # Скелетон загрузки
│   ├── BudgetWidget.tsx    # Виджет бюджета
│   └── NetworkStatus.tsx   # Индикатор сети
├── features/               # Функциональные модули
│   ├── chat/               # Чат для сотрудников
│   ├── employees/          # Управление сотрудниками
│   ├── sessions/           # Просмотр сессий
│   ├── questions/          # Управление вопросами
│   ├── prompts/            # Управление промптами
│   └── dashboard/          # Дашборды (placeholder)
├── hooks/                  # Общие хуки
│   ├── useNotification.ts  # Уведомления
│   └── useNetworkStatus.ts # Статус сети
├── mocks/                  # MSW моки
│   ├── browser.ts          # Настройка MSW
│   ├── handlers.ts         # Обработчики запросов
│   └── data.ts             # Тестовые данные
└── utils/                  # Утилиты
```

## Разработка

### Запуск

```bash
# С моками (без бэкенда)
npm run dev:mock

# С реальным бэкендом (должен быть на localhost:8000)
npm run dev
```

### Добавление нового API эндпоинта

1. Добавить типы в `src/api/types.ts`:
```typescript
export interface NewEntity {
  id: number
  name: string
}
```

2. Создать хук в `src/api/hooks/`:
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../client'
import type { NewEntity } from '../types'

export function useNewEntities() {
  return useQuery({
    queryKey: ['newEntities'],
    queryFn: () => api.get<NewEntity[]>('/new-entities'),
  })
}

export function useCreateNewEntity() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<NewEntity>) => 
      api.post<NewEntity>('/new-entities', data),
    onSuccess: () => 
      queryClient.invalidateQueries({ queryKey: ['newEntities'] }),
  })
}
```

3. Экспортировать из `src/api/hooks/index.ts`

4. Добавить мок в `src/mocks/handlers.ts` (для разработки)

### Добавление новой страницы

1. Создать компонент в `src/features/<module>/`:
```typescript
export default function NewPage() {
  return <div>New Page</div>
}
```

2. Добавить роут в `src/App.tsx`:
```typescript
<Route path="new-page" element={<NewPage />} />
```

### Работа с формами

Используем контролируемые компоненты с useState:

```typescript
const [form, setForm] = useState({ name: '', email: '' })

<TextInput
  value={form.name}
  onChange={(e) => setForm({ ...form, name: e.target.value })}
/>
```

### Уведомления

```typescript
import { useNotification } from '../../hooks/useNotification'

const notification = useNotification()
notification.success('Успешно сохранено')
notification.error('Произошла ошибка')
```

### Диалоги подтверждения

```typescript
import ConfirmDialog from '../../components/ConfirmDialog'

const [open, setOpen] = useState(false)

<ConfirmDialog
  opened={open}
  onClose={() => setOpen(false)}
  onConfirm={handleDelete}
  title="Удалить?"
  message="Это действие нельзя отменить."
  confirmLabel="Удалить"
  loading={isDeleting}
/>
```

## API клиент

### Обработка ошибок

`ApiRequestError` содержит:
- `status` — HTTP статус
- `statusText` — текст статуса
- `data` — тело ответа (если есть)

`getErrorMessage(error)` возвращает человекочитаемое сообщение:
- 404/410 → "Ссылка недействительна..."
- 429 → "Слишком много сообщений..."
- 503 → "Сервис временно недоступен..."
- Network error → "Не удалось отправить..."

### React Query

Настройки по умолчанию:
- `retry: 1` — одна повторная попытка
- `staleTime: 30000` — данные считаются свежими 30 сек

## Стилизация

### CSS модули

Для компонент-специфичных стилей:
```typescript
import styles from './Component.module.css'
<div className={styles.container}>
```

### Mantine

Используем компоненты Mantine с пропсами:
```typescript
<Button variant="light" color="red" size="sm">
<Text c="dimmed" size="xs">
<Paper p="md" withBorder>
```

### CSS переменные

Определены в `src/index.css`:
```css
:root {
  --chat-max-width: 800px;
  --message-user-bg: #e3f2fd;
  --message-assistant-bg: #f5f5f5;
}
```

## Тестирование с моками

### Тестовые данные

В `src/mocks/data.ts` определены:
- `mockEmployees` — тестовые сотрудники
- `mockSessions` — тестовые сессии
- `mockQuestions` — тестовые вопросы
- `mockPrompts` — тестовые промпты
- `mockBudget` — тестовый бюджет

### Тестовые ссылки

- Чат: http://localhost:5173/i/abc123
- Админка: http://localhost:5173/admin

## Сборка

```bash
npm run build
```

Результат в `dist/`. Требуется веб-сервер с SPA fallback.

## Линтинг

```bash
npm run lint
```
