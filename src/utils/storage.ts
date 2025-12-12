export interface PDFDocument {
  id: string
  type: string
  text: string
  createdAt: string
  blobUrl?: string
  history?: DocumentHistory[]
}

export interface DocumentHistory {
  id: string
  action: 'created' | 'viewed' | 'downloaded' | 'deleted' | 'updated'
  timestamp: string
  details?: string
}

const STORAGE_KEY = 'ustaz_pdfs'
const USER_KEY = 'ustaz_user'

export const storage = {
  // PDF Documents
  getPDFs: (): PDFDocument[] => {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  },

  savePDF: (pdf: PDFDocument): void => {
    const pdfs = storage.getPDFs()
    const existingIndex = pdfs.findIndex(p => p.id === pdf.id)
    
    if (existingIndex >= 0) {
      // Обновляем существующий документ
      const existing = pdfs[existingIndex]
      pdf.history = existing.history || []
      pdf.history.push({
        id: Date.now().toString(),
        action: 'updated',
        timestamp: new Date().toISOString(),
      })
      pdfs[existingIndex] = pdf
    } else {
      // Добавляем новый документ
      pdf.history = [{
        id: Date.now().toString(),
        action: 'created',
        timestamp: pdf.createdAt,
      }]
      pdfs.unshift(pdf)
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pdfs))
  },

  addHistory: (pdfId: string, action: DocumentHistory['action'], details?: string): void => {
    const pdfs = storage.getPDFs()
    const pdf = pdfs.find(p => p.id === pdfId)
    if (pdf) {
      if (!pdf.history) {
        pdf.history = []
      }
      pdf.history.push({
        id: Date.now().toString(),
        action,
        timestamp: new Date().toISOString(),
        details,
      })
      localStorage.setItem(STORAGE_KEY, JSON.stringify(pdfs))
    }
  },

  deletePDF: (id: string): void => {
    const pdfs = storage.getPDFs()
    const filtered = pdfs.filter(pdf => pdf.id !== id)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
  },

  // User
  getUser: (): { email: string; name: string } | null => {
    const data = localStorage.getItem(USER_KEY)
    return data ? JSON.parse(data) : null
  },

  saveUser: (user: { email: string; name: string }): void => {
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  },

  clearUser: (): void => {
    localStorage.removeItem(USER_KEY)
  },
}


