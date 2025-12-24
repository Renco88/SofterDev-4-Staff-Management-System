import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import AdminLayout from '../../layouts/AdminLayout.jsx'

export default function AdminLeaves() {
  const { token } = useAuth()
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'
  const [query, setQuery] = useState('')
  const [data, setData] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const perPage = 5
  const [notifMsg, setNotifMsg] = useState('')
  const [lastPending, setLastPending] = useState(0)

  const load = async () => {
    if (!token) return
    try {
      const res = await fetch(`${API_BASE}/api/leave-requests`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || 'Failed to load leave requests')
      const rows = Array.isArray(data?.leaveRequests) ? data.leaveRequests : []
      // Normalize to table format
      setData(rows.map(r => ({
        id: r.id || r._id,
        employee: r.name,
        type: r.type || 'General',
        start: r.date,
        end: r.date,
        status: r.status || 'Pending',
        reason: r.reason || '',
      })))
      // Track current pending count
      const pendingCount = rows.filter(r => (r.status || 'Pending') === 'Pending').length
      setLastPending(pendingCount)
    } catch (err) {
      console.warn(err.message || 'Failed to load leave requests')
      setData([])
    }
  }

  useEffect(() => { load() }, [token])

  // Poll for new pending leave requests and notify when count increases
  useEffect(() => {
    if (!token) return
    const id = setInterval(async () => {
      try {
        const res = await fetch(`${API_BASE}/api/leave-requests?status=Pending`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const json = await res.json()
        const pending = Array.isArray(json?.leaveRequests) ? json.leaveRequests.length : 0
        if (pending > lastPending) {
          const diff = pending - lastPending
          setNotifMsg(`${diff} new leave request${diff > 1 ? 's' : ''} received.`)
          setLastPending(pending)
          // Refresh table data to reflect new items
          await load()
        }
      } catch (err) {
        // ignore polling errors
      }
    }, 10000) // 10s interval
    return () => clearInterval(id)
  }, [token, lastPending])

  const act = async (id, action) => {
    if (!token || !id) return
    try {
      const res = await fetch(`${API_BASE}/api/leave-requests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ action }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || 'Failed to update leave request')
      await load()
    } catch (err) {
      alert(err.message || 'Failed to update leave')
    }
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return data
    return data.filter(l =>
      l.employee.toLowerCase().includes(q) ||
      l.type.toLowerCase().includes(q) ||
      l.status.toLowerCase().includes(q)
    )
  }, [query, data])

  const counts = useMemo(() => {
    const c = { total: data.length, pending: 0, approved: 0, rejected: 0 }
    for (const r of data) {
      if (r.status === 'Pending') c.pending += 1
      else if (r.status === 'Approved') c.approved += 1
      else if (r.status === 'Rejected') c.rejected += 1
    }
    return c
  }, [data])

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage))
  const start = (currentPage - 1) * perPage
  const pageData = filtered.slice(start, start + perPage)

  return (
    <AdminLayout>
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Leave Management</h1>
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">Total: {counts.total}</span>
        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-yellow-50 text-yellow-700 border border-yellow-200">Pending: {counts.pending}</span>
        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-50 text-green-700 border border-green-200">Approved: {counts.approved}</span>
        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-50 text-red-700 border border-red-200">Rejected: {counts.rejected}</span>
      </div>

      {notifMsg && (
        <div className="mb-4 flex items-center justify-between rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-2 text-indigo-800">
          <span className="text-sm">{notifMsg}</span>
          <button className="text-xs font-medium text-indigo-700 hover:underline" onClick={() => setNotifMsg('')}>Dismiss</button>
        </div>
      )}

      {/* Top bar: search */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3 mb-4">
        <div className="relative w-full sm:max-w-xs">
          <input
            type="text"
            placeholder="Search"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setCurrentPage(1) }}
            className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:outline-none"
          />
          <svg className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 21l-4.35-4.35"/><circle cx="10" cy="10" r="7"/></svg>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border rounded-2xl shadow-sm overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="text-gray-600">
            <tr>
              <th className="px-4 py-3 text-left">Employee</th>
              <th className="px-4 py-3 text-left">Leave Type</th>
              <th className="px-4 py-3 text-left">Start Date</th>
              <th className="px-4 py-3 text-left">End Date</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Reason</th>
              <th className="px-4 py-3 text-left">Action</th>
            </tr>
          </thead>
          <tbody className="text-gray-900">
            {pageData.map((l, i) => (
              <tr key={i} className="border-t">
                <td className="px-4 py-4">{l.employee}</td>
                <td className="px-4 py-4 text-indigo-600">{l.type}</td>
                <td className="px-4 py-4">{l.start}</td>
                <td className="px-4 py-4">{l.end}</td>
                <td className="px-4 py-4">
                  <StatusBadge status={l.status} />
                </td>
                <td className="px-4 py-4">{l.reason}</td>
                <td className="px-4 py-4">
                  {l.status === 'Pending' ? (
                    <div className="flex items-center gap-2">
                      <button onClick={() => act(l.id, 'approve')} className="px-3 py-1 rounded bg-green-600 hover:bg-green-700 text-white text-xs">Approve</button>
                      <button onClick={() => act(l.id, 'reject')} className="px-3 py-1 rounded bg-red-600 hover:bg-red-700 text-white text-xs">Reject</button>
                    </div>
                  ) : (
                    <span className="text-gray-500 text-sm">—</span>
                  )}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td className="px-4 py-4 text-gray-500" colSpan={7}>No leaves found.</td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex items-center justify-center gap-2 px-4 py-3">
          <button
            className="p-2 rounded hover:bg-gray-100"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            aria-label="Previous"
          >
            <span className="sr-only">Previous</span>
            <svg className="h-4 w-4 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
            <button
              key={n}
              onClick={() => setCurrentPage(n)}
              className={`h-8 w-8 inline-flex items-center justify-center rounded-full text-sm ${
                currentPage === n ? 'bg-gray-200 text-gray-900' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {n}
            </button>
          ))}
          <button
            className="p-2 rounded hover:bg-gray-100"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            aria-label="Next"
          >
            <span className="sr-only">Next</span>
            <svg className="h-4 w-4 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
          </button>
        </div>
      </div>
    </AdminLayout>
  )
}

function StatusBadge({ status }) {
  const base = 'inline-flex items-center px-2 py-1 rounded text-xs font-medium border'
  if (status === 'Approved') return <span className={`${base} bg-green-50 text-green-700 border-green-200`}>Approved</span>
  if (status === 'Rejected') return <span className={`${base} bg-red-50 text-red-700 border-red-200`}>Rejected</span>
  if (status === 'Pending') return <span className={`${base} bg-yellow-50 text-yellow-700 border-yellow-200`}>Pending</span>
  return <span className={`${base} bg-gray-100 text-gray-700 border-gray-200`}>Applied</span>
}