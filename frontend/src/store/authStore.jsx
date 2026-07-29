import { createContext, useContext, useState, useCallback } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user')
    return stored ? JSON.parse(stored) : null
  })

  const login = useCallback(async (matricule, password) => {
    const response = await fetch('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: matricule, password })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || 'Identifiant ou mot de passe incorrect')
    }

    const json = await response.json()
    const result = json.data
    localStorage.setItem('accessToken', result.accessToken)
    localStorage.setItem('refreshToken', result.refreshToken)
    const userData = {
      id: result.user.id,
      email: result.user.email,
      role: result.user.role,
      name: result.user.name || result.user.email,
      matricule: result.user.matricule,
    }
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
    return userData
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    setUser(null)
  }, [])

  const isAdmin = user?.role === 'admin'
  const isTeacher = user?.role === 'teacher'
  const isAuthenticated = !!user

  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin, isTeacher, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}