import UserLayout from '../../layouts/UserLayout.jsx'

export default function UserSettings() {
  return (
    <UserLayout>
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">User · Settings</h1>
      <p className="text-sm text-gray-500 mb-6">Update your preferences.</p>
      <div className="bg-white border rounded-xl p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
            <select className="w-full px-3 py-2 border rounded-lg">
              <option>English</option>
              <option>বাংলা</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notifications</label>
            <select className="w-full px-3 py-2 border rounded-lg">
              <option>Enabled</option>
              <option>Disabled</option>
            </select>
          </div>
        </div>
      </div>
    </UserLayout>
  )
}