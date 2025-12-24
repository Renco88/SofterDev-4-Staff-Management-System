import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import AdminLayout from '../../layouts/AdminLayout.jsx'
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'



// Ensure salary values display in BDT even if backend still stores `$`
const formatSalaryBDT = (value) => {
  if (value === null || value === undefined) return '—'
  const s = String(value).trim()
  if (!s) return '—'
  if (s.startsWith('BDT')) return s
  if (s.startsWith('$')) {
    const amount = s.replace(/\$/,'').trim()
    return `BDT ${amount}`
  }
  // If it's just a number or other string, prefix with BDT
  return /^\d/.test(s) ? `BDT ${s}` : s
}

// Fallback departments if none found in localStorage (names only for dropdown)
const departmentsSeed = [
  'Engineering',
  'Marketing',
  'Sales',
  'Human Resources',
  'Finance',
]

export default function AdminEmployees() {
  const { token } = useAuth()
  const [query, setQuery] = useState('')
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [viewEmployee, setViewEmployee] = useState(null)
  const [editEmployee, setEditEmployee] = useState(null)
  const [pendingDelete, setPendingDelete] = useState(null)
  const [editPaymentMethod, setEditPaymentMethod] = useState(null)
  const [copiedKey, setCopiedKey] = useState('')
  useEffect(() => {
    if (!copiedKey) return
    const t = setTimeout(() => setCopiedKey(''), 1500)
    return () => clearTimeout(t)
  }, [copiedKey])

  // Load employees from backend
  useEffect(() => {
    const fetchEmployees = async () => {
      setLoading(true)
      setError('')
      try {
        const res = await fetch(`${API_BASE}/api/users?role=user`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: token ? `Bearer ${token}` : '',
          },
        })
        const json = await res.json()
        if (!res.ok) throw new Error(json?.message || 'Failed to load employees')
        setData(Array.isArray(json.users) ? json.users : [])
      } catch (err) {
        setError(err.message || 'Error loading employees')
      } finally {
        setLoading(false)
      }
    }
    if (token) fetchEmployees()
  }, [token])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return data
    return data.filter(e =>
      e.name.toLowerCase().includes(q) ||
      e.email.toLowerCase().includes(q) ||
      e.role.toLowerCase().includes(q) ||
      (e.department ? e.department.toLowerCase().includes(q) : false)
    )
  }, [query, data])

  const handleDelete = async (id) => {
    if (!id) return
    try {
      const res = await fetch(`${API_BASE}/api/users/${id}`, {
        method: 'DELETE',
        headers: { Authorization: token ? `Bearer ${token}` : '' },
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json?.message || 'Delete failed')
      setData((prev) => prev.filter(e => (e.id || e._id) !== id))
    } catch (err) {
      alert(err.message || 'Delete failed')
    }
  }

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

      {/* Mobile Cards */}
      <div className="block md:hidden space-y-3">
        {filtered.map((e, idx) => (
          <div key={`card-${idx}`} className="bg-white border rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full overflow-hidden border shrink-0">
                {e?.avatarUrl ? (
                  <img src={e.avatarUrl} alt={e.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full rounded-full bg-gradient-to-br from-indigo-200 to-pink-200 flex items-center justify-center text-sm font-semibold text-gray-700">
                    {(e?.name?.[0] || 'U').toUpperCase()}
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-base font-semibold text-gray-900 truncate">{e.name}</p>
                <p className="text-sm text-gray-600 truncate">{e.role}</p>
                <p className="text-sm text-indigo-600 truncate">{e.email}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-3 text-sm">
              <div>
                <p className="text-gray-500">Department</p>
                <p className="text-gray-800">{e.department || '-'}</p>
              </div>
              <div>
                <p className="text-gray-500">Salary</p>
                <p className="text-gray-800">{formatSalaryBDT(e.salary)}</p>
              </div>
              <div>
                <p className="text-gray-500">Leave Balance</p>
                <p className="text-gray-800">{e.leave}</p>
              </div>
              <div>
                <p className="text-gray-500">Payment Method</p>
                <p className="text-gray-800">{e?.paymentMethod?.method || '—'}</p>
              </div>
            </div>
            {e?.paymentMethod?.method && (
              <div className="mt-2 text-xs text-gray-700 space-y-1">
                {e.paymentMethod.method === 'bkash' && (
                  <button
                    type="button"
                    className="text-indigo-600 hover:text-indigo-700"
                    onClick={async () => {
                      const key = `${e.id || e._id}:bkash`
                      try { await navigator.clipboard.writeText(e.paymentMethod.bkashNumber || '') } catch {}
                      setCopiedKey(key)
                    }}
                    aria-label="Copy bKash number"
                  >
                    bKash: {e.paymentMethod.bkashNumber || '—'} {copiedKey === `${e.id || e._id}:bkash` && (<span className="text-green-700">(Copied)</span>)}
                  </button>
                )}
                {e.paymentMethod.method === 'nagad' && (
                  <button
                    type="button"
                    className="text-indigo-600 hover:text-indigo-700"
                    onClick={async () => {
                      const key = `${e.id || e._id}:nagad`
                      try { await navigator.clipboard.writeText(e.paymentMethod.nagadNumber || '') } catch {}
                      setCopiedKey(key)
                    }}
                    aria-label="Copy Nagad number"
                  >
                    Nagad: {e.paymentMethod.nagadNumber || '—'} {copiedKey === `${e.id || e._id}:nagad` && (<span className="text-green-700">(Copied)</span>)}
                  </button>
                )}
                {e.paymentMethod.method === 'bank' && (
                  <div>
                    <div>Bank: {e.paymentMethod.bankName || '—'}</div>
                    <button
                      type="button"
                      className="text-indigo-600 hover:text-indigo-700"
                      onClick={async () => {
                        const key = `${e.id || e._id}:account`
                        try { await navigator.clipboard.writeText(e.paymentMethod.accountNumber || '') } catch {}
                        setCopiedKey(key)
                      }}
                      aria-label="Copy account number"
                    >
                      Account: {e.paymentMethod.accountNumber || '—'} {copiedKey === `${e.id || e._id}:account` && (<span className="text-green-700">(Copied)</span>)}
                    </button>
                    <div>Branch: {e.paymentMethod.branch || '—'}</div>
                  </div>
                )}
              </div>
            )}
            <div className="mt-3 flex flex-wrap gap-3">
              <button className="text-indigo-600 hover:text-indigo-700 text-sm" onClick={() => setViewEmployee(e)}>View</button>
              <button className="text-gray-600 hover:text-gray-800 text-sm" onClick={() => setEditEmployee(e)}>Edit</button>
              <button className="text-blue-600 hover:text-blue-700 text-sm" onClick={() => setEditPaymentMethod(e)}>Edit Payment</button>
              <button className="text-red-600 hover:text-red-700 text-sm" onClick={() => setPendingDelete(e)}>Delete</button>
            </div>
          </div>
        ))}
        {!loading && filtered.length === 0 && (
          <div className="bg-white border rounded-xl p-4 text-sm text-gray-500">No employees found.</div>
        )}
      </div>

      {/* Table (Desktop) */}
      <div className="hidden md:block bg-white border rounded-2xl shadow-sm overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="text-gray-600">
            <tr>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Role</th>
              <th className="px-4 py-3 text-left">Department</th>
              <th className="px-4 py-3 text-left">Salary</th>
              <th className="px-4 py-3 text-left">Leave Balance</th>
              <th className="px-4 py-3 text-left">Payment Method</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="text-gray-900">
            {filtered.map((e, idx) => (
              <tr key={idx} className="border-t">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full overflow-hidden border">
                      {e?.avatarUrl ? (
                        <img src={e.avatarUrl} alt={e.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full rounded-full bg-gradient-to-br from-indigo-200 to-pink-200 flex items-center justify-center text-sm font-semibold text-gray-700">
                          {(e?.name?.[0] || 'U').toUpperCase()}
                        </div>
                      )}
                    </div>
                    <span>{e.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-indigo-600">{e.email}</td>
                <td className="px-4 py-3">{e.role}</td>
                <td className="px-4 py-3">{e.department || '-'}</td>
                <td className="px-4 py-3">{formatSalaryBDT(e.salary)}</td>
                <td className="px-4 py-3">{e.leave}</td>
                <td className="px-4 py-3">
                  {e?.paymentMethod?.method ? (
                    <div className="space-y-1">
                      <div className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 border border-gray-200 text-xs text-gray-700">
                        {e.paymentMethod.method}
                      </div>
                      {e.paymentMethod.method === 'bkash' && (
                        <button
                          type="button"
                          className="text-indigo-600 hover:text-indigo-700 text-xs"
                          onClick={async () => {
                            const key = `${e.id || e._id}:bkash`
                            try {
                              await navigator.clipboard.writeText(e.paymentMethod.bkashNumber || '')
                              setCopiedKey(key)
                            } catch {}
                          }}
                        >
                          bKash Number: {e.paymentMethod.bkashNumber || '—'} {copiedKey === `${e.id || e._id}:bkash` && (<span className="text-green-700">(Copied)</span>)}
                        </button>
                      )}
                      {e.paymentMethod.method === 'nagad' && (
                        <button
                          type="button"
                          className="text-indigo-600 hover:text-indigo-700 text-xs"
                          onClick={async () => {
                            const key = `${e.id || e._id}:nagad`
                            try {
                              await navigator.clipboard.writeText(e.paymentMethod.nagadNumber || '')
                              setCopiedKey(key)
                            } catch {}
                          }}
                        >
                          Nagad Number: {e.paymentMethod.nagadNumber || '—'} {copiedKey === `${e.id || e._id}:nagad` && (<span className="text-green-700">(Copied)</span>)}
                        </button>
                      )}
                      {e.paymentMethod.method === 'bank' && (
                        <div className="text-xs text-gray-700">
                          <div>Bank: {e.paymentMethod.bankName || '—'}</div>
                          <button
                            type="button"
                            className="text-indigo-600 hover:text-indigo-700"
                            onClick={async () => {
                              const key = `${e.id || e._id}:account`
                              try {
                                await navigator.clipboard.writeText(e.paymentMethod.accountNumber || '')
                                setCopiedKey(key)
                              } catch {}
                            }}
                          >
                            Account: {e.paymentMethod.accountNumber || '—'} {copiedKey === `${e.id || e._id}:account` && (<span className="text-green-700">(Copied)</span>)}
                          </button>
                          <div>Branch: {e.paymentMethod.branch || '—'}</div>
                        </div>
                      )}
                    </div>
                  ) : (
                    'false'
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-4">
                    <button
                      className="text-indigo-600 hover:text-indigo-700 text-sm"
                      onClick={() => setViewEmployee(e)}
                    >
                      View
                    </button>
                    <button
                      className="text-gray-600 hover:text-gray-800 text-sm"
                      onClick={() => setEditEmployee(e)}
                    >
                      Edit
                    </button>
                    <button
                      className="text-blue-600 hover:text-blue-700 text-sm"
                      onClick={() => setEditPaymentMethod(e)}
                    >
                      Edit Payment Method
                    </button>
                    <button
                      className="text-red-600 hover:text-red-700 text-sm"
                      onClick={() => setPendingDelete(e)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td className="px-4 py-4 text-gray-500" colSpan={8}>No employees found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {showModal && (
        <AddEmployeeModal
          onCancel={() => setShowModal(false)}
          onSubmit={(created) => {
            setData((prev) => [created, ...prev])
            setShowModal(false)
          }}
        />
      )}
      {viewEmployee && (
        <ViewEmployeeModal
          employee={viewEmployee}
          onClose={() => setViewEmployee(null)}
        />
      )}
      {editEmployee && (
        <EditEmployeeModal
          employee={editEmployee}
          onCancel={() => setEditEmployee(null)}
          onSubmit={(updated) => {
            setData((prev) => prev.map(e => (e.id || e._id) === (updated.id || updated._id) ? updated : e))
            setEditEmployee(null)
          }}
        />
      )}
      {editPaymentMethod && (
        <EditPaymentMethodModal
          employee={editPaymentMethod}
          onCancel={() => setEditPaymentMethod(null)}
          onSubmit={(updated) => {
            setData((prev) => prev.map(e => (e.id || e._id) === (updated.id || updated._id) ? updated : e))
            setEditPaymentMethod(null)
          }}
        />
      )}
      {pendingDelete && (
        <ConfirmDeleteModal
          employee={pendingDelete}
          onCancel={() => setPendingDelete(null)}
          onConfirm={async () => {
            await handleDelete(pendingDelete.id || pendingDelete._id)
            setPendingDelete(null)
          }}
        />
      )}
    </AdminLayout>
  )
}

function AddEmployeeModal({ onCancel, onSubmit }) {
  const { token } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [department, setDepartment] = useState('')
  const [salary, setSalary] = useState('')
  const [leave, setLeave] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [departments, setDepartments] = useState([])
  const [depsLoading, setDepsLoading] = useState(false)
  const [depsError, setDepsError] = useState('')

  useEffect(() => {
    const loadDepartments = async () => {
      setDepsLoading(true)
      setDepsError('')
      try {
        const res = await fetch(`${API_BASE}/api/departments`, {
          headers: { Authorization: token ? `Bearer ${token}` : '' },
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data?.message || 'Failed to load departments')
        setDepartments(Array.isArray(data.departments) ? data.departments.map(d => d.name) : [])
      } catch (err) {
        setDepsError(err.message || 'Error loading departments')
      } finally {
        setDepsLoading(false)
      }
    }
    if (token) loadDepartments()
  }, [token])

  const canSubmit = name.trim() && email.trim() && password.trim() && department.trim()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!canSubmit) return
    setSubmitting(true)
    const formattedSalary = salary.trim() ? (salary.startsWith('BDT') ? salary : `BDT ${salary}`) : 'BDT 0'
    const formattedLeave = leave.trim() ? (leave.endsWith('days') ? leave : `${leave} days`) : '0 days'
    try {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password: password.trim(),
          role: 'user',
          department: department.trim(),
          salary: formattedSalary,
          leave: formattedLeave,
        })
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data?.message || 'Registration failed')
      }
      // Use created user from backend (includes id)
      onSubmit(data.user)
    } catch (err) {
      setError(err.message || 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl border p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Add Employee</h3>

        {error && (
          <div className="mb-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md p-2">{error}</div>
        )}

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
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="Set login password" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <select value={department} onChange={(e) => setDepartment(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm">
              <option value="">Select department</option>
              {departments.map((d, i) => (
                <option key={i} value={d}>{d}</option>
              ))}
            </select>
            {depsLoading && <p className="mt-1 text-xs text-gray-500">Loading departments…</p>}
            {depsError && <p className="mt-1 text-xs text-red-600">{depsError}</p>}
            {!depsLoading && !depsError && departments.length === 0 && (
              <p className="mt-1 text-xs text-gray-500">No departments found. Create departments first.</p>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Salary</label>
              <input value={salary} onChange={(e) => setSalary(e.target.value)} type="text" className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="BDT 95,000" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Leave Balance</label>
              <input value={leave} onChange={(e) => setLeave(e.target.value)} type="text" className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="15 days" />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              className={`px-4 py-2 rounded-md text-sm font-medium text-white ${canSubmit && !submitting ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-300 cursor-not-allowed'}`}
              disabled={!canSubmit || submitting}
            >
              {submitting ? 'Creating…' : 'Add Employee'}
            </button>
            <button type="button" onClick={onCancel} className="px-4 py-2 rounded-md text-sm font-medium bg-gray-100 hover:bg-gray-200 text-gray-800">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function ViewEmployeeModal({ employee, onClose }) {
  if (!employee) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl border p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Employee Details</h3>
        <div className="space-y-2 text-sm">
          <p><span className="font-medium text-gray-700">Name:</span> {employee.name}</p>
          <p><span className="font-medium text-gray-700">Email:</span> {employee.email}</p>
          <p><span className="font-medium text-gray-700">Role:</span> {employee.role}</p>
          <p><span className="font-medium text-gray-700">Department:</span> {employee.department || '-'}</p>
          <p><span className="font-medium text-gray-700">Salary:</span> {formatSalaryBDT(employee.salary) || '-'}</p>
          <p><span className="font-medium text-gray-700">Leave Balance:</span> {employee.leave || '-'}</p>
        </div>
        <div className="mt-4 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded-md text-sm font-medium bg-gray-100 hover:bg-gray-200 text-gray-800">Close</button>
        </div>
      </div>
    </div>
  )
}

function EditEmployeeModal({ employee, onCancel, onSubmit }) {
  const { token } = useAuth()
  const [name, setName] = useState(employee?.name || '')
  const [email, setEmail] = useState(employee?.email || '')
  const [department, setDepartment] = useState(employee?.department || '')
  const [salary, setSalary] = useState(employee?.salary || '')
  const [leave, setLeave] = useState(employee?.leave || '')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const canSubmit = name.trim() && email.trim()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!canSubmit) return
    setSubmitting(true)
    const formattedSalary = salary.trim() ? (salary.startsWith('BDT') ? salary : `BDT ${salary}`) : ''
    const formattedLeave = leave.trim() ? (leave.endsWith('days') ? leave : `${leave} days`) : ''
    try {
      const res = await fetch(`${API_BASE}/api/users/${employee.id || employee._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          department: department.trim(),
          salary: formattedSalary,
          leave: formattedLeave,
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || 'Update failed')
      onSubmit(data.user)
    } catch (err) {
      setError(err.message || 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl border p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Edit Employee</h3>
        {error && (
          <div className="mb-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md p-2">{error}</div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} type="text" className="w-full px-3 py-2 border rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className="w-full px-3 py-2 border rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <input value={department} onChange={(e) => setDepartment(e.target.value)} type="text" className="w-full px-3 py-2 border rounded-lg text-sm" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Salary</label>
              <input value={salary} onChange={(e) => setSalary(e.target.value)} type="text" className="w-full px-3 py-2 border rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Leave Balance</label>
              <input value={leave} onChange={(e) => setLeave(e.target.value)} type="text" className="w-full px-3 py-2 border rounded-lg text-sm" />
            </div>
          </div>
          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              className={`px-4 py-2 rounded-md text-sm font-medium text-white ${canSubmit && !submitting ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-300 cursor-not-allowed'}`}
              disabled={!canSubmit || submitting}
            >
              {submitting ? 'Saving…' : 'Save Changes'}
            </button>
            <button type="button" onClick={onCancel} className="px-4 py-2 rounded-md text-sm font-medium bg-gray-100 hover:bg-gray-200 text-gray-800">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function ConfirmDeleteModal({ employee, onCancel, onConfirm }) {
  if (!employee) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirm Delete</h3>
        <p className="text-sm text-gray-700 mb-4">Are you sure you want to delete <span className="font-medium">{employee.name}</span>?</p>
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-md text-sm font-medium bg-gray-100 hover:bg-gray-200 text-gray-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

function EditPaymentMethodModal({ employee, onCancel, onSubmit }) {
  const { token } = useAuth()
  const [method, setMethod] = useState(employee?.paymentMethod?.method || '')
  const [bkashNumber, setBkashNumber] = useState(employee?.paymentMethod?.bkashNumber || '')
  const [nagadNumber, setNagadNumber] = useState(employee?.paymentMethod?.nagadNumber || '')
  const [bankName, setBankName] = useState(employee?.paymentMethod?.bankName || '')
  const [accountNumber, setAccountNumber] = useState(employee?.paymentMethod?.accountNumber || '')
  const [branch, setBranch] = useState(employee?.paymentMethod?.branch || '')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const canSubmit = Boolean(method)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!canSubmit) return
    try {
      setSubmitting(true)
      const payload = { method }
      if (method === 'bkash') payload.bkashNumber = bkashNumber
      if (method === 'nagad') payload.nagadNumber = nagadNumber
      if (method === 'bank') {
        payload.bankName = bankName
        payload.accountNumber = accountNumber
        if (branch) payload.branch = branch
      }
      const res = await fetch(`${API_BASE}/api/users/${employee.id || employee._id}/payment-method`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || 'Failed to update payment method')
      onSubmit(data.user)
    } catch (err) {
      setError(err.message || 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl border p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Edit Payment Method</h3>
        {error && (
          <div className="mb-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md p-2">{error}</div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-4">
            <label className="inline-flex items-center gap-2 text-sm">
              <input type="radio" name="method" value="bkash" checked={method === 'bkash'} onChange={() => setMethod('bkash')} />
              bKash
            </label>
            <label className="inline-flex items-center gap-2 text-sm">
              <input type="radio" name="method" value="nagad" checked={method === 'nagad'} onChange={() => setMethod('nagad')} />
              Nagad
            </label>
            <label className="inline-flex items-center gap-2 text-sm">
              <input type="radio" name="method" value="bank" checked={method === 'bank'} onChange={() => setMethod('bank')} />
              Bank
            </label>
          </div>
          {method === 'bkash' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">bKash Number</label>
              <input className="w-full px-3 py-2 border rounded-lg" placeholder="01XXXXXXXXX" value={bkashNumber} onChange={e => setBkashNumber(e.target.value)} />
            </div>
          )}
          {method === 'nagad' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nagad Number</label>
              <input className="w-full px-3 py-2 border rounded-lg" placeholder="01XXXXXXXXX" value={nagadNumber} onChange={e => setNagadNumber(e.target.value)} />
            </div>
          )}
          {method === 'bank' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                <input className="w-full px-3 py-2 border rounded-lg" value={bankName} onChange={e => setBankName(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                <input className="w-full px-3 py-2 border rounded-lg" value={accountNumber} onChange={e => setAccountNumber(e.target.value)} />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Branch (optional)</label>
                <input className="w-full px-3 py-2 border rounded-lg" value={branch} onChange={e => setBranch(e.target.value)} />
              </div>
            </div>
          )}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              className={`px-4 py-2 rounded-md text-sm font-medium text-white ${canSubmit && !submitting ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-300 cursor-not-allowed'}`}
              disabled={!canSubmit || submitting}
            >
              {submitting ? 'Saving…' : 'Save Payment Method'}
            </button>
            <button type="button" onClick={onCancel} className="px-4 py-2 rounded-md text-sm font-medium bg-gray-100 hover:bg-gray-200 text-gray-800">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  )
}