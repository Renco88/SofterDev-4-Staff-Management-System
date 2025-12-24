import AdminLayout from '../../layouts/AdminLayout.jsx'
import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'

const IMGBB_KEY = '1c0fb80377fba0fb63a63956ab7cf922'

async function uploadToImgbb(file) {
  const form = new FormData()
  // convert file to base64
  const base64 = await new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result).split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
  form.append('image', base64)
  const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_KEY}`, {
    method: 'POST',
    body: form,
  })
  const json = await res.json()
  if (!json?.success) throw new Error('Image upload failed')
  return json?.data?.display_url || json?.data?.url
}

export default function AdminTasks() {
  const { token } = useAuth()
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'
  const [employees, setEmployees] = useState([])
  const [loadingEmployees, setLoadingEmployees] = useState(false)
  const [errorEmployees, setErrorEmployees] = useState('')

  const [selectedUserId, setSelectedUserId] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [adminImageUrl, setAdminImageUrl] = useState('')
  const [imgUploading, setImgUploading] = useState(false)

  const [tasks, setTasks] = useState([])
  const [loadingTasks, setLoadingTasks] = useState(false)
  const [errorTasks, setErrorTasks] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [query, setQuery] = useState('')

  // Load employees
  useEffect(() => {
    const loadEmployees = async () => {
      if (!token) return
      setLoadingEmployees(true)
      setErrorEmployees('')
      try {
        const res = await fetch(`${API_BASE}/api/users?role=user`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const json = await res.json()
        if (!res.ok) throw new Error(json?.message || 'Failed to load employees')
        setEmployees(Array.isArray(json?.users) ? json.users : [])
      } catch (err) {
        setErrorEmployees(err.message || 'Error loading employees')
      } finally {
        setLoadingEmployees(false)
      }
    }
    loadEmployees()
  }, [token])

  // Load tasks
  const refreshTasks = async () => {
    if (!token) return
    setLoadingTasks(true)
    setErrorTasks('')
    try {
      const url = new URL(`${API_BASE}/api/tasks`)
      if (statusFilter) url.searchParams.set('status', statusFilter)
      const res = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${token}` },
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.message || 'Failed to load tasks')
      setTasks(Array.isArray(json?.tasks) ? json.tasks : [])
    } catch (err) {
      setErrorTasks(err.message || 'Error loading tasks')
    } finally {
      setLoadingTasks(false)
    }
  }
  useEffect(() => { refreshTasks() }, [token, statusFilter])

  const filteredTasks = useMemo(() => {
    const q = query.trim().toLowerCase()
    return tasks.filter(t => (
      (!q || t.title.toLowerCase().includes(q) || t.email.toLowerCase().includes(q) || t.name.toLowerCase().includes(q))
    ))
  }, [tasks, query])

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      setImgUploading(true)
      const url = await uploadToImgbb(file)
      setAdminImageUrl(url)
    } catch (err) {
      alert(err.message || 'Failed to upload image')
    } finally {
      setImgUploading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedUserId) return alert('Please select an employee')
    if (!title.trim()) return alert('Please enter a task title')
    try {
      const res = await fetch(`${API_BASE}/api/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: selectedUserId,
          title: title.trim(),
          description: description.trim(),
          adminImageUrl,
        })
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.message || 'Failed to create task')
      setTitle('')
      setDescription('')
      setAdminImageUrl('')
      refreshTasks()
      alert('Task assigned successfully')
    } catch (err) {
      alert(err.message || 'Error creating task')
    }
  }

  return (
    <AdminLayout>
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">Task Assign</h1>

      {/* Assign form */}
      <div className="bg-white border rounded-2xl p-6 shadow-sm mb-6">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm"
            >
              <option value="">Select employee</option>
              {loadingEmployees && <option>Loading...</option>}
              {employees.map(u => (
                <option key={u.id} value={u.id}>{u.name} — {u.email}</option>
              ))}
            </select>
            {errorEmployees && <p className="text-xs text-red-600 mt-1">{errorEmployees}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Task Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter task title"
              className="w-full px-3 py-2 border rounded-lg text-sm"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Details or instructions"
              className="w-full px-3 py-2 border rounded-lg text-sm h-24"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Attach Image (optional)</label>
            <input type="file" accept="image/*" onChange={handleImageChange} />
            {imgUploading && <p className="text-xs text-gray-500 mt-1">Uploading...</p>}
            {adminImageUrl && (
              <img src={adminImageUrl} alt="attachment" className="mt-2 h-20 rounded-md border" />
            )}
          </div>
          <div className="flex items-center gap-2 md:col-span-2">
            <button type="submit" className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm">Assign Task</button>
            <button type="button" onClick={() => { setTitle(''); setDescription(''); setAdminImageUrl('') }} className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm">Reset</button>
          </div>
        </form>
      </div>

      {/* List tasks */}
      <div className="bg-white border rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div className="relative w-full sm:max-w-xs">
            <input
              type="text"
              placeholder="Search by title/name/email"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:outline-none"
            />
            <svg className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 21l-4.35-4.35"/><circle cx="10" cy="10" r="7"/></svg>
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 border rounded-lg text-sm w-full sm:w-auto">
            <option value="">All statuses</option>
            <option value="Pending">Pending</option>
            <option value="Done">Done</option>
          </select>
        </div>
        {loadingTasks && <div className="text-sm text-gray-500">Loading tasks...</div>}
        {errorTasks && <div className="text-sm text-red-600">{errorTasks}</div>}
        {!loadingTasks && filteredTasks.length === 0 && (
          <div className="text-sm text-gray-500">No tasks found.</div>
        )}
        {filteredTasks.length > 0 && (
          <>
            {/* Mobile Cards */}
            <div className="block md:hidden space-y-3">
              {filteredTasks.map(t => (
                <div key={`card-${t.id}`} className="bg-white border rounded-xl p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0">
                      <p className="text-sm text-gray-600 truncate">{t.name} — {t.email}</p>
                      <h3 className="text-base font-semibold text-gray-900 truncate">{t.title}</h3>
                    </div>
                    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${t.status === 'Done' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{t.status}</span>
                  </div>
                  <div className="mt-2 flex items-center gap-4 text-sm">
                    {t.adminImageUrl ? <a href={t.adminImageUrl} target="_blank" rel="noreferrer" className="text-indigo-600">Admin image</a> : <span className="text-gray-500">Admin image: —</span>}
                    {t.userImageUrl ? <a href={t.userImageUrl} target="_blank" rel="noreferrer" className="text-indigo-600">User image</a> : <span className="text-gray-500">User image: —</span>}
                  </div>
                  <div className="mt-2 text-sm text-gray-700">
                    <span className="text-gray-500">User Note:</span> <span className="break-words">{t.userNote || '—'}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Table (Desktop) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full text-sm">
              <thead className="text-gray-600">
                <tr>
                  <th className="px-4 py-3 text-left">Employee</th>
                  <th className="px-4 py-3 text-left">Title</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Admin Image</th>
                  <th className="px-4 py-3 text-left">User Image</th>
                  <th className="px-4 py-3 text-left">User Note</th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.map(t => (
                  <tr key={t.id} className="border-t">
                    <td className="px-4 py-3">{t.name} — {t.email}</td>
                    <td className="px-4 py-3">{t.title}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${t.status === 'Done' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{t.status}</span>
                    </td>
                    <td className="px-4 py-3">{t.adminImageUrl ? <a href={t.adminImageUrl} target="_blank" rel="noreferrer" className="text-indigo-600">View</a> : '—'}</td>
                    <td className="px-4 py-3">{t.userImageUrl ? <a href={t.userImageUrl} target="_blank" rel="noreferrer" className="text-indigo-600">View</a> : '—'}</td>
                    <td className="px-4 py-3 max-w-[280px] truncate" title={t.userNote || ''}>{t.userNote || '—'}</td>
                  </tr>
                ))}
              </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  )
}