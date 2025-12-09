import { useEffect, useMemo, useState } from 'react'
import AdminLayout from '../../layouts/AdminLayout.jsx'

const departmentsSeed = [
  { name: 'Engineering', description: 'Responsible for product development and technical innovation.' },
  { name: 'Marketing', description: 'Manages brand promotion, market research, and customer engagement.' },
  { name: 'Sales', description: 'Drives revenue through direct sales, partnerships, and account management.' },
  { name: 'Human Resources', description: 'Handles recruitment, employee relations, and organizational development.' },
  { name: 'Finance', description: 'Oversees financial planning, accounting, and reporting.' },
]

export default function AdminDepartments() {
  const [query, setQuery] = useState('')
  const [data, setData] = useState(() => {
    try {
      const raw = localStorage.getItem('adminDepartmentsData')
      return raw ? JSON.parse(raw) : departmentsSeed
    } catch {
      return departmentsSeed
    }
  })
  const [showModal, setShowModal] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const perPage = 5

  useEffect(() => {
    try { localStorage.setItem('adminDepartmentsData', JSON.stringify(data)) } catch {}
  }, [data])

  useEffect(() => { setCurrentPage(1) }, [query])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return data
    return data.filter(d =>
      d.name.toLowerCase().includes(q) ||
      d.description.toLowerCase().includes(q)
    )
  }, [query, data])

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage))
  const start = (currentPage - 1) * perPage
  const pageData = filtered.slice(start, start + perPage)

  const handleDelete = (name) => {
    if (!confirm(`Delete department "${name}"?`)) return
    setData(prev => prev.filter(d => d.name !== name))
  }

  return (
    <AdminLayout>
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">Departments</h1>

      {/* Top bar: search + add */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div className="relative w-full sm:max-w-xs">
          <input
            type="text"
            placeholder="Search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:outline-none"
          />
          <svg className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 21l-4.35-4.35"/><circle cx="10" cy="10" r="7"/></svg>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center justify-center px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm w-full sm:w-auto"
        >
          Add Department
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border rounded-2xl shadow-sm overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="text-gray-600">
            <tr>
              <th className="px-4 py-3 text-left">Department Name</th>
              <th className="px-4 py-3 text-left">Description</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="text-gray-900">
            {pageData.map((d, i) => (
              <tr key={i} className="border-t">
                <td className="px-4 py-4 font-medium">{d.name}</td>
                <td className="px-4 py-4 text-gray-700">{d.description}</td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-4">
                    <button className="text-gray-700 hover:text-gray-900 text-sm">Edit</button>
                    <button onClick={() => handleDelete(d.name)} className="text-red-600 hover:text-red-700 text-sm">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td className="px-4 py-4 text-gray-500" colSpan={3}>No departments found.</td>
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

      {showModal && (
        <AddDepartmentModal
          onCancel={() => setShowModal(false)}
          onSubmit={(payload) => {
            setData(prev => [...prev, payload])
            setShowModal(false)
          }}
        />
      )}
    </AdminLayout>
  )
}

function AddDepartmentModal({ onCancel, onSubmit }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const canSubmit = name.trim() && description.trim()

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!canSubmit) return
    onSubmit({ name: name.trim(), description: description.trim() })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl border p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Add Department</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} type="text" className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="e.g., Engineering" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" rows={3} placeholder="Short description" />
          </div>
          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              className={`px-4 py-2 rounded-md text-sm font-medium text-white ${canSubmit ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-300 cursor-not-allowed'}`}
              disabled={!canSubmit}
            >
              Add Department
            </button>
            <button type="button" onClick={onCancel} className="px-4 py-2 rounded-md text-sm font-medium bg-gray-100 hover:bg-gray-200 text-gray-800">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  )
}