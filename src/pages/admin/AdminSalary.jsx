import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import AdminLayout from '../../layouts/AdminLayout.jsx'

const salarySeed = [
  { employee: 'Sophia Clark', month: '2024-07', salary: 60000, allowance: 5000, deduction: 2000, status: 'Paid', payDate: '2024-07-25' },
  { employee: 'Ethan Walker', month: '2024-07', salary: 75000, allowance: 7000, deduction: 3000, status: 'Paid', payDate: '2024-07-25' },
  { employee: 'Olivia Reed', month: '2024-07', salary: 55000, allowance: 4000, deduction: 1500, status: 'Paid', payDate: '2024-07-25' },
  { employee: 'Liam Hayes', month: '2024-07', salary: 80000, allowance: 8000, deduction: 3500, status: 'Paid', payDate: '2024-07-25' },
  { employee: 'Ava Bennett', month: '2024-07', salary: 65000, allowance: 6000, deduction: 2500, status: 'Paid', payDate: '2024-07-25' },
  { employee: 'Noah Foster', month: '2024-07', salary: 70000, allowance: 6500, deduction: 2800, status: 'Pending', payDate: '' },
  { employee: 'Isabella Powell', month: '2024-07', salary: 58000, allowance: 4500, deduction: 1800, status: 'Paid', payDate: '2024-07-25' },
  { employee: 'Jackson Carter', month: '2024-07', salary: 85000, allowance: 9000, deduction: 4000, status: 'Paid', payDate: '2024-07-25' },
  { employee: 'Mia Hughes', month: '2024-07', salary: 62000, allowance: 5500, deduction: 2200, status: 'Paid', payDate: '2024-07-25' },
  { employee: 'Aiden Coleman', month: '2024-07', salary: 72000, allowance: 7500, deduction: 3200, status: 'Pending', payDate: '' },
]

export default function AdminSalary() {
  const { token } = useAuth()
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'
  const [query, setQuery] = useState('')
  const [month, setMonth] = useState('')
  const [status, setStatus] = useState('All')
  const [records, setRecords] = useState(() => {
    try {
      const raw = localStorage.getItem('adminSalaryRecords')
      return raw ? JSON.parse(raw) : salarySeed
    } catch {
      return salarySeed
    }
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    try { localStorage.setItem('adminSalaryRecords', JSON.stringify(records)) } catch {}
  }, [records])

  // Helper to parse salary string from DB to number
  const toNumber = (str) => {
    const n = Number(String(str ?? '').replace(/[^0-9.-]/g, ''))
    return Number.isFinite(n) ? n : 0
  }

  // Fetch payments from backend and render in table
  useEffect(() => {
    let cancelled = false
    const loadPayments = async () => {
      if (!token) return
      setLoading(true)
      setError(null)
      try {
        const url = new URL(`${API_BASE}/api/payments`)
        if (month) url.searchParams.set('month', month)
        const res = await fetch(url.toString(), {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) {
          const text = await res.text()
          throw new Error(text || `HTTP ${res.status}`)
        }
        const data = await res.json()
        const items = Array.isArray(data?.payments) ? data.payments : []
        const mapped = items.map(p => ({
          employee: p.name || p.email || 'Unknown',
          month: p.month,
          salary: Number(p.salary) || 0,
          allowance: Number(p.allowance) || 0,
          deduction: Number(p.deduction) || 0,
          status: p.status,
          payDate: p.payDate || '',
        }))
        if (!cancelled) setRecords(mapped)
      } catch (err) {
        if (!cancelled) setError('Failed to load payments')
        console.error('Load payments error:', err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    loadPayments()
    return () => { cancelled = true }
  }, [token, month])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return records.filter(r => (
      (!month || r.month === month) &&
      (status === 'All' || r.status === status) &&
      (!q || r.employee.toLowerCase().includes(q))
    ))
  }, [records, query, month, status])

  const monthlyTotalPaid = useMemo(() => {
    return filtered
      .filter(r => r.status === 'Paid')
      .reduce((sum, r) => sum + r.salary + r.allowance - r.deduction, 0)
  }, [filtered])

  const pendingCount = useMemo(() => filtered.filter(r => r.status === 'Pending').length, [filtered])
  const lastUpdated = useMemo(() => {
    const parsed = filtered
      .map(r => r.payDate)
      .filter(Boolean)
      .map(v => new Date(v))
      .filter(d => !Number.isNaN(d.getTime()))
      .sort((a, b) => a - b)
    const latest = parsed.length ? parsed[parsed.length - 1] : null
    return latest ? latest.toLocaleString() : '—'
  }, [filtered])

  const formatBDT = (n) => `BDT ${n.toLocaleString('en-US')}`

  return (
    <AdminLayout>
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">Salary</h1>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-4">
        <div className="flex flex-col sm:flex-row sm:items-end gap-3 w-full">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
            <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="px-3 py-2 border rounded-lg text-sm" placeholder="All months" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="px-3 py-2 border rounded-lg text-sm">
              <option>All</option>
              <option>Paid</option>
              <option>Pending</option>
            </select>
          </div>
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:outline-none"
            />
            <svg className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 21l-4.35-4.35"/><circle cx="10" cy="10" r="7"/></svg>
          </div>
        </div>
        <button onClick={() => setShowModal(true)} className="inline-flex items-center justify-center px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm w-full sm:w-auto">Add Payment</button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="bg-white border rounded-xl p-6 shadow-sm">
          <p className="text-sm text-gray-600">Monthly Salary Total (Paid)</p>
          <h2 className="text-xl font-bold mt-2">{formatBDT(monthlyTotalPaid)}</h2>
        </div>
        <div className="bg-white border rounded-xl p-6 shadow-sm">
          <p className="text-sm text-gray-600">Pending Payments</p>
          <h2 className="text-xl font-bold mt-2">{pendingCount}</h2>
        </div>
        <div className="bg-white border rounded-xl p-6 shadow-sm">
          <p className="text-sm text-gray-600">Last Updated</p>
          <h2 className="text-xl font-bold mt-2">{lastUpdated}</h2>
        </div>
      </div>

      {/* Load/Error States */}
      {loading && (
        <div className="mb-4 px-4 py-3 rounded-md bg-blue-50 border border-blue-200 text-blue-700 text-sm">
          Payments loading from database...
        </div>
      )}
      {error && (
        <div className="mb-4 px-4 py-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Mobile Cards */}
      <div className="block md:hidden space-y-3">
        {filtered.map((r, i) => {
          const total = r.salary + r.allowance - r.deduction
          return (
            <div key={`card-${r.employee}-${r.month}-${i}`} className="bg-white border rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-sm text-gray-600">{r.month}</p>
                  <h3 className="text-base font-semibold text-gray-900 truncate">{r.employee}</h3>
                </div>
                <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium border ${
                  r.status === 'Paid'
                    ? 'bg-green-50 text-green-700 border-green-200'
                    : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                }`}>{r.status}</span>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-3 text-sm">
                <div>
                  <p className="text-gray-500">Salary</p>
                  <p className="text-gray-800">{formatBDT(r.salary)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Allowance</p>
                  <p className="text-gray-800">{formatBDT(r.allowance)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Deduction</p>
                  <p className="text-gray-800">{formatBDT(r.deduction)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Total Pay</p>
                  <p className="text-gray-800 font-medium">{formatBDT(total)}</p>
                </div>
              </div>
              <div className="mt-2 text-sm text-gray-700">
                <span className="text-gray-500">Pay Date:</span> {(() => {
                  if (!r.payDate) return '—'
                  const d = new Date(r.payDate)
                  return Number.isNaN(d.getTime()) ? r.payDate : d.toLocaleString()
                })()}
              </div>
            </div>
          )
        })}
        {!loading && filtered.length === 0 && (
          <div className="bg-white border rounded-xl p-4 text-sm text-gray-500">No salary records for this filter.</div>
        )}
      </div>

      {/* Table (Desktop) */}
      <div className="hidden md:block bg-white border rounded-2xl shadow-sm overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="text-gray-600">
            <tr>
              <th className="px-4 py-3 text-left">Employee Name</th>
              <th className="px-4 py-3 text-left">Salary</th>
              <th className="px-4 py-3 text-left">Allowance</th>
              <th className="px-4 py-3 text-left">Deduction</th>
              <th className="px-4 py-3 text-left">Total Pay</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Pay Date</th>
            </tr>
          </thead>
          <tbody className="text-gray-900">
            {filtered.map((r, i) => {
              const total = r.salary + r.allowance - r.deduction
              return (
                <tr key={`${r.employee}-${r.month}-${i}`} className="border-t">
                  <td className="px-4 py-4">{r.employee}</td>
                  <td className="px-4 py-4">{formatBDT(r.salary)}</td>
                  <td className="px-4 py-4">{formatBDT(r.allowance)}</td>
                  <td className="px-4 py-4">{formatBDT(r.deduction)}</td>
                  <td className="px-4 py-4">{formatBDT(total)}</td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium border ${
                      r.status === 'Paid'
                        ? 'bg-green-50 text-green-700 border-green-200'
                        : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                    }`}>{r.status}</span>
                  </td>
                  <td className="px-4 py-4 text-gray-700">{(function(){
                    if (!r.payDate) return '—'
                    const d = new Date(r.payDate)
                    return Number.isNaN(d.getTime()) ? r.payDate : d.toLocaleString()
                  })()}</td>
                </tr>
              )
            })}
            {filtered.length === 0 && (
              <tr>
                <td className="px-4 py-4 text-gray-500" colSpan={7}>No salary records for this filter.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <AddPaymentModal
          token={token}
          apiBase={API_BASE}
          defaultMonth={month}
          onCancel={() => setShowModal(false)}
          onSubmit={(payload) => {
            setRecords(prev => [...prev, payload])
            setShowModal(false)
          }}
        />
      )}
    </AdminLayout>
  )
}

function AddPaymentModal({ token, apiBase, defaultMonth, onCancel, onSubmit }) {
  const [employees, setEmployees] = useState([])
  const [empLoading, setEmpLoading] = useState(false)
  const [empError, setEmpError] = useState(null)
  const [email, setEmail] = useState('')
  const [employeeName, setEmployeeName] = useState('')
  const [month, setMonth] = useState(defaultMonth || '')
  const [salary, setSalary] = useState('')
  const [allowance, setAllowance] = useState('')
  const [deduction, setDeduction] = useState('')
  const [status, setStatus] = useState('Paid')
  const [payDate, setPayDate] = useState('')
  const [showPaymentMethod, setShowPaymentMethod] = useState(false)
  const [copiedKey, setCopiedKey] = useState('')
  useEffect(() => {
    if (!copiedKey) return
    const t = setTimeout(() => setCopiedKey(''), 1500)
    return () => clearTimeout(t)
  }, [copiedKey])

  const canSubmit = email.trim() && month.trim() && salary.trim()

  const toNumber = (str) => {
    const n = Number(String(str).replace(/[^0-9.-]/g, ''))
    return Number.isFinite(n) ? n : 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!canSubmit) return
    const selected = employees.find(u => u.email === email)
    if (!selected) {
      setEmpError('Please select a valid employee')
      return
    }
    try {
      const payload = {
        userId: selected.id,
        email: selected.email,
        name: selected.name,
        month: month.trim(),
        salary: toNumber(salary),
        allowance: toNumber(allowance),
        deduction: toNumber(deduction),
        status,
        payDate: status === 'Paid' ? payDate : '',
      }
      const res = await fetch(`${apiBase}/api/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || `HTTP ${res.status}`)
      }
      const data = await res.json()
      const p = data?.payment
      // Update table with the created payment
      onSubmit({
        employee: p?.name || selected.name,
        month: p?.month || month.trim(),
        salary: p?.salary ?? toNumber(salary),
        allowance: p?.allowance ?? toNumber(allowance),
        deduction: p?.deduction ?? toNumber(deduction),
        status: p?.status || status,
        payDate: p?.payDate || (status === 'Paid' ? payDate : ''),
      })
    } catch (err) {
      console.error('Create payment failed:', err)
      setEmpError('Failed to create payment')
    }
  }

  // Load employees for email dropdown
  useEffect(() => {
    let cancelled = false
    const load = async () => {
      if (!token) return
      setEmpLoading(true)
      setEmpError(null)
      try {
        const res = await fetch(`${apiBase}/api/users?role=user`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) {
          const text = await res.text()
          throw new Error(text || `HTTP ${res.status}`)
        }
        const data = await res.json()
        const users = Array.isArray(data?.users) ? data.users : []
        if (!cancelled) setEmployees(users)
      } catch (err) {
        if (!cancelled) setEmpError('Failed to load employees')
      } finally {
        if (!cancelled) setEmpLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [token])

  // When email changes, auto-fill name and salary
  useEffect(() => {
    const selected = employees.find(u => u.email === email)
    if (selected) {
      setEmployeeName(selected.name || '')
      setSalary(String(selected.salary || ''))
    } else {
      setEmployeeName('')
    }
  }, [email, employees])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl border p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Add Payment</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium text-gray-700">Employee Email</label>
              {email && (
                <button
                  type="button"
                  className="text-xs text-indigo-600 hover:text-indigo-700"
                  onClick={() => setShowPaymentMethod(v => !v)}
                >
                  {showPaymentMethod ? 'Hide Payment Method' : 'View Payment Method'}
                </button>
              )}
            </div>
            <select value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm">
              <option value="">{empLoading ? 'Loading...' : 'Select email'}</option>
              {employees.map(u => (
                <option key={u.id} value={u.email}>{u.email}</option>
              ))}
            </select>
            {empError && <p className="mt-1 text-xs text-red-600">{empError}</p>}
            {showPaymentMethod && email && (
              <PaymentMethodDetails
                employee={employees.find(u => u.email === email)}
                copiedKey={copiedKey}
                setCopiedKey={setCopiedKey}
              />
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Employee Name</label>
            <input value={employeeName} readOnly type="text" className="w-full px-3 py-2 border rounded-lg text-sm bg-gray-50" placeholder="Auto-filled" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
              <input value={month} onChange={(e) => setMonth(e.target.value)} type="month" className="w-full px-3 py-2 border rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm">
                <option>Paid</option>
                <option>Pending</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Salary</label>
              <input value={salary} onChange={(e) => setSalary(e.target.value)} type="text" className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="60000" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Allowance</label>
              <input value={allowance} onChange={(e) => setAllowance(e.target.value)} type="text" className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="5000" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Deduction</label>
              <input value={deduction} onChange={(e) => setDeduction(e.target.value)} type="text" className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="2000" />
            </div>
          </div>
          {status === 'Paid' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pay Date & Time</label>
              <input value={payDate} onChange={(e) => setPayDate(e.target.value)} type="datetime-local" className="w-full px-3 py-2 border rounded-lg text-sm" />
            </div>
          )}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              className={`px-4 py-2 rounded-md text-sm font-medium text-white ${canSubmit ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-300 cursor-not-allowed'}`}
              disabled={!canSubmit}
            >
              Add Payment
            </button>
            <button type="button" onClick={onCancel} className="px-4 py-2 rounded-md text-sm font-medium bg-gray-100 hover:bg-gray-200 text-gray-800">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function PaymentMethodDetails({ employee, copiedKey, setCopiedKey }) {
  if (!employee || !employee.paymentMethod || !employee.paymentMethod.method) {
    return (
      <div className="mt-2 px-3 py-2 rounded-md bg-gray-50 border text-xs text-gray-700">No payment method set.</div>
    )
  }
  const pm = employee.paymentMethod
  const uid = employee.id || employee._id
  return (
    <div className="mt-2 space-y-1 px-3 py-2 rounded-md bg-gray-50 border">
      <div className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 border border-gray-200 text-xs text-gray-700">
        {pm.method}
      </div>
      {pm.method === 'bkash' && (
        <button
          type="button"
          className="text-indigo-600 hover:text-indigo-700 text-xs"
          onClick={async () => {
            const key = `${uid}:bkash`
            try {
              await navigator.clipboard.writeText(pm.bkashNumber || '')
              setCopiedKey(key)
            } catch {}
          }}
        >
          bKash Number: {pm.bkashNumber || '—'} {copiedKey === `${uid}:bkash` && (<span className="text-green-700">(Copied)</span>)}
        </button>
      )}
      {pm.method === 'nagad' && (
        <button
          type="button"
          className="text-indigo-600 hover:text-indigo-700 text-xs"
          onClick={async () => {
            const key = `${uid}:nagad`
            try {
              await navigator.clipboard.writeText(pm.nagadNumber || '')
              setCopiedKey(key)
            } catch {}
          }}
        >
          Nagad Number: {pm.nagadNumber || '—'} {copiedKey === `${uid}:nagad` && (<span className="text-green-700">(Copied)</span>)}
        </button>
      )}
      {pm.method === 'bank' && (
        <div className="text-xs text-gray-700">
          <div>Bank: {pm.bankName || '—'}</div>
          <button
            type="button"
            className="text-indigo-600 hover:text-indigo-700"
            onClick={async () => {
              const key = `${uid}:account`
              try {
                await navigator.clipboard.writeText(pm.accountNumber || '')
                setCopiedKey(key)
              } catch {}
            }}
          >
            Account: {pm.accountNumber || '—'} {copiedKey === `${uid}:account` && (<span className="text-green-700">(Copied)</span>)}
          </button>
          <div>Branch: {pm.branch || '—'}</div>
        </div>
      )}
    </div>
  )
}
