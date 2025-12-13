"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  email: string
  name?: string
  firstName?: string
  lastName?: string
  role: 'SUPER_ADMIN' | 'ADMIN' | 'USER'
  traineeId?: string
  userType?: string
  projectName?: string
}

interface AuthState {
  user: User | null
  token: string | null
  loading: boolean
  isAuthenticated: boolean
  isSuperAdmin: boolean
  isAdmin: boolean
  isOC: boolean
}

export function useAuth(requiredRole?: 'SUPER_ADMIN' | 'ADMIN' | 'USER' | 'ADMIN_OR_SUPER'): AuthState {
  const router = useRouter()
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    loading: true,
    isAuthenticated: false,
    isSuperAdmin: false,
    isAdmin: false,
    isOC: false,
  })

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token')
      const storedUser = localStorage.getItem('user')

      if (!token || !storedUser) {
        // Not authenticated - redirect to login
        router.replace('/login')
        setState(prev => ({ ...prev, loading: false }))
        return
      }

      try {
        const user = JSON.parse(storedUser) as User

        // Check role requirements
        if (requiredRole) {
          const hasAccess = 
            requiredRole === 'ADMIN_OR_SUPER' 
              ? (user.role === 'SUPER_ADMIN' || user.role === 'ADMIN')
              : requiredRole === 'ADMIN'
                ? (user.role === 'SUPER_ADMIN' || user.role === 'ADMIN')
                : requiredRole === 'SUPER_ADMIN'
                  ? user.role === 'SUPER_ADMIN'
                  : true // USER role - any authenticated user

          if (!hasAccess) {
            // Unauthorized - redirect to dashboard
            router.replace('/dashboard')
            setState(prev => ({ ...prev, loading: false }))
            return
          }
        }

        setState({
          user,
          token,
          loading: false,
          isAuthenticated: true,
          isSuperAdmin: user.role === 'SUPER_ADMIN',
          isAdmin: user.role === 'ADMIN',
          isOC: user.role === 'ADMIN' || user.role === 'SUPER_ADMIN',
        })
      } catch (e) {
        // Invalid user data - clear and redirect
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        router.replace('/login')
        setState(prev => ({ ...prev, loading: false }))
      }
    }

    checkAuth()
  }, [router, requiredRole])

  return state
}

// Hook for public pages that should redirect to dashboard if already logged in
export function usePublicRoute() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const user = localStorage.getItem('user')

    if (token && user) {
      setIsAuthenticated(true)
      router.replace('/dashboard')
    } else {
      setLoading(false)
    }
  }, [router])

  return { loading, isAuthenticated }
}
