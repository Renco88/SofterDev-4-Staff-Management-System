import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, user } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/" replace />
  }

  if (requiredRole && user?.role !== requiredRole) {
    // If role mismatch, redirect to the user's own dashboard
    const target = user?.role === 'admin' ? '/admin' : '/user'
    return <Navigate to={target} replace />
  }

  return children
}

export default ProtectedRoute