import UserLayout from '../../layouts/UserLayout.jsx'
import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'

export default function UserOverview() {
  const { token } = useAuth()
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [pendingTasks, setPendingTasks] = useState(0)
  const [leavesLeft, setLeavesLeft] = useState(0)
  const [attendancePct, setAttendancePct] = useState(0)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      if (!token) return
      setLoading(true)
      setError('')
      try {
        // Fetch tasks
        const tasksRes = await fetch(`${API_BASE}/api/tasks/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const tasksJson = await tasksRes.json()
        if (!tasksRes.ok) throw new Error(tasksJson?.message || 'Failed to load tasks')
        const tasks = Array.isArray(tasksJson?.tasks) ? tasksJson.tasks : []
        const pending = tasks.filter(t => t.status !== 'Done').length
        if (!cancelled) setPendingTasks(pending)

        // Fetch profile to get leave allocation
        const meRes = await fetch(`${API_BASE}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const meJson = await meRes.json()
        if (!meRes.ok) throw new Error(meJson?.message || 'Failed to load profile')
        const leaveAlloc = Number(meJson?.user?.leave || 0)
        if (!cancelled) setLeavesLeft(Number.isFinite(leaveAlloc) ? leaveAlloc : 0)

        // Fetch attendance summary to compute percentage
        const attRes = await fetch(`${API_BASE}/api/attendance/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const attJson = await attRes.json()
        if (!attRes.ok) throw new Error(attJson?.message || 'Failed to load attendance')
        const summary = attJson?.summary || { present: 0, late: 0, leave: 0 }
        const denom = Number(summary.present || 0) + Number(summary.late || 0) + Number(summary.leave || 0)
        const pct = denom > 0 ? Math.round((Number(summary.present || 0) / denom) * 100) : 0
        if (!cancelled) setAttendancePct(pct)
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load overview')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [token])

  return (
    <UserLayout>
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">User · Overview</h1>
      <p className="text-sm text-gray-500 mb-6">A quick summary of your activity.</p>

      {loading && (
        <div className="px-4 py-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 text-sm mb-4">Loading overview…</div>
      )}
      {!loading && error && (
        <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm mb-4">{error}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border rounded-xl p-6 shadow-sm">
          <p className="text-sm text-gray-600">Pending Tasks</p>
          <h2 className="text-xl font-bold text-gray-800 mt-2">{pendingTasks}</h2>
        </div>
        <div className="bg-white border rounded-xl p-6 shadow-sm">
          <p className="text-sm text-gray-600">Leaves Left</p>
          <h2 className="text-xl font-bold text-gray-800 mt-2">{leavesLeft}</h2>
        </div>
        <div className="bg-white border rounded-xl p-6 shadow-sm">
          <p className="text-sm text-gray-600">Attendance</p>
          <h2 className="text-xl font-bold text-gray-800 mt-2">{attendancePct}%</h2>
        </div>
      </div>
    </UserLayout>
  )
}