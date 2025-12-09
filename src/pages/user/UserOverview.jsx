import UserLayout from '../../layouts/UserLayout.jsx'

export default function UserOverview() {
  return (
    <UserLayout>
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">User · Overview</h1>
      <p className="text-sm text-gray-500 mb-6">A quick summary of your activity.</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-100 rounded-xl p-6 shadow-sm">
          <p className="text-sm text-gray-600">Pending Tasks</p>
          <h2 className="text-xl font-bold text-gray-800 mt-2">5</h2>
        </div>
        <div className="bg-gray-100 rounded-xl p-6 shadow-sm">
          <p className="text-sm text-gray-600">Leaves Left</p>
          <h2 className="text-xl font-bold text-gray-800 mt-2">12</h2>
        </div>
        <div className="bg-gray-100 rounded-xl p-6 shadow-sm">
          <p className="text-sm text-gray-600">Attendance</p>
          <h2 className="text-xl font-bold text-gray-800 mt-2">96%</h2>
        </div>
      </div>
    </UserLayout>
  )
}