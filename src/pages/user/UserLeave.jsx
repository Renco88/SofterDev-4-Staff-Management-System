import { useState } from 'react'
import UserLayout from '../../layouts/UserLayout.jsx'

const leaveHistory = [
  { type: 'Vacation', start: '2024-07-15', end: '2024-07-20', status: 'Approved', days: 5, reason: 'Family trip' },
  { type: 'Sick Leave', start: '2024-06-10', end: '2024-06-12', status: 'Approved', days: 2, reason: 'Flu' },
  { type: 'Personal Leave', start: '2024-05-01', end: '2024-05-01', status: 'Approved', days: 1, reason: 'Personal appoint...' },
  { type: 'Vacation', start: '2024-04-05', end: '2024-04-10', status: 'Approved', days: 5, reason: 'Spring break' },
  { type: 'Vacation', start: '2024-03-15', end: '2024-03-20', status: 'Rejected', days: 5, reason: 'Travel' },
]

const balance = [
  { label: 'Vacation', value: '10 days' },
  { label: 'Sick Leave', value: '5 days' },
  { label: 'Personal Leave', value: '2 days' },
]

const StatusBadge = ({ status }) => {
  const approved = status === 'Approved'
  const cls = approved ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${cls}`}>{status}</span>
  )
}

export default function UserLeave() {
  const [applyOpen, setApplyOpen] = useState(false)
  return (
    <UserLayout>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">My Leave History</h1>
        <button
          onClick={() => setApplyOpen(true)}
          className="hidden sm:inline-flex rounded-lg px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-800 border"
        >
          Apply for leave
        </button>
      </div>

      <div className="bg-white border rounded-2xl shadow-sm overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="text-gray-600">
            <tr>
              <th className="px-4 py-3 text-left">Leave Type</th>
              <th className="px-4 py-3 text-left">Start Date</th>
              <th className="px-4 py-3 text-left">End Date</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Days</th>
              <th className="px-4 py-3 text-left">Reason</th>
            </tr>
          </thead>
          <tbody className="text-gray-900">
            {leaveHistory.map((row, idx) => (
              <tr key={idx} className="border-t">
                <td className="px-4 py-3">{row.type}</td>
                <td className="px-4 py-3">{row.start}</td>
                <td className="px-4 py-3">{row.end}</td>
                <td className="px-4 py-3"><StatusBadge status={row.status} /></td>
                <td className="px-4 py-3">{row.days}</td>
                <td className="px-4 py-3">{row.reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-8">
        <h2 className="text-base font-semibold text-gray-800 mb-3">Leave Balance</h2>
        <div className="bg-white border rounded-2xl p-6 shadow-sm">
          <div className="space-y-3">
            {balance.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <span className="text-sm text-gray-700">{item.label}</span>
                <span className="text-sm text-gray-500">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {applyOpen && (
        <ApplyLeaveModal
          onCancel={() => setApplyOpen(false)}
          onSubmit={() => setApplyOpen(false)}
        />
      )}
    </UserLayout>
  )
}

function ApplyLeaveModal({ onCancel, onSubmit }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl border p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Apply for Leave</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Leave Type</label>
            <select className="w-full px-3 py-2 border rounded-lg text-sm">
              <option>Select Leave Type</option>
              <option>Vacation</option>
              <option>Sick Leave</option>
              <option>Personal Leave</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input type="date" className="w-full px-3 py-2 border rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input type="date" className="w-full px-3 py-2 border rounded-lg text-sm" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Leave</label>
            <textarea className="w-full px-3 py-2 border rounded-lg text-sm" rows="3" placeholder="Write reason" />
          </div>

          <div className="border-2 border-dashed rounded-xl p-6 text-center">
            <div className="font-semibold text-gray-800">Upload Supporting Documents</div>
            <div className="text-xs text-gray-500 mb-3">Drag and drop files here, or browse</div>
            <label htmlFor="leaveFiles" className="inline-flex items-center justify-center px-3 py-2 border rounded-lg text-sm bg-gray-100 hover:bg-gray-200 cursor-pointer">Browse Files</label>
            <input id="leaveFiles" type="file" multiple className="hidden" />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button onClick={onSubmit} className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm">Submit Application</button>
            <button onClick={onCancel} className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  )
}