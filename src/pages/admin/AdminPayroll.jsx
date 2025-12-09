import AdminLayout from '../../layouts/AdminLayout.jsx'

export default function AdminPayroll() {
  return (
    <AdminLayout>
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">Admin · Payroll</h1>
      <p className="text-sm text-gray-500 mb-6">Process payroll and view summaries.</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border rounded-xl p-6 shadow-sm">
          <p className="text-sm text-gray-600">Monthly Pay</p>
          <h2 className="text-xl font-bold mt-2">$750,000</h2>
        </div>
        <div className="bg-white border rounded-xl p-6 shadow-sm">
          <p className="text-sm text-gray-600">Pending Approvals</p>
          <h2 className="text-xl font-bold mt-2">4</h2>
        </div>
        <div className="bg-white border rounded-xl p-6 shadow-sm">
          <p className="text-sm text-gray-600">Last Run</p>
          <h2 className="text-xl font-bold mt-2">Nov 1</h2>
        </div>
      </div>
    </AdminLayout>
  )
}