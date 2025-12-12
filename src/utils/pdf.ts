// @ts-ignore - html2pdf.js doesn't have TypeScript definitions
import html2pdf from 'html2pdf.js'

export interface PDFOptions {
  type: string
  text: string
}

export const createPDF = async (options: PDFOptions): Promise<Blob> => {
  const { type, text } = options
  
  // Если text уже содержит HTML (начинается с <), используем его напрямую
  // Иначе создаем стандартный формат
  const html = text.trim().startsWith('<') 
    ? text 
    : `
    <div style="font-family: 'Times New Roman', serif; padding: 40px; max-width: 800px; margin: 0 auto;">
      <h2 style="text-align: center; text-transform: uppercase; font-size: 18px; margin-bottom: 20px;">
        ҚР Оқу-ағарту министрінің №130 бұйрығына сәйкес
      </h2>
      <h3 style="text-align: center; font-size: 20px; margin-bottom: 30px; font-weight: bold;">
        ${type}
      </h3>
      <p style="text-align: right; margin-bottom: 20px; font-size: 14px;">
        Директорға, №15 орта мектеп
      </p>
      <br>
      <div style="font-size: 16px; line-height: 1.8; margin-bottom: 40px; text-align: justify;">
        ${text.split('\n').map(p => `<p style="margin-bottom: 12px;">${p}</p>`).join('')}
      </div>
      <br>
      <div style="margin-top: 60px;">
        <p style="font-size: 14px; margin-bottom: 10px;">Күні: ${new Date().toLocaleDateString('kk-KZ')}</p>
        <p style="font-size: 14px;">Қолы: ______________</p>
      </div>
    </div>
  `

  const element = document.createElement('div')
  element.innerHTML = html
  
  // Настройки для правильного отображения
  element.style.position = 'absolute'
  element.style.top = '0'
  element.style.left = '0'
  element.style.width = '210mm' // A4 ширина
  element.style.minHeight = '297mm' // A4 высота
  element.style.backgroundColor = 'white'
  element.style.color = 'black'
  element.style.fontSize = '12pt'
  element.style.lineHeight = '1.5'
  element.style.padding = '20mm'
  element.style.boxSizing = 'border-box'
  
  // Делаем элемент видимым для html2canvas, но вне экрана
  element.style.visibility = 'visible'
  element.style.opacity = '1'
  element.style.zIndex = '9999'
  
  document.body.appendChild(element)

  // Ждем, чтобы браузер успел отрендерить элемент и загрузить все стили
  await new Promise(resolve => setTimeout(resolve, 300))

  const opt = {
    margin: [0, 0, 0, 0],
    filename: `${type}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { 
      scale: 2,
      useCORS: true,
      logging: false,
      letterRendering: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      width: element.scrollWidth || 794, // A4 в пикселях (210mm * 3.78)
      height: element.scrollHeight || 1123, // A4 в пикселях (297mm * 3.78)
    },
    jsPDF: { 
      unit: 'mm', 
      format: 'a4', 
      orientation: 'portrait',
      compress: true,
    },
    pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
  }

  try {
    console.log('Генерация PDF...', { elementWidth: element.scrollWidth, elementHeight: element.scrollHeight })
    const pdfBlob = await html2pdf().set(opt).from(element).outputPdf('blob')
    
    // Удаляем элемент после генерации
    if (document.body.contains(element)) {
      document.body.removeChild(element)
    }
    
    console.log('PDF успешно создан, размер:', pdfBlob.size, 'байт')
    return pdfBlob
  } catch (error) {
    console.error('Ошибка генерации PDF:', error)
    // Удаляем элемент в случае ошибки
    if (document.body.contains(element)) {
      document.body.removeChild(element)
    }
    throw error
  }
}

