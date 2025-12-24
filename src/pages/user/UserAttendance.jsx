import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import UserLayout from '../../layouts/UserLayout.jsx'

export default function UserAttendance() {
  const { token } = useAuth()
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [records, setRecords] = useState([])
  const [summary, setSummary] = useState({ present: 0, late: 0, leave: 0 })
  const [reason, setReason] = useState('')
  const [leaveReason, setLeaveReason] = useState('')
  const [now, setNow] = useState(new Date())
  const [config, setConfig] = useState({ activeDate: '', startTime: '', dailyStartTime: '', graceMinutes: 0, offDays: [], offDayReasons: {} })

  // Today string
  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), [])

  // Derive start and late threshold dynamically from config
  const { start, lateThreshold, isConfigured, isOffDay } = useMemo(() => {
    const today = new Date()
    const dateStr = todayStr
    const off = Array.isArray(config.offDays) && config.offDays.includes(dateStr)
    let startTime = null
    if (config.activeDate === dateStr && config.startTime) {
      startTime = new Date(config.startTime)
    } else if (config.dailyStartTime) {
      const hhmm = String(config.dailyStartTime)
      if (/^\d{2}:\d{2}$/.test(hhmm)) {
        startTime = new Date(`${dateStr}T${hhmm}:00`)
      }
    }
    const configured = Boolean(startTime) && Number.isFinite(Number(config.graceMinutes))
    const threshold = startTime ? new Date(startTime.getTime() + Number(config.graceMinutes || 0) * 60000) : null
    return { start: startTime, lateThreshold: threshold, isConfigured: configured, isOffDay: off }
  }, [config, todayStr])

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  const hasToday = useMemo(() => records.some(r => r.date === todayStr), [records, todayStr])
  const isBeforeStart = start && now < start
  const isOnTimeWindow = start && lateThreshold && now >= start && now <= lateThreshold
  const isLateWindow = start && lateThreshold && now > lateThreshold

  // Compose displayed rows including Off Day as synthetic entry with reason
  const displayedRecords = useMemo(() => {
    const rows = Array.isArray(records) ? [...records] : []
    const today = todayStr
    if (Array.isArray(config.offDays) && config.offDays.includes(today)) {
      const reasonText = (config.offDayReasons && config.offDayReasons[today]) ? config.offDayReasons[today] : ''
      rows.unshift({ date: today, arrivalTime: '', status: 'OffDay', reason: reasonText })
    }
    return rows
  }, [records, config, todayStr])

  const load = async () => {
    if (!token) return
    setLoading(true)
    setError('')
    try {
      // Load config
      const cfgRes = await fetch(`${API_BASE}/api/attendance/config`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const cfgData = await cfgRes.json()
      if (!cfgRes.ok) throw new Error(cfgData?.message || 'Failed to load attendance config')
      const cfg = cfgData?.config || {}
      setConfig({
        activeDate: cfg.activeDate || '',
        startTime: cfg.startTime || '',
        dailyStartTime: cfg.dailyStartTime || '',
        graceMinutes: Number(cfg.graceMinutes || 0),
        offDays: Array.isArray(cfg.offDays) ? cfg.offDays : [],
      })
      // Merge in off-day reasons
      setConfig(prev => ({
        ...prev,
        offDayReasons: (cfg.offDayReasons && typeof cfg.offDayReasons === 'object') ? cfg.offDayReasons : {},
      }))

      const res = await fetch(`${API_BASE}/api/attendance/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || 'Failed to load attendance')
      setRecords(Array.isArray(data?.attendance) ? data.attendance : [])
      setSummary(data?.summary || { present: 0, late: 0, leave: 0 })
    } catch (err) {
      setError(err.message || 'Failed to load attendance')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [token])

  const markOnTime = async () => {
    if (!token || !isOnTimeWindow || hasToday || isOffDay) return
    try {
      const res = await fetch(`${API_BASE}/api/attendance/mark`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: 'OnTime' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || 'Failed to mark attendance')
      await load()
    } catch (err) {
      alert(err.message || 'Failed to mark')
    }
  }

  const markLate = async () => {
    if (!token || !isLateWindow || hasToday || isOffDay) return
    try {
      const res = await fetch(`${API_BASE}/api/attendance/mark`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: 'Late', reason: reason.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || 'Failed to mark late')
      setReason('')
      await load()
    } catch (err) {
      alert(err.message || 'Failed to mark')
    }
  }

  const markLeave = async () => {
    if (!token || hasToday || isOffDay) return
    try {
      const res = await fetch(`${API_BASE}/api/attendance/leave`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ reason: leaveReason.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || 'Failed to mark leave')
      setLeaveReason('')
      await load()
    } catch (err) {
      alert(err.message || 'Failed to mark leave')
    }
  }

  return (
    <UserLayout>
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">Attendance</h1>
      <p className="text-sm text-gray-500 mb-6">On-time/late windows follow admin schedule. Off days disable attendance.</p>

      {/* Status */}
      <div className="bg-white border rounded-xl p-4 md:p-5 shadow-sm space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Scheduled Daily Start</p>
            <p className="text-sm font-semibold text-gray-800">{config.dailyStartTime || '—'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Late after</p>
            <p className="text-sm font-semibold text-gray-800">{Number(config.graceMinutes || 0)} min</p>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">On-time until</p>
            <p className="text-sm font-semibold text-gray-800">{lateThreshold ? lateThreshold.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}</p>
          </div>
          <div className={`px-3 py-1 rounded-lg text-xs font-medium ${isOffDay ? 'bg-gray-100 text-gray-700 border border-gray-300' : isBeforeStart ? 'bg-blue-50 text-blue-700 border border-blue-200' : isOnTimeWindow ? 'bg-green-50 text-green-700 border border-green-200' : isLateWindow ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' : 'bg-gray-50 text-gray-700 border border-gray-200'}`}>
            {isOffDay ? 'Off day' : isBeforeStart ? 'Waiting for start' : isOnTimeWindow ? 'On-time window' : isLateWindow ? 'Late window' : 'Not configured'}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="bg-white border rounded-xl p-6 shadow-sm">
          <p className="text-sm text-gray-600 mb-2">On-Time Attendance</p>
          <button
            type="button"
            onClick={markOnTime}
            disabled={!isOnTimeWindow || hasToday || isOffDay}
            className={`px-4 py-2 rounded-md text-sm font-medium text-white ${((isOnTimeWindow && !hasToday && !isOffDay)) ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-300 cursor-not-allowed'}`}
          >
            Mark On-Time
          </button>
          {hasToday && <p className="mt-2 text-xs text-green-700">Already marked today.</p>}
        </div>

        <div className="bg-white border rounded-xl p-6 shadow-sm">
          <p className="text-sm text-gray-600 mb-2">Late Attendance (requires reason)</p>
          <input
            type="text"
            placeholder="Enter proper reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            disabled={!isLateWindow || hasToday || isOffDay}
            className="w-full px-3 py-2 border rounded-lg text-sm disabled:bg-gray-100"
          />
          <button
            type="button"
            onClick={markLate}
            disabled={!isLateWindow || hasToday || !reason.trim() || isOffDay}
            className={`mt-2 px-4 py-2 rounded-md text-sm font-medium text-white ${((isLateWindow && !hasToday && reason.trim() && !isOffDay)) ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-yellow-300 cursor-not-allowed'}`}
          >
            Submit Late Attendance
          </button>
        </div>

        <div className="bg-white border rounded-xl p-6 shadow-sm">
          <p className="text-sm text-gray-600 mb-2">Mark Leave (optional)</p>
          <input
            type="text"
            placeholder="Reason for leave"
            value={leaveReason}
            onChange={(e) => setLeaveReason(e.target.value)}
            disabled={hasToday}
            className="w-full px-3 py-2 border rounded-lg text-sm disabled:bg-gray-100"
          />
          <button
            type="button"
            onClick={markLeave}
            disabled={hasToday || !leaveReason.trim() || isOffDay}
            className={`mt-2 px-4 py-2 rounded-md text-sm font-medium text-white ${(!hasToday && leaveReason.trim() && !isOffDay) ? 'bg-red-600 hover:bg-red-700' : 'bg-red-300 cursor-not-allowed'}`}
          >
            Submit Leave
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="bg-white border rounded-xl p-6 shadow-sm">
          <p className="text-sm text-gray-600">Present Days</p>
          <h2 className="text-xl font-bold mt-2">{summary.present}</h2>
        </div>
        <div className="bg-white border rounded-xl p-6 shadow-sm">
          <p className="text-sm text-gray-600">Late Attendance</p>
          <h2 className="text-xl font-bold mt-2">{summary.late}</h2>
        </div>
        <div className="bg-white border rounded-xl p-6 shadow-sm">
          <p className="text-sm text-gray-600">Leave</p>
          <h2 className="text-xl font-bold mt-2">{summary.leave}</h2>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border rounded-2xl shadow-sm mt-6 overflow-x-auto">
        <div className="px-4 pt-4">
          <h2 className="text-lg font-semibold text-gray-800">My Attendance History</h2>
          <p className="text-xs text-gray-500 mb-3">Includes submission time, status, and reason.</p>
        </div>
        <table className="min-w-full text-sm">
          <thead className="text-gray-600">
            <tr>
              <th className="px-4 py-3 text-left">Date</th>
              <th className="px-4 py-3 text-left">Time</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Reason</th>
            </tr>
          </thead>
          <tbody className="text-gray-900">
            {displayedRecords.length === 0 ? (
              <tr>
                <td className="px-4 py-4 text-gray-500" colSpan={4}>No records yet.</td>
              </tr>
            ) : (
              displayedRecords.map((r, idx) => (
                <tr key={idx} className="border-t">
                  <td className="px-4 py-3">{r.date}</td>
                  <td className="px-4 py-3">{r.arrivalTime ? new Date(r.arrivalTime).toLocaleTimeString() : '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium border ${
                      r.status === 'OnTime'
                        ? 'bg-green-50 text-green-700 border-green-200'
                        : r.status === 'Late'
                        ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                        : r.status === 'Leave'
                        ? 'bg-red-50 text-red-700 border-red-200'
                        : 'bg-gray-50 text-gray-700 border-gray-200'
                    }`}>{r.status === 'OnTime' ? 'Present' : r.status}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{r.reason || '—'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {loading && (
        <div className="mt-4 px-4 py-3 rounded-md bg-blue-50 border border-blue-200 text-blue-700 text-sm">Loading attendance...</div>
      )}
      {error && (
        <div className="mt-2 px-4 py-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
      )}
    </UserLayout>
  )
}