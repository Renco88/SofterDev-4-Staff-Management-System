import { useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { useNavigate } from 'react-router-dom'
import UserLayout from '../layouts/UserLayout.jsx'
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
  const navigate = useNavigate()

  const [sidebarOpen, setSidebarOpen] = useState(false)

  const navItems = [
    { label: 'Profile', icon: UserIcon, path: '/user/profile' },
    { label: 'Tasks', icon: ClipboardList, path: '/user/tasks' },
    { label: 'Leave', icon: CalendarDays, path: '/user/leave' },
    { label: 'Attendance', icon: CheckSquare, path: '/user/attendance' },
    { label: 'Settings', icon: Settings, path: '/user/settings' },
  ]

  return (
    <UserLayout>
      <div className="bg-white shadow-sm border rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">User Dashboard</h2>
            <p className="text-sm text-gray-500">Overview of your activity</p>
          </div>
        </div>
      </div>

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
    </UserLayout>
  )
}

export default UserDashboard