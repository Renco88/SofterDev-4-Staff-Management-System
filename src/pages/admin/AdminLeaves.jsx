import { useMemo, useState } from 'react'
import AdminLayout from '../../layouts/AdminLayout.jsx'

const leavesSeed = [
  { employee: 'Ethan Bennett', type: 'Sick Leave', start: '2024-07-10', end: '2024-07-12', status: 'Applied' },
  { employee: 'Olivia Carter', type: 'Personal Leave', start: '2024-07-22', end: '2024-07-23', status: 'Pending' },
  { employee: 'Sophia Clark', type: 'Vacation', start: '2024-07-15', end: '2024-07-20', status: 'Approved' },
  { employee: 'Liam Harper', type: 'Vacation', start: '2024-08-05', end: '2024-08-10', status: 'Rejected' },
  { employee: 'Ava Foster', type: 'Maternity Leave', start: '2024-09-01', end: '2024-12-01', status: 'Approved' },
  { employee: 'Noah Carter', type: 'Sick Leave', start: '2024-10-03', end: '2024-10-05', status: 'Applied' },
  { employee: 'Isabella Coleman', type: 'Vacation', start: '2024-11-10', end: '2024-11-18', status: 'Approved' },
  { employee: 'Jackson Hayes', type: 'Personal Leave', start: '2024-07-29', end: '2024-07-30', status: 'Pending' },
  { employee: 'Mia Jenkins', type: 'Sick Leave', start: '2024-08-18', end: '2024-08-19', status: 'Approved' },
  { employee: 'Aiden Brooks', type: 'Vacation', start: '2024-09-12', end: '2024-09-16', status: 'Rejected' },
]

export default function AdminLeaves() {
  const [query, setQuery] = useState('')
  const [data] = useState(leavesSeed)
  const [currentPage, setCurrentPage] = useState(1)
  const perPage = 5

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return data
    return data.filter(l =>
      l.employee.toLowerCase().includes(q) ||
      l.type.toLowerCase().includes(q) ||
      l.status.toLowerCase().includes(q)
    )
  }, [query, data])

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage))
  const start = (currentPage - 1) * perPage
  const pageData = filtered.slice(start, start + perPage)

  return (
    <AdminLayout>
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">Leave Management</h1>

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
                <td className="px-4 py-4">
                  <button className="text-indigo-600 hover:text-indigo-700 text-sm">View</button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td className="px-4 py-4 text-gray-500" colSpan={6}>No leaves found.</td>
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