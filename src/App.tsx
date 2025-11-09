import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { LoginPage } from '@/components/LoginPage'
import { Dashboard } from '@/components/Dashboard'
import { Toaster } from '@/components/ui/sonner'

function AppContent() {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <LoginPage />
  }

  return <Dashboard />
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
      <Toaster position="top-right" />
    </AuthProvider>
  )
}

export default App