import AdminLayout from '../../layouts/AdminLayout.jsx'

export default function AdminSettings() {
  return (
    <AdminLayout>
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">Admin · Settings</h1>
      <p className="text-sm text-gray-500 mb-6">Configure system preferences and roles.</p>
      <div className="bg-white border rounded-xl p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Theme</label>
            <select className="w-full px-3 py-2 border rounded-lg">
              <option>Light</option>
              <option>Dark</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Default Role</label>
            <select className="w-full px-3 py-2 border rounded-lg">
              <option>User</option>
              <option>Admin</option>
            </select>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}