import UserLayout from '../../layouts/UserLayout.jsx'

export default function UserTasks() {
  return (
    <UserLayout>
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">User · Tasks</h1>
      <p className="text-sm text-gray-500 mb-6">Your assigned tasks and status.</p>
      <div className="bg-white border rounded-xl p-6 shadow-sm">
        <div className="text-sm text-gray-500">Task list/table can be added here later.</div>
      </div>
    </UserLayout>
  )
}