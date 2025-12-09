import AdminLayout from '../layouts/AdminLayout.jsx'

export default function AdminDashboard() {
  return (
    <AdminLayout>
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Dashboard</h1>
      <p className="text-sm text-gray-500 mb-6">Overview of key metrics and leave details</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        <div className="bg-gray-100 rounded-xl p-6 shadow-sm">
          <p className="text-sm text-gray-600">Total Employees</p>
          <h2 className="text-xl font-bold text-gray-800 mt-2">150</h2>
        </div>
        <div className="bg-gray-100 rounded-xl p-6 shadow-sm">
          <p className="text-sm text-gray-600">Total Departments</p>
          <h2 className="text-xl font-bold text-gray-800 mt-2">10</h2>
        </div>
        <div className="bg-gray-100 rounded-xl p-6 shadow-sm">
          <p className="text-sm text-gray-600">Monthly Pay</p>
          <h2 className="text-xl font-bold text-gray-800 mt-2">$750,000</h2>
        </div>
      </div>

      <h2 className="text-lg font-semibold text-gray-800 mb-4">Leave Details</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="border rounded-xl p-5 shadow-sm bg-white">
          <p className="text-sm text-gray-600">Applied</p>
          <h3 className="text-xl font-bold mt-2">20</h3>
        </div>
        <div className="border rounded-xl p-5 shadow-sm bg-white">
          <p className="text-sm text-gray-600">Approved</p>
          <h3 className="text-xl font-bold mt-2">15</h3>
        </div>
        <div className="border rounded-xl p-5 shadow-sm bg-white">
          <p className="text-sm text-gray-600">Pending</p>
          <h3 className="text-xl font-bold mt-2">3</h3>
        </div>
        <div className="border rounded-xl p-5 shadow-sm bg-white">
          <p className="text-sm text-gray-600">Rejected</p>
          <h3 className="text-xl font-bold mt-2">2</h3>
        </div>
      </div>
    </AdminLayout>
  )
}