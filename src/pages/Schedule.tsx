import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiArrowLeft, FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi'
import { apiClient } from '../api/client'
import { useAuth } from '../contexts/AuthContext'

interface ScheduleItem {
  id?: string
  day: string
  period: number
  subject: string
  subjectId?: string
  class: string
  classId?: string
  teacher?: string
  room?: string
}

const DAYS = ['Дүйсенбі', 'Сейсенбі', 'Сәрсенбі', 'Бейсенбі', 'Жұма', 'Сенбі']
const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8]

function Schedule() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [schedule, setSchedule] = useState<ScheduleItem[]>([])
  const [subjects, setSubjects] = useState<Array<{ id: string; name: string; nameKz?: string }>>([])
  const [classes, setClasses] = useState<Array<{ id: string; name: string; nameKz?: string }>>([])
  const [editingItem, setEditingItem] = useState<ScheduleItem | null>(null)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    loadSchedule()
  }, [subjects, classes])

  const loadData = async () => {
    try {
      if (apiClient.getToken() === 'demo-token') {
        // Fallback данные
        setSubjects([
          { id: 'math', name: 'Математика', nameKz: 'Математика' },
          { id: 'kazakh', name: 'Қазақ тілі', nameKz: 'Қазақ тілі' },
          { id: 'russian', name: 'Орыс тілі', nameKz: 'Орыс тілі' },
          { id: 'english', name: 'Ағылшын тілі', nameKz: 'Ағылшын тілі' },
        ])
        setClasses([
          { id: '1a', name: '1А', nameKz: '1А' },
          { id: '2a', name: '2А', nameKz: '2А' },
          { id: '3a', name: '3А', nameKz: '3А' },
        ])
        return
      }

      const [subjectsData, classesData] = await Promise.allSettled([
        apiClient.getSubjects().catch(() => []),
        apiClient.getClasses(user?.school_id).catch(() => []),
      ])

      if (subjectsData.status === 'fulfilled') {
        const subs = Array.isArray(subjectsData.value) ? subjectsData.value : []
        setSubjects(subs.length > 0 ? subs : [
          { id: 'math', name: 'Математика', nameKz: 'Математика' },
          { id: 'kazakh', name: 'Қазақ тілі', nameKz: 'Қазақ тілі' },
        ])
      }

      if (classesData.status === 'fulfilled') {
        const cls = Array.isArray(classesData.value) ? classesData.value : []
        setClasses(cls.length > 0 ? cls : [
          { id: '1a', name: '1А', nameKz: '1А' },
          { id: '2a', name: '2А', nameKz: '2А' },
        ])
      }
    } catch (error) {
      console.error('Ошибка загрузки данных:', error)
    }
  }

  const loadSchedule = () => {
    // Загружаем из localStorage
    const saved = localStorage.getItem('schedule')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (parsed && parsed.length > 0) {
          setSchedule(parsed)
          return
        }
      } catch (e) {
        console.error('Ошибка загрузки расписания:', e)
      }
    }
    // Не загружаем демо-данные автоматически - только по кнопке
  }

  const loadDemoSchedule = () => {
    // Демо-данные для показа жюри
    const demoSubjects = [
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

    const demoClasses = [
      { id: '7a', name: '7А', nameKz: '7А' },
      { id: '7b', name: '7Б', nameKz: '7Б' },
      { id: '8a', name: '8А', nameKz: '8А' },
      { id: '8b', name: '8Б', nameKz: '8Б' },
      { id: '9a', name: '9А', nameKz: '9А' },
    ]

    // Примерное расписание на неделю
    const demoSchedule: ScheduleItem[] = [
      // Понедельник
      { id: '1', day: 'Дүйсенбі', period: 1, subject: 'kazakh', class: '7a', room: '101' },
      { id: '2', day: 'Дүйсенбі', period: 2, subject: 'math', class: '7a', room: '205' },
      { id: '3', day: 'Дүйсенбі', period: 3, subject: 'russian', class: '7a', room: '103' },
      { id: '4', day: 'Дүйсенбі', period: 4, subject: 'english', class: '7a', room: '201' },
      { id: '5', day: 'Дүйсенбі', period: 5, subject: 'physics', class: '7a', room: '301' },
      
      { id: '6', day: 'Дүйсенбі', period: 1, subject: 'math', class: '7b', room: '205' },
      { id: '7', day: 'Дүйсенбі', period: 2, subject: 'kazakh', class: '7b', room: '101' },
      { id: '8', day: 'Дүйсенбі', period: 3, subject: 'chemistry', class: '7b', room: '302' },
      { id: '9', day: 'Дүйсенбі', period: 4, subject: 'english', class: '7b', room: '201' },
      
      { id: '10', day: 'Дүйсенбі', period: 1, subject: 'kazakh', class: '8a', room: '102' },
      { id: '11', day: 'Дүйсенбі', period: 2, subject: 'math', class: '8a', room: '206' },
      { id: '12', day: 'Дүйсенбі', period: 3, subject: 'biology', class: '8a', room: '303' },
      { id: '13', day: 'Дүйсенбі', period: 4, subject: 'russian', class: '8a', room: '104' },
      
      // Вторник
      { id: '14', day: 'Сейсенбі', period: 1, subject: 'math', class: '7a', room: '205' },
      { id: '15', day: 'Сейсенбі', period: 2, subject: 'kazakh', class: '7a', room: '101' },
      { id: '16', day: 'Сейсенбі', period: 3, subject: 'history', class: '7a', room: '105' },
      { id: '17', day: 'Сейсенбі', period: 4, subject: 'english', class: '7a', room: '201' },
      { id: '18', day: 'Сейсенбі', period: 5, subject: 'geography', class: '7a', room: '106' },
      
      { id: '19', day: 'Сейсенбі', period: 1, subject: 'kazakh', class: '7b', room: '101' },
      { id: '20', day: 'Сейсенбі', period: 2, subject: 'math', class: '7b', room: '205' },
      { id: '21', day: 'Сейсенбі', period: 3, subject: 'russian', class: '7b', room: '103' },
      { id: '22', day: 'Сейсенбі', period: 4, subject: 'physics', class: '7b', room: '301' },
      
      { id: '23', day: 'Сейсенбі', period: 1, subject: 'math', class: '8a', room: '206' },
      { id: '24', day: 'Сейсенбі', period: 2, subject: 'kazakh', class: '8a', room: '102' },
      { id: '25', day: 'Сейсенбі', period: 3, subject: 'chemistry', class: '8a', room: '302' },
      { id: '26', day: 'Сейсенбі', period: 4, subject: 'english', class: '8a', room: '202' },
      
      // Среда
      { id: '27', day: 'Сәрсенбі', period: 1, subject: 'kazakh', class: '7a', room: '101' },
      { id: '28', day: 'Сәрсенбі', period: 2, subject: 'math', class: '7a', room: '205' },
      { id: '29', day: 'Сәрсенбі', period: 3, subject: 'russian', class: '7a', room: '103' },
      { id: '30', day: 'Сәрсенбі', period: 4, subject: 'biology', class: '7a', room: '303' },
      { id: '31', day: 'Сәрсенбі', period: 5, subject: 'english', class: '7a', room: '201' },
      
      { id: '32', day: 'Сәрсенбі', period: 1, subject: 'math', class: '7b', room: '205' },
      { id: '33', day: 'Сәрсенбі', period: 2, subject: 'kazakh', class: '7b', room: '101' },
      { id: '34', day: 'Сәрсенбі', period: 3, subject: 'geography', class: '7b', room: '106' },
      { id: '35', day: 'Сәрсенбі', period: 4, subject: 'english', class: '7b', room: '201' },
      
      { id: '36', day: 'Сәрсенбі', period: 1, subject: 'kazakh', class: '8a', room: '102' },
      { id: '37', day: 'Сәрсенбі', period: 2, subject: 'math', class: '8a', room: '206' },
      { id: '38', day: 'Сәрсенбі', period: 3, subject: 'physics', class: '8a', room: '301' },
      { id: '39', day: 'Сәрсенбі', period: 4, subject: 'russian', class: '8a', room: '104' },
      
      // Четверг
      { id: '40', day: 'Бейсенбі', period: 1, subject: 'math', class: '7a', room: '205' },
      { id: '41', day: 'Бейсенбі', period: 2, subject: 'kazakh', class: '7a', room: '101' },
      { id: '42', day: 'Бейсенбі', period: 3, subject: 'chemistry', class: '7a', room: '302' },
      { id: '43', day: 'Бейсенбі', period: 4, subject: 'english', class: '7a', room: '201' },
      { id: '44', day: 'Бейсенбі', period: 5, subject: 'history', class: '7a', room: '105' },
      
      { id: '45', day: 'Бейсенбі', period: 1, subject: 'kazakh', class: '7b', room: '101' },
      { id: '46', day: 'Бейсенбі', period: 2, subject: 'math', class: '7b', room: '205' },
      { id: '47', day: 'Бейсенбі', period: 3, subject: 'russian', class: '7b', room: '103' },
      { id: '48', day: 'Бейсенбі', period: 4, subject: 'biology', class: '7b', room: '303' },
      
      { id: '49', day: 'Бейсенбі', period: 1, subject: 'math', class: '8a', room: '206' },
      { id: '50', day: 'Бейсенбі', period: 2, subject: 'kazakh', class: '8a', room: '102' },
      { id: '51', day: 'Бейсенбі', period: 3, subject: 'english', class: '8a', room: '202' },
      { id: '52', day: 'Бейсенбі', period: 4, subject: 'geography', class: '8a', room: '106' },
      
      // Пятница
      { id: '53', day: 'Жұма', period: 1, subject: 'kazakh', class: '7a', room: '101' },
      { id: '54', day: 'Жұма', period: 2, subject: 'math', class: '7a', room: '205' },
      { id: '55', day: 'Жұма', period: 3, subject: 'russian', class: '7a', room: '103' },
      { id: '56', day: 'Жұма', period: 4, subject: 'physics', class: '7a', room: '301' },
      { id: '57', day: 'Жұма', period: 5, subject: 'english', class: '7a', room: '201' },
      
      { id: '58', day: 'Жұма', period: 1, subject: 'math', class: '7b', room: '205' },
      { id: '59', day: 'Жұма', period: 2, subject: 'kazakh', class: '7b', room: '101' },
      { id: '60', day: 'Жұма', period: 3, subject: 'chemistry', class: '7b', room: '302' },
      { id: '61', day: 'Жұма', period: 4, subject: 'english', class: '7b', room: '201' },
      
      { id: '62', day: 'Жұма', period: 1, subject: 'kazakh', class: '8a', room: '102' },
      { id: '63', day: 'Жұма', period: 2, subject: 'math', class: '8a', room: '206' },
      { id: '64', day: 'Жұма', period: 3, subject: 'biology', class: '8a', room: '303' },
      { id: '65', day: 'Жұма', period: 4, subject: 'russian', class: '8a', room: '104' },
      
      // Суббота
      { id: '66', day: 'Сенбі', period: 1, subject: 'math', class: '7a', room: '205' },
      { id: '67', day: 'Сенбі', period: 2, subject: 'kazakh', class: '7a', room: '101' },
      { id: '68', day: 'Сенбі', period: 3, subject: 'history', class: '7a', room: '105' },
      
      { id: '69', day: 'Сенбі', period: 1, subject: 'kazakh', class: '7b', room: '101' },
      { id: '70', day: 'Сенбі', period: 2, subject: 'math', class: '7b', room: '205' },
      { id: '71', day: 'Сенбі', period: 3, subject: 'geography', class: '7b', room: '106' },
      
      { id: '72', day: 'Сенбі', period: 1, subject: 'math', class: '8a', room: '206' },
      { id: '73', day: 'Сенбі', period: 2, subject: 'kazakh', class: '8a', room: '102' },
      { id: '74', day: 'Сенбі', period: 3, subject: 'chemistry', class: '8a', room: '302' },
    ]

    // Устанавливаем демо-данные
    setSchedule(demoSchedule)
    localStorage.setItem('schedule', JSON.stringify(demoSchedule))
    
    // Также устанавливаем демо-предметы и классы, если их нет
    if (subjects.length === 0) {
      setSubjects(demoSubjects)
    }
    if (classes.length === 0) {
      setClasses(demoClasses)
    }
  }

  const saveSchedule = (newSchedule: ScheduleItem[]) => {
    setSchedule(newSchedule)
    localStorage.setItem('schedule', JSON.stringify(newSchedule))
  }

  const handleAdd = () => {
    setEditingItem({
      day: DAYS[0],
      period: 1,
      subject: '',
      class: '',
      room: '',
    })
    setShowForm(true)
  }

  const handleEdit = (item: ScheduleItem) => {
    setEditingItem(item)
    setShowForm(true)
  }

  const handleDelete = (item: ScheduleItem) => {
    if (confirm('Сабақты жоюға сенімдісіз бе?')) {
      const newSchedule = schedule.filter(s => 
        !(s.day === item.day && s.period === item.period && s.class === item.class)
      )
      saveSchedule(newSchedule)
    }
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingItem) return

    const newItem: ScheduleItem = {
      ...editingItem,
      id: editingItem.id || Date.now().toString(),
    }

    // Удаляем старый элемент, если редактируем
    const filtered = schedule.filter(s => 
      !(s.id === editingItem.id && s.id)
    )

    // Проверяем, нет ли конфликта (тот же день, период, класс)
    const conflict = filtered.find(s => 
      s.day === newItem.day && 
      s.period === newItem.period && 
      s.class === newItem.class &&
      s.id !== newItem.id
    )

    if (conflict) {
      alert('Бұл уақытта басқа сабақ бар!')
      return
    }

    saveSchedule([...filtered, newItem])
    setShowForm(false)
    setEditingItem(null)
  }

  const getScheduleForCell = (day: string, period: number) => {
    return schedule.find(s => s.day === day && s.period === period)
  }

  const getSubjectName = (subjectId: string) => {
    const subject = subjects.find(s => s.id === subjectId)
    return subject ? (subject.nameKz || subject.name) : subjectId
  }

  const getClassName = (classId: string) => {
    const cls = classes.find(c => c.id === classId)
    return cls ? (cls.nameKz || cls.name) : classId
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition"
          >
            <FiArrowLeft />
            Артқа
          </button>
          <h1 className="text-3xl font-bold text-gray-800">Сабақ кестесі</h1>
          <div className="flex gap-2">
            <button
              onClick={loadDemoSchedule}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition"
              title="Демо-расписание для показа жюри"
            >
              Демо-кесте
            </button>
            <button
              onClick={handleAdd}
              className="flex items-center gap-2 bg-primary hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
            >
              <FiPlus />
              Сабақ қосу
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border border-gray-300 p-3 bg-gray-100 font-semibold text-gray-700 min-w-[100px]">
                  Уақыт / Күні
                </th>
                {DAYS.map(day => (
                  <th key={day} className="border border-gray-300 p-3 bg-gray-100 font-semibold text-gray-700 min-w-[150px]">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PERIODS.map(period => (
                <tr key={period}>
                  <td className="border border-gray-300 p-3 text-center font-semibold bg-gray-50">
                    {period} сабақ
                  </td>
                  {DAYS.map(day => {
                    const item = getScheduleForCell(day, period)
                    return (
                      <td key={`${day}-${period}`} className="border border-gray-300 p-2 min-h-[80px]">
                        {item ? (
                          <div className="bg-blue-50 rounded p-2 h-full">
                            <div className="font-semibold text-sm text-gray-800 mb-1">
                              {getSubjectName(item.subject)}
                            </div>
                            <div className="text-xs text-gray-600 mb-1">
                              {getClassName(item.class)}
                            </div>
                            {item.room && (
                              <div className="text-xs text-gray-500">
                                Каб. {item.room}
                              </div>
                            )}
                            <div className="flex gap-1 mt-2">
                              <button
                                onClick={() => handleEdit(item)}
                                className="text-blue-600 hover:text-blue-800 text-xs"
                                title="Өңдеу"
                              >
                                <FiEdit2 />
                              </button>
                              <button
                                onClick={() => handleDelete(item)}
                                className="text-red-600 hover:text-red-800 text-xs"
                                title="Жою"
                              >
                                <FiTrash2 />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="text-gray-400 text-center text-sm py-4">
                            Бос
                          </div>
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Форма добавления/редактирования */}
        {showForm && editingItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-4">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                {editingItem.id ? 'Сабақты өңдеу' : 'Жаңа сабақ'}
              </h2>
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Күні *
                  </label>
                  <select
                    value={editingItem.day}
                    onChange={(e) => setEditingItem({ ...editingItem, day: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  >
                    {DAYS.map(day => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Сабақ нөмірі *
                  </label>
                  <select
                    value={editingItem.period}
                    onChange={(e) => setEditingItem({ ...editingItem, period: parseInt(e.target.value) })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  >
                    {PERIODS.map(p => (
                      <option key={p} value={p}>{p} сабақ</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Пән *
                  </label>
                  <select
                    value={editingItem.subject}
                    onChange={(e) => setEditingItem({ ...editingItem, subject: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  >
                    <option value="">Таңдаңыз...</option>
                    {subjects.map(subj => (
                      <option key={subj.id} value={subj.id}>
                        {subj.nameKz || subj.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Сынып *
                  </label>
                  <select
                    value={editingItem.class}
                    onChange={(e) => setEditingItem({ ...editingItem, class: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  >
                    <option value="">Таңдаңыз...</option>
                    {classes.map(cls => (
                      <option key={cls.id} value={cls.id}>
                        {cls.nameKz || cls.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Кабинет
                  </label>
                  <input
                    type="text"
                    value={editingItem.room || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, room: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    placeholder="Мысалы: 101"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-primary hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
                  >
                    Сақтау
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false)
                      setEditingItem(null)
                    }}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg transition"
                  >
                    Болдырмау
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Schedule


