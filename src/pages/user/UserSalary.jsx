import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import UserLayout from '../../layouts/UserLayout.jsx'

export default function UserSalary() {
  const { token } = useAuth()
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'
  const [profile, setProfile] = useState(null)
  const [payments, setPayments] = useState([])
  const [month, setMonth] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const formatBDT = (n) => {
    const num = Number(n)
    return Number.isFinite(num) ? `BDT ${num.toLocaleString('en-US')}` : String(n ?? '')
  }
  const normalizeSalaryText = (s) => {
    if (!s) return '—'
    const str = String(s).trim()
    if (str.startsWith('BDT')) return str
    if (str.startsWith('$')) return `BDT ${str.slice(1).trim()}`
    return str
  }

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      if (!token) return
      setLoading(true)
      setError('')
      try {
        // Fetch my profile for current salary and details
        const meRes = await fetch(`${API_BASE}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!meRes.ok) {
          const text = await meRes.text()
          throw new Error(text || `HTTP ${meRes.status}`)
        }
        const meData = await meRes.json()
        if (!cancelled) setProfile(meData?.user || null)

        // Fetch my payment history
        const url = new URL(`${API_BASE}/api/payments/me`)
        if (month) url.searchParams.set('month', month)
        const payRes = await fetch(url.toString(), {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!payRes.ok) {
          const text = await payRes.text()
          throw new Error(text || `HTTP ${payRes.status}`)
        }
        const payData = await payRes.json()
        const items = Array.isArray(payData?.payments) ? payData.payments : []
        if (!cancelled) setPayments(items)
      } catch (err) {
        console.error('Load my salary error:', err)
        if (!cancelled) setError('Failed to load data')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [token, month])

  const filtered = useMemo(() => {
    return payments.filter(p => (!month || p.month === month))
  }, [payments, month])

  const monthlyTotalPaid = useMemo(() => {
    return filtered
      .filter(p => p.status === 'Paid')
      .reduce((sum, p) => sum + (Number(p.salary) || 0) + (Number(p.allowance) || 0) - (Number(p.deduction) || 0), 0)
  }, [filtered])

  return (
    <UserLayout>
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">My Salary</h1>

      {/* Profile summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="bg-white border rounded-xl p-6 shadow-sm">
          <p className="text-sm text-gray-600">Name</p>
          <h2 className="text-xl font-bold mt-2">{profile?.name || '—'}</h2>
        </div>
        <div className="bg-white border rounded-xl p-6 shadow-sm">
          <p className="text-sm text-gray-600">Email</p>
          <h2 className="text-xl font-bold mt-2">{profile?.email || '—'}</h2>
        </div>
        <div className="bg-white border rounded-xl p-6 shadow-sm">
          <p className="text-sm text-gray-600">Current Salary</p>
          <h2 className="text-xl font-bold mt-2">{normalizeSalaryText(profile?.salary)}</h2>
        </div>
      </div>

      {/* Filters and summary */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-4">
        <div className="flex items-end gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
            <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="px-3 py-2 border rounded-lg text-sm" placeholder="All months" />
          </div>
        </div>
        <div className="bg-white border rounded-xl p-4 shadow-sm">
          <p className="text-sm text-gray-600">Monthly Total (Paid)</p>
          <h2 className="text-lg font-bold mt-1">{formatBDT(monthlyTotalPaid)}</h2>
        </div>
      </div>

      {/* History table */}
      <div className="bg-white border rounded-2xl shadow-sm overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="text-gray-600">
            <tr>
              <th className="px-4 py-3 text-left">Month</th>
              <th className="px-4 py-3 text-left">Salary</th>
              <th className="px-4 py-3 text-left">Allowance</th>
              <th className="px-4 py-3 text-left">Deduction</th>
              <th className="px-4 py-3 text-left">Total</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Pay Date</th>
            </tr>
          </thead>
          <tbody className="text-gray-900">
            {loading && (
              <tr><td className="px-4 py-4 text-gray-500" colSpan={7}>Loading…</td></tr>
            )}
            {!loading && error && (
              <tr><td className="px-4 py-4 text-red-600" colSpan={7}>{error}</td></tr>
            )}
            {!loading && !error && filtered.map((p, i) => {
              const total = (Number(p.salary) || 0) + (Number(p.allowance) || 0) - (Number(p.deduction) || 0)
              const payLabel = (function(){
                const d = new Date(p.payDate)
                return p.payDate && !Number.isNaN(d.getTime()) ? d.toLocaleString() : (p.payDate || '—')
              })()
              return (
                <tr key={`${p.month}-${i}`} className="border-t">
                  <td className="px-4 py-4">{p.month || '—'}</td>
                  <td className="px-4 py-4">{formatBDT(Number(p.salary) || 0)}</td>
                  <td className="px-4 py-4">{formatBDT(Number(p.allowance) || 0)}</td>
                  <td className="px-4 py-4">{formatBDT(Number(p.deduction) || 0)}</td>
                  <td className="px-4 py-4">{formatBDT(total)}</td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium border ${
                      p.status === 'Paid'
                        ? 'bg-green-50 text-green-700 border-green-200'
                        : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                    }`}>{p.status}</span>
                  </td>
                  <td className="px-4 py-4 text-gray-700">{payLabel}</td>
                </tr>
              )
            })}
            {!loading && !error && filtered.length === 0 && (
              <tr>
                <td className="px-4 py-4 text-gray-500" colSpan={7}>No records found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </UserLayout>
  )
}