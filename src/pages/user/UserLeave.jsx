import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import UserLayout from '../../layouts/UserLayout.jsx'
// Simple static balance placeholder (future: compute from policy)
const balance = [
  { label: 'Vacation', value: '10 days' },
  { label: 'Sick Leave', value: '5 days' },
  { label: 'Personal Leave', value: '2 days' },
]

const StatusBadge = ({ status }) => {
  const approved = status === 'Approved'
  const cls = approved ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${cls}`}>{status}</span>
  )
}

export default function UserLeave() {
  const { token } = useAuth()
  const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000' : 'https://staff-managment-system-backend.vercel.app')
  const [applyOpen, setApplyOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [requests, setRequests] = useState([])

  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), [])

  const load = async () => {
    if (!token) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${API_BASE}/api/leave-requests/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || 'Failed to load leave requests')
      setRequests(Array.isArray(data?.leaveRequests) ? data.leaveRequests : [])
    } catch (err) {
      setError(err.message || 'Failed to load leave requests')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [token])
  return (
    <UserLayout>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">My Leave History</h1>
        <button
          onClick={() => setApplyOpen(true)}
          className="hidden sm:inline-flex rounded-lg px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-800 border"
        >
          Apply for leave
        </button>
      </div>

      <div className="bg-white border rounded-2xl shadow-sm overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="text-gray-600">
            <tr>
              <th className="px-4 py-3 text-left">Leave Type</th>
              <th className="px-4 py-3 text-left">Start Date</th>
              <th className="px-4 py-3 text-left">End Date</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Days</th>
              <th className="px-4 py-3 text-left">Reason</th>
            </tr>
          </thead>
          <tbody className="text-gray-900">
            {requests.map((row) => (
              <tr key={row._id || `${row.date}-${row.type}`} className="border-t">
                <td className="px-4 py-3">{row.type || 'General'}</td>
                <td className="px-4 py-3">{row.date}</td>
                <td className="px-4 py-3">{row.date}</td>
                <td className="px-4 py-3"><StatusBadge status={row.status || 'Pending'} /></td>
                <td className="px-4 py-3">1</td>
                <td className="px-4 py-3">{row.reason || ''}</td>
              </tr>
            ))}
            {requests.length === 0 && (
              <tr>
                <td className="px-4 py-3 text-gray-500" colSpan={6}>
                  {loading ? 'Loading...' : (error ? error : 'No leave requests yet.')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-8">
        <h2 className="text-base font-semibold text-gray-800 mb-3">Leave Balance</h2>
        <div className="bg-white border rounded-2xl p-6 shadow-sm">
          <div className="space-y-3">
            {balance.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <span className="text-sm text-gray-700">{item.label}</span>
                <span className="text-sm text-gray-500">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {applyOpen && (
        <ApplyLeaveModal
          todayStr={todayStr}
          token={token}
          apiBase={API_BASE}
          onCancel={() => setApplyOpen(false)}
          onSubmitted={() => { setApplyOpen(false); load() }}
        />
      )}
    </UserLayout>
  )
}

function ApplyLeaveModal({ token, apiBase, todayStr, onCancel, onSubmitted }) {
  const [type, setType] = useState('General')
  const [date, setDate] = useState(todayStr)
  const [reason, setReason] = useState('')
  const [saving, setSaving] = useState(false)

  const submit = async () => {
    if (!token || !date) return
    setSaving(true)
    try {
      const res = await fetch(`${apiBase}/api/leave-requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ date, type, reason }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || 'Failed to submit leave request')
      onSubmitted && onSubmitted()
    } catch (err) {
      alert(err.message || 'Failed to submit leave')
    } finally {
      setSaving(false)
    }
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl border p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Apply for Leave</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Leave Type</label>
            <select className="w-full px-3 py-2 border rounded-lg text-sm" value={type} onChange={e => setType(e.target.value)}>
              <option value="General">General</option>
              <option value="Vacation">Vacation</option>
              <option value="Sick Leave">Sick Leave</option>
              <option value="Personal Leave">Personal Leave</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input type="date" className="w-full px-3 py-2 border rounded-lg text-sm" value={date} onChange={e => setDate(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input type="date" className="w-full px-3 py-2 border rounded-lg text-sm" value={date} readOnly />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Leave</label>
            <textarea className="w-full px-3 py-2 border rounded-lg text-sm" rows="3" placeholder="Write reason" value={reason} onChange={e => setReason(e.target.value)} />
          </div>

          {/* Future: upload supporting documents */}

          <div className="flex items-center gap-3 pt-2">
            <button onClick={submit} disabled={saving} className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm disabled:opacity-60">{saving ? 'Submitting...' : 'Submit Application'}</button>
            <button onClick={onCancel} className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  )
}