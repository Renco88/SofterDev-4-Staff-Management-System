import { useEffect, useState } from 'react'
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
  LogOut,
  X,
  ClipboardList,
} from 'lucide-react'

export default function AdminLayout({ children }) {
  const { logout, token } = useAuth()
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const [pendingLeaves, setPendingLeaves] = useState(0)
  const [pendingTasks, setPendingTasks] = useState(0)

  const navItems = [
    { label: 'Overview', icon: Home, path: '/admin/overview' },
    { label: 'Employees', icon: Users, path: '/admin/employees' },
    { label: 'Departments', icon: Building2, path: '/admin/departments' },
    { label: 'Salary', icon: Wallet, path: '/admin/salary' },
    { label: 'Attendance', icon: CheckSquare, path: '/admin/attendance' },
    { label: 'Tasks', icon: ClipboardList, path: '/admin/tasks' },
    { label: 'Leaves', icon: CalendarDays, path: '/admin/leaves' },
  ]

  // Poll pending leave requests count
  useEffect(() => {
    if (!token) return
    let stopped = false
    const fetchPending = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/leave-requests?status=Pending`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const json = await res.json()
        if (!stopped) {
          const count = Array.isArray(json?.leaveRequests) ? json.leaveRequests.length : 0
          setPendingLeaves(count)
        }
      } catch (_) {
        // ignore
      }
    }
    fetchPending()
    const id = setInterval(fetchPending, 10000)
    return () => { stopped = true; clearInterval(id) }
  }, [token])

  // Poll tasks counts (pending only)
  useEffect(() => {
    if (!token) return
    let stopped = false
    const fetchCounts = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/tasks?status=Pending`, { headers: { Authorization: `Bearer ${token}` } })
        const json = await res.json()
        if (!stopped) setPendingTasks(Array.isArray(json?.tasks) ? json.tasks.length : 0)
      } catch (_) {
        // ignore
      }
    }
    fetchCounts()
    const id = setInterval(fetchCounts, 10000)
    return () => { stopped = true; clearInterval(id) }
  }, [token])

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
                    {path === '/admin/tasks' && pendingTasks > 0 && (
                      <span className="ml-auto inline-flex items-center justify-center rounded-full bg-yellow-500 text-white text-[10px] h-5 min-w-[20px] px-1">
                        {pendingTasks}
                      </span>
                    )}
                    {path === '/admin/leaves' && pendingLeaves > 0 && (
                      <span className="ml-auto inline-flex items-center justify-center rounded-full bg-red-600 text-white text-[10px] h-5 min-w-[20px] px-1">
                        {pendingLeaves}
                      </span>
                    )}
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
          <section className="min-w-0">{children}</section>
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
                  {path === '/admin/tasks' && pendingTasks > 0 && (
                    <span className="ml-auto inline-flex items-center justify-center rounded-full bg-yellow-500 text-white text-[10px] h-5 min-w-[20px] px-1">
                      {pendingTasks}
                    </span>
                  )}
                  {path === '/admin/leaves' && pendingLeaves > 0 && (
                    <span className="ml-auto inline-flex items-center justify-center rounded-full bg-red-600 text-white text-[10px] h-5 min-w-[20px] px-1">
                      {pendingLeaves}
                    </span>
                  )}
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