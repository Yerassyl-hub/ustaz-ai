import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiMic, FiMessageSquare, FiFolder, FiCalendar, FiMessageCircle } from 'react-icons/fi'
import { storage } from '../utils/storage'
import type { PDFDocument } from '../utils/storage'
import { useAuth } from '../contexts/AuthContext'

function Dashboard() {
  const navigate = useNavigate()
  const { user, isAuthenticated, isLoading, logout: authLogout } = useAuth()
  const [pdfs, setPdfs] = useState<PDFDocument[]>([])

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login')
      return
    }
    setPdfs(storage.getPDFs())
  }, [isAuthenticated, isLoading, navigate])

  const quickActions = [
    {
      id: 'voice',
      title: 'Голосовой AI агент',
      icon: FiMic,
      color: 'bg-primary',
      onClick: () => navigate('/voice-report'),
    },
    {
      id: 'whatsapp',
      title: 'Шаблоны WhatsApp',
      icon: FiMessageSquare,
      color: 'bg-primaryGreen',
      onClick: () => navigate('/message-builder'),
    },
    {
      id: 'chat',
      title: 'Чат-бот',
      icon: FiMessageCircle,
      color: 'bg-blue-600',
      onClick: () => {
        // Открываем чат-бот (n8n создает виджет в правом нижнем углу)
        const chatWidget = document.querySelector('[data-n8n-chat]') as HTMLElement
        if (chatWidget) {
          chatWidget.click()
        } else {
          // Если виджет еще не загрузился, показываем подсказку
          alert('Чат-бот загружается... Пожалуйста, проверьте правый нижний угол страницы через несколько секунд.')
        }
      },
    },
    {
      id: 'documents',
      title: 'Мои документы',
      icon: FiFolder,
      color: 'bg-purple-600',
      onClick: () => navigate('/my-documents'),
    },
    {
      id: 'schedule',
      title: 'Сабақ кестесі',
      icon: FiCalendar,
      color: 'bg-orange-500',
      onClick: () => navigate('/schedule'),
    },
  ]

  const completedTasks = pdfs.length
  const totalTasks = 15

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Жүктелуде...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {(user?.full_name || user?.email || 'М').charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  Қайырлы күн, {user?.full_name || user?.email?.split('@')[0] || 'Мұғалім'}!
                </h1>
                <p className="text-gray-500">{user?.email || ''}</p>
              </div>
            </div>
            <button
              onClick={async () => {
                await authLogout()
                navigate('/login')
              }}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition"
            >
              Шығу
            </button>
          </div>
        </div>

        {/* Progress Widget */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Прогресс</h2>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Есеп тапсырылды</span>
                <span>{completedTasks}/{totalTasks}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-primary h-3 rounded-full transition-all duration-300"
                  style={{ width: `${(completedTasks / totalTasks) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Жылдам әрекеттер</h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            {quickActions.map((action) => {
              const Icon = action.icon
              return (
                <button
                  key={action.id}
                  onClick={action.onClick}
                  className={`${action.color} text-white rounded-xl p-6 hover:opacity-90 transition transform hover:scale-105 shadow-lg`}
                >
                  <Icon className="text-4xl mb-3" />
                  <p className="font-semibold text-lg">{action.title}</p>
                </button>
              )
            })}
          </div>
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg mt-4">
            <p className="text-sm text-blue-800 mb-2">
              <strong>💬 Чат-бот:</strong> Плавающая кнопка чата находится в <strong>правом нижнем углу</strong> страницы.
            </p>
            <p className="text-xs text-blue-700">
              Если чат-бот не виден, обновите страницу (F5) и подождите несколько секунд. 
              После открытия чата вы увидите поле для ввода текста внизу окна чата.
            </p>
          </div>
        </div>

        {/* Top 10 Teacher Documents */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Жиі қолданылатын құжаттар</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {[
              { id: 'ktp', name: 'КТП', fullName: 'Календарно-тематическое планирование', icon: '📅' },
              { id: 'lesson-plan', name: 'Поурочный план', fullName: 'Технологическая карта урока', icon: '📝' },
              { id: 'quality-report', name: 'Отчет по качеству', fullName: 'Отчет по качеству знаний', icon: '📊' },
              { id: 'control-analysis', name: 'Анализ СОР/СОЧ', fullName: 'Анализ контрольных работ', icon: '📈' },
              { id: 'education-plan', name: 'План воспитания', fullName: 'План воспитательной работы', icon: '🎯' },
              { id: 'parent-meeting', name: 'Протокол собрания', fullName: 'Протокол родительского собрания', icon: '👨‍👩‍👧' },
              { id: 'class-passport', name: 'Паспорт класса', fullName: 'Социальный паспорт класса', icon: '📋' },
              { id: 'student-characteristic', name: 'Характеристика', fullName: 'Характеристика на ученика', icon: '👤' },
              { id: 'safety-journal', name: 'Журнал ТБ', fullName: 'Журнал инструктажа по ТБ', icon: '⚠️' },
              { id: 'class-journal', name: 'Классный журнал', fullName: 'Электронный журнал (Kundelik)', icon: '📖' },
            ].map((doc) => (
              <button
                key={doc.id}
                onClick={() => {
                  // Переход на страницу создания документа
                  navigate('/document-builder', { 
                    state: { documentType: doc.id, documentName: doc.fullName } 
                  })
                }}
                className="bg-white border-2 border-gray-200 rounded-lg p-4 hover:border-primary hover:shadow-md transition-all text-left group"
                title={doc.fullName}
              >
                <div className="text-3xl mb-2">{doc.icon}</div>
                <p className="font-semibold text-sm text-gray-800 group-hover:text-primary transition">
                  {doc.name}
                </p>
                <p className="text-xs text-gray-500 mt-1 opacity-0 group-hover:opacity-100 transition">
                  Құжат жасау
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Documents */}
        {pdfs.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Соңғы документтер</h2>
            <div className="space-y-2">
              {pdfs.slice(0, 5).map((pdf) => (
                <div
                  key={pdf.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                >
                  <div>
                    <p className="font-medium text-gray-800">{pdf.type}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(pdf.createdAt).toLocaleDateString('kk-KZ')}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      if (pdf.blobUrl) {
                        window.open(pdf.blobUrl, '_blank')
                      }
                    }}
                    className="text-primary hover:text-primaryGreen transition"
                  >
                    Ашу
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard

