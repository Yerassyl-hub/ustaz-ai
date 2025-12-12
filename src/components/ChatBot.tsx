import { useEffect } from 'react'

function ChatBot() {
  useEffect(() => {
    // Проверяем, не загружен ли уже чат
    if ((window as any).n8nChatInitialized) {
      return
    }

    // Загружаем CSS
    const link = document.createElement('link')
    link.id = 'n8n-chat-styles'
    link.href = 'https://cdn.jsdelivr.net/npm/@n8n/chat/dist/style.css'
    link.rel = 'stylesheet'
    document.head.appendChild(link)

    // Загружаем и инициализируем чат через script тег
    const script = document.createElement('script')
    script.type = 'module'
    script.id = 'n8n-chat-script'
    script.textContent = `
      import { createChat } from 'https://cdn.jsdelivr.net/npm/@n8n/chat/dist/chat.bundle.es.js';
      
      try {
        createChat({
          webhookUrl: 'https://nurik02.app.n8n.cloud/webhook/755b1cf7-ecca-4fc1-988f-decab37f24c2/chat',
          webhookConfig: {
            method: 'POST',
            headers: {}
          },
          target: '#n8n-chat',
          mode: 'window',
          chatInputKey: 'chatInput',
          chatSessionKey: 'sessionId',
          loadPreviousSession: true,
          metadata: {},
          showWelcomeScreen: false,
          defaultLanguage: 'en',
          initialMessages: [
            'Сәлем! 👋',
            'Мен Ustaz ai дың вертуалды көмекшісімін'
          ],
          i18n: {
            en: {
              title: 'Сәлем! 👋',
              subtitle: "Сөйлесуді бастаңыз. Біз сізге көмектесу үшін 24/7 осындамыз.",
              footer: '',
              getStarted: 'New Conversation',
              inputPlaceholder: 'Type your question..',
            },
          },
          enableStreaming: false,
        });
        window.n8nChatInitialized = true;
        console.log('✅ Чат-бот n8n успешно загружен');
      } catch (error) {
        console.error('❌ Ошибка создания чата:', error);
      }
    `
    script.onerror = () => {
      console.error('❌ Ошибка загрузки скрипта чат-бота')
    }
    
    // Добавляем скрипт с небольшой задержкой, чтобы CSS успел загрузиться
    setTimeout(() => {
      document.body.appendChild(script)
    }, 100)

    // Cleanup не выполняем, чтобы чат оставался доступным при навигации
  }, [])

  return null
}

export default ChatBot

