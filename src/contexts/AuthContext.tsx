import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { apiClient } from '../api/client'

interface User {
  email: string
  full_name: string
  phone?: string
  school_id?: string
  class_id?: string
  role?: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: {
    email: string
    password: string
    full_name: string
    phone?: string
    school_id?: string
    class_id?: string
  }) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Проверяем, есть ли сохраненный токен
    const token = apiClient.getToken()
    if (token) {
      // Можно загрузить данные пользователя
      // Пока просто устанавливаем, что пользователь авторизован
      const savedUser = localStorage.getItem('user')
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser))
        } catch (e) {
          console.error('Error parsing user data:', e)
        }
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const data = await apiClient.login(email, password)
      // Сохраняем базовую информацию о пользователе
      const userData: User = {
        email,
        full_name: email.split('@')[0], // Временное решение, лучше получать с бэкенда
      }
      setUser(userData)
      localStorage.setItem('user', JSON.stringify(userData))
    } catch (error: any) {
      console.error('Login error:', error)
      
      // ВСЕГДА переключаемся в demo режим при любой ошибке бэкенда
      console.warn('Бэкенд недоступен или возвращает ошибку, используем demo режим')
      // Demo режим - сохраняем локально
      const userData: User = {
        email,
        full_name: email.split('@')[0] || 'Мұғалім',
      }
      setUser(userData)
      localStorage.setItem('user', JSON.stringify(userData))
      // Устанавливаем фейковый токен для demo режима
      apiClient.setToken('demo-token')
      // НЕ пробрасываем ошибку - просто переключаемся в demo режим
    }
  }

  const register = async (data: {
    email: string
    password: string
    full_name: string
    phone?: string
    school_id?: string
    class_id?: string
  }) => {
    try {
      await apiClient.register(data)
      const userData: User = {
        email: data.email,
        full_name: data.full_name,
        phone: data.phone,
        school_id: data.school_id,
        class_id: data.class_id,
      }
      setUser(userData)
      localStorage.setItem('user', JSON.stringify(userData))
    } catch (error: any) {
      console.error('Register error:', error)
      
      // Если ошибка регистрации, все равно создаем пользователя в demo режиме
      console.warn('Регистрация через бэкенд не удалась, используем demo режим')
      const userData: User = {
        email: data.email,
        full_name: data.full_name,
        phone: data.phone,
        school_id: data.school_id,
        class_id: data.class_id,
      }
      setUser(userData)
      localStorage.setItem('user', JSON.stringify(userData))
      apiClient.setToken('demo-token')
      // НЕ пробрасываем ошибку - просто переключаемся в demo режим
    }
  }

  const logout = async () => {
    try {
      await apiClient.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setUser(null)
      localStorage.removeItem('user')
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

