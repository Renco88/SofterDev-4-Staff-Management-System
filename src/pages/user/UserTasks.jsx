import UserLayout from '../../layouts/UserLayout.jsx'
import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'

const IMGBB_KEY = '1c0fb80377fba0fb63a63956ab7cf922'

async function uploadToImgbb(file) {
  const form = new FormData()
  const base64 = await new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result).split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
  form.append('image', base64)
  const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_KEY}`, { method: 'POST', body: form })
  const json = await res.json()
  if (!json?.success) throw new Error('Image upload failed')
  return json?.data?.display_url || json?.data?.url
}

export default function UserTasks() {
  const { token } = useAuth()
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')

  const loadTasks = async () => {
    if (!token) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${API_BASE}/api/tasks/me`, { headers: { Authorization: `Bearer ${token}` } })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.message || 'Failed to load tasks')
      setTasks(Array.isArray(json?.tasks) ? json.tasks : [])
    } catch (err) {
      setError(err.message || 'Error loading tasks')
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { loadTasks() }, [token])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return tasks.filter(t => (!q || t.title.toLowerCase().includes(q)))
  }, [tasks, query])

  const markDone = async (taskId, file, note) => {
    try {
      let userImageUrl = ''
      if (file) userImageUrl = await uploadToImgbb(file)
      const res = await fetch(`${API_BASE}/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: 'Done', userImageUrl, userNote: note || '' })
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.message || 'Failed to update task')
      await loadTasks()
      alert('Task marked as done')
    } catch (err) {
      alert(err.message || 'Error updating task')
    }
  }

  return (
    <UserLayout>
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">User · Tasks</h1>
      <p className="text-sm text-gray-500 mb-6">Your assigned tasks and status.</p>
      <div className="bg-white border rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="relative w-full sm:max-w-xs">
            <input
              type="text"
              placeholder="Search by title"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:outline-none"
            />
            <svg className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 21l-4.35-4.35"/><circle cx="10" cy="10" r="7"/></svg>
          </div>
        </div>

        {loading && <div className="text-sm text-gray-500">Loading tasks...</div>}
        {error && <div className="text-sm text-red-600">{error}</div>}
        {!loading && filtered.length === 0 && (
          <div className="text-sm text-gray-500">No tasks found.</div>
        )}
        {filtered.length > 0 && (
          <div className="space-y-4">
            {filtered.map(t => (
              <div key={t.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Assigned by Admin</p>
                    <h3 className="text-base font-semibold text-gray-800">{t.title}</h3>
                  </div>
                  <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${t.status === 'Done' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{t.status}</span>
                </div>
                {t.description && <p className="text-sm text-gray-600 mt-1">{t.description}</p>}
                <div className="flex items-center gap-4 mt-3">
                  {t.adminImageUrl && <a href={t.adminImageUrl} target="_blank" rel="noreferrer" className="text-indigo-600 text-sm">Admin image</a>}
                  {t.userImageUrl && <a href={t.userImageUrl} target="_blank" rel="noreferrer" className="text-indigo-600 text-sm">Your image</a>}
                </div>
                {t.status !== 'Done' && (
                  <div className="mt-3 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-2 items-center">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <input type="file" accept="image/*" id={`file-${t.id}`} className="text-sm" />
                      <input
                        type="text"
                        id={`note-${t.id}`}
                        placeholder="Write a completion note"
                        className="flex-1 px-3 py-2 border rounded-md text-sm"
                      />
                    </div>
                    <button
                      onClick={() => {
                        const fileInput = document.getElementById(`file-${t.id}`)
                        const noteInput = document.getElementById(`note-${t.id}`)
                        const file = fileInput?.files?.[0] || null
                        const note = noteInput?.value || ''
                        markDone(t.id, file, note)
                        if (noteInput) noteInput.value = ''
                        if (fileInput) fileInput.value = ''
                      }}
                      className="px-3 py-2 rounded-md bg-green-600 hover:bg-green-700 text-white text-sm"
                    >Mark Done</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </UserLayout>
  )
}