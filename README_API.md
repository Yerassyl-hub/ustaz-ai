# Интеграция с бэкендом TeacherAssist

## Настройка

1. **Создайте файл `.env.local`** в корне проекта:
```env
VITE_API_URL=http://localhost:8000/api/v1
```

2. **Убедитесь, что бэкенд запущен** на `http://localhost:8000`

3. **Проверьте CORS настройки** в бэкенде (должен разрешать `http://localhost:5173`)

## Использование API

### Аутентификация

Приложение теперь использует реальную аутентификацию через бэкенд:

- **Регистрация**: Автоматически при первом входе (если нужно)
- **Вход**: Через email и пароль
- **Токены**: Сохраняются в localStorage
- **Автоматический выход**: При истечении токена

### API Клиент

Используйте `apiClient` из `src/api/client.ts`:

```typescript
import { apiClient } from '../api/client'

// Получить студентов
const students = await apiClient.getStudents()

// Получить документы
const documents = await apiClient.getDocuments()

// Создать оценку
await apiClient.createGrade({
  student_id: '123',
  subject: 'Математика',
  grade: 5,
  date: '2024-12-11'
})
```

### Контекст аутентификации

Используйте `useAuth` hook:

```typescript
import { useAuth } from '../contexts/AuthContext'

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth()
  
  // ...
}
```

## Защищенные маршруты

Все страницы кроме Login защищены и требуют аутентификации. При отсутствии токена пользователь автоматически перенаправляется на страницу входа.

## Документация API

Полная документация API доступна после запуска бэкенда:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`


