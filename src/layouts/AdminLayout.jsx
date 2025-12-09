import { useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import AppLayout from './AppLayout.jsx'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  Menu,
  Home,
  Users,
  Building2,
  Wallet,
  CalendarDays,
  CheckSquare,
  Settings,
  LogOut,
  X,
} from 'lucide-react'

export default function AdminLayout({ children }) {
  const { logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  const navItems = [
    { label: 'Overview', icon: Home, path: '/admin/overview' },
    { label: 'Employees', icon: Users, path: '/admin/employees' },
    { label: 'Departments', icon: Building2, path: '/admin/departments' },
    { label: 'Salary', icon: Wallet, path: '/admin/salary' },
    { label: 'Attendance', icon: CheckSquare, path: '/admin/attendance' },
    { label: 'Leaves', icon: CalendarDays, path: '/admin/leaves' },
    { label: 'Settings', icon: Settings, path: '/admin/settings' },
  ]

  const isActive = (path) => location.pathname === path

  return (
    <AppLayout hideHeader={true}>
      <div className="p-4 md:p-6">
        {/* Mobile Top Bar */}
        <div className="md:hidden flex items-center justify-between mb-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="inline-flex items-center justify-center rounded-md p-2 text-gray-700 hover:bg-gray-100"
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
          </button>
          <h1 className="text-xl font-semibold text-gray-800">Admin</h1>
          <button
            onClick={logout}
            className="text-sm text-gray-600 hover:text-gray-800"
          >
            Logout
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-4 md:gap-6">
          {/* Sidebar (Desktop) */}
          <aside className="hidden md:block bg-white border rounded-xl shadow-sm h-fit sticky top-24">
            <div className="p-4">
              <div className="text-sm font-semibold text-gray-800 mb-2">Navigation</div>
              <nav className="space-y-1">
                {navItems.map(({ label, icon: Icon, path }) => (
                  <button
                    key={label}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 ${
                      isActive(path) ? 'bg-gray-100' : ''
                    }`}
                    onClick={() => navigate(path)}
                  >
                    <Icon className="h-5 w-5 text-gray-500" />
                    <span className="text-sm">{label}</span>
                  </button>
                ))}
              </nav>
            </div>
            <div className="p-4 border-t">
              <button
                onClick={logout}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-700"
              >
                <LogOut className="h-5 w-5 text-gray-500" />
                <span className="text-sm">Logout</span>
              </button>
            </div>
          </aside>

          {/* Main Content */}
          <section>{children}</section>
        </div>
      </div>

      {/* Mobile Drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full w-72 bg-white shadow-xl">
            <div className="flex items-center justify-between p-4 border-b">
              <span className="font-semibold">Admin Menu</span>
              <button
                onClick={() => setSidebarOpen(false)}
                className="rounded-md p-1 hover:bg-gray-100"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="p-4 space-y-1">
              {navItems.map(({ label, icon: Icon, path }) => (
                <button
                  key={label}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 ${
                    isActive(path) ? 'bg-gray-100' : ''
                  }`}
                  onClick={() => { setSidebarOpen(false); navigate(path) }}
                >
                  <Icon className="h-5 w-5 text-gray-500" />
                  <span className="text-sm">{label}</span>
                </button>
              ))}
            </nav>
            <div className="p-4 border-t">
              <button
                onClick={() => { setSidebarOpen(false); logout() }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-700"
              >
                <LogOut className="h-5 w-5 text-gray-500" />
                <span className="text-sm">Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  )
}