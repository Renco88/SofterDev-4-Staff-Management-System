import UserLayout from '../../layouts/UserLayout.jsx'
import { useAuth } from '../../context/AuthContext.jsx'

const initialData = {
  fullName: 'Sophia Clark',
  email: 'dadaf@gg.yhj',
  phone: '446464646',
  address: 'dlka.ada kkau. ada',
  dob: '11.20.3320',
  gender: 'Female',
  employeeId: '12345',
}

export default function UserProfile() {
  const { user } = useAuth()
  const name = user?.name || initialData.fullName

  const avatarInitial = name?.[0]?.toUpperCase?.() || 'U'

  return (
    <UserLayout>
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">My profile</h1>

      {/* Header card */}
      <div className="bg-white border rounded-2xl p-6 shadow-sm mb-6 flex items-center gap-4">
        <div className="h-16 w-16 rounded-full bg-gradient-to-br from-indigo-200 to-pink-200 flex items-center justify-center text-xl font-bold text-gray-700">
          {avatarInitial}
        </div>
        <div>
          <div className="text-lg font-semibold text-gray-900">{name}</div>
          <div className="text-sm text-gray-500">Employee ID: {initialData.employeeId}</div>
        </div>
      </div>

      <div className="text-base font-semibold text-gray-800 mb-3">Personal information</div>
      <div className="bg-white border rounded-2xl p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full name</label>
            <input
              className="w-full px-3 py-2 border rounded-lg"
              defaultValue={name}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              className="w-full px-3 py-2 border rounded-lg"
              defaultValue={initialData.email}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone number</label>
            <input
              className="w-full px-3 py-2 border rounded-lg"
              defaultValue={initialData.phone}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <input
              className="w-full px-3 py-2 border rounded-lg"
              defaultValue={initialData.address}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date of birth</label>
            <input
              className="w-full px-3 py-2 border rounded-lg"
              defaultValue={initialData.dob}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
            <input
              className="w-full px-3 py-2 border rounded-lg"
              defaultValue={initialData.gender}
            />
          </div>
        </div>
      </div>
    </UserLayout>
  )
}