import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { FiArrowLeft, FiDownload, FiShare2 } from 'react-icons/fi'
import { getTemplateById } from '../utils/documentTemplates'
import { createPDF } from '../utils/pdf'
import { storage } from '../utils/storage'
import { saveAs } from 'file-saver'
import { apiClient } from '../api/client'
import { useAuth } from '../contexts/AuthContext'

interface OptionItem {
  id: string
  name: string
  nameKz?: string
}

function DocumentBuilder() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const documentId = location.state?.documentType || new URLSearchParams(location.search).get('type') || 'ktp'
  
  const template = getTemplateById(documentId)
  
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null)
  
  // Данные из API
  const [schools, setSchools] = useState<OptionItem[]>([])
  const [classes, setClasses] = useState<OptionItem[]>([])
  const [teachers, setTeachers] = useState<OptionItem[]>([])
  const [subjects, setSubjects] = useState<OptionItem[]>([])
  const [students, setStudents] = useState<OptionItem[]>([])
  const [loadingData, setLoadingData] = useState(false)

  if (!template) {
    // Специальная обработка для электронного журнала
    if (documentId === 'class-journal') {
      return (
        <div className="min-h-screen bg-gray-50 p-6">
          <div className="max-w-4xl mx-auto">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6 transition"
            >
              <FiArrowLeft />
              Артқа
            </button>
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <div className="text-6xl mb-4">📖</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Электронный журнал (Kundelik)</h2>
              <p className="text-gray-600 mb-6">
                Электронный журнал ведется в системе Kundelik.kz. 
                Для работы с журналом необходимо войти в систему через официальный сайт.
              </p>
              <a
                href="https://kundelik.kz"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-primary hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition"
              >
                Открыть Kundelik.kz
              </a>
            </div>
          </div>
        </div>
      )
    }

    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6 transition"
          >
            <FiArrowLeft />
            Артқа
          </button>
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <p className="text-gray-600">Шаблон не найден</p>
          </div>
        </div>
      </div>
    )
  }

  // Загрузка данных из API
  useEffect(() => {
    const loadData = async () => {
      setLoadingData(true)
      
      // Fallback данные для demo режима или если API недоступен
      const fallbackSubjects = [
        { id: 'math', name: 'Математика', nameKz: 'Математика' },
        { id: 'kazakh', name: 'Қазақ тілі', nameKz: 'Қазақ тілі' },
        { id: 'russian', name: 'Орыс тілі', nameKz: 'Орыс тілі' },
        { id: 'english', name: 'Ағылшын тілі', nameKz: 'Ағылшын тілі' },
        { id: 'physics', name: 'Физика', nameKz: 'Физика' },
        { id: 'chemistry', name: 'Химия', nameKz: 'Химия' },
        { id: 'biology', name: 'Биология', nameKz: 'Биология' },
        { id: 'history', name: 'Тарих', nameKz: 'Тарих' },
        { id: 'geography', name: 'География', nameKz: 'География' },
      ]

      const fallbackClasses = [
        { id: '1a', name: '1А', nameKz: '1А' },
        { id: '1b', name: '1Б', nameKz: '1Б' },
        { id: '2a', name: '2А', nameKz: '2А' },
        { id: '2b', name: '2Б', nameKz: '2Б' },
        { id: '3a', name: '3А', nameKz: '3А' },
        { id: '4a', name: '4А', nameKz: '4А' },
        { id: '5a', name: '5А', nameKz: '5А' },
        { id: '6a', name: '6А', nameKz: '6А' },
        { id: '7a', name: '7А', nameKz: '7А' },
        { id: '8a', name: '8А', nameKz: '8А' },
        { id: '9a', name: '9А', nameKz: '9А' },
        { id: '10a', name: '10А', nameKz: '10А' },
        { id: '11a', name: '11А', nameKz: '11А' },
      ]

      // Если demo режим, используем fallback данные
      if (apiClient.getToken() === 'demo-token') {
        setSubjects(fallbackSubjects)
        setClasses(fallbackClasses)
        if (user?.full_name) {
          setTeachers([{ id: 'current', name: user.full_name, nameKz: user.full_name }])
        }
        setLoadingData(false)
        return
      }

      try {
        // Загружаем все необходимые данные параллельно
        const [schoolsData, classesData, teachersData, subjectsData] = await Promise.allSettled([
          apiClient.getSchools().catch((e) => {
            console.error('Ошибка загрузки школ:', e)
            return []
          }),
          apiClient.getClasses(user?.school_id).catch((e) => {
            console.error('Ошибка загрузки классов:', e)
            return []
          }),
          apiClient.getTeachers(user?.school_id).catch((e) => {
            console.error('Ошибка загрузки учителей:', e)
            return []
          }),
          apiClient.getSubjects().catch((e) => {
            console.error('Ошибка загрузки предметов:', e)
            return []
          }),
        ])

        // Обработка школ
        if (schoolsData.status === 'fulfilled') {
          const schoolsList = Array.isArray(schoolsData.value) ? schoolsData.value : []
          console.log('Загружено школ:', schoolsList.length)
          setSchools(schoolsList.length > 0 ? schoolsList : [])
        }

        // Обработка классов
        if (classesData.status === 'fulfilled') {
          const classesList = Array.isArray(classesData.value) ? classesData.value : []
          console.log('✅ Загружено классов:', classesList.length)
          if (classesList.length > 0) {
            setClasses(classesList)
            // Логируем первые несколько для отладки
            if (classesList.length > 0) {
              console.log('Примеры классов:', classesList.slice(0, 5).map(c => c.name || c.nameKz || c.id))
            }
          } else {
            console.warn('⚠️ Классы не загружены, используем fallback данные')
            setClasses(fallbackClasses)
          }
        } else {
          console.error('❌ Ошибка загрузки классов:', classesData.reason)
          setClasses(fallbackClasses)
        }

        // Обработка учителей
        if (teachersData.status === 'fulfilled') {
          const teachersList = Array.isArray(teachersData.value) ? teachersData.value : []
          console.log('✅ Загружено учителей:', teachersList.length)
          if (teachersList.length > 0) {
            setTeachers(teachersList)
            // Логируем первые несколько для отладки
            if (teachersList.length > 0) {
              console.log('Примеры учителей:', teachersList.slice(0, 5).map(t => t.name || t.nameKz || t.full_name || t.id))
            }
          } else {
            console.warn('⚠️ Учителя не загружены')
            if (user?.full_name) {
              setTeachers([{ id: 'current', name: user.full_name, nameKz: user.full_name }])
            }
          }
        } else {
          console.error('❌ Ошибка загрузки учителей:', teachersData.reason)
          if (user?.full_name) {
            setTeachers([{ id: 'current', name: user.full_name, nameKz: user.full_name }])
          }
        }

        // Обработка предметов
        if (subjectsData.status === 'fulfilled') {
          const subjectsList = Array.isArray(subjectsData.value) ? subjectsData.value : []
          console.log('Загружено предметов:', subjectsList.length)
          setSubjects(subjectsList.length > 0 ? subjectsList : fallbackSubjects)
        } else {
          setSubjects(fallbackSubjects)
        }
      } catch (error) {
        console.error('Ошибка загрузки данных:', error)
        // Используем fallback данные при ошибке
        setSubjects(fallbackSubjects)
        setClasses(fallbackClasses)
        if (user?.full_name) {
          setTeachers([{ id: 'current', name: user.full_name, nameKz: user.full_name }])
        }
      } finally {
        setLoadingData(false)
      }
    }

    loadData()
  }, [user?.school_id, user?.full_name])

  // Загрузка классов при изменении школы
  useEffect(() => {
    const loadClasses = async () => {
      const schoolId = formData.school_id || formData.school
      
      if (!schoolId) {
        return
      }

      if (apiClient.getToken() === 'demo-token') {
        return
      }

      try {
        const classesData = await apiClient.getClasses(schoolId)
        const classesList = Array.isArray(classesData) ? classesData : []
        console.log('Загружено классов для школы:', classesList.length)
        if (classesList.length > 0) {
          setClasses(classesList)
        }
      } catch (error) {
        console.error('Ошибка загрузки классов:', error)
      }
    }

    loadClasses()
  }, [formData.school_id, formData.school])

  // Загрузка студентов при изменении класса
  useEffect(() => {
    const loadStudents = async () => {
      if (!formData.class || apiClient.getToken() === 'demo-token') {
        return
      }

      try {
        const studentsData = await apiClient.getStudents(formData.class)
        setStudents(Array.isArray(studentsData) ? studentsData : [])
      } catch (error) {
        console.error('Ошибка загрузки студентов:', error)
      }
    }

    loadStudents()
  }, [formData.class])

  // Инициализация формы данными пользователя
  useEffect(() => {
    if (template && user) {
      const initialData: Record<string, any> = {}
      
      template.fields.forEach((field) => {
        if (field.type === 'date') {
          initialData[field.key] = new Date().toISOString().split('T')[0]
        } else if (field.key === 'teacher' && user.full_name) {
          initialData[field.key] = user.full_name
        } else if (field.key === 'class' && user.class_id) {
          initialData[field.key] = user.class_id
        } else if (field.key === 'school' && user.school_id) {
          initialData[field.key] = user.school_id
        } else {
          initialData[field.key] = ''
        }
      })
      
      setFormData(initialData)
    }
  }, [template, user])

  const handleFieldChange = (key: string, value: any) => {
    setFormData(prev => {
      const newData = { ...prev, [key]: value }
      
      // Если изменилась школа, очищаем класс
      if (key === 'school_id' || key === 'school') {
        delete newData.class
        delete newData.class_id
        setClasses([])
      }
      
      // Если изменился класс, очищаем студента
      if (key === 'class' || key === 'class_id') {
        delete newData.student
        delete newData.student_id
        setStudents([])
      }
      
      return newData
    })
  }

  // Получение опций для поля
  const getFieldOptions = (field: any): Array<{ value: string; label: string }> => {
    // Если есть статические опции
    if (field.options) {
      return field.options.map((opt: string) => ({ value: opt, label: opt }))
    }

    // Если есть источник данных из API
    if (field.dataSource) {
      let sourceData: OptionItem[] = []
      
      switch (field.dataSource) {
        case 'schools':
          sourceData = schools
          break
        case 'classes':
          sourceData = classes
          break
        case 'teachers':
          sourceData = teachers
          break
        case 'subjects':
          sourceData = subjects
          break
        case 'students':
          sourceData = students
          break
      }

      console.log(`📋 Опции для ${field.key} (${field.dataSource}):`, sourceData.length)
      
      if (sourceData.length > 0 && sourceData.length <= 20) {
        console.log(`   Примеры:`, sourceData.slice(0, 5).map(item => ({
          id: item.id,
          name: item.nameKz || item.name || item.id
        })))
      }

      if (sourceData.length === 0) {
        console.warn(`⚠️ Нет данных для ${field.key} (${field.dataSource})`)
        return []
      }

      const options = sourceData.map(item => ({
        value: item.id,
        label: item.nameKz || item.name || item.id
      }))
      
      console.log(`✅ Создано опций для ${field.key}: ${options.length}`)
      return options
    }

    return []
  }

  // Получение названия по ID
  const getNameById = (id: string, source: 'schools' | 'classes' | 'teachers' | 'subjects' | 'students'): string => {
    let sourceData: OptionItem[] = []
    switch (source) {
      case 'schools': sourceData = schools; break
      case 'classes': sourceData = classes; break
      case 'teachers': sourceData = teachers; break
      case 'subjects': sourceData = subjects; break
      case 'students': sourceData = students; break
    }
    const item = sourceData.find(item => item.id === id)
    return item ? (item.nameKz || item.name || id) : id
  }

  const generateDocument = async () => {
    try {
      // Подготавливаем данные для шаблона, заменяя ID на названия
      const templateData = { ...formData }
      
      template?.fields.forEach(field => {
        if (field.dataSource && templateData[field.key]) {
          const name = getNameById(templateData[field.key], field.dataSource)
          templateData[field.key] = name
        }
      })
      
      const html = template.template(templateData)
      const blob = await createPDF({
        type: template.nameKz,
        text: html,
      })

      const url = URL.createObjectURL(blob)
      setPdfBlob(blob)
      setPdfUrl(url)

          // Сохраняем в localStorage
          const pdfDoc = {
            id: Date.now().toString(),
            type: template.nameKz,
            text: html,
            createdAt: new Date().toISOString(),
            blobUrl: url,
            history: [{
              id: Date.now().toString(),
              action: 'created' as const,
              timestamp: new Date().toISOString(),
            }],
          }
          storage.savePDF(pdfDoc)
    } catch (error) {
      console.error('Ошибка генерации документа:', error)
      alert('Құжат жасау кезінде қате пайда болды')
    }
  }

  const downloadPDF = () => {
    if (pdfBlob) {
      saveAs(pdfBlob, `${template.nameKz}.pdf`)
    }
  }

  const sharePDF = async () => {
    if (pdfBlob && navigator.share) {
      try {
        const file = new File([pdfBlob], `${template.nameKz}.pdf`, { type: 'application/pdf' })
        await navigator.share({
          title: template.nameKz,
          files: [file],
        })
      } catch (error) {
        console.error('Ошибка шаринга:', error)
        downloadPDF()
      }
    } else {
      downloadPDF()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6 transition"
        >
          <FiArrowLeft />
          Артқа
        </button>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">
            {template.nameKz}
          </h1>
          <p className="text-center text-gray-600 mb-4">{template.name}</p>
          {template.orderCode && (
            <div className="mb-8 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-lg">
              <p className="text-sm text-gray-700 mb-2">
                <strong>Ресми бұйрық:</strong> №{template.orderCode}
              </p>
              <div className="flex gap-4 text-sm">
                {template.orderUrlKz && (
                  <a
                    href={template.orderUrlKz}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    Қазақша нұсқасы
                  </a>
                )}
                {template.orderUrlRu && (
                  <a
                    href={template.orderUrlRu}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    Русская версия
                  </a>
                )}
              </div>
            </div>
          )}

          {!pdfUrl ? (
            <form className="space-y-6">
              {template.fields.map((field) => (
                <div key={field.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {field.labelKz} {field.required && <span className="text-red-500">*</span>}
                  </label>
                  {field.type === 'textarea' ? (
                    <textarea
                      value={formData[field.key] || ''}
                      onChange={(e) => handleFieldChange(field.key, e.target.value)}
                      rows={4}
                      required={field.required}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none"
                      placeholder={`${field.labelKz} енгізіңіз...`}
                    />
                  ) : field.type === 'select' || field.dataSource ? (
                    <div>
                      <select
                        value={formData[field.key] || ''}
                        onChange={(e) => handleFieldChange(field.key, e.target.value)}
                        required={field.required}
                        disabled={loadingData && !!field.dataSource}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                      >
                        <option value="">{loadingData && field.dataSource ? 'Жүктелуде...' : 'Таңдаңыз...'}</option>
                        {getFieldOptions(field).map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      {field.dataSource && getFieldOptions(field).length === 0 && !loadingData && (
                        <p className="mt-1 text-xs text-gray-500">
                          Деректер жоқ. Тексеріңіз, бэкенд іске қосылған және деректер бар ма.
                        </p>
                      )}
                    </div>
                  ) : (
                    <input
                      type={field.type}
                      value={formData[field.key] || ''}
                      onChange={(e) => handleFieldChange(field.key, e.target.value)}
                      required={field.required}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                      placeholder={`${field.labelKz} енгізіңіз...`}
                    />
                  )}
                </div>
              ))}

              <button
                type="button"
                onClick={generateDocument}
                className="w-full bg-primary hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition"
              >
                PDF жасау
              </button>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-xl font-semibold text-gray-800 mb-2">Құжат сәтті жасалды!</p>
                <p className="text-gray-600">{template.nameKz}</p>
              </div>

              <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                <iframe
                  src={pdfUrl}
                  className="w-full h-96 border-0 rounded"
                  title="PDF Preview"
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={downloadPDF}
                  className="flex-1 bg-primary hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition flex items-center justify-center gap-2"
                >
                  <FiDownload />
                  Жүктеу
                </button>
                <button
                  onClick={sharePDF}
                  className="flex-1 bg-primaryGreen hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition flex items-center justify-center gap-2"
                >
                  <FiShare2 />
                  Бөлісу
                </button>
              </div>

              <button
                onClick={() => {
                  setPdfUrl(null)
                  setPdfBlob(null)
                  setFormData({})
                }}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-4 rounded-lg transition"
              >
                Жаңа құжат
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DocumentBuilder

