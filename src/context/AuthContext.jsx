import { createContext, useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const initial = (() => {
    try {
      const saved = localStorage.getItem('auth_state')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })()

  const [user, setUser] = useState(initial?.user || null)
  const [isAuthenticated, setIsAuthenticated] = useState(Boolean(initial?.isAuthenticated))
  const [token, setToken] = useState(initial?.token || null)
  const navigate = useNavigate()

  // initial state already derived from localStorage synchronously

  useEffect(() => {
    localStorage.setItem(
      'auth_state',
      JSON.stringify({ user, isAuthenticated, token })
    )
  }, [user, isAuthenticated, token])

  const login = ({ user: nextUser, token: nextToken }) => {
    setUser(nextUser)
    setToken(nextToken)
    setIsAuthenticated(true)
    if (nextUser?.role === 'admin') navigate('/admin/overview')
    else navigate('/user/overview')
  }

  const logout = () => {
    setUser(null)
    setIsAuthenticated(false)
    setToken(null)
    try { localStorage.removeItem('auth_token') } catch {}
    navigate('/')
  }

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}