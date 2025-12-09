import { useEffect, useMemo, useState } from 'react'
import UserLayout from '../../layouts/UserLayout.jsx'

export default function UserAttendance() {
  // Configure a submission window: now → +10 minutes
  const [windowEndMs] = useState(() => Date.now() + 10 * 60 * 1000)
  const [nowMs, setNowMs] = useState(Date.now())
  const [note, setNote] = useState('')
  const [submittedAt, setSubmittedAt] = useState(null)
  const [records, setRecords] = useState(() => {
    try {
      const raw = localStorage.getItem('attendanceRecords')
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    const t = setInterval(() => setNowMs(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])

  const timeLeftMs = Math.max(0, windowEndMs - nowMs)
  const isClosed = timeLeftMs === 0
  const canSubmit = !isClosed && !submittedAt && note.trim().length > 0

  const mmss = useMemo(() => {
    const totalSec = Math.floor(timeLeftMs / 1000)
    const m = String(Math.floor(totalSec / 60)).padStart(2, '0')
    const s = String(totalSec % 60).padStart(2, '0')
    return `${m}:${s}`
  }, [timeLeftMs])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!canSubmit) return
    const now = new Date()
    setSubmittedAt(now)
    const newRecord = { dateIso: now.toISOString(), note: note.trim() }
    const next = [...records, newRecord]
    setRecords(next)
    try { localStorage.setItem('attendanceRecords', JSON.stringify(next)) } catch {}
  }

  return (
    <UserLayout>
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">Attendance</h1>
      <p className="text-sm text-gray-500 mb-6">Mark your attendance within the active time window.</p>

      {/* Status / Countdown */}
      <div className="bg-white border rounded-xl p-4 md:p-5 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">Submission Window</p>
          {isClosed ? (
            <p className="text-sm font-semibold text-red-600">Attendance closed</p>
          ) : (
            <p className="text-sm font-semibold text-gray-800">Closes in {mmss}</p>
          )}
        </div>
        <div className={`px-3 py-1 rounded-lg text-xs font-medium ${isClosed ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
          {isClosed ? 'Closed' : 'Open'}
        </div>
      </div>

      {/* Attendance form */}
      <form onSubmit={handleSubmit} className="bg-white border rounded-2xl p-6 shadow-sm mt-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">Attendance Note</label>
        <input
          type="text"
          className="w-full px-3 py-2 border rounded-lg text-sm disabled:bg-gray-100"
          placeholder="Enter note (e.g., Present, WFH, etc.)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          disabled={isClosed || !!submittedAt}
        />

        <div className="mt-4 flex items-center gap-3">
          <button
            type="submit"
            className={`px-4 py-2 rounded-md text-sm font-medium text-white ${canSubmit ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-300 cursor-not-allowed'}`}
            disabled={!canSubmit}
          >
            Submit Attendance
          </button>
          {submittedAt && (
            <span className="text-sm text-green-700">Submitted at {submittedAt.toLocaleTimeString()}</span>
          )}
        </div>

        {isClosed && !submittedAt && (
          <p className="mt-3 text-sm text-red-600">Time is over. You cannot submit attendance now.</p>
        )}
      </form>

      {/* Info */}
      <div className="text-xs text-gray-500 mt-3">
        Note: The current demo window is 10 minutes from page load.
      </div>

      {/* Records Table */}
      <div className="bg-white border rounded-2xl shadow-sm mt-6 overflow-x-auto">
        <div className="px-4 pt-4">
          <h2 className="text-lg font-semibold text-gray-800">My Attendance History</h2>
          <p className="text-xs text-gray-500 mb-3">Includes submission time and note.</p>
        </div>
        <table className="min-w-full text-sm">
          <thead className="text-gray-600">
            <tr>
              <th className="px-4 py-3 text-left">Date</th>
              <th className="px-4 py-3 text-left">Time</th>
              <th className="px-4 py-3 text-left">Note</th>
            </tr>
          </thead>
          <tbody className="text-gray-900">
            {records.length === 0 ? (
              <tr>
                <td className="px-4 py-4 text-gray-500" colSpan={3}>No records yet.</td>
              </tr>
            ) : (
              records.map((r, idx) => {
                const d = new Date(r.dateIso)
                return (
                  <tr key={idx} className="border-t">
                    <td className="px-4 py-3">{d.toLocaleDateString()}</td>
                    <td className="px-4 py-3">{d.toLocaleTimeString()}</td>
                    <td className="px-4 py-3">{r.note}</td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </UserLayout>
  )
}