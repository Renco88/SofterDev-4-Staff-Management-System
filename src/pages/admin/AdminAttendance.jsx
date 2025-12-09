import { useMemo, useState } from 'react'
import AdminLayout from '../../layouts/AdminLayout.jsx'

const attendanceSeed = [
  { name: 'Alice Khan', date: '2025-12-09', time: '09:01 AM', status: 'Present' },
  { name: 'Rifat Ahmed', date: '2025-12-09', time: '09:20 AM', status: 'Late' },
  { name: 'Sumaiya Noor', date: '2025-12-09', time: '-', status: 'Absent' },
  { name: 'Ethan Bennett', date: '2025-12-09', time: '08:58 AM', status: 'Present' },
  { name: 'Olivia Carter', date: '2025-12-09', time: '09:05 AM', status: 'Present' },
  { name: 'Sophia Clark', date: '2025-12-09', time: '09:32 AM', status: 'Late' },
  { name: 'Liam Harper', date: '2025-12-08', time: '09:00 AM', status: 'Present' },
  { name: 'Ava Foster', date: '2025-12-08', time: '-', status: 'Absent' },
  { name: 'Jackson Hayes', date: '2025-12-08', time: '09:17 AM', status: 'Late' },
  { name: 'Isabella Coleman', date: '2025-12-08', time: '08:55 AM', status: 'Present' },
  { name: 'Noah Carter', date: '2025-12-07', time: '09:02 AM', status: 'Present' },
  { name: 'Mia Jenkins', date: '2025-12-07', time: '09:40 AM', status: 'Late' },
]

export default function AdminAttendance() {
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [dateFilter, setDateFilter] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return attendanceSeed.filter((r) => {
      const matchesQuery = !q || r.name.toLowerCase().includes(q)
      const matchesStatus = statusFilter === 'All' || r.status === statusFilter
      const matchesDate = !dateFilter || r.date === dateFilter
      return matchesQuery && matchesStatus && matchesDate
    })
  }, [query, statusFilter, dateFilter])

  const counts = useMemo(() => {
    let present = 0, late = 0, absent = 0
    for (const r of filtered) {
      if (r.status === 'Present') present++
      else if (r.status === 'Late') late++
      else if (r.status === 'Absent') absent++
    }
    return { present, late, absent }
  }, [filtered])

  return (
    <AdminLayout>
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">Attendance</h1>

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
            <option>Present</option>
            <option>Late</option>
            <option>Absent</option>
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
          <p className="text-sm text-gray-600">Present</p>
          <h2 className="text-xl font-bold mt-2">{counts.present}</h2>
        </div>
        <div className="bg-white border rounded-xl p-6 shadow-sm">
          <p className="text-sm text-gray-600">Late</p>
          <h2 className="text-xl font-bold mt-2">{counts.late}</h2>
        </div>
        <div className="bg-white border rounded-xl p-6 shadow-sm">
          <p className="text-sm text-gray-600">Absent</p>
          <h2 className="text-xl font-bold mt-2">{counts.absent}</h2>
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
              <th className="px-4 py-3 text-left">Note</th>
            </tr>
          </thead>
          <tbody className="text-gray-900">
            {filtered.map((r, i) => (
              <tr key={`${r.name}-${r.date}-${i}`} className="border-t">
                <td className="px-4 py-3">{r.name}</td>
                <td className="px-4 py-3">{r.date}</td>
                <td className="px-4 py-3">{r.time}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium border ${
                    r.status === 'Present'
                      ? 'bg-green-50 text-green-700 border-green-200'
                      : r.status === 'Late'
                      ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                      : 'bg-red-50 text-red-700 border-red-200'
                  }`}>{r.status}</span>
                </td>
                <td className="px-4 py-3 text-gray-600">{r.time === '-' ? 'No check-in' : ''}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
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