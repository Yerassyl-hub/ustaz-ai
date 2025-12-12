// API клиент для работы с бэкендом TeacherAssist

// Используем переменную окружения или production URL по умолчанию
// В dev режиме можно использовать прокси через Vite или прямой URL
const API_BASE_URL = import.meta.env.VITE_API_URL || (
  import.meta.env.DEV 
    ? '/api/v1'  // Прокси через Vite (для локального бэкенда)
    : 'https://backof.onrender.com/api/v1'  // Production URL по умолчанию
)

interface LoginResponse {
  access_token: string
  refresh_token: string
  token_type: string
}

interface RegisterData {
  email: string
  password: string
  full_name: string
  phone?: string
  school_id?: string
  class_id?: string
  role?: string
}

class ApiClient {
  private baseURL: string
  private token: string | null = null

  constructor(baseURL: string) {
    this.baseURL = baseURL
    // Загрузить токен из localStorage
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('access_token')
    }
  }

  setToken(token: string | null) {
    this.token = token
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('access_token', token)
        localStorage.setItem('refresh_token', localStorage.getItem('refresh_token') || '')
      } else {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
      }
    }
  }

  getToken(): string | null {
    return this.token
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    }

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      })

      if (!response.ok) {
        if (response.status === 401) {
          // Токен истек, очищаем и перенаправляем на вход
          this.setToken(null)
          if (typeof window !== 'undefined') {
            window.location.href = '/login'
          }
        }
        
        let errorMessage = `HTTP error! status: ${response.status}`
        let errorDetails: any = {}
        
        try {
          const error = await response.json()
          errorDetails = error
          
          // Обработка разных форматов ошибок
          if (error.detail) {
            if (Array.isArray(error.detail)) {
              // Валидационные ошибки FastAPI
              errorMessage = error.detail.map((e: any) => 
                `${e.loc?.join('.')}: ${e.msg}`
              ).join(', ')
            } else if (typeof error.detail === 'string') {
              errorMessage = error.detail
            } else {
              errorMessage = JSON.stringify(error.detail)
            }
          } else if (error.message) {
            errorMessage = error.message
          } else {
            errorMessage = JSON.stringify(error)
          }
        } catch (e) {
          // Если не удалось распарсить JSON, используем статус
          if (response.status === 500) {
            errorMessage = 'Бэкенд серверде қате пайда болды (500). Demo режимге ауысамыз.'
          } else if (response.status === 404) {
            errorMessage = 'Эндпоинт табылмады (404)'
          } else if (response.status === 403) {
            errorMessage = 'Доступ запрещен (403)'
          } else if (response.status === 422) {
            errorMessage = 'Деректер дұрыс емес (422). Барлық өрістерді тексеріңіз.'
          }
        }
        
        const error = new Error(errorMessage)
        ;(error as any).status = response.status
        ;(error as any).details = errorDetails
        throw error
      }

      return response.json()
    } catch (error: any) {
      console.error('API request error:', error)
      
      // Если это CORS ошибка или бэкенд недоступен, пробрасываем ошибку
      if (error.message?.includes('Failed to fetch') || error.message?.includes('CORS')) {
        throw new Error('Бэкенд серверге қол жеткізу мүмкін емес. Бэкендтің іске қосылғанын тексеріңіз.')
      }
      
      throw error
    }
  }

  // Аутентификация
  async login(email: string, password: string): Promise<LoginResponse> {
    const data = await this.request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    this.setToken(data.access_token)
    if (typeof window !== 'undefined') {
      localStorage.setItem('refresh_token', data.refresh_token)
    }
    return data
  }

  async register(userData: RegisterData): Promise<LoginResponse> {
    const data = await this.request<LoginResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ ...userData, role: userData.role || 'teacher' }),
    })
    this.setToken(data.access_token)
    if (typeof window !== 'undefined') {
      localStorage.setItem('refresh_token', data.refresh_token)
    }
    return data
  }

  async refreshToken(): Promise<LoginResponse> {
    const refreshToken = typeof window !== 'undefined' 
      ? localStorage.getItem('refresh_token') 
      : null
    
    if (!refreshToken) {
      throw new Error('No refresh token available')
    }

    const data = await this.request<LoginResponse>('/auth/refresh-token', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    })
    this.setToken(data.access_token)
    if (typeof window !== 'undefined') {
      localStorage.setItem('refresh_token', data.refresh_token)
    }
    return data
  }

  async logout(): Promise<void> {
    try {
      await this.request('/auth/logout', { method: 'POST' })
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      this.setToken(null)
      if (typeof window !== 'undefined') {
        localStorage.removeItem('refresh_token')
      }
    }
  }

  // Студенты
  async getStudents(classId?: string) {
    try {
      const params = classId ? `?class_id=${classId}` : ''
      const data = await this.request(`/students${params}`)
      
      // Если данные в формате { items: [...] } или { data: [...] }
      if (data && typeof data === 'object' && !Array.isArray(data)) {
        const items = (data as any).items || (data as any).data || []
        console.log(`Загружено студентов для класса ${classId}: ${items.length}`)
        return items
      }
      
      const students = Array.isArray(data) ? data : []
      console.log(`Загружено студентов для класса ${classId}: ${students.length}`)
      return students
    } catch (error) {
      console.error('getStudents error:', error)
      return []
    }
  }

  async getStudent(id: string) {
    return this.request(`/students/${id}`)
  }

  // Документы
  async getDocuments() {
    return this.request('/documents')
  }

  async getDocument(id: string) {
    return this.request(`/documents/${id}`)
  }

  async createDocument(documentData: any) {
    return this.request('/documents', {
      method: 'POST',
      body: JSON.stringify(documentData),
    })
  }

  // Оценки
  async getGrades(studentId?: string) {
    const params = studentId ? `?student_id=${studentId}` : ''
    return this.request(`/grades${params}`)
  }

  async createGrade(gradeData: any) {
    return this.request('/grades', {
      method: 'POST',
      body: JSON.stringify(gradeData),
    })
  }

  // Домашние задания
  async getHomework() {
    return this.request('/homework')
  }

  async createHomework(homeworkData: any) {
    return this.request('/homework', {
      method: 'POST',
      body: JSON.stringify(homeworkData),
    })
  }

  // Посещаемость
  async getAttendance() {
    return this.request('/attendance')
  }

  async createAttendance(attendanceData: any) {
    return this.request('/attendance', {
      method: 'POST',
      body: JSON.stringify(attendanceData),
    })
  }

  // Школы
  async getSchools() {
    try {
      const data = await this.request('/schools')
      // Если данные в формате { items: [...] } или { data: [...] }
      if (data && typeof data === 'object' && !Array.isArray(data)) {
        return (data as any).items || (data as any).data || []
      }
      return Array.isArray(data) ? data : []
    } catch (error) {
      console.error('getSchools error:', error)
      return []
    }
  }

  async getSchool(id: string) {
    return this.request(`/schools/${id}`)
  }

  // Классы
  async getClasses(schoolId?: string) {
    try {
      // Сначала пробуем загрузить без пагинации
      const params = schoolId ? `?school_id=${schoolId}` : ''
      let data = await this.request(`/classes${params}`)
      
      // Если данные в формате { items: [...] } или { data: [...] }
      let allClasses: any[] = []
      if (data && typeof data === 'object' && !Array.isArray(data)) {
        allClasses = (data as any).items || (data as any).data || []
        const total = (data as any).total || (data as any).count || allClasses.length
        
        // Если есть пагинация и не все данные загружены
        if (total > allClasses.length && allClasses.length > 0) {
          console.log(`Загружено ${allClasses.length} из ${total} классов, загружаем остальные...`)
          
          // Загружаем остальные страницы
          let page = 2
          const pageSize = 100
          let hasMore = true
          
          while (hasMore && allClasses.length < total) {
            const pageParams = schoolId 
              ? `?school_id=${schoolId}&page=${page}&limit=${pageSize}` 
              : `?page=${page}&limit=${pageSize}`
            
            try {
              const pageData = await this.request(`/classes${pageParams}`)
              let pageItems: any[] = []
              
              if (pageData && typeof pageData === 'object' && !Array.isArray(pageData)) {
                pageItems = (pageData as any).items || (pageData as any).data || []
              } else if (Array.isArray(pageData)) {
                pageItems = pageData
              }
              
              if (pageItems.length > 0) {
                allClasses = [...allClasses, ...pageItems]
                page++
                hasMore = pageItems.length === pageSize && allClasses.length < total
              } else {
                hasMore = false
              }
              
              if (page > 100) {
                console.warn('Превышен лимит страниц при загрузке классов')
                break
              }
            } catch (pageError) {
              console.warn('Ошибка загрузки страницы классов:', pageError)
              hasMore = false
            }
          }
        }
      } else if (Array.isArray(data)) {
        allClasses = data
      }

      console.log(`✅ Загружено всего классов: ${allClasses.length}`)
      if (allClasses.length > 0) {
        console.log('Примеры классов:', allClasses.slice(0, 10).map(c => ({
          id: c.id,
          name: c.name || c.nameKz || 'N/A'
        })))
      }
      return allClasses
    } catch (error) {
      console.error('getClasses error:', error)
      return []
    }
  }

  async getClass(id: string) {
    return this.request(`/classes/${id}`)
  }

  // Учителя
  async getTeachers(schoolId?: string) {
    try {
      // Сначала пробуем загрузить без пагинации
      const params = schoolId ? `?school_id=${schoolId}` : ''
      let data = await this.request(`/teachers${params}`)
      
      // Если данные в формате { items: [...] } или { data: [...] }
      let allTeachers: any[] = []
      if (data && typeof data === 'object' && !Array.isArray(data)) {
        allTeachers = (data as any).items || (data as any).data || []
        const total = (data as any).total || (data as any).count || allTeachers.length
        
        // Если есть пагинация и не все данные загружены
        if (total > allTeachers.length && allTeachers.length > 0) {
          console.log(`Загружено ${allTeachers.length} из ${total} учителей, загружаем остальные...`)
          
          // Загружаем остальные страницы
          let page = 2
          const pageSize = 100
          let hasMore = true
          
          while (hasMore && allTeachers.length < total) {
            const pageParams = schoolId 
              ? `?school_id=${schoolId}&page=${page}&limit=${pageSize}` 
              : `?page=${page}&limit=${pageSize}`
            
            try {
              const pageData = await this.request(`/teachers${pageParams}`)
              let pageItems: any[] = []
              
              if (pageData && typeof pageData === 'object' && !Array.isArray(pageData)) {
                pageItems = (pageData as any).items || (pageData as any).data || []
              } else if (Array.isArray(pageData)) {
                pageItems = pageData
              }
              
              if (pageItems.length > 0) {
                allTeachers = [...allTeachers, ...pageItems]
                page++
                hasMore = pageItems.length === pageSize && allTeachers.length < total
              } else {
                hasMore = false
              }
              
              if (page > 100) {
                console.warn('Превышен лимит страниц при загрузке учителей')
                break
              }
            } catch (pageError) {
              console.warn('Ошибка загрузки страницы учителей:', pageError)
              hasMore = false
            }
          }
        }
      } else if (Array.isArray(data)) {
        allTeachers = data
      }

      console.log(`✅ Загружено всего учителей: ${allTeachers.length}`)
      if (allTeachers.length > 0) {
        console.log('Примеры учителей:', allTeachers.slice(0, 10).map(t => ({
          id: t.id,
          name: t.name || t.nameKz || t.full_name || 'N/A'
        })))
      }
      return allTeachers
    } catch (error) {
      console.error('getTeachers error:', error)
      return []
    }
  }

  async getTeacher(id: string) {
    return this.request(`/teachers/${id}`)
  }

  // Предметы
  async getSubjects() {
    try {
      const data = await this.request('/subjects')
      // Если данные в формате { items: [...] } или { data: [...] }
      if (data && typeof data === 'object' && !Array.isArray(data)) {
        return (data as any).items || (data as any).data || []
      }
      return Array.isArray(data) ? data : []
    } catch (error) {
      console.error('getSubjects error:', error)
      return []
    }
  }

  // Проверка здоровья API
  async healthCheck() {
    try {
      const response = await fetch(`${this.baseURL.replace('/api/v1', '')}/health`)
      return response.json()
    } catch (error) {
      console.error('Health check error:', error)
      return { status: 'error' }
    }
  }
}

export const apiClient = new ApiClient(API_BASE_URL)

