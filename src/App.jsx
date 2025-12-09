import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'
import UserDashboard from './pages/UserDashboard.jsx'
// Admin subpages
import AdminOverview from './pages/admin/AdminOverview.jsx'
import AdminEmployees from './pages/admin/AdminEmployees.jsx'
import AdminDepartments from './pages/admin/AdminDepartments.jsx'
import AdminSalary from './pages/admin/AdminSalary.jsx'
import AdminAttendance from './pages/admin/AdminAttendance.jsx'
import AdminLeaves from './pages/admin/AdminLeaves.jsx'
import AdminSettings from './pages/admin/AdminSettings.jsx'
// User subpages
import UserOverview from './pages/user/UserOverview.jsx'
import UserSalary from './pages/user/UserSalary.jsx'
import UserProfile from './pages/user/UserProfile.jsx'
import UserTasks from './pages/user/UserTasks.jsx'
import UserLeave from './pages/user/UserLeave.jsx'
import UserAttendance from './pages/user/UserAttendance.jsx'
import UserSettings from './pages/user/UserSettings.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      {/* Admin sub-routes */}
      <Route
        path="/admin/overview"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminOverview />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/employees"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminEmployees />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/departments"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminDepartments />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/salary"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminSalary />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/attendance"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminAttendance />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/leaves"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminLeaves />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/settings"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminSettings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/user"
        element={
          <ProtectedRoute requiredRole="user">
            <UserDashboard />
          </ProtectedRoute>
        }
      />
      {/* User sub-routes */}
      <Route
        path="/user/overview"
        element={
          <ProtectedRoute requiredRole="user">
            <UserOverview />
          </ProtectedRoute>
        }
      />
      <Route
        path="/user/salary"
        element={
          <ProtectedRoute requiredRole="user">
            <UserSalary />
          </ProtectedRoute>
        }
      />
      <Route
        path="/user/profile"
        element={
          <ProtectedRoute requiredRole="user">
            <UserProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/user/tasks"
        element={
          <ProtectedRoute requiredRole="user">
            <UserTasks />
          </ProtectedRoute>
        }
      />
      <Route
        path="/user/leave"
        element={
          <ProtectedRoute requiredRole="user">
            <UserLeave />
          </ProtectedRoute>
        }
      />
      <Route
        path="/user/attendance"
        element={
          <ProtectedRoute requiredRole="user">
            <UserAttendance />
          </ProtectedRoute>
        }
      />
      <Route
        path="/user/settings"
        element={
          <ProtectedRoute requiredRole="user">
            <UserSettings />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
