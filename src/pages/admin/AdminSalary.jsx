import { useEffect, useMemo, useState } from 'react'
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
  const [query, setQuery] = useState('')
  const [month, setMonth] = useState('2024-07')
  const [status, setStatus] = useState('All')
  const [records, setRecords] = useState(() => {
    try {
      const raw = localStorage.getItem('adminSalaryRecords')
      return raw ? JSON.parse(raw) : salarySeed
    } catch {
      return salarySeed
    }
  })
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    try { localStorage.setItem('adminSalaryRecords', JSON.stringify(records)) } catch {}
  }, [records])

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
    const dates = filtered.map(r => r.payDate).filter(Boolean).sort()
    return dates.length ? dates[dates.length - 1] : '—'
  }, [filtered])

  const formatUSD = (n) => `$${n.toLocaleString('en-US')}`

  return (
    <AdminLayout>
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">Salary</h1>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-4">
        <div className="flex flex-col sm:flex-row sm:items-end gap-3 w-full">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
            <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="px-3 py-2 border rounded-lg text-sm" />
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
          <h2 className="text-xl font-bold mt-2">{formatUSD(monthlyTotalPaid)}</h2>
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

      {/* Table */}
      <div className="bg-white border rounded-2xl shadow-sm overflow-x-auto">
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
                  <td className="px-4 py-4">{formatUSD(r.salary)}</td>
                  <td className="px-4 py-4">{formatUSD(r.allowance)}</td>
                  <td className="px-4 py-4">{formatUSD(r.deduction)}</td>
                  <td className="px-4 py-4">{formatUSD(total)}</td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium border ${
                      r.status === 'Paid'
                        ? 'bg-green-50 text-green-700 border-green-200'
                        : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                    }`}>{r.status}</span>
                  </td>
                  <td className="px-4 py-4 text-gray-700">{r.payDate || '—'}</td>
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

function AddPaymentModal({ defaultMonth, onCancel, onSubmit }) {
  const [employee, setEmployee] = useState('')
  const [month, setMonth] = useState(defaultMonth || '')
  const [salary, setSalary] = useState('')
  const [allowance, setAllowance] = useState('')
  const [deduction, setDeduction] = useState('')
  const [status, setStatus] = useState('Paid')
  const [payDate, setPayDate] = useState('')

  const canSubmit = employee.trim() && month.trim() && salary.trim()

  const toNumber = (str) => {
    const n = Number(String(str).replace(/[^0-9.-]/g, ''))
    return Number.isFinite(n) ? n : 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!canSubmit) return
    onSubmit({
      employee: employee.trim(),
      month: month.trim(),
      salary: toNumber(salary),
      allowance: toNumber(allowance),
      deduction: toNumber(deduction),
      status,
      payDate: status === 'Paid' ? payDate : '',
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl border p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Add Payment</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Employee Name</label>
            <input value={employee} onChange={(e) => setEmployee(e.target.value)} type="text" className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="e.g., Sophia Clark" />
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Pay Date</label>
              <input value={payDate} onChange={(e) => setPayDate(e.target.value)} type="date" className="w-full px-3 py-2 border rounded-lg text-sm" />
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