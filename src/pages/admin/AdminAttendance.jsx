import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import AdminLayout from '../../layouts/AdminLayout.jsx'

// Backend-integrated Admin Attendance

export default function AdminAttendance() {
  const { token } = useAuth()
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [dateFilter, setDateFilter] = useState('')
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [config, setConfig] = useState({ activeDate: '', startTime: '', graceMinutes: 0, offDays: [], offDayReasons: {} })
  const [graceInput, setGraceInput] = useState('0')
  const [offDayInput, setOffDayInput] = useState('')
  const [offDayReasonInput, setOffDayReasonInput] = useState('')
  const [dailyStartInput, setDailyStartInput] = useState('')
  const [overrideDateInput, setOverrideDateInput] = useState('')

  const loadConfig = async () => {
    if (!token) return
    try {
      const res = await fetch(`${API_BASE}/api/attendance/config`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.message || 'Failed to load config')
      const cfg = json?.config || {}
      setConfig({
        activeDate: cfg.activeDate || '',
        startTime: cfg.startTime || '',
        graceMinutes: Number(cfg.graceMinutes || 0),
        offDays: Array.isArray(cfg.offDays) ? cfg.offDays : [],
        dailyStartTime: cfg.dailyStartTime || '',
        offDayReasons: (cfg.offDayReasons && typeof cfg.offDayReasons === 'object') ? cfg.offDayReasons : {},
      })
      setGraceInput(String(Number(cfg.graceMinutes || 0)))
      setDailyStartInput(String(cfg.dailyStartTime || ''))
    } catch (err) {
      console.warn(err.message || 'Failed to load config')
    }
  }

  const loadAttendance = async () => {
    if (!token) return
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams()
      if (dateFilter) params.set('date', dateFilter)
      const res = await fetch(`${API_BASE}/api/attendance?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.message || 'Failed to load attendance')
      setData(Array.isArray(json.attendance) ? json.attendance : [])
    } catch (err) {
      setError(err.message || 'Failed to load attendance')
      setData([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadConfig() }, [token])
  useEffect(() => { loadAttendance() }, [token, dateFilter])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return (Array.isArray(data) ? data : []).filter((r) => {
      const matchesQuery = !q || (r.name || '').toLowerCase().includes(q)
      const matchesStatus = statusFilter === 'All' || r.status === statusFilter
      const matchesDate = !dateFilter || r.date === dateFilter
      return matchesQuery && matchesStatus && matchesDate
    })
  }, [query, statusFilter, dateFilter, data])

  // Inject off-day as a synthetic row when a specific date is selected
  const offDayRows = useMemo(() => {
    if (dateFilter && Array.isArray(config.offDays) && config.offDays.includes(dateFilter)) {
      const reason = (config.offDayReasons && config.offDayReasons[dateFilter]) ? config.offDayReasons[dateFilter] : ''
      return [{ name: '-', date: dateFilter, time: '-', status: 'OffDay', reason }]
    }
    return []
  }, [dateFilter, config])

  const displayed = useMemo(() => {
    return [...offDayRows, ...filtered]
  }, [offDayRows, filtered])

  const counts = useMemo(() => {
    let ontime = 0, late = 0, leave = 0
    for (const r of filtered) {
      if (r.status === 'OnTime') ontime++
      else if (r.status === 'Late') late++
      else if (r.status === 'Leave') leave++
    }
    return { ontime, late, leave }
  }, [filtered])

  return (
    <AdminLayout>
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">Attendance</h1>

      {/* Controls: Start attendance & off days */}
      <div className="bg-white border rounded-2xl shadow-sm p-4 mb-4 space-y-3">
        <div className="flex flex-col md:flex-row md:items-end gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Daily Start Time</label>
            <input
              type="time"
              value={dailyStartInput}
              onChange={(e) => setDailyStartInput(e.target.value)}
              className="px-3 py-2 border rounded-lg text-sm w-36"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Grace Minutes</label>
            <input
              type="number"
              min="0"
              value={graceInput}
              onChange={(e) => setGraceInput(e.target.value)}
              className="px-3 py-2 border rounded-lg text-sm w-32"
            />
          </div>
          <button
            onClick={async () => {
              if (!token || !dailyStartInput) return
              try {
                const res = await fetch(`${API_BASE}/api/attendance/config/schedule`, {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                  body: JSON.stringify({ dailyStartTime: dailyStartInput, graceMinutes: Number(graceInput || 0) })
                })
                const json = await res.json()
                if (!res.ok) throw new Error(json?.message || 'Failed to save schedule')
                await loadConfig()
                alert('Daily schedule saved')
              } catch (err) {
                alert(err.message || 'Failed to save schedule')
              }
            }}
            className="px-4 py-2 rounded-lg text-sm bg-gray-900 text-white hover:bg-black"
          >Save Schedule</button>
          <button
            onClick={async () => {
              if (!token) return
              try {
                const res = await fetch(`${API_BASE}/api/attendance/config/start`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                  body: JSON.stringify({ graceMinutes: Number(graceInput || 0) })
                })
                const json = await res.json()
                if (!res.ok) throw new Error(json?.message || 'Failed to start attendance')
                await loadConfig()
                await loadAttendance()
                alert('Attendance started for today')
              } catch (err) {
                alert(err.message || 'Failed to start attendance')
              }
            }}
            className="px-4 py-2 rounded-lg text-sm bg-brand text-white hover:bg-brand-dark"
          >Start Attendance Now</button>
        </div>
        <div className="flex flex-col md:flex-row md:items-end gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Active Date Override</label>
            <input
              type="date"
              value={overrideDateInput}
              onChange={(e) => setOverrideDateInput(e.target.value)}
              className="px-3 py-2 border rounded-lg text-sm"
            />
          </div>
          <button
            onClick={async () => {
              if (!token || !overrideDateInput) return
              try {
                const res = await fetch(`${API_BASE}/api/attendance/config/set-date`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                  body: JSON.stringify({ date: overrideDateInput })
                })
                const json = await res.json()
                if (!res.ok) throw new Error(json?.message || 'Failed to set active date')
                setOverrideDateInput('')
                await loadConfig()
                await loadAttendance()
              } catch (err) {
                alert(err.message || 'Failed to set active date')
              }
            }}
            className="px-4 py-2 rounded-lg text-sm bg-gray-100 hover:bg-gray-200"
          >Set Active Date</button>
        </div>
        <div className="flex flex-col md:flex-row md:items-end gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Add Off Day</label>
            <input
              type="date"
              value={offDayInput}
              onChange={(e) => setOffDayInput(e.target.value)}
              className="px-3 py-2 border rounded-lg text-sm"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Off Day Reason (optional)</label>
            <input
              type="text"
              value={offDayReasonInput}
              onChange={(e) => setOffDayReasonInput(e.target.value)}
              placeholder="e.g., Public holiday, Maintenance, etc."
              className="px-3 py-2 border rounded-lg text-sm w-full"
            />
          </div>
          <button
            onClick={async () => {
              if (!token || !offDayInput) return
              try {
                const res = await fetch(`${API_BASE}/api/attendance/offdays`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                  body: JSON.stringify({ date: offDayInput, reason: offDayReasonInput })
                })
                const json = await res.json()
                if (!res.ok) throw new Error(json?.message || 'Failed to add off day')
                setOffDayInput('')
                setOffDayReasonInput('')
                await loadConfig()
              } catch (err) {
                alert(err.message || 'Failed to add off day')
              }
            }}
            className="px-4 py-2 rounded-lg text-sm bg-gray-100 hover:bg-gray-200"
          >Add</button>
        </div>
        <div className="text-sm text-gray-700">
          <p>Active Date: <span className="font-medium">{config.activeDate || '—'}</span></p>
          <p>Start Time: <span className="font-medium">{config.startTime ? new Date(config.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}</span></p>
          <p>Scheduled Daily Start: <span className="font-medium">{config.dailyStartTime || '—'}</span></p>
          <p>Late starts after: <span className="font-medium">{Number(config.graceMinutes || 0)} min</span></p>
          {Array.isArray(config.offDays) && config.offDays.length > 0 && (
            <div className="mt-2">
              <p className="font-medium mb-1">Off Days:</p>
              <div className="flex flex-wrap gap-2">
                {config.offDays.map(d => (
                  <span key={d} className="inline-flex items-center gap-2 px-2 py-1 rounded border text-xs">
                    <span className="font-medium">{d}</span>
                    {config.offDayReasons && config.offDayReasons[d] ? (
                      <span className="text-gray-600">– {config.offDayReasons[d]}</span>
                    ) : null}
                    <button
                      onClick={async () => {
                        if (!token) return
                        try {
                          const res = await fetch(`${API_BASE}/api/attendance/offdays/${d}`, {
                            method: 'DELETE',
                            headers: { Authorization: `Bearer ${token}` },
                          })
                          const json = await res.json()
                          if (!res.ok) throw new Error(json?.message || 'Failed to remove off day')
                          await loadConfig()
                        } catch (err) {
                          alert(err.message || 'Failed to remove off day')
                        }
                      }}
                      className="text-red-600 hover:text-red-700"
                    >×</button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row md:items-end gap-3 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm"
          >
            <option>All</option>
            <option>OnTime</option>
            <option>Late</option>
            <option>Leave</option>
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Search Employee</label>
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:outline-none"
            />
            <svg className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 21l-4.35-4.35"/><circle cx="10" cy="10" r="7"/></svg>
          </div>
        </div>
        <button
          onClick={() => { setDateFilter(''); setStatusFilter('All'); setQuery('') }}
          className="px-3 py-2 rounded-lg text-sm bg-gray-100 hover:bg-gray-200 text-gray-800"
        >
          Clear Filters
        </button>
      </div>

      {/* Daily summary (based on filtered) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="bg-white border rounded-xl p-6 shadow-sm">
          <p className="text-sm text-gray-600">On-Time</p>
          <h2 className="text-xl font-bold mt-2">{counts.ontime}</h2>
        </div>
        <div className="bg-white border rounded-xl p-6 shadow-sm">
          <p className="text-sm text-gray-600">Late</p>
          <h2 className="text-xl font-bold mt-2">{counts.late}</h2>
        </div>
        <div className="bg-white border rounded-xl p-6 shadow-sm">
          <p className="text-sm text-gray-600">Leave</p>
          <h2 className="text-xl font-bold mt-2">{counts.leave}</h2>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border rounded-2xl shadow-sm overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="text-gray-600">
            <tr>
              <th className="px-4 py-3 text-left">Employee</th>
              <th className="px-4 py-3 text-left">Date</th>
              <th className="px-4 py-3 text-left">Time</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Reason</th>
            </tr>
          </thead>
          <tbody className="text-gray-900">
            {displayed.map((r, i) => (
              <tr key={`${r.name}-${r.date}-${i}`} className="border-t">
                <td className="px-4 py-3">{r.name}</td>
                <td className="px-4 py-3">{r.date}</td>
                <td className="px-4 py-3">{r.time}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium border ${
                    r.status === 'OnTime'
                      ? 'bg-green-50 text-green-700 border-green-200'
                      : r.status === 'Late'
                      ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                      : r.status === 'Leave'
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : 'bg-gray-50 text-gray-700 border-gray-200'
                  }`}>{r.status}</span>
                </td>
                <td className="px-4 py-3 text-gray-600">{r.reason || (r.time === '-' ? '—' : '')}</td>
              </tr>
            ))}
            {displayed.length === 0 && (
              <tr>
                <td className="px-4 py-4 text-gray-500" colSpan={5}>No attendance records found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  )
}