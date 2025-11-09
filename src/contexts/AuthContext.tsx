import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useKV } from '@github/spark/hooks'
import type { User, AuthState } from '@/lib/types'
import { verifyToken } from '@/lib/auth'
import { initializeDefaultData } from '@/lib/initData'

declare const spark: {
  kv: {
    get: <T>(key: string) => Promise<T | undefined>
  }
}

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
    async function initialize() {
      try {
        await initializeDefaultData()
        
        const currentState = await spark.kv.get<AuthState>('auth-state')
        if (currentState?.token) {
          const tokenData = verifyToken(currentState.token)
          if (!tokenData) {
            setAuthState({ user: null, token: null })
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
      } finally {
        setIsReady(true)
      }
    }
    
    initialize()
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
        user: authState?.user || null,
        token: authState?.token || null,
        login,
        logout,
        isAuthenticated: !!(authState?.token && authState?.user),
        hasRole
      }}
    >
      {isReady ? children : (
        <div className="flex items-center justify-center min-h-screen bg-background">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      )}
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
