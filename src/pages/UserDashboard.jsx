import { useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import AppLayout from '../layouts/AppLayout.jsx'
import {
  Menu,
  User as UserIcon,
  ClipboardList,
  CalendarDays,
  CheckSquare,
  Settings,
  LogOut,
  X,
} from 'lucide-react'

const UserDashboard = () => {
  const { user, logout } = useAuth()

  const [sidebarOpen, setSidebarOpen] = useState(false)

  const navItems = [
    { label: 'Profile', icon: UserIcon },
    { label: 'Tasks', icon: ClipboardList },
    { label: 'Leave', icon: CalendarDays },
    { label: 'Attendance', icon: CheckSquare },
    { label: 'Settings', icon: Settings },
  ]

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
          <h1 className="text-xl font-semibold text-gray-800">User Dashboard</h1>
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
              <div className="text-sm font-semibold text-gray-800 mb-2">Menu</div>
              <nav className="space-y-1">
                {navItems.map(({ label, icon: Icon }) => (
                  <button
                    key={label}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-700"
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
          <section>
            <div className="bg-white shadow-sm border rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-800">User Dashboard</h2>
                  <p className="text-sm text-gray-500">Welcome, {user?.name || 'User'}</p>
                </div>
                <button
                  className="rounded-lg bg-red-500 hover:bg-red-600 text-white px-4 py-2 text-sm"
                  onClick={logout}
                >
                  Logout
                </button>
              </div>
            </div>

            {/* Example cards to mirror admin style */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-gray-100 rounded-xl p-6 shadow-sm">
                <p className="text-sm text-gray-600">Pending Tasks</p>
                <h2 className="text-xl font-bold text-gray-800 mt-2">5</h2>
              </div>
              <div className="bg-gray-100 rounded-xl p-6 shadow-sm">
                <p className="text-sm text-gray-600">Leaves Left</p>
                <h2 className="text-xl font-bold text-gray-800 mt-2">12</h2>
              </div>
              <div className="bg-gray-100 rounded-xl p-6 shadow-sm">
                <p className="text-sm text-gray-600">Attendance</p>
                <h2 className="text-xl font-bold text-gray-800 mt-2">96%</h2>
              </div>
            </div>
          </section>
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
              <span className="font-semibold">User Menu</span>
              <button
                onClick={() => setSidebarOpen(false)}
                className="rounded-md p-1 hover:bg-gray-100"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="p-4 space-y-1">
              {navItems.map(({ label, icon: Icon }) => (
                <button
                  key={label}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-700"
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="h-5 w-5 text-gray-500" />
                  <span className="text-sm">{label}</span>
                </button>
              ))}
            </nav>
            <div className="p-4 border-t">
              <button
                onClick={() => {
                  setSidebarOpen(false)
                  logout()
                }}
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

export default UserDashboard