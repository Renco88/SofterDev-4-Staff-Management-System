import { createContext, useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const saved = localStorage.getItem('auth_state')
    if (saved) {
      const parsed = JSON.parse(saved)
      setUser(parsed.user)
      setIsAuthenticated(parsed.isAuthenticated)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(
      'auth_state',
      JSON.stringify({ user, isAuthenticated })
    )
  }, [user, isAuthenticated])

  const login = ({ name, role }) => {
    setUser({ name, role })
    setIsAuthenticated(true)
    if (role === 'admin') navigate('/admin')
    else navigate('/user')
  }

  const logout = () => {
    setUser(null)
    setIsAuthenticated(false)
    navigate('/')
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}