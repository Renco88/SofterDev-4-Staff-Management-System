import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import AdminLayout from '../../layouts/AdminLayout.jsx'

export default function AdminOverview() {
  const { token } = useAuth()
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'
  const [employeesCount, setEmployeesCount] = useState(0)
  const [departmentsCount, setDepartmentsCount] = useState(0)
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const currentMonth = useMemo(() => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  }, [])

  const formatBDT = (n) => `BDT ${Number(n || 0).toLocaleString('en-US')}`

  const monthlyPay = useMemo(() => {
    return payments
      .filter(p => p.status === 'Paid' && p.month === currentMonth)
      .reduce((sum, p) => sum + (Number(p.salary) || 0) + (Number(p.allowance) || 0) - (Number(p.deduction) || 0), 0)
  }, [payments, currentMonth])

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      if (!token) return
      setLoading(true)
      setError('')
      try {
        const [empRes, depRes, payRes] = await Promise.all([
          fetch(`${API_BASE}/api/users?role=user`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_BASE}/api/departments`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_BASE}/api/payments?month=${currentMonth}`, { headers: { Authorization: `Bearer ${token}` } }),
        ])

        if (!empRes.ok || !depRes.ok || !payRes.ok) {
          const errs = [empRes, depRes, payRes].filter(r => !r.ok).map(r => r.status).join(', ')
          throw new Error(`HTTP ${errs}`)
        }

        const empData = await empRes.json()
        const depData = await depRes.json()
        const payData = await payRes.json()

        if (!cancelled) {
          setEmployeesCount(Array.isArray(empData?.users) ? empData.users.length : 0)
          setDepartmentsCount(Array.isArray(depData?.departments) ? depData.departments.length : 0)
          setPayments(Array.isArray(payData?.payments) ? payData.payments : [])
        }
      } catch (err) {
        console.error('Load overview error:', err)
        if (!cancelled) setError('Failed to load overview')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [token, currentMonth])

  return (
    <AdminLayout>
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">Admin · Overview</h1>
      <p className="text-sm text-gray-500 mb-6">High-level metrics and recent activity.</p>

      {loading && (
        <div className="mb-4 px-4 py-3 rounded-md bg-blue-50 border border-blue-200 text-blue-700 text-sm">Loading overview…</div>
      )}
      {error && (
        <div className="mb-4 px-4 py-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border rounded-xl p-6 shadow-sm">
          <p className="text-sm text-gray-600">Employees</p>
          <h2 className="text-xl font-bold mt-2">{employeesCount}</h2>
        </div>
        <div className="bg-white border rounded-xl p-6 shadow-sm">
          <p className="text-sm text-gray-600">Departments</p>
          <h2 className="text-xl font-bold mt-2">{departmentsCount}</h2>
        </div>
        <div className="bg-white border rounded-xl p-6 shadow-sm">
          <p className="text-sm text-gray-600">Monthly Pay</p>
          <h2 className="text-xl font-bold mt-2">{formatBDT(monthlyPay)}</h2>
        </div>
      </div>
    </AdminLayout>
  )
}