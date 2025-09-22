import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'super-admin'
  avatar?: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>
  logout: () => void
  refreshToken: () => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  // Development mode - set to true to run without backend
  const isDevelopmentMode = import.meta.env.DEV || true

  // Check for existing token on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('🔐 Initializing authentication...')
        console.log('🔐 Development mode:', isDevelopmentMode)
        
        if (isDevelopmentMode) {
          // In development mode, check for stored credentials but don't verify with backend
          const storedToken = localStorage.getItem('auth_token')
          const storedUser = localStorage.getItem('auth_user')
          
          if (storedToken && storedUser) {
            console.log('🔐 Development mode: Using stored credentials')
            setToken(storedToken)
            setUser(JSON.parse(storedUser))
          } else {
            console.log('🔐 Development mode: No stored credentials')
          }
        } else {
          // Production mode - verify with backend
          const storedToken = localStorage.getItem('auth_token')
          const storedUser = localStorage.getItem('auth_user')
          
          if (storedToken && storedUser) {
            console.log('🔐 Verifying existing token...')
            const isValid = await verifyToken(storedToken)
            console.log('🔐 Token is valid:', isValid)
            
            if (isValid) {
              setToken(storedToken)
              setUser(JSON.parse(storedUser))
              console.log('🔐 User authenticated successfully')
            } else {
              console.log('🔐 Token invalid, clearing storage')
              localStorage.removeItem('auth_token')
              localStorage.removeItem('auth_user')
            }
          } else {
            console.log('🔐 No stored credentials found')
          }
        }
      } catch (error) {
        console.error('🔐 Auth initialization error:', error)
        if (!isDevelopmentMode) {
          localStorage.removeItem('auth_token')
          localStorage.removeItem('auth_user')
        }
      } finally {
        console.log('🔐 Auth initialization complete')
        setIsLoading(false)
      }
    }

    initializeAuth()
  }, [isDevelopmentMode])

  // Auto-refresh token before expiry
  useEffect(() => {
    if (!token) return

    const refreshInterval = setInterval(async () => {
      const success = await refreshToken()
      if (!success) {
        logout()
      }
    }, 15 * 60 * 1000) // Refresh every 15 minutes

    return () => clearInterval(refreshInterval)
  }, [token])

  const verifyToken = async (tokenToVerify: string): Promise<boolean> => {
    try {
      const response = await fetch('http://localhost:3001/api/auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenToVerify}`
        }
      })
      return response.ok
    } catch (error) {
      console.error('Token verification failed:', error)
      return false
    }
  }

  const login = async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    try {
      setIsLoading(true)
      
      if (isDevelopmentMode) {
        // Development mode - mock authentication
        console.log('🔐 Development mode: Mock authentication')
        
        // Mock users for development
        const mockUsers = [
          {
            id: '1',
            email: 'admin@resolveit.gov',
            password: 'admin123',
            name: 'Admin User',
            role: 'admin' as const
          },
          {
            id: '2',
            email: 'superadmin@resolveit.gov',
            password: 'superadmin123',
            name: 'Super Admin',
            role: 'super-admin' as const
          }
        ]
        
        // Find user
        const user = mockUsers.find(u => u.email === email && u.password === password)
        
        if (user) {
          // Create mock token
          const mockToken = `dev-token-${user.id}-${Date.now()}`
          
          // Store token and user data
          localStorage.setItem('auth_token', mockToken)
          localStorage.setItem('auth_user', JSON.stringify({
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role
          }))
          
          setToken(mockToken)
          setUser({
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role
          })
          
          console.log('🔐 Development mode: Login successful')
          return { success: true }
        } else {
          return { success: false, message: 'Invalid email or password' }
        }
      } else {
        // Production mode - real API call
        const response = await fetch('http://localhost:3001/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email, password })
        })

        const data = await response.json()

        if (response.ok && data.success) {
          const { token: newToken, user: userData } = data.data
          
          // Store token and user data
          localStorage.setItem('auth_token', newToken)
          localStorage.setItem('auth_user', JSON.stringify(userData))
          
          setToken(newToken)
          setUser(userData)
          
          return { success: true }
        } else {
          return { success: false, message: data.message || 'Login failed' }
        }
      }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, message: 'Network error. Please try again.' }
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    // Clear local storage
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
    
    // Clear state
    setToken(null)
    setUser(null)
    
    if (isDevelopmentMode) {
      console.log('🔐 Development mode: Logout successful')
    } else {
      // Production mode: Call logout endpoint to invalidate token on server
      if (token) {
        fetch('http://localhost:3001/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }).catch(console.error)
      }
    }
  }

  const refreshToken = async (): Promise<boolean> => {
    if (!token) return false

    if (isDevelopmentMode) {
      // Development mode - just return true (no actual refresh needed)
      console.log('🔐 Development mode: Token refresh (mock)')
      return true
    }

    try {
      const response = await fetch('http://localhost:3001/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data.token) {
          const newToken = data.data.token
          localStorage.setItem('auth_token', newToken)
          setToken(newToken)
          return true
        }
      }
      
      return false
    } catch (error) {
      console.error('Token refresh error:', error)
      return false
    }
  }

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    isLoading,
    login,
    logout,
    refreshToken
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
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
