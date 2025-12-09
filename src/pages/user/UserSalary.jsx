import UserLayout from '../../layouts/UserLayout.jsx'

const salaryHistory = [
  { date: 'Jan 1, 2022', amount: '$60,000', reason: 'Initial Salary' },
  { date: 'Jul 1, 2022', amount: '$63,000', reason: 'Performance Review' },
  { date: 'Jan 1, 2023', amount: '$65,000', reason: 'Annual Increase' },
  { date: 'Jul 1, 2023', amount: '$68,000', reason: 'Promotion' },
  { date: 'Jan 1, 2024', amount: '$70,000', reason: 'Annual Increase' },
]

export default function UserSalary() {
  return (
    <UserLayout>
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">My Salary History</h1>

      <div className="bg-white border rounded-2xl shadow-sm overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="text-gray-600">
            <tr>
              <th className="px-4 py-3 text-left">Effective Date</th>
              <th className="px-4 py-3 text-left">Salary Amount</th>
              <th className="px-4 py-3 text-left">Adjustment Reason</th>
            </tr>
          </thead>
          <tbody className="text-gray-900">
            {salaryHistory.map((row, idx) => (
              <tr key={idx} className="border-t">
                <td className="px-4 py-3">{row.date}</td>
                <td className="px-4 py-3">{row.amount}</td>
                <td className="px-4 py-3">
                  <span className="text-indigo-600 hover:text-indigo-700 cursor-default">{row.reason}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </UserLayout>
  )
}