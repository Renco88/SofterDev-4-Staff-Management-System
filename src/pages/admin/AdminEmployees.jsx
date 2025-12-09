import { useEffect, useMemo, useState } from 'react'
import AdminLayout from '../../layouts/AdminLayout.jsx'

const employeesSeed = [
  { name: 'Ethan Harper', email: 'ethan.harper@example.com', role: 'Software Engineer', salary: '$95,000', leave: '15 days' },
  { name: 'Olivia Bennett', email: 'olivia.bennett@example.com', role: 'Product Manager', salary: '$110,000', leave: '12 days' },
  { name: 'Noah Carter', email: 'noah.carter@example.com', role: 'UX Designer', salary: '$85,000', leave: '18 days' },
  { name: 'Ava Mitchell', email: 'ava.mitchell@example.com', role: 'Marketing Specialist', salary: '$75,000', leave: '20 days' },
  { name: 'Liam Foster', email: 'liam.foster@example.com', role: 'Sales Representative', salary: '$80,000', leave: '10 days' },
  { name: 'Sophia Reynolds', email: 'sophia.reynolds@example.com', role: 'HR Manager', salary: '$90,000', leave: '14 days' },
  { name: 'Jackson Hayes', email: 'jackson.hayes@example.com', role: 'Finance Analyst', salary: '$88,000', leave: '16 days' },
  { name: 'Isabella Coleman', email: 'isabella.coleman@example.com', role: 'Operations Coordinator', salary: '$70,000', leave: '22 days' },
  { name: 'Aiden Brooks', email: 'aiden.brooks@example.com', role: 'Customer Support', salary: '$65,000', leave: '25 days' },
  { name: 'Mia Jenkins', email: 'mia.jenkins@example.com', role: 'Content Writer', salary: '$72,000', leave: '19 days' },
]

export default function AdminEmployees() {
  const [query, setQuery] = useState('')
  const [data, setData] = useState(() => {
    try {
      const raw = localStorage.getItem('adminEmployeesData')
      return raw ? JSON.parse(raw) : employeesSeed
    } catch {
      return employeesSeed
    }
  })
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    try { localStorage.setItem('adminEmployeesData', JSON.stringify(data)) } catch {}
  }, [data])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return data
    return data.filter(e =>
      e.name.toLowerCase().includes(q) ||
      e.email.toLowerCase().includes(q) ||
      e.role.toLowerCase().includes(q)
    )
  }, [query, data])

  return (
    <AdminLayout>
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">Employees</h1>

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
          Add Employee
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border rounded-2xl shadow-sm overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="text-gray-600">
            <tr>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Role</th>
              <th className="px-4 py-3 text-left">Salary</th>
              <th className="px-4 py-3 text-left">Leave Balance</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="text-gray-900">
            {filtered.map((e, idx) => (
              <tr key={idx} className="border-t">
                <td className="px-4 py-3">{e.name}</td>
                <td className="px-4 py-3 text-indigo-600">{e.email}</td>
                <td className="px-4 py-3">{e.role}</td>
                <td className="px-4 py-3">{e.salary}</td>
                <td className="px-4 py-3">{e.leave}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-4">
                    <button className="text-indigo-600 hover:text-indigo-700 text-sm">View</button>
                    <button className="text-gray-600 hover:text-gray-800 text-sm">Edit</button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td className="px-4 py-4 text-gray-500" colSpan={6}>No employees found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {showModal && (
        <AddEmployeeModal
          onCancel={() => setShowModal(false)}
          onSubmit={(payload) => {
            setData((prev) => [...prev, payload])
            setShowModal(false)
          }}
        />
      )}
    </AdminLayout>
  )
}

function AddEmployeeModal({ onCancel, onSubmit }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('')
  const [salary, setSalary] = useState('')
  const [leave, setLeave] = useState('')

  const canSubmit = name.trim() && email.trim() && role.trim()

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!canSubmit) return
    const formattedSalary = salary.trim() ? (salary.startsWith('$') ? salary : `$${salary}`) : '$0'
    const formattedLeave = leave.trim() ? (leave.endsWith('days') ? leave : `${leave} days`) : '0 days'
    onSubmit({ name: name.trim(), email: email.trim(), role: role.trim(), salary: formattedSalary, leave: formattedLeave })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl border p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Add Employee</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} type="text" className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="e.g., Ethan Harper" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="name@example.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <input value={role} onChange={(e) => setRole(e.target.value)} type="text" className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="e.g., Software Engineer" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Salary</label>
              <input value={salary} onChange={(e) => setSalary(e.target.value)} type="text" className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="$95,000" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Leave Balance</label>
              <input value={leave} onChange={(e) => setLeave(e.target.value)} type="text" className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="15 days" />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              className={`px-4 py-2 rounded-md text-sm font-medium text-white ${canSubmit ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-300 cursor-not-allowed'}`}
              disabled={!canSubmit}
            >
              Add Employee
            </button>
            <button type="button" onClick={onCancel} className="px-4 py-2 rounded-md text-sm font-medium bg-gray-100 hover:bg-gray-200 text-gray-800">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  )
}