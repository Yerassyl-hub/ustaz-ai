// Voice Agent utility для интеграции с n8n webhook
// Адаптировано из AI Agent проекта

export interface VoiceAgentConfig {
  n8nWebhookUrl: string
  maxRecordingDuration?: number
  mimeType?: string
}

const DEFAULT_CONFIG: Partial<VoiceAgentConfig> = {
  maxRecordingDuration: 30000, // 30 секунд
  mimeType: 'audio/webm;codecs=opus',
}

export class VoiceAgent {
  private config: VoiceAgentConfig
  private mediaRecorder: MediaRecorder | null = null
  private audioStream: MediaStream | null = null
  private audioChunks: Blob[] = []
  private isRecording = false

  constructor(config: VoiceAgentConfig) {
    this.config = { ...DEFAULT_CONFIG, ...config } as VoiceAgentConfig
  }

  /**
   * Начать запись
   */
  async startRecording(): Promise<void> {
    if (this.isRecording) {
      console.log('Уже идет запись')
      return
    }

    try {
      // Запрашиваем доступ к микрофону
      this.audioStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        },
      })

      // Создаем MediaRecorder
      this.mediaRecorder = new MediaRecorder(this.audioStream, {
        mimeType: this.config.mimeType,
      })

      this.audioChunks = []

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data)
        }
      }

      this.mediaRecorder.onstop = async () => {
        if (this.audioStream) {
          this.audioStream.getTracks().forEach((track) => track.stop())
          this.audioStream = null
        }
      }

      this.mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event)
        this.isRecording = false
      }

      // Начинаем запись
      this.mediaRecorder.start()
      this.isRecording = true

      // Автоматическая остановка через максимальное время
      setTimeout(() => {
        if (this.isRecording) {
          this.stopRecording()
        }
      }, this.config.maxRecordingDuration || 30000)
    } catch (error) {
      console.error('Ошибка доступа к микрофону:', error)
      throw new Error('Не удалось получить доступ к микрофону')
    }
  }

  /**
   * Остановить запись
   */
  async stopRecording(): Promise<Blob | null> {
    if (!this.isRecording || !this.mediaRecorder) {
      return null
    }

    return new Promise((resolve) => {
      // Сохраняем обработчик onstop
      const originalOnStop = this.mediaRecorder!.onstop

      // Устанавливаем новый обработчик, который создаст blob
      this.mediaRecorder!.onstop = () => {
        // Вызываем оригинальный обработчик если он был
        if (originalOnStop && this.mediaRecorder) {
          originalOnStop.call(this.mediaRecorder, new Event('stop'))
        }

        // Останавливаем поток
        if (this.audioStream) {
          this.audioStream.getTracks().forEach((track) => track.stop())
          this.audioStream = null
        }

        this.isRecording = false

        // Создаем blob из записанных чанков
        if (this.audioChunks.length > 0) {
          const audioBlob = new Blob(this.audioChunks, {
            type: this.config.mimeType,
          })
          resolve(audioBlob)
        } else {
          console.warn('Нет аудио данных для создания blob')
          resolve(null)
        }
      }

      // Останавливаем recorder
      try {
        if (this.mediaRecorder && (this.mediaRecorder.state === 'recording' || this.mediaRecorder.state === 'paused')) {
          // Запрашиваем последний чанк данных
          this.mediaRecorder.requestData()
          
          // Небольшая задержка перед остановкой, чтобы data event успел сработать
          setTimeout(() => {
            if (this.mediaRecorder && (this.mediaRecorder.state === 'recording' || this.mediaRecorder.state === 'paused')) {
              this.mediaRecorder.stop()
            } else {
              // Если recorder уже остановлен, создаем blob из имеющихся чанков
              if (this.audioChunks.length > 0) {
                const audioBlob = new Blob(this.audioChunks, {
                  type: this.config.mimeType,
                })
                resolve(audioBlob)
              } else {
                resolve(null)
              }
            }
          }, 200)
        } else {
          // Если recorder уже остановлен, создаем blob из имеющихся чанков
          if (this.audioChunks.length > 0) {
            const audioBlob = new Blob(this.audioChunks, {
              type: this.config.mimeType,
            })
            resolve(audioBlob)
          } else {
            resolve(null)
          }
        }
      } catch (error) {
        console.error('Ошибка остановки recorder:', error)
        // В случае ошибки пытаемся создать blob из имеющихся данных
        if (this.audioChunks.length > 0) {
          const audioBlob = new Blob(this.audioChunks, {
            type: this.config.mimeType,
          })
          resolve(audioBlob)
        } else {
          resolve(null)
        }
      }
    })
  }

  /**
   * Отправить аудио в n8n webhook
   */
  async sendToN8N(audioBlob: Blob): Promise<{ text: string; audio?: string }> {
    if (!this.config.n8nWebhookUrl) {
      throw new Error('n8n webhook URL не настроен')
    }

    try {
      // Создаем FormData
      const formData = new FormData()
      formData.append('audio', audioBlob, 'recording.webm')

      // Отправляем запрос
      const response = await fetch(this.config.n8nWebhookUrl, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`)
      }

      // Проверяем Content-Type
      const contentType = response.headers.get('content-type')
      let data

      if (contentType && contentType.includes('application/json')) {
        const responseText = await response.text()
        if (responseText.trim() === '' || responseText.trim() === '{}') {
          data = { text: '', audio: '' }
        } else {
          data = JSON.parse(responseText)
        }
      } else if (contentType && contentType.includes('audio')) {
        // Если ответ - аудио файл, конвертируем в base64
        const blob = await response.blob()
        const reader = new FileReader()
        data = await new Promise<{ text: string; audio: string }>((resolve, reject) => {
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
      } else {
        await response.text() // Просто читаем для очистки
        throw new Error(`Неподдерживаемый формат ответа. Получен: ${contentType || 'unknown'}`)
      }

      // Проверяем формат данных
      if (!data || typeof data !== 'object') {
        throw new Error('Некорректный формат ответа от n8n')
      }

      // Если нет text, но есть другие поля
      if (!data.text) {
        data.text = data.response || data.output || data.message || ''
      }

      return {
        text: data.text || '',
        audio: data.audio,
      }
    } catch (error) {
      console.error('Ошибка отправки в n8n:', error)
      throw error
    }
  }

  /**
   * Получить состояние записи
   */
  getRecordingState(): boolean {
    return this.isRecording
  }

  /**
   * Очистить ресурсы
   */
  cleanup(): void {
    if (this.audioStream) {
      this.audioStream.getTracks().forEach((track) => track.stop())
      this.audioStream = null
    }
    this.mediaRecorder = null
    this.audioChunks = []
    this.isRecording = false
  }
}

