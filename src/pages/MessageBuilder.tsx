import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiArrowLeft, FiCopy, FiSend } from 'react-icons/fi'
import { useForm } from 'react-hook-form'

interface MessageForm {
  date: string
  time: string
  room: string
  additionalInfo?: string
}

const categories = [
  { id: 'meeting', name: 'Собрание', kz: 'Жиналыс' },
  { id: 'saturday', name: 'Сенбілік', kz: 'Сенбілік' },
  { id: 'money', name: 'Ақша жинау', kz: 'Ақша жинау' },
  { id: 'congrats', name: 'Құттықтау', kz: 'Құттықтау' },
]

function MessageBuilder() {
  const navigate = useNavigate()
  const [selectedCategory, setSelectedCategory] = useState('meeting')
  const { register, watch, handleSubmit } = useForm<MessageForm>({
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      time: '14:00',
      room: '',
    },
  })

  const formData = watch()

  const generateMessage = (data: MessageForm): string => {
    switch (selectedCategory) {
      case 'meeting':
        return `Құрметті ата-аналар! 

${data.date} күні сағат ${data.time} мектепте ата-аналар жиналысы өтеді.${data.room ? ` Кабинет: ${data.room}.` : ''}

${data.additionalInfo || 'Келуді сұраймыз.'}

Құрметпен, мектеп әкімшілігі.`

      case 'saturday':
        return `Құрметті ата-аналар!

${data.date} күні сенбілік сабақ өтеді. Оқушылардың сабаққа келуін сұраймыз.

${data.additionalInfo || 'Сабақ басталу уақыты: 09:00'}

Құрметпен, мектеп әкімшілігі.`

      case 'money':
        return `Құрметті ата-аналар!

${data.date} күні ${data.additionalInfo || 'мәктәптік қажеттіліктер үшін'} ақша жинау жүргізіледі.

${data.room ? `Кабинет: ${data.room}.` : ''}

Құрметпен, мектеп әкімшілігі.`

      case 'congrats':
        return `Құрметті ата-аналар!

${data.additionalInfo || 'Сізбен бірге құттықтаймыз!'}

${data.date} күні ${data.additionalInfo || 'арнайы оқиға'} өтеді.

${data.room ? `Кабинет: ${data.room}.` : ''}

Құрметпен, мектеп әкімшілігі.`

      default:
        return ''
    }
  }

  const message = generateMessage(formData)

  const copyToClipboard = () => {
    navigator.clipboard.writeText(message)
    alert('Мәтін көшірілді!')
  }

  const sendMessage = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
  }

  const onSubmit = (data: MessageForm) => {
    console.log('Form submitted:', data)
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
          <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            WhatsApp шаблондары
          </h1>

          {/* Categories */}
          <div className="mb-8">
            <div className="flex gap-4 overflow-x-auto pb-4">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-6 py-3 rounded-lg font-semibold whitespace-nowrap transition ${
                    selectedCategory === cat.id
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {cat.kz}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {selectedCategory === 'meeting' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Күні
                  </label>
                  <input
                    type="date"
                    {...register('date', { required: true })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Уақыты
                  </label>
                  <input
                    type="time"
                    {...register('time', { required: true })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Кабинет
                  </label>
                  <input
                    type="text"
                    {...register('room')}
                    placeholder="Кабинет нөмірі"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  />
                </div>
              </>
            )}

            {selectedCategory === 'saturday' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Күні
                  </label>
                  <input
                    type="date"
                    {...register('date', { required: true })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  />
                </div>
              </>
            )}

            {selectedCategory === 'money' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Күні
                  </label>
                  <input
                    type="date"
                    {...register('date', { required: true })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  />
                </div>
              </>
            )}

            {selectedCategory === 'congrats' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Күні
                  </label>
                  <input
                    type="date"
                    {...register('date', { required: true })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Қосымша ақпарат
              </label>
              <textarea
                {...register('additionalInfo')}
                rows={3}
                placeholder="Қосымша ақпарат енгізіңіз..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none"
              />
            </div>
          </form>

          {/* Live Preview */}
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Алдын ала қарау</h2>
            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  М
                </div>
                <span className="font-semibold text-gray-800">Мектеп</span>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <p className="text-gray-800 whitespace-pre-wrap">{message}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 mt-6">
            <button
              onClick={copyToClipboard}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-4 rounded-lg transition flex items-center justify-center gap-2"
            >
              <FiCopy />
              Көшіру
            </button>
            <button
              onClick={sendMessage}
              className="flex-1 bg-primaryGreen hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition flex items-center justify-center gap-2"
            >
              <FiSend />
              Жіберу
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MessageBuilder


