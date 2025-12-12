// Шаблоны документов для казахстанских школ

export interface DocumentTemplate {
  id: string
  name: string
  nameKz: string
  orderCode?: string // Код приказа (Adilet)
  orderUrlKz?: string // Ссылка на приказ (казахский)
  orderUrlRu?: string // Ссылка на приказ (русский)
  template: (data: Record<string, any>) => string
  fields: Array<{
    key: string
    label: string
    labelKz: string
    type: 'text' | 'textarea' | 'number' | 'date' | 'select'
    required?: boolean
    options?: string[]
    dataSource?: 'schools' | 'classes' | 'teachers' | 'subjects' | 'students' // Источник данных из API
    dependsOn?: string // Поле, от которого зависит загрузка данных (например, класс зависит от школы)
  }>
}

export const documentTemplates: DocumentTemplate[] = [
  {
    id: 'ktp',
    name: 'Календарно-тематическое планирование',
    nameKz: 'Күнтізбелік-тақырыптық жоспар',
    orderCode: 'V2100024429',
    orderUrlKz: 'https://adilet.zan.kz/kaz/docs/V2100024429',
    orderUrlRu: 'https://adilet.zan.kz/rus/docs/V2100024429',
    fields: [
      { key: 'subject', label: 'Предмет', labelKz: 'Пән', type: 'select', required: true, dataSource: 'subjects' },
      { key: 'class', label: 'Класс', labelKz: 'Сынып', type: 'select', required: true, dataSource: 'classes' },
      { key: 'teacher', label: 'ФИО учителя', labelKz: 'Мұғалімнің аты-жөні', type: 'select', required: true, dataSource: 'teachers' },
      { key: 'academicYear', label: 'Учебный год', labelKz: 'Оқу жылы', type: 'text', required: true },
    ],
    template: (data) => `
      <div style="font-family: 'Times New Roman', serif; padding: 40px; max-width: 1000px; margin: 0 auto;">
        <h2 style="text-align: center; text-transform: uppercase; font-size: 18px; margin-bottom: 20px;">
          КҮНТІЗБЕЛІК-ТАҚЫРЫПТЫҚ ЖОСПАР
        </h2>
        <h3 style="text-align: center; font-size: 16px; margin-bottom: 30px;">
          ${data.subject || 'Пән'} | ${data.class || 'Сынып'} | ${data.academicYear || 'Оқу жылы'}
        </h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 12px;">
          <thead>
            <tr style="background-color: #f0f0f0;">
              <th style="border: 1px solid #000; padding: 8px; text-align: center;">№</th>
              <th style="border: 1px solid #000; padding: 8px; text-align: center;">Тақырып</th>
              <th style="border: 1px solid #000; padding: 8px; text-align: center;">Сағат саны</th>
              <th style="border: 1px solid #000; padding: 8px; text-align: center;">Оқу мақсаттары (код)</th>
              <th style="border: 1px solid #000; padding: 8px; text-align: center;">Күні</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="border: 1px solid #000; padding: 8px; text-align: center;">1</td>
              <td style="border: 1px solid #000; padding: 8px;">${data.topic1 || 'Тақырып 1'}</td>
              <td style="border: 1px solid #000; padding: 8px; text-align: center;">2</td>
              <td style="border: 1px solid #000; padding: 8px;">${data.objective1 || '7.1.1.1'}</td>
              <td style="border: 1px solid #000; padding: 8px; text-align: center;">${data.date1 || ''}</td>
            </tr>
          </tbody>
        </table>
        <div style="margin-top: 40px;">
          <p style="font-size: 14px;"><strong>Мұғалім:</strong> ${data.teacher || '________________'}</p>
          <p style="font-size: 14px; margin-top: 20px;"><strong>Бекітті:</strong> ________________</p>
        </div>
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 11px; color: #666;">
          <p><strong>Ресми бұйрық:</strong> №V2100024429</p>
          <p><a href="https://adilet.zan.kz/kaz/docs/V2100024429" target="_blank" style="color: #2563EB;">Қазақша нұсқасы</a> | 
             <a href="https://adilet.zan.kz/rus/docs/V2100024429" target="_blank" style="color: #2563EB;">Русская версия</a></p>
        </div>
      </div>
    `,
  },
  {
    id: 'lesson-plan',
    name: 'Поурочный план',
    nameKz: 'Қысқа мерзімді жоспар',
    orderCode: 'V2100024429',
    orderUrlKz: 'https://adilet.zan.kz/kaz/docs/V2100024429',
    orderUrlRu: 'https://adilet.zan.kz/rus/docs/V2100024429',
    fields: [
      { key: 'subject', label: 'Предмет', labelKz: 'Пән', type: 'select', required: true, dataSource: 'subjects' },
      { key: 'class', label: 'Класс', labelKz: 'Сынып', type: 'select', required: true, dataSource: 'classes' },
      { key: 'teacher', label: 'ФИО учителя', labelKz: 'Мұғалімнің аты-жөні', type: 'select', required: true, dataSource: 'teachers' },
      { key: 'date', label: 'Дата', labelKz: 'Күні', type: 'date', required: true },
      { key: 'topic', label: 'Тема урока', labelKz: 'Сабақ тақырыбы', type: 'text', required: true },
      { key: 'objective', label: 'Цели обучения (код)', labelKz: 'Оқу мақсаты (код)', type: 'text', required: true },
      { key: 'allStudents', label: 'Все учащиеся смогут', labelKz: 'Барлық оқушылар біледі', type: 'textarea' },
      { key: 'mostStudents', label: 'Большинство учащихся смогут', labelKz: 'Көпшілік оқушылар біледі', type: 'textarea' },
      { key: 'someStudents', label: 'Некоторые учащиеся смогут', labelKz: 'Кейбір оқушылар біледі', type: 'textarea' },
      { key: 'lessonPlan', label: 'Ход урока', labelKz: 'Сабақ барысы', type: 'textarea', required: true },
    ],
    template: (data) => `
      <div style="font-family: 'Times New Roman', serif; padding: 40px; max-width: 800px; margin: 0 auto;">
        <h2 style="text-align: center; text-transform: uppercase; font-size: 18px; margin-bottom: 30px;">
          ҚЫСҚА МЕРЗІМДІ ЖОСПАР
        </h2>
        <div style="margin-bottom: 20px;">
          <p><strong>Пән:</strong> ${data.subject || ''}</p>
          <p><strong>Сынып:</strong> ${data.class || ''}</p>
          <p><strong>Мұғалім:</strong> ${data.teacher || ''}</p>
          <p><strong>Күні:</strong> ${data.date ? new Date(data.date).toLocaleDateString('kk-KZ') : ''}</p>
        </div>
        <div style="margin-bottom: 20px; padding: 15px; background-color: #f9f9f9; border-left: 4px solid #2563EB;">
          <h3 style="font-size: 16px; margin-bottom: 10px;"><strong>Сабақ тақырыбы:</strong></h3>
          <p style="font-size: 14px;">${data.topic || ''}</p>
        </div>
        <div style="margin-bottom: 20px;">
          <h3 style="font-size: 16px; margin-bottom: 10px;"><strong>Оқу мақсаттары (бағдарламаға сілтеме):</strong></h3>
          <p style="font-size: 14px;">${data.objective || ''}</p>
        </div>
        <div style="margin-bottom: 20px;">
          <h3 style="font-size: 16px; margin-bottom: 10px;"><strong>Сабақ мақсаттары:</strong></h3>
          <p style="font-size: 14px; margin-bottom: 8px;"><strong>Барлық оқушылар біледі:</strong> ${data.allStudents || ''}</p>
          <p style="font-size: 14px; margin-bottom: 8px;"><strong>Көпшілік оқушылар біледі:</strong> ${data.mostStudents || ''}</p>
          <p style="font-size: 14px;"><strong>Кейбір оқушылар біледі:</strong> ${data.someStudents || ''}</p>
        </div>
        <div style="margin-bottom: 20px;">
          <h3 style="font-size: 16px; margin-bottom: 10px;"><strong>Сабақ барысы:</strong></h3>
          <div style="font-size: 14px; line-height: 1.8; white-space: pre-wrap;">${data.lessonPlan || ''}</div>
        </div>
        <div style="margin-top: 40px; text-align: right;">
          <p style="font-size: 14px;"><strong>Мұғалім:</strong> ${data.teacher || '________________'}</p>
        </div>
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 11px; color: #666;">
          <p><strong>Ресми бұйрық:</strong> №V2100024429</p>
          <p><a href="https://adilet.zan.kz/kaz/docs/V2100024429" target="_blank" style="color: #2563EB;">Қазақша нұсқасы</a> | 
             <a href="https://adilet.zan.kz/rus/docs/V2100024429" target="_blank" style="color: #2563EB;">Русская версия</a></p>
        </div>
      </div>
    `,
  },
  {
    id: 'control-analysis',
    name: 'Анализ СОР/СОЧ',
    nameKz: 'СОР/СОЧ талдауы',
    orderCode: 'V2200029326',
    orderUrlKz: 'https://adilet.zan.kz/kaz/docs/V2200029326',
    orderUrlRu: 'https://adilet.zan.kz/rus/docs/V2200029326',
    fields: [
      { key: 'subject', label: 'Предмет', labelKz: 'Пән', type: 'select', required: true, dataSource: 'subjects' },
      { key: 'class', label: 'Класс', labelKz: 'Сынып', type: 'select', required: true, dataSource: 'classes' },
      { key: 'quarter', label: 'Четверть', labelKz: 'Тоқсан', type: 'select', options: ['1', '2', '3', '4'], required: true },
      { key: 'type', label: 'Тип работы', labelKz: 'Жұмыс түрі', type: 'select', options: ['СОР', 'СОЧ'], required: true },
      { key: 'totalStudents', label: 'Всего учащихся', labelKz: 'Барлығы оқушы', type: 'number', required: true },
      { key: 'completed', label: 'Выполняли работу', labelKz: 'Жұмыс орындаған', type: 'number', required: true },
      { key: 'lowLevel', label: 'Низкий уровень (0-39%)', labelKz: 'Төмен деңгей', type: 'number', required: true },
      { key: 'mediumLevel', label: 'Средний уровень (40-84%)', labelKz: 'Орташа деңгей', type: 'number', required: true },
      { key: 'highLevel', label: 'Высокий уровень (85-100%)', labelKz: 'Жоғары деңгей', type: 'number', required: true },
      { key: 'difficulties', label: 'Трудности по целям обучения', labelKz: 'Оқу мақсаттары бойынша қиындықтар', type: 'textarea' },
      { key: 'conclusions', label: 'Выводы и план работы', labelKz: 'Қорытынды және жұмыс жоспары', type: 'textarea', required: true },
    ],
    template: (data) => {
      const total = parseInt(data.completed) || 0
      const low = parseInt(data.lowLevel) || 0
      const medium = parseInt(data.mediumLevel) || 0
      const high = parseInt(data.highLevel) || 0
      const quality = total > 0 ? Math.round(((medium + high) / total) * 100) : 0
      const success = total > 0 ? Math.round(((total - low) / total) * 100) : 0

      return `
        <div style="font-family: 'Times New Roman', serif; padding: 40px; max-width: 800px; margin: 0 auto;">
          <h2 style="text-align: center; text-transform: uppercase; font-size: 18px; margin-bottom: 30px;">
            СОР/СОЧ ТАЛДАУЫ
          </h2>
          <div style="margin-bottom: 20px;">
            <p><strong>Пән:</strong> ${data.subject || ''}</p>
            <p><strong>Сынып:</strong> ${data.class || ''}</p>
            <p><strong>Тоқсан:</strong> ${data.quarter || ''}</p>
            <p><strong>Жұмыс түрі:</strong> ${data.type || ''}</p>
          </div>
          <div style="margin-bottom: 20px; padding: 15px; background-color: #f9f9f9; border: 1px solid #ddd;">
            <p><strong>Барлығы оқушы:</strong> ${data.totalStudents || 0}</p>
            <p><strong>Жұмыс орындаған:</strong> ${data.completed || 0}</p>
          </div>
          <div style="margin-bottom: 20px;">
            <h3 style="font-size: 16px; margin-bottom: 10px;"><strong>Нәтижелер:</strong></h3>
            <ul style="font-size: 14px; line-height: 1.8;">
              <li><strong>Төмен деңгей (0-39%):</strong> ${low} оқушы</li>
              <li><strong>Орташа деңгей (40-84%):</strong> ${medium} оқушы</li>
              <li><strong>Жоғары деңгей (85-100%):</strong> ${high} оқушы</li>
            </ul>
            <div style="margin-top: 15px; padding: 10px; background-color: #e8f4f8;">
              <p><strong>Білім сапасы:</strong> ${quality}%</p>
              <p><strong>Сәттілік:</strong> ${success}%</p>
            </div>
          </div>
          ${data.difficulties ? `
            <div style="margin-bottom: 20px;">
              <h3 style="font-size: 16px; margin-bottom: 10px;"><strong>Оқу мақсаттары бойынша қиындықтар:</strong></h3>
              <p style="font-size: 14px; line-height: 1.8; white-space: pre-wrap;">${data.difficulties}</p>
            </div>
          ` : ''}
          <div style="margin-bottom: 20px;">
            <h3 style="font-size: 16px; margin-bottom: 10px;"><strong>Қорытынды және жұмыс жоспары:</strong></h3>
            <p style="font-size: 14px; line-height: 1.8; white-space: pre-wrap;">${data.conclusions || ''}</p>
          </div>
          <div style="margin-top: 40px; text-align: right;">
            <p style="font-size: 14px;"><strong>Қолы:</strong> ________________</p>
          </div>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 11px; color: #666;">
            <p><strong>Ресми бұйрық:</strong> №V2200029326</p>
            <p><a href="https://adilet.zan.kz/kaz/docs/V2200029326" target="_blank" style="color: #2563EB;">Қазақша нұсқасы</a> | 
               <a href="https://adilet.zan.kz/rus/docs/V2200029326" target="_blank" style="color: #2563EB;">Русская версия</a></p>
          </div>
        </div>
      `
    },
  },
  {
    id: 'parent-meeting',
    name: 'Протокол родительского собрания',
    nameKz: 'Ата-аналар жиналысының хаттамасы',
    orderCode: 'V2100024429',
    orderUrlKz: 'https://adilet.zan.kz/kaz/docs/V2100024429',
    orderUrlRu: 'https://adilet.zan.kz/rus/docs/V2100024429',
    fields: [
      { key: 'number', label: 'Номер протокола', labelKz: 'Хаттама нөмірі', type: 'number', required: true },
      { key: 'date', label: 'Дата', labelKz: 'Күні', type: 'date', required: true },
      { key: 'class', label: 'Класс', labelKz: 'Сынып', type: 'text', required: true },
      { key: 'topic', label: 'Тема собрания', labelKz: 'Жиналыс тақырыбы', type: 'text', required: true },
      { key: 'present', label: 'Присутствовали', labelKz: 'Қатысқан', type: 'number', required: true },
      { key: 'agenda', label: 'Повестка дня', labelKz: 'Күн тәртібі', type: 'textarea', required: true },
      { key: 'discussion', label: 'Слушали', labelKz: 'Тыңдалды', type: 'textarea', required: true },
      { key: 'decisions', label: 'Решили', labelKz: 'Қаулы', type: 'textarea', required: true },
      { key: 'chairman', label: 'Председатель', labelKz: 'Төраға', type: 'text' },
      { key: 'secretary', label: 'Секретарь', labelKz: 'Хатшы', type: 'text' },
    ],
    template: (data) => `
      <div style="font-family: 'Times New Roman', serif; padding: 40px; max-width: 800px; margin: 0 auto;">
        <h2 style="text-align: center; text-transform: uppercase; font-size: 18px; margin-bottom: 30px;">
          АТА-АНАЛАР ЖИНАЛЫСЫНЫҢ ХАТТАМАСЫ
        </h2>
        <div style="margin-bottom: 20px; text-align: center;">
          <p style="font-size: 16px;"><strong>ХАТТАМА №${data.number || ''}</strong></p>
          <p style="font-size: 14px;">${data.date ? new Date(data.date).toLocaleDateString('kk-KZ') : ''}</p>
        </div>
        <div style="margin-bottom: 20px;">
          <p><strong>Сынып:</strong> ${data.class || ''}</p>
          <p><strong>Тақырып:</strong> ${data.topic || ''}</p>
          <p><strong>Қатысқан:</strong> ${data.present || 0} ата-ана</p>
        </div>
        <div style="margin-bottom: 20px;">
          <h3 style="font-size: 16px; margin-bottom: 10px;"><strong>Күн тәртібі:</strong></h3>
          <div style="font-size: 14px; line-height: 1.8; white-space: pre-wrap;">${data.agenda || ''}</div>
        </div>
        <div style="margin-bottom: 20px;">
          <h3 style="font-size: 16px; margin-bottom: 10px;"><strong>Тыңдалды:</strong></h3>
          <div style="font-size: 14px; line-height: 1.8; white-space: pre-wrap;">${data.discussion || ''}</div>
        </div>
        <div style="margin-bottom: 20px;">
          <h3 style="font-size: 16px; margin-bottom: 10px;"><strong>Қаулы:</strong></h3>
          <div style="font-size: 14px; line-height: 1.8; white-space: pre-wrap;">${data.decisions || ''}</div>
        </div>
        <div style="margin-top: 40px;">
          <p style="font-size: 14px;"><strong>Төраға:</strong> ${data.chairman || '________________'}</p>
          <p style="font-size: 14px; margin-top: 10px;"><strong>Хатшы:</strong> ${data.secretary || '________________'}</p>
        </div>
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 11px; color: #666;">
          <p><strong>Ресми бұйрық:</strong> №V2100024429</p>
          <p><a href="https://adilet.zan.kz/kaz/docs/V2100024429" target="_blank" style="color: #2563EB;">Қазақша нұсқасы</a> | 
             <a href="https://adilet.zan.kz/rus/docs/V2100024429" target="_blank" style="color: #2563EB;">Русская версия</a></p>
        </div>
      </div>
    `,
  },
  {
    id: 'student-characteristic',
    name: 'Характеристика на ученика',
    nameKz: 'Оқушыға сипаттама',
    orderCode: 'V2100024429',
    orderUrlKz: 'https://adilet.zan.kz/kaz/docs/V2100024429',
    orderUrlRu: 'https://adilet.zan.kz/rus/docs/V2100024429',
    fields: [
      { key: 'studentName', label: 'ФИО ученика', labelKz: 'Оқушының аты-жөні', type: 'text', required: true },
      { key: 'class', label: 'Класс', labelKz: 'Сынып', type: 'text', required: true },
      { key: 'birthDate', label: 'Дата рождения', labelKz: 'Туған күні', type: 'date' },
      { key: 'academicPerformance', label: 'Успеваемость', labelKz: 'Оқу жетістігі', type: 'textarea', required: true },
      { key: 'behavior', label: 'Поведение', labelKz: 'Мінез-құлық', type: 'textarea', required: true },
      { key: 'personality', label: 'Личностные качества', labelKz: 'Жеке қасиеттері', type: 'textarea' },
      { key: 'recommendations', label: 'Рекомендации', labelKz: 'Ұсыныстар', type: 'textarea' },
    ],
    template: (data) => `
      <div style="font-family: 'Times New Roman', serif; padding: 40px; max-width: 800px; margin: 0 auto;">
        <h2 style="text-align: center; text-transform: uppercase; font-size: 18px; margin-bottom: 30px;">
          ОҚУШЫҒА СИПАТТАМА
        </h2>
        <div style="margin-bottom: 20px;">
          <p><strong>Оқушының аты-жөні:</strong> ${data.studentName || ''}</p>
          <p><strong>Сынып:</strong> ${data.class || ''}</p>
          ${data.birthDate ? `<p><strong>Туған күні:</strong> ${new Date(data.birthDate).toLocaleDateString('kk-KZ')}</p>` : ''}
        </div>
        <div style="margin-bottom: 20px;">
          <h3 style="font-size: 16px; margin-bottom: 10px;"><strong>Оқу жетістігі:</strong></h3>
          <p style="font-size: 14px; line-height: 1.8; white-space: pre-wrap;">${data.academicPerformance || ''}</p>
        </div>
        <div style="margin-bottom: 20px;">
          <h3 style="font-size: 16px; margin-bottom: 10px;"><strong>Мінез-құлық:</strong></h3>
          <p style="font-size: 14px; line-height: 1.8; white-space: pre-wrap;">${data.behavior || ''}</p>
        </div>
        ${data.personality ? `
          <div style="margin-bottom: 20px;">
            <h3 style="font-size: 16px; margin-bottom: 10px;"><strong>Жеке қасиеттері:</strong></h3>
            <p style="font-size: 14px; line-height: 1.8; white-space: pre-wrap;">${data.personality}</p>
          </div>
        ` : ''}
        ${data.recommendations ? `
          <div style="margin-bottom: 20px;">
            <h3 style="font-size: 16px; margin-bottom: 10px;"><strong>Ұсыныстар:</strong></h3>
            <p style="font-size: 14px; line-height: 1.8; white-space: pre-wrap;">${data.recommendations}</p>
          </div>
        ` : ''}
        <div style="margin-top: 40px; text-align: right;">
          <p style="font-size: 14px;"><strong>Класс жетекшісі:</strong> ________________</p>
          <p style="font-size: 14px; margin-top: 10px;"><strong>Директор:</strong> ________________</p>
        </div>
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 11px; color: #666;">
          <p><strong>Ресми бұйрық:</strong> №V2100024429</p>
          <p><a href="https://adilet.zan.kz/kaz/docs/V2100024429" target="_blank" style="color: #2563EB;">Қазақша нұсқасы</a> | 
             <a href="https://adilet.zan.kz/rus/docs/V2100024429" target="_blank" style="color: #2563EB;">Русская версия</a></p>
        </div>
      </div>
    `,
  },
  {
    id: 'quality-report',
    name: 'Отчет по качеству знаний',
    nameKz: 'Білім сапасы туралы есеп',
    orderCode: 'V2200029326',
    orderUrlKz: 'https://adilet.zan.kz/kaz/docs/V2200029326',
    orderUrlRu: 'https://adilet.zan.kz/rus/docs/V2200029326',
    fields: [
      { key: 'subject', label: 'Предмет', labelKz: 'Пән', type: 'select', required: true, dataSource: 'subjects' },
      { key: 'class', label: 'Класс', labelKz: 'Сынып', type: 'select', required: true, dataSource: 'classes' },
      { key: 'quarter', label: 'Четверть', labelKz: 'Тоқсан', type: 'select', options: ['1', '2', '3', '4', 'Год'], required: true },
      { key: 'totalStudents', label: 'Всего учащихся', labelKz: 'Барлығы оқушы', type: 'number', required: true },
      { key: 'excellent', label: 'Отличники (5)', labelKz: 'Өте жақсы (5)', type: 'number', required: true },
      { key: 'good', label: 'Хорошисты (4)', labelKz: 'Жақсы (4)', type: 'number', required: true },
      { key: 'satisfactory', label: 'Удовлетворительно (3)', labelKz: 'Қанағаттанарлық (3)', type: 'number', required: true },
      { key: 'unsatisfactory', label: 'Неудовлетворительно (2)', labelKz: 'Қанағаттанбайтын (2)', type: 'number' },
      { key: 'conclusions', label: 'Выводы', labelKz: 'Қорытынды', type: 'textarea' },
    ],
    template: (data) => {
      const total = parseInt(data.totalStudents) || 0
      const excellent = parseInt(data.excellent) || 0
      const good = parseInt(data.good) || 0
      const satisfactory = parseInt(data.satisfactory) || 0
      const unsatisfactory = parseInt(data.unsatisfactory) || 0
      const quality = total > 0 ? Math.round(((excellent + good) / total) * 100) : 0
      const success = total > 0 ? Math.round(((total - unsatisfactory) / total) * 100) : 0

      return `
        <div style="font-family: 'Times New Roman', serif; padding: 40px; max-width: 800px; margin: 0 auto;">
          <h2 style="text-align: center; text-transform: uppercase; font-size: 18px; margin-bottom: 30px;">
            БІЛІМ САПАСЫ ТУРАЛЫ ЕСЕП
          </h2>
          <div style="margin-bottom: 20px;">
            <p><strong>Пән:</strong> ${data.subject || ''}</p>
            <p><strong>Сынып:</strong> ${data.class || ''}</p>
            <p><strong>Тоқсан:</strong> ${data.quarter || ''}</p>
          </div>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px;">
            <thead>
              <tr style="background-color: #f0f0f0;">
                <th style="border: 1px solid #000; padding: 10px; text-align: center;">Баға</th>
                <th style="border: 1px solid #000; padding: 10px; text-align: center;">Оқушылар саны</th>
                <th style="border: 1px solid #000; padding: 10px; text-align: center;">%</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="border: 1px solid #000; padding: 10px; text-align: center;">5 (Өте жақсы)</td>
                <td style="border: 1px solid #000; padding: 10px; text-align: center;">${excellent}</td>
                <td style="border: 1px solid #000; padding: 10px; text-align: center;">${total > 0 ? Math.round((excellent / total) * 100) : 0}%</td>
              </tr>
              <tr>
                <td style="border: 1px solid #000; padding: 10px; text-align: center;">4 (Жақсы)</td>
                <td style="border: 1px solid #000; padding: 10px; text-align: center;">${good}</td>
                <td style="border: 1px solid #000; padding: 10px; text-align: center;">${total > 0 ? Math.round((good / total) * 100) : 0}%</td>
              </tr>
              <tr>
                <td style="border: 1px solid #000; padding: 10px; text-align: center;">3 (Қанағаттанарлық)</td>
                <td style="border: 1px solid #000; padding: 10px; text-align: center;">${satisfactory}</td>
                <td style="border: 1px solid #000; padding: 10px; text-align: center;">${total > 0 ? Math.round((satisfactory / total) * 100) : 0}%</td>
              </tr>
              ${unsatisfactory > 0 ? `
              <tr>
                <td style="border: 1px solid #000; padding: 10px; text-align: center;">2 (Қанағаттанбайтын)</td>
                <td style="border: 1px solid #000; padding: 10px; text-align: center;">${unsatisfactory}</td>
                <td style="border: 1px solid #000; padding: 10px; text-align: center;">${total > 0 ? Math.round((unsatisfactory / total) * 100) : 0}%</td>
              </tr>
              ` : ''}
            </tbody>
          </table>
          <div style="margin-top: 20px; padding: 15px; background-color: #e8f4f8;">
            <p><strong>Барлығы оқушы:</strong> ${total}</p>
            <p><strong>Білім сапасы:</strong> ${quality}%</p>
            <p><strong>Сәттілік:</strong> ${success}%</p>
          </div>
          ${data.conclusions ? `
            <div style="margin-top: 20px;">
              <h3 style="font-size: 16px; margin-bottom: 10px;"><strong>Қорытынды:</strong></h3>
              <p style="font-size: 14px; line-height: 1.8; white-space: pre-wrap;">${data.conclusions}</p>
            </div>
          ` : ''}
          <div style="margin-top: 40px; text-align: right;">
            <p style="font-size: 14px;"><strong>Мұғалім:</strong> ________________</p>
          </div>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 11px; color: #666;">
            <p><strong>Ресми бұйрық:</strong> №V2200029326</p>
            <p><a href="https://adilet.zan.kz/kaz/docs/V2200029326" target="_blank" style="color: #2563EB;">Қазақша нұсқасы</a> | 
               <a href="https://adilet.zan.kz/rus/docs/V2200029326" target="_blank" style="color: #2563EB;">Русская версия</a></p>
          </div>
        </div>
      `
    },
  },
  {
    id: 'education-plan',
    name: 'План воспитательной работы',
    nameKz: 'Тәрбие жоспары',
    orderCode: 'V2100024429',
    orderUrlKz: 'https://adilet.zan.kz/kaz/docs/V2100024429',
    orderUrlRu: 'https://adilet.zan.kz/rus/docs/V2100024429',
    fields: [
      { key: 'class', label: 'Класс', labelKz: 'Сынып', type: 'text', required: true },
      { key: 'teacher', label: 'Классный руководитель', labelKz: 'Класс жетекшісі', type: 'text', required: true },
      { key: 'academicYear', label: 'Учебный год', labelKz: 'Оқу жылы', type: 'text', required: true },
      { key: 'goals', label: 'Цели воспитательной работы', labelKz: 'Тәрбие жұмысының мақсаттары', type: 'textarea', required: true },
      { key: 'activities', label: 'Мероприятия', labelKz: 'Іс-шаралар', type: 'textarea', required: true },
    ],
    template: (data) => `
      <div style="font-family: 'Times New Roman', serif; padding: 40px; max-width: 800px; margin: 0 auto;">
        <h2 style="text-align: center; text-transform: uppercase; font-size: 18px; margin-bottom: 30px;">
          ТӘРБИЕ ЖОСПАРЫ
        </h2>
        <div style="margin-bottom: 20px;">
          <p><strong>Сынып:</strong> ${data.class || ''}</p>
          <p><strong>Класс жетекшісі:</strong> ${data.teacher || ''}</p>
          <p><strong>Оқу жылы:</strong> ${data.academicYear || ''}</p>
        </div>
        <div style="margin-bottom: 20px;">
          <h3 style="font-size: 16px; margin-bottom: 10px;"><strong>Тәрбие жұмысының мақсаттары:</strong></h3>
          <div style="font-size: 14px; line-height: 1.8; white-space: pre-wrap;">${data.goals || ''}</div>
        </div>
        <div style="margin-bottom: 20px;">
          <h3 style="font-size: 16px; margin-bottom: 10px;"><strong>Іс-шаралар:</strong></h3>
          <div style="font-size: 14px; line-height: 1.8; white-space: pre-wrap;">${data.activities || ''}</div>
        </div>
        <div style="margin-top: 40px; text-align: right;">
          <p style="font-size: 14px;"><strong>Класс жетекшісі:</strong> ${data.teacher || '________________'}</p>
        </div>
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 11px; color: #666;">
          <p><strong>Ресми бұйрық:</strong> №V2100024429</p>
          <p><a href="https://adilet.zan.kz/kaz/docs/V2100024429" target="_blank" style="color: #2563EB;">Қазақша нұсқасы</a> | 
             <a href="https://adilet.zan.kz/rus/docs/V2100024429" target="_blank" style="color: #2563EB;">Русская версия</a></p>
        </div>
      </div>
    `,
  },
  {
    id: 'class-passport',
    name: 'Социальный паспорт класса',
    nameKz: 'Сыныптың әлеуметтік паспорты',
    orderCode: 'V2000020317',
    orderUrlKz: 'https://adilet.zan.kz/kaz/docs/V2000020317',
    orderUrlRu: 'https://adilet.zan.kz/rus/docs/V2000020317',
    fields: [
      { key: 'class', label: 'Класс', labelKz: 'Сынып', type: 'text', required: true },
      { key: 'totalStudents', label: 'Всего учащихся', labelKz: 'Барлығы оқушы', type: 'number', required: true },
      { key: 'boys', label: 'Мальчиков', labelKz: 'Ұлдар', type: 'number', required: true },
      { key: 'girls', label: 'Девочек', labelKz: 'Қыздар', type: 'number', required: true },
      { key: 'fullFamilies', label: 'Полных семей', labelKz: 'Толық отбасылар', type: 'number' },
      { key: 'incompleteFamilies', label: 'Неполных семей', labelKz: 'Толық емес отбасылар', type: 'number' },
      { key: 'largeFamilies', label: 'Многодетных семей', labelKz: 'Көпбалалы отбасылар', type: 'number' },
      { key: 'lowIncome', label: 'Малообеспеченных', labelKz: 'Төмен табысты', type: 'number' },
      { key: 'guardianship', label: 'Опекаемых', labelKz: 'Қамқорлықтағы', type: 'number' },
      { key: 'disabled', label: 'С инвалидностью', labelKz: 'Мүгедектігі бар', type: 'number' },
    ],
    template: (data) => `
      <div style="font-family: 'Times New Roman', serif; padding: 40px; max-width: 800px; margin: 0 auto;">
        <h2 style="text-align: center; text-transform: uppercase; font-size: 18px; margin-bottom: 30px;">
          СЫНЫПТЫҢ ӘЛЕУМЕТТІК ПАСПОРТЫ
        </h2>
        <div style="margin-bottom: 20px;">
          <p><strong>Сынып:</strong> ${data.class || ''}</p>
          <p><strong>Оқу жылы:</strong> ${new Date().getFullYear()}-${new Date().getFullYear() + 1}</p>
        </div>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px;">
          <tr>
            <td style="border: 1px solid #000; padding: 10px;"><strong>Барлығы оқушы:</strong></td>
            <td style="border: 1px solid #000; padding: 10px; text-align: center;">${data.totalStudents || 0}</td>
          </tr>
          <tr>
            <td style="border: 1px solid #000; padding: 10px;"><strong>Ұлдар:</strong></td>
            <td style="border: 1px solid #000; padding: 10px; text-align: center;">${data.boys || 0}</td>
          </tr>
          <tr>
            <td style="border: 1px solid #000; padding: 10px;"><strong>Қыздар:</strong></td>
            <td style="border: 1px solid #000; padding: 10px; text-align: center;">${data.girls || 0}</td>
          </tr>
          <tr>
            <td style="border: 1px solid #000; padding: 10px;"><strong>Толық отбасылар:</strong></td>
            <td style="border: 1px solid #000; padding: 10px; text-align: center;">${data.fullFamilies || 0}</td>
          </tr>
          <tr>
            <td style="border: 1px solid #000; padding: 10px;"><strong>Толық емес отбасылар:</strong></td>
            <td style="border: 1px solid #000; padding: 10px; text-align: center;">${data.incompleteFamilies || 0}</td>
          </tr>
          <tr>
            <td style="border: 1px solid #000; padding: 10px;"><strong>Көпбалалы отбасылар:</strong></td>
            <td style="border: 1px solid #000; padding: 10px; text-align: center;">${data.largeFamilies || 0}</td>
          </tr>
          <tr>
            <td style="border: 1px solid #000; padding: 10px;"><strong>Төмен табысты:</strong></td>
            <td style="border: 1px solid #000; padding: 10px; text-align: center;">${data.lowIncome || 0}</td>
          </tr>
          <tr>
            <td style="border: 1px solid #000; padding: 10px;"><strong>Қамқорлықтағы:</strong></td>
            <td style="border: 1px solid #000; padding: 10px; text-align: center;">${data.guardianship || 0}</td>
          </tr>
          <tr>
            <td style="border: 1px solid #000; padding: 10px;"><strong>Мүгедектігі бар:</strong></td>
            <td style="border: 1px solid #000; padding: 10px; text-align: center;">${data.disabled || 0}</td>
          </tr>
        </table>
        <div style="margin-top: 40px; text-align: right;">
          <p style="font-size: 14px;"><strong>Класс жетекшісі:</strong> ________________</p>
        </div>
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 11px; color: #666;">
          <p><strong>Ресми бұйрық:</strong> №V2000020317</p>
          <p><a href="https://adilet.zan.kz/kaz/docs/V2000020317" target="_blank" style="color: #2563EB;">Қазақша нұсқасы</a> | 
             <a href="https://adilet.zan.kz/rus/docs/V2000020317" target="_blank" style="color: #2563EB;">Русская версия</a></p>
        </div>
      </div>
    `,
  },
  {
    id: 'safety-journal',
    name: 'Журнал инструктажа по ТБ',
    nameKz: 'Қауіпсіздік техникасы бойынша нұсқау журналы',
    orderCode: 'V2100024429',
    orderUrlKz: 'https://adilet.zan.kz/kaz/docs/V2100024429',
    orderUrlRu: 'https://adilet.zan.kz/rus/docs/V2100024429',
    fields: [
      { key: 'class', label: 'Класс', labelKz: 'Сынып', type: 'text', required: true },
      { key: 'teacher', label: 'Учитель', labelKz: 'Мұғалім', type: 'text', required: true },
      { key: 'topic', label: 'Тема инструктажа', labelKz: 'Нұсқау тақырыбы', type: 'text', required: true },
      { key: 'date', label: 'Дата', labelKz: 'Күні', type: 'date', required: true },
      { key: 'students', label: 'Список учащихся (ФИО)', labelKz: 'Оқушылар тізімі', type: 'textarea', required: true },
    ],
    template: (data) => `
      <div style="font-family: 'Times New Roman', serif; padding: 40px; max-width: 800px; margin: 0 auto;">
        <h2 style="text-align: center; text-transform: uppercase; font-size: 18px; margin-bottom: 30px;">
          ҚАУІПСІЗДІК ТЕХНИКАСЫ БОЙЫНША НҰСҚАУ ЖУРНАЛЫ
        </h2>
        <div style="margin-bottom: 20px;">
          <p><strong>Сынып:</strong> ${data.class || ''}</p>
          <p><strong>Мұғалім:</strong> ${data.teacher || ''}</p>
          <p><strong>Нұсқау тақырыбы:</strong> ${data.topic || ''}</p>
          <p><strong>Күні:</strong> ${data.date ? new Date(data.date).toLocaleDateString('kk-KZ') : ''}</p>
        </div>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px;">
          <thead>
            <tr style="background-color: #f0f0f0;">
              <th style="border: 1px solid #000; padding: 10px; text-align: center;">№</th>
              <th style="border: 1px solid #000; padding: 10px; text-align: center;">Оқушының аты-жөні</th>
              <th style="border: 1px solid #000; padding: 10px; text-align: center;">Қолы</th>
            </tr>
          </thead>
          <tbody>
            ${(data.students || '').split('\n').filter(s => s.trim()).map((student, index) => `
              <tr>
                <td style="border: 1px solid #000; padding: 10px; text-align: center;">${index + 1}</td>
                <td style="border: 1px solid #000; padding: 10px;">${student.trim()}</td>
                <td style="border: 1px solid #000; padding: 10px; text-align: center;">________________</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div style="margin-top: 40px;">
          <p style="font-size: 14px;"><strong>Мұғалім:</strong> ${data.teacher || '________________'}</p>
        </div>
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 11px; color: #666;">
          <p><strong>Ресми бұйрық:</strong> №V2100024429</p>
          <p><a href="https://adilet.zan.kz/kaz/docs/V2100024429" target="_blank" style="color: #2563EB;">Қазақша нұсқасы</a> | 
             <a href="https://adilet.zan.kz/rus/docs/V2100024429" target="_blank" style="color: #2563EB;">Русская версия</a></p>
        </div>
      </div>
    `,
  },
  {
    id: 'class-journal',
    name: 'Классный журнал',
    nameKz: 'Сынып журналы',
    orderCode: 'V2300033330',
    orderUrlKz: 'https://adilet.zan.kz/kaz/docs/V2300033330',
    orderUrlRu: 'https://adilet.zan.kz/rus/docs/V2300033330',
    fields: [],
    template: () => `
      <div style="font-family: 'Times New Roman', serif; padding: 40px; max-width: 800px; margin: 0 auto; text-align: center;">
        <h2 style="text-align: center; text-transform: uppercase; font-size: 18px; margin-bottom: 30px;">
          СЫНЫП ЖУРНАЛЫ
        </h2>
        <p style="font-size: 16px; margin-bottom: 20px;">
          Электрондық журналды пайдалану үшін <strong>Kundelik.kz</strong> платформасына өтіңіз.
        </p>
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 11px; color: #666;">
          <p><strong>Ресми бұйрық:</strong> №V2300033330</p>
          <p><a href="https://adilet.zan.kz/kaz/docs/V2300033330" target="_blank" style="color: #2563EB;">Қазақша нұсқасы</a> | 
             <a href="https://adilet.zan.kz/rus/docs/V2300033330" target="_blank" style="color: #2563EB;">Русская версия</a></p>
        </div>
      </div>
    `,
  },
]

export const getTemplateById = (id: string): DocumentTemplate | undefined => {
  return documentTemplates.find(template => template.id === id)
}

