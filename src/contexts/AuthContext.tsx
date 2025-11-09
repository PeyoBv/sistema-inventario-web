import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useKV } from '@github/spark/hooks'
import type { User, AuthState } from '@/lib/types'
import { verifyToken } from '@/lib/auth'

interface AuthContextType {
  user: User | null
  token: string | null
  login: (token: string, user: User) => void
  logout: () => void
  isAuthenticated: boolean
  hasRole: (roles: string[]) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useKV<AuthState>('auth-state', { user: null, token: null })
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    if (authState?.token) {
      const tokenData = verifyToken(authState.token)
      if (!tokenData) {
        setAuthState({ user: null, token: null })
      }
    }
    setIsReady(true)
  }, [])

  const login = (token: string, user: User) => {
    setAuthState({ token, user })
  }

  const logout = () => {
    setAuthState({ user: null, token: null })
  }

  const hasRole = (roles: string[]): boolean => {
    if (!authState?.user) return false
    return roles.includes(authState.user.role)
  }

  return (
    <AuthContext.Provider
      value={{
        user: authState?.user ?? null,
        token: authState?.token ?? null,
        login,
        logout,
        isAuthenticated: !!authState?.token && !!authState?.user,
        hasRole
      }}
    >
      {isReady ? children : <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
