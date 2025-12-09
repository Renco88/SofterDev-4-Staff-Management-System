import AdminLayout from '../../layouts/AdminLayout.jsx'

export default function AdminOverview() {
  return (
    <AdminLayout>
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">Admin · Overview</h1>
      <p className="text-sm text-gray-500 mb-6">High-level metrics and recent activity.</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border rounded-xl p-6 shadow-sm">
          <p className="text-sm text-gray-600">Employees</p>
          <h2 className="text-xl font-bold mt-2">150</h2>
        </div>
        <div className="bg-white border rounded-xl p-6 shadow-sm">
          <p className="text-sm text-gray-600">Departments</p>
          <h2 className="text-xl font-bold mt-2">10</h2>
        </div>
        <div className="bg-white border rounded-xl p-6 shadow-sm">
          <p className="text-sm text-gray-600">Monthly Pay</p>
          <h2 className="text-xl font-bold mt-2">$750,000</h2>
        </div>
      </div>
    </AdminLayout>
  )
}