# OrgMapper Client

Фронтенд для системы OrgMapper — инструмента для проведения структурированных интервью с сотрудниками.

## Технологии

- React 19 + TypeScript
- Vite (rolldown)
- Mantine UI
- TanStack Query (React Query)
- React Router
- MSW (Mock Service Worker) для разработки

## Быстрый старт

```bash
# Установка зависимостей
npm install

# Запуск с моками (без бэкенда)
npm run dev:mock

# Запуск с реальным бэкендом
npm run dev
```

Приложение будет доступно на http://localhost:5173

## Скрипты

| Команда | Описание |
|---------|----------|
| `npm run dev` | Запуск dev-сервера |
| `npm run dev:mock` | Запуск с mock API |
| `npm run build` | Сборка для production |
| `npm run preview` | Просмотр production сборки |
| `npm run lint` | Проверка ESLint |

## Структура проекта

```
src/
├── api/                 # API клиент и хуки
│   ├── client.ts        # HTTP клиент
│   ├── types.ts         # TypeScript типы
│   └── hooks/           # React Query хуки
├── components/          # Общие компоненты
│   ├── AdminLayout.tsx  # Layout админки
│   ├── PublicLayout.tsx # Layout публичных страниц
│   ├── ConfirmDialog.tsx
│   └── ...
├── features/            # Функциональные модули
│   ├── chat/            # Чат для сотрудников
│   ├── employees/       # Управление сотрудниками
│   ├── sessions/        # Просмотр сессий
│   ├── questions/       # Управление вопросами
│   ├── prompts/         # Управление промптами
│   └── dashboard/       # Дашборды (placeholder)
├── hooks/               # Общие хуки
├── mocks/               # MSW моки для разработки
└── utils/               # Утилиты
```

## Роуты

### Публичные
- `/i/:token` — Страница чата для сотрудника (по invite-ссылке)

### Админка
- `/admin/employees` — Список сотрудников
- `/admin/employees/new` — Создание сотрудника
- `/admin/employees/:id` — Карточка сотрудника
- `/admin/employees/:id/sessions/:sessionId` — Просмотр сессии
- `/admin/questions` — Управление вопросами
- `/admin/prompts` — Управление промптами
- `/admin/dashboard` — Дашборды

## Разработка с моками

При запуске `npm run dev:mock` включается MSW, который перехватывает запросы к API и возвращает тестовые данные.

Тестовые данные находятся в `src/mocks/data.ts`, обработчики — в `src/mocks/handlers.ts`.

Для тестирования чата используйте ссылку: http://localhost:5173/i/abc123

## Подключение к бэкенду

Бэкенд должен быть запущен на `http://localhost:8000`. Vite проксирует запросы `/api/*` на бэкенд.

Конфигурация прокси в `vite.config.ts`:

```ts
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8000',
      changeOrigin: true,
    },
  },
}
```

## API эндпоинты

### Сессии (публичные)
- `GET /api/sessions/by-token/:token` — Получить сессию по токену
- `POST /api/sessions/:id/messages` — Отправить сообщение

### Сотрудники
- `GET /api/employees` — Список
- `POST /api/employees` — Создать
- `GET /api/employees/:id` — Получить
- `PUT /api/employees/:id` — Обновить
- `DELETE /api/employees/:id` — Удалить
- `POST /api/employees/:id/invite` — Создать приглашение
- `DELETE /api/employees/:id/invite` — Отозвать приглашение
- `GET /api/employees/:id/sessions` — Сессии сотрудника

### Вопросы
- `GET /api/questions` — Список
- `POST /api/questions` — Создать
- `PUT /api/questions/:id` — Обновить
- `DELETE /api/questions/:id` — Удалить

### Промпты
- `GET /api/prompts?type=chat|extractor|summary` — Список
- `POST /api/prompts` — Создать новую версию
- `POST /api/prompts/:id/activate` — Активировать версию

### Прочее
- `GET /api/budget` — Информация о бюджете
- `GET /api/admin/sessions/:id` — Детали сессии (админ)

## Сборка для production

```bash
npm run build
```

Собранные файлы будут в папке `dist/`. Для раздачи нужен веб-сервер с поддержкой SPA fallback.

## Переменные окружения

| Переменная | Описание |
|------------|----------|
| `VITE_MOCK` | `true` для включения MSW моков |
