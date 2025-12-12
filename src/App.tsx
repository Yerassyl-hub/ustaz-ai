import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import VoiceReport from './pages/VoiceReport'
import MessageBuilder from './pages/MessageBuilder'
import DocumentBuilder from './pages/DocumentBuilder'
import MyDocuments from './pages/MyDocuments'
import Schedule from './pages/Schedule'
import ChatBot from './components/ChatBot'
import type { ReactNode } from 'react'

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Жүктелуде...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/voice-report"
          element={
            <ProtectedRoute>
              <VoiceReport />
            </ProtectedRoute>
          }
        />
        <Route
          path="/message-builder"
          element={
            <ProtectedRoute>
              <MessageBuilder />
            </ProtectedRoute>
          }
        />
        <Route
          path="/document-builder"
          element={
            <ProtectedRoute>
              <DocumentBuilder />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-documents"
          element={
            <ProtectedRoute>
              <MyDocuments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/schedule"
          element={
            <ProtectedRoute>
              <Schedule />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
      <ChatBot />
    </>
  )
}

export default App

