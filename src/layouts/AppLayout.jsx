import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

const AppLayout = ({ children, hideHeader = false }) => {
  const { user, isAuthenticated, logout } = useAuth()
  return (
    <div className="min-h-screen bg-gray-50">
      {!hideHeader && (
        <header className="border-b bg-white/90 backdrop-blur">
          <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
            <Link to="/" className="text-lg font-semibold text-gray-800">Staff Management System</Link>
            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <>
                  <span className="text-sm text-gray-600">{user?.name} · {user?.role}</span>
                  <Link
                    to={user?.role === 'admin' ? '/admin' : '/user'}
                    className="text-sm text-brand hover:text-brand-dark"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={logout}
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link to="/" className="text-sm text-brand hover:text-brand-dark">Login</Link>
              )}
            </div>
          </div>
        </header>
      )}
      <main className="mx-auto max-w-5xl px-4 py-8">
        {children}
      </main>
    </div>
  )
}

export default AppLayout