import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiMic, FiArrowLeft, FiDownload, FiEye, FiFolder } from 'react-icons/fi'
import { createPDF } from '../utils/pdf'
import { storage } from '../utils/storage'
import { saveAs } from 'file-saver'

// n8n webhook URL для голосового агента
const N8N_VOICE_WEBHOOK = 'https://nurik02.app.n8n.cloud/webhook/voice-input'

type RecordingState = 'ready' | 'recording' | 'processing' | 'listening'

interface ResponseData {
  text?: string
  audio?: string
  pdf_url?: string
  response?: string
  output?: string
  message?: string
  binary?: any
  [key: string]: any // Для других возможных полей от n8n
}

function VoiceReport() {
  const navigate = useNavigate()
  const [state, setState] = useState<RecordingState>('ready')
  const [response, setResponse] = useState<ResponseData | null>(null)
  const [statusText, setStatusText] = useState('Нажмите на кнопку, чтобы начать')
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null)
  const [pdfDirectUrl, setPdfDirectUrl] = useState<string | null>(null) // Прямая ссылка на PDF (для скачивания)
  const [generatingPdf, setGeneratingPdf] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pdfLoadError, setPdfLoadError] = useState(false) // Ошибка загрузки PDF из-за CORS
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioStreamRef = useRef<MediaStream | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    return () => {
      // Cleanup
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach(track => track.stop())
      }
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  const startRecording = async () => {
    if (state === 'recording') return

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        },
      })

      audioStreamRef.current = stream
      audioChunksRef.current = []

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
      })

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        if (audioStreamRef.current) {
          audioStreamRef.current.getTracks().forEach(track => track.stop())
          audioStreamRef.current = null
        }
        await processRecording()
      }

      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event)
        setState('ready')
        setStatusText('Ошибка записи. Попробуйте еще раз.')
      }

      mediaRecorderRef.current = mediaRecorder
      mediaRecorder.start()
      setState('recording')
      setStatusText('Говорите...')

      // Auto-stop after 30 seconds
      setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          stopRecording()
        }
      }, 30000)
    } catch (error) {
      console.error('Error accessing microphone:', error)
      setStatusText('Не удалось получить доступ к микрофону. Проверьте разрешения.')
    }
  }

  const stopRecording = () => {
    if (state !== 'recording' || !mediaRecorderRef.current) return

    // Stop stream immediately
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach(track => track.stop())
      audioStreamRef.current = null
    }

    setState('processing')
    setStatusText('Отправка запроса...')

    // Request last chunk and stop
    if (mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.requestData()
      setTimeout(() => {
        mediaRecorderRef.current?.stop()
      }, 100)
    }
  }

  const processRecording = async () => {
    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm;codecs=opus' })

    if (audioBlob.size === 0) {
      setStatusText('Запись пуста. Попробуйте еще раз.')
      setState('ready')
      return
    }

    console.log('🎤 Отправка аудио на n8n webhook:', N8N_VOICE_WEBHOOK)
    console.log('📦 Размер аудио:', audioBlob.size, 'байт')

    try {
      const formData = new FormData()
      formData.append('audio', audioBlob, 'recording.webm')

      setStatusText('Отправка запроса...')
      const response = await fetch(N8N_VOICE_WEBHOOK, {
        method: 'POST',
        body: formData,
      })

      console.log('📡 Ответ получен:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ HTTP ошибка:', response.status, errorText)
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`)
      }

      const contentType = response.headers.get('content-type') || ''
      console.log('📄 Content-Type:', contentType)

      let data: ResponseData

      if (contentType.includes('application/json')) {
        const text = await response.text()
        console.log('📝 JSON ответ (сырой):', text.substring(0, 500))
        
        if (text.trim() === '' || text.trim() === '{}') {
          console.warn('⚠️ Пустой JSON ответ')
          data = { text: '', audio: '' }
        } else {
          try {
            data = JSON.parse(text)
            console.log('✅ Распарсенный JSON:', data)
          } catch (parseError) {
            console.error('❌ Ошибка парсинга JSON:', parseError)
            throw new Error('Некорректный JSON ответ от n8n')
          }
        }
      } else if (contentType.includes('audio')) {
        console.log('🎵 Получен аудио ответ')
        const blob = await response.blob()
        const reader = new FileReader()
        data = await new Promise((resolve, reject) => {
          reader.onloadend = () => {
            const base64String = (reader.result as string).split(',')[1]
            resolve({
              text: '',
              audio: `data:audio/mp3;base64,${base64String}`,
            })
          }
          reader.onerror = reject
          reader.readAsDataURL(blob)
        })
        console.log('✅ Аудио конвертировано в base64')
      } else {
        // Пробуем прочитать как текст
        const text = await response.text()
        console.log('📄 Текстовый ответ:', text.substring(0, 500))
        
        // Пробуем распарсить как JSON
        try {
          data = JSON.parse(text)
          console.log('✅ Удалось распарсить как JSON:', data)
        } catch {
          // Если не JSON, создаем текстовый ответ
          data = { text: text || 'Ответ получен, но формат неизвестен', audio: '' }
          console.log('📝 Создан текстовый ответ из неизвестного формата')
        }
      }

      console.log('📦 Финальные данные:', data)

      // Проверяем формат данных (как в app.js)
      if (!data || typeof data !== 'object') {
        console.warn('Invalid response format from n8n:', data)
        throw new Error('Некорректный формат ответа от n8n. Ожидается JSON с полями text, audio или pdf_url.')
      }

      // Если есть message о старте workflow, это ошибка конфигурации
      if (data.message && data.message.includes('Workflow was started')) {
        console.error('Webhook возвращает сообщение о старте вместо результата')
        throw new Error('Webhook настроен неправильно. Измените "Respond" в Webhook node на "Using Respond to Webhook Node".')
      }

      // Если нет text, но есть другие поля, попробуем использовать их
      if (!data.text) {
        data.text = data.response || data.output || data.message || ''
      }

      // Извлекаем pdf_url, если есть
      if (data.pdf_url) {
        console.log('✅ PDF URL получен:', data.pdf_url)
      }

      // Проверяем, есть ли хоть какие-то данные
      if (!data.text && !data.audio && !data.pdf_url) {
        console.warn('⚠️ Пустой ответ от n8n')
        setStatusText('Ответ от AI агента пуст. Попробуйте еще раз.')
        setState('ready')
        return
      }

      setResponse(data)
      setError(null) // Очищаем предыдущие ошибки
      
      // Если есть pdf_url - загружаем и показываем PDF (приоритет, как в app.js)
      if (data.pdf_url) {
        console.log('📄 Генерация PDF из URL:', data.pdf_url)
        setPdfDirectUrl(data.pdf_url) // Сохраняем прямую ссылку
        try {
          await generatePDFFromUrl(data.pdf_url)
          setState('listening')
          setStatusText('PDF готов. Можете задать следующий вопрос.')
        } catch (pdfError: any) {
          console.error('Ошибка генерации PDF из URL:', pdfError)
          // Если ошибка CORS, показываем кнопку для скачивания
          if (pdfError.message?.includes('CORS') || pdfError.message?.includes('Failed to fetch')) {
            setPdfLoadError(true)
            setState('listening')
            setStatusText('PDF готов. Используйте кнопку для скачивания или открытия.')
            
            // Сохраняем прямую ссылку в localStorage даже если не удалось загрузить
            const docId = `ai-agent-${Date.now()}`
            const pdfDoc = {
              id: docId,
              type: 'AI Agent Жауабы',
              text: `PDF URL: ${data.pdf_url}`,
              createdAt: new Date().toISOString(),
              blobUrl: data.pdf_url, // Сохраняем прямую ссылку
              history: [{
                id: Date.now().toString(),
                action: 'created' as const,
                timestamp: new Date().toISOString(),
                details: `PDF URL получен (CORS ограничение): ${data.pdf_url}`,
              }],
            }
            storage.savePDF(pdfDoc)
            console.log('✅ PDF URL сохранен в localStorage с ID:', docId)
          } else {
            setStatusText('PDF URL получен, но не удалось загрузить. Попробуйте открыть ссылку.')
          }
        }
      } 
      // Если есть текст - генерируем PDF из текста
      else if (data.text && data.text.trim()) {
        console.log('📄 Генерация PDF из текста')
        try {
          await generatePDFFromText(data.text)
          setState('listening')
          setStatusText('PDF готов. Можете задать следующий вопрос.')
        } catch (pdfError) {
          console.error('Ошибка генерации PDF из текста:', pdfError)
          setStatusText('Ошибка генерации PDF. Текст сохранен.')
        }
      }
      // Если только аудио - воспроизводим (как в app.js: приоритет у PDF, аудио только если нет PDF)
      else if (data.audio && !data.pdf_url) {
        console.log('🎵 Воспроизведение аудио ответа')
        setState('listening')
        setStatusText('Ответ получен. Можете задать следующий вопрос.')
        setTimeout(() => playAudio(data.audio!), 500)
      }
      // Если ничего нет
      else {
        console.warn('⚠️ Пустой ответ от n8n')
        setStatusText('Ответ от AI агента пуст. Попробуйте еще раз.')
        setState('ready')
      }
    } catch (error: any) {
      console.error('❌ Ошибка обработки аудио:', error)
      console.error('Детали ошибки:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
      })
      
      let errorMessage = 'Произошла ошибка при обработке запроса.'
      
      if (error.message?.includes('Failed to fetch') || error.message?.includes('CORS')) {
        errorMessage = 'Ошибка подключения к серверу. Проверьте интернет-соединение.'
      } else if (error.message?.includes('HTTP error')) {
        errorMessage = `Ошибка сервера: ${error.message}`
      } else if (error.message) {
        errorMessage = error.message
      }
      
      setStatusText(errorMessage)
      setError(errorMessage)
      setState('ready')
      
      // Автоматически скрываем ошибку через 10 секунд
      setTimeout(() => {
        setError(null)
      }, 10000)
    }
  }

  const playAudio = (audioData: string) => {
    try {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }

      const audio = new Audio(audioData)
      audioRef.current = audio
      setStatusText('Воспроизведение ответа...')

      audio.onended = () => {
        audioRef.current = null
        setStatusText('Ответ получен. Можете задать следующий вопрос.')
      }

      audio.onerror = () => {
        audioRef.current = null
        setStatusText('Ошибка воспроизведения аудио')
      }

      audio.play()
    } catch (error) {
      console.error('Error playing audio:', error)
    }
  }

  const toggleRecording = () => {
    if (state === 'recording') {
      stopRecording()
    } else if (state === 'ready' || state === 'listening') {
      startRecording()
    }
  }

  const generatePDFFromUrl = async (url: string) => {
    try {
      setGeneratingPdf(true)
      setStatusText('Загрузка PDF...')
      
      console.log('📥 Загрузка PDF с URL:', url)
      
      // Загружаем PDF по URL
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Не удалось загрузить PDF: ${response.status} ${response.statusText}`)
      }
      
      const blob = await response.blob()
      console.log('✅ PDF загружен, размер:', blob.size, 'байт')
      
      if (blob.size === 0) {
        throw new Error('PDF файл пуст')
      }
      
      const urlBlob = URL.createObjectURL(blob)
      
      setPdfBlob(blob)
      setPdfUrl(urlBlob)
      
      // Сохраняем в localStorage с уникальным ID
      const docId = `ai-agent-${Date.now()}`
      const pdfDoc = {
        id: docId,
        type: 'AI Agent Жауабы',
        text: `PDF загружен из URL: ${url}`,
        createdAt: new Date().toISOString(),
        blobUrl: urlBlob,
        history: [{
          id: Date.now().toString(),
          action: 'created' as const,
          timestamp: new Date().toISOString(),
          details: `PDF загружен из ${url}`,
        }],
      }
      storage.savePDF(pdfDoc)
      
      console.log('✅ PDF сохранен в localStorage с ID:', docId)
      console.log('📋 Всего документов в хранилище:', storage.getPDFs().length)
      setStatusText('PDF готов и сохранен')
    } catch (error: any) {
      console.error('❌ Ошибка загрузки PDF:', error)
      setError(`Ошибка загрузки PDF: ${error.message}`)
      setStatusText('Ошибка загрузки PDF. Попробуйте еще раз.')
      throw error
    } finally {
      setGeneratingPdf(false)
    }
  }

  const generatePDFFromText = async (text: string) => {
    try {
      setGeneratingPdf(true)
      setStatusText('PDF жасалуда...')
      
      console.log('📝 Генерация PDF из текста, длина текста:', text.length)
      
      // Генерируем PDF из текста
      const blob = await createPDF({
        type: 'AI Agent Жауабы',
        text: text,
      })
      
      console.log('✅ PDF сгенерирован, размер:', blob.size, 'байт')
      
      if (blob.size === 0) {
        throw new Error('Сгенерированный PDF пуст')
      }
      
      const url = URL.createObjectURL(blob)
      setPdfBlob(blob)
      setPdfUrl(url)
      
      // Сохраняем в localStorage с уникальным ID
      const docId = `ai-agent-${Date.now()}`
      const html = `<div style="font-family: 'Times New Roman', serif; padding: 40px;">
        <h2 style="text-align: center; font-size: 20px; margin-bottom: 30px; font-weight: bold;">
          AI Agent Жауабы
        </h2>
        <div style="font-size: 16px; line-height: 1.8; text-align: justify;">
          ${text.split('\n').map(p => `<p style="margin-bottom: 12px;">${p}</p>`).join('')}
        </div>
        <div style="margin-top: 60px;">
          <p style="font-size: 14px;">Күні: ${new Date().toLocaleDateString('kk-KZ')}</p>
        </div>
      </div>`
      
      const pdfDoc = {
        id: docId,
        type: 'AI Agent Жауабы',
        text: html,
        createdAt: new Date().toISOString(),
        blobUrl: url,
        history: [{
          id: Date.now().toString(),
          action: 'created' as const,
          timestamp: new Date().toISOString(),
          details: 'PDF сгенерирован из текстового ответа AI',
        }],
      }
      storage.savePDF(pdfDoc)
      
      console.log('✅ PDF сохранен в localStorage с ID:', docId)
      console.log('📋 Всего документов в хранилище:', storage.getPDFs().length)
      setStatusText('PDF дайын және сақталды')
    } catch (error: any) {
      console.error('❌ Ошибка генерации PDF:', error)
      setError(`Ошибка генерации PDF: ${error.message}`)
      setStatusText('PDF жасау кезінде қате пайда болды')
      throw error // Пробрасываем ошибку дальше
    } finally {
      setGeneratingPdf(false)
    }
  }

  const downloadPDF = () => {
    if (pdfBlob) {
      saveAs(pdfBlob, 'AI_Agent_Жауабы.pdf')
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
      <button
        onClick={() => navigate('/dashboard')}
        className="absolute top-6 left-6 flex items-center gap-2 text-gray-600 hover:text-gray-800 transition"
      >
        <FiArrowLeft />
        Артқа
      </button>

      {/* PDF Preview */}
      {(pdfUrl || pdfDirectUrl) && (
        <div className="w-full max-w-5xl mb-8 animate-fade-in bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path>
              </svg>
              <h3 className="text-xl font-bold text-gray-800">PDF дайын</h3>
              <span className="text-sm text-gray-500">
                ({new Date().toLocaleTimeString('kk-KZ')})
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => navigate('/my-documents')}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition"
                title="Барлық құжаттарды көру"
              >
                <FiFolder />
                Барлық құжаттар
              </button>
              {pdfDirectUrl && (
                <>
                  <a
                    href={pdfDirectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition"
                    title="Жаңа вкладкада ашу"
                  >
                    <FiEye />
                    Ашу
                  </a>
                  <a
                    href={pdfDirectUrl}
                    download
                    className="flex items-center gap-2 bg-primary hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
                    title="PDF жүктеу"
                  >
                    <FiDownload />
                    Жүктеу
                  </a>
                </>
              )}
              {pdfBlob && pdfUrl && (
                <>
                  <a
                    href={pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition"
                    title="Жаңа вкладкада ашу"
                  >
                    <FiEye />
                    Ашу
                  </a>
                  <button
                    onClick={downloadPDF}
                    className="flex items-center gap-2 bg-primary hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
                  >
                    <FiDownload />
                    Жүктеу
                  </button>
                </>
              )}
            </div>
          </div>
          
          {pdfLoadError ? (
            <div className="border border-gray-300 rounded-lg bg-gray-50 p-8 text-center">
              <div className="mb-4">
                <svg className="w-16 h-16 text-blue-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-gray-800 mb-2">PDF дайын</h4>
              <p className="text-gray-600 mb-4">
                PDF файл дайын, бірақ браузерде көрсету мүмкін емес (CORS қатесі).
                <br />
                Төмендегі батырмаларды пайдаланып PDF-ті ашыңыз немесе жүктеңіз.
              </p>
              <div className="flex gap-3 justify-center">
                <a
                  href={pdfDirectUrl!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition"
                >
                  <FiEye />
                  PDF ашу
                </a>
                <a
                  href={pdfDirectUrl!}
                  download
                  className="flex items-center gap-2 bg-primary hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition"
                >
                  <FiDownload />
                  PDF жүктеу
                </a>
              </div>
            </div>
          ) : pdfUrl ? (
            <div className="border border-gray-300 rounded-lg bg-gray-50 overflow-hidden shadow-inner">
              <iframe
                src={pdfUrl}
                className="w-full h-[700px] border-0"
                title="PDF Preview"
                onError={() => {
                  console.error('Ошибка загрузки PDF в iframe')
                  setPdfLoadError(true)
                }}
              />
            </div>
          ) : null}
          
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>ℹ️ Құжат сақталды:</strong> PDF сақталды және "Менің құжаттарым" бөлімінде қолжетімді.
            </p>
          </div>
        </div>
      )}

      {/* Text Response (если нет PDF) */}
      {response && !pdfUrl && response.text && (
        <div className="w-full max-w-4xl mb-8 animate-fade-in">
          <div className="flex items-center justify-center gap-3 mb-4">
            <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path>
            </svg>
            <div className="text-sm text-gray-500">Ответ получен</div>
          </div>
          <div className="text-gray-800 text-base leading-relaxed text-center bg-white rounded-lg p-6 shadow-lg">
            {response.text}
          </div>
          {response.audio && (
            <div className="mt-4 text-center">
              <button
                onClick={() => playAudio(response.audio!)}
                className="flex items-center gap-2 bg-primary hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition mx-auto"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M6.343 6.343l13.314 13.314M6.343 17.657L19.657 4.343"></path>
                </svg>
                Тыңдау
              </button>
            </div>
          )}
        </div>
      )}

      {/* Audio Visualizer Circle */}
      <div className="relative w-[400px] h-[400px] flex items-center justify-center">
        {/* Blue Glow */}
        <div
          className={`absolute w-[400px] h-[400px] rounded-full bg-gradient-radial from-blue-400/10 to-transparent transition-all ${
            state === 'recording' ? 'animate-pulse' : ''
          }`}
          style={{
            background: state === 'recording'
              ? 'radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, rgba(59, 130, 246, 0) 70%)'
              : 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0) 70%)',
          }}
        />

        {/* Audio Segments */}
        {Array.from({ length: 16 }).map((_, i) => (
          <div
            key={i}
            className={`absolute w-[200px] h-[200px] rounded-full opacity-30 transition-all ${
              state === 'recording' ? 'animate-pulse opacity-60' : ''
            }`}
            style={{
              background: i % 2 === 0 ? '#60a5fa' : '#3b82f6',
              clipPath: `polygon(50% 50%, ${50 + 50 * Math.cos((i * 22.5 - 90) * Math.PI / 180)}% ${50 + 50 * Math.sin((i * 22.5 - 90) * Math.PI / 180)}%, ${50 + 50 * Math.cos(((i + 1) * 22.5 - 90) * Math.PI / 180)}% ${50 + 50 * Math.sin(((i + 1) * 22.5 - 90) * Math.PI / 180)}%)`,
            }}
          />
        ))}

        {/* Center Button */}
        <button
          onClick={toggleRecording}
          disabled={state === 'processing'}
          className={`relative z-10 px-10 py-5 rounded-full text-white font-semibold text-lg flex items-center gap-3 shadow-lg transition-all ${
            state === 'recording'
              ? 'bg-gradient-to-r from-green-500 to-green-600 animate-pulse'
              : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
          } ${state === 'processing' ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
        >
          <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
            <FiMic className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <span>
            {state === 'recording' ? 'Recording...' : 'Call Teacher Assist'}
          </span>
        </button>
      </div>

      {/* Status Text */}
      <div className="mt-6 text-lg text-center">
        {error ? (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg max-w-2xl mx-auto">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <p className="text-red-700 font-medium">{error}</p>
            </div>
            <p className="text-sm text-red-600 mt-2">
              Откройте консоль браузера (F12) для подробностей
            </p>
          </div>
        ) : (
          <p className="text-gray-600">{statusText}</p>
        )}
      </div>

      {/* Loading Overlay */}
      {(state === 'processing' || generatingPdf) && (
        <div className="fixed inset-0 bg-blue-900/75 flex items-center justify-center z-50">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white text-xl font-medium">
              {generatingPdf ? 'PDF жасалуда...' : 'Обработка запроса...'}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default VoiceReport
