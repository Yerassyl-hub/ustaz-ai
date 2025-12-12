# API Запросы для тестирования бэкенда

## Базовый URL
- **Development (через прокси)**: `http://localhost:5173/api/v1`
- **Production**: `http://localhost:8000/api/v1` (или ваш production URL)

## Аутентификация
Все запросы (кроме login/register) требуют JWT токен в заголовке:
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

---

## 1. Получить ВСЕ классы (без пагинации)

### Запрос:
```bash
GET /api/v1/classes?school_id=YOUR_SCHOOL_ID
```

### С токеном (curl):
```bash
curl -X GET "http://localhost:8000/api/v1/classes?school_id=YOUR_SCHOOL_ID" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json"
```

### Ожидаемый ответ:
```json
{
  "items": [
    {
      "id": "1",
      "name": "1А",
      "nameKz": "1А",
      "school_id": "school_id"
    },
    {
      "id": "2",
      "name": "1Ә",
      "nameKz": "1Ә",
      "school_id": "school_id"
    }
    // ... должно быть 66 классов
  ],
  "total": 66,
  "count": 66
}
```

### Или если API возвращает массив напрямую:
```json
[
  {
    "id": "1",
    "name": "1А",
    "nameKz": "1А"
  },
  // ... 66 классов
]
```

---

## 2. Получить ВСЕ классы (с пагинацией)

### Запрос первой страницы:
```bash
GET /api/v1/classes?school_id=YOUR_SCHOOL_ID&page=1&limit=100
```

### С токеном (curl):
```bash
curl -X GET "http://localhost:8000/api/v1/classes?school_id=YOUR_SCHOOL_ID&page=1&limit=100" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json"
```

---

## 3. Получить ВСЕ учителя (без пагинации)

### Запрос:
```bash
GET /api/v1/teachers?school_id=YOUR_SCHOOL_ID
```

### С токеном (curl):
```bash
curl -X GET "http://localhost:8000/api/v1/teachers?school_id=YOUR_SCHOOL_ID" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json"
```

### Ожидаемый ответ:
```json
{
  "items": [
    {
      "id": "1",
      "full_name": "Иванов Иван Иванович",
      "name": "Иванов И.И.",
      "nameKz": "Иванов И.И.",
      "email": "teacher1@example.com",
      "school_id": "school_id"
    }
    // ... должно быть 66 учителей
  ],
  "total": 66,
  "count": 66
}
```

---

## 4. Получить ВСЕ учителя (с пагинацией)

### Запрос:
```bash
GET /api/v1/teachers?school_id=YOUR_SCHOOL_ID&page=1&limit=100
```

### С токеном (curl):
```bash
curl -X GET "http://localhost:8000/api/v1/teachers?school_id=YOUR_SCHOOL_ID&page=1&limit=100" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json"
```

---

## 5. Получить студентов по классу

### Запрос:
```bash
GET /api/v1/students?class_id=CLASS_ID
```

### С токеном (curl):
```bash
curl -X GET "http://localhost:8000/api/v1/students?class_id=CLASS_ID" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json"
```

### Ожидаемый ответ:
```json
{
  "items": [
    {
      "id": "1",
      "full_name": "Алиев Али Алиевич",
      "name": "Алиев А.А.",
      "nameKz": "Әлиев Ә.Ә.",
      "class_id": "CLASS_ID"
    }
    // ... должно быть 30 студентов
  ],
  "total": 30,
  "count": 30
}
```

---

## 6. Получить все школы

### Запрос:
```bash
GET /api/v1/schools
```

### С токеном (curl):
```bash
curl -X GET "http://localhost:8000/api/v1/schools" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json"
```

---

## 7. Логин (для получения токена)

### Запрос:
```bash
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "teacher@example.com",
  "password": "password123"
}
```

### curl:
```bash
curl -X POST "http://localhost:8000/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teacher@example.com",
    "password": "password123"
  }'
```

### Ответ:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

---

## JavaScript примеры (для консоли браузера)

### После логина, получить токен из localStorage:
```javascript
const token = localStorage.getItem('access_token');
const schoolId = 'YOUR_SCHOOL_ID'; // ID школы из вашего аккаунта

// Получить все классы
fetch(`/api/v1/classes?school_id=${schoolId}`, {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
  .then(res => res.json())
  .then(data => {
    console.log('Классы:', data);
    console.log('Количество:', Array.isArray(data) ? data.length : (data.items?.length || data.data?.length || 0));
  });

// Получить всех учителей
fetch(`/api/v1/teachers?school_id=${schoolId}`, {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
  .then(res => res.json())
  .then(data => {
    console.log('Учителя:', data);
    console.log('Количество:', Array.isArray(data) ? data.length : (data.items?.length || data.data?.length || 0));
  });

// Получить студентов для класса
const classId = 'CLASS_ID';
fetch(`/api/v1/students?class_id=${classId}`, {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
  .then(res => res.json())
  .then(data => {
    console.log('Студенты:', data);
    console.log('Количество:', Array.isArray(data) ? data.length : (data.items?.length || data.data?.length || 0));
  });
```

---

## Проверка через Postman или Insomnia

### Настройки:
1. **Method**: GET
2. **URL**: `http://localhost:8000/api/v1/classes?school_id=YOUR_SCHOOL_ID`
3. **Headers**:
   - `Authorization`: `Bearer YOUR_ACCESS_TOKEN`
   - `Content-Type`: `application/json`

### Для учителей:
- **URL**: `http://localhost:8000/api/v1/teachers?school_id=YOUR_SCHOOL_ID`

### Для студентов:
- **URL**: `http://localhost:8000/api/v1/students?class_id=CLASS_ID`

---

## Важные моменты:

1. **Проверьте формат ответа**:
   - Массив напрямую: `[{...}, {...}]`
   - Объект с items: `{ items: [...], total: 66 }`
   - Объект с data: `{ data: [...], count: 66 }`

2. **Проверьте пагинацию**:
   - Если API поддерживает пагинацию, используйте `?page=1&limit=100`
   - Если нет, запрос без параметров должен вернуть все данные

3. **Проверьте фильтрацию**:
   - `?school_id=ID` - фильтр по школе
   - `?class_id=ID` - фильтр по классу

4. **Ожидаемые результаты**:
   - **Классы**: 66 (11 классов × 6 букв: А, Ә, Б, С, Д, Г и т.д.)
   - **Учителя**: 66
   - **Студенты в каждом классе**: 30

---

## Быстрая проверка через браузер (после логина):

Откройте консоль браузера (F12) на странице сайта и выполните:

```javascript
// Получить токен и school_id из localStorage
const token = localStorage.getItem('access_token');
const user = JSON.parse(localStorage.getItem('user') || '{}');
const schoolId = user.school_id;

console.log('Token:', token);
console.log('School ID:', schoolId);

// Проверить классы
fetch(`/api/v1/classes?school_id=${schoolId}`, {
  headers: { 'Authorization': `Bearer ${token}` }
})
  .then(r => r.json())
  .then(d => {
    const count = Array.isArray(d) ? d.length : (d.items?.length || d.data?.length || 0);
    console.log(`✅ Классов загружено: ${count}`);
    console.log('Данные:', d);
  });

// Проверить учителей
fetch(`/api/v1/teachers?school_id=${schoolId}`, {
  headers: { 'Authorization': `Bearer ${token}` }
})
  .then(r => r.json())
  .then(d => {
    const count = Array.isArray(d) ? d.length : (d.items?.length || d.data?.length || 0);
    console.log(`✅ Учителей загружено: ${count}`);
    console.log('Данные:', d);
  });
```

