import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiArrowLeft, FiDownload, FiTrash2, FiEye, FiSearch, FiClock, FiList } from 'react-icons/fi'
import { storage } from '../utils/storage'
import type { PDFDocument } from '../utils/storage'
import { saveAs } from 'file-saver'

function MyDocuments() {
  const navigate = useNavigate()
  const [documents, setDocuments] = useState<PDFDocument[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDoc, setSelectedDoc] = useState<PDFDocument | null>(null)
  const [showHistory, setShowHistory] = useState(false)

  useEffect(() => {
    const docs = storage.getPDFs()
    setDocuments(docs)
  }, [])

  const filteredDocuments = documents.filter(doc =>
    doc.type.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleDelete = (id: string) => {
    if (confirm('Құжатты жоюға сенімдісіз бе?')) {
      storage.deletePDF(id)
      const updatedDocs = storage.getPDFs()
      setDocuments(updatedDocs)
      if (selectedDoc?.id === id) {
        setSelectedDoc(null)
      }
    }
  }

  const handleDownload = (doc: PDFDocument) => {
    if (doc.blobUrl) {
      fetch(doc.blobUrl)
        .then(res => res.blob())
        .then(blob => {
          saveAs(blob, `${doc.type}.pdf`)
          storage.addHistory(doc.id, 'downloaded')
          // Обновляем документ в списке
          const updatedDocs = storage.getPDFs()
          setDocuments(updatedDocs)
          if (selectedDoc?.id === doc.id) {
            setSelectedDoc(updatedDocs.find(d => d.id === doc.id) || null)
          }
        })
        .catch(error => {
          console.error('Ошибка скачивания:', error)
          alert('Жүктеу кезінде қате пайда болды')
        })
    }
  }

  const handleView = (doc: PDFDocument) => {
    setSelectedDoc(doc)
    storage.addHistory(doc.id, 'viewed')
    // Обновляем документ в списке
    const updatedDocs = storage.getPDFs()
    setDocuments(updatedDocs)
  }

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      created: 'Жасалды',
      viewed: 'Қаралды',
      downloaded: 'Жүктелді',
      updated: 'Жаңартылды',
      deleted: 'Жойылды',
    }
    return labels[action] || action
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
          <h1 className="text-3xl font-bold text-gray-800">Менің құжаттарым</h1>
          <div className="w-24"></div> {/* Spacer for centering */}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Список документов */}
          <div className="lg:col-span-1 bg-white rounded-xl shadow-lg p-6">
            <div className="mb-4">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Іздеу..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                />
              </div>
            </div>

            <div className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto">
              {filteredDocuments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-lg mb-2">Құжаттар жоқ</p>
                  <p className="text-sm">Жаңа құжат жасау үшін басты бетке өтіңіз</p>
                </div>
              ) : (
                filteredDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    onClick={() => handleView(doc)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition ${
                      selectedDoc?.id === doc.id
                        ? 'border-primary bg-blue-50'
                        : 'border-gray-200 hover:border-primary hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800 mb-1">{doc.type}</h3>
                        <p className="text-sm text-gray-500">
                          {new Date(doc.createdAt).toLocaleDateString('kk-KZ', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(doc.id)
                        }}
                        className="ml-2 text-red-500 hover:text-red-700 transition"
                        title="Жою"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Просмотр документа */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
            {selectedDoc ? (
              <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-800">{selectedDoc.type}</h2>
                        <p className="text-sm text-gray-500 mt-1">
                          {new Date(selectedDoc.createdAt).toLocaleDateString('kk-KZ', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setShowHistory(!showHistory)}
                          className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition"
                          title="Тарих"
                        >
                          <FiList />
                          Тарих
                        </button>
                        <button
                          onClick={() => handleDownload(selectedDoc)}
                          className="flex items-center gap-2 bg-primary hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
                        >
                          <FiDownload />
                          Жүктеу
                        </button>
                        {selectedDoc.blobUrl && (
                          <a
                            href={selectedDoc.blobUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 bg-primaryGreen hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition"
                          >
                            <FiEye />
                            Ашу
                          </a>
                        )}
                      </div>
                    </div>

                    {/* История документа */}
                    {showHistory && selectedDoc.history && selectedDoc.history.length > 0 && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                          <FiClock />
                          Құжат тарихы
                        </h3>
                        <div className="space-y-2">
                          {selectedDoc.history
                            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                            .map((item) => (
                              <div key={item.id} className="flex items-center justify-between text-sm py-2 border-b border-gray-200 last:border-0">
                                <div className="flex items-center gap-2">
                                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                                    {getActionLabel(item.action)}
                                  </span>
                                  {item.details && (
                                    <span className="text-gray-600">{item.details}</span>
                                  )}
                                </div>
                                <span className="text-gray-500">
                                  {new Date(item.timestamp).toLocaleDateString('kk-KZ', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </span>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}

                <div className="border border-gray-300 rounded-lg bg-gray-50">
                  {selectedDoc.blobUrl ? (
                    <iframe
                      src={selectedDoc.blobUrl}
                      className="w-full h-[calc(100vh-400px)] border-0 rounded"
                      title="PDF Preview"
                      onError={() => {
                        console.error('Ошибка загрузки PDF')
                      }}
                    />
                  ) : selectedDoc.text ? (
                    <div className="p-8">
                      <div 
                        className="prose max-w-none"
                        dangerouslySetInnerHTML={{ __html: selectedDoc.text }}
                      />
                    </div>
                  ) : (
                    <div className="p-8 text-center text-gray-500">
                      <p>PDF көрінісі қолжетімсіз</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[calc(100vh-300px)] text-gray-500">
                <div className="text-center">
                  <FiEye className="text-6xl mx-auto mb-4 text-gray-300" />
                  <p className="text-lg">Құжат таңдаңыз</p>
                  <p className="text-sm mt-2">Сол жақтағы тізімнен құжат таңдаңыз</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default MyDocuments

