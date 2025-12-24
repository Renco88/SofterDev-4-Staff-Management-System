import { useEffect, useState } from 'react'
import UserLayout from '../../layouts/UserLayout.jsx'
import { useAuth } from '../../context/AuthContext.jsx'

export default function UserProfile() {
  const { token } = useAuth()
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [saveSuccess, setSaveSuccess] = useState('')

  // Avatar upload state
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [avatarError, setAvatarError] = useState('')
  const [avatarSuccess, setAvatarSuccess] = useState('')

  // Payment method form state
  const [method, setMethod] = useState('')
  const [bkashNumber, setBkashNumber] = useState('')
  const [nagadNumber, setNagadNumber] = useState('')
  const [bankName, setBankName] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [branch, setBranch] = useState('')

  useEffect(() => {
    let cancelled = false
    const loadProfile = async () => {
      if (!token) return
      setLoading(true)
      setError('')
      try {
        const res = await fetch(`${API_BASE}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data?.message || 'Failed to load profile')
        if (!cancelled) {
          setProfile(data.user || null)
          // Prefill method selection if exists
          const pm = data?.user?.paymentMethod
          if (pm?.method && !method) setMethod(pm.method)
        }
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load profile')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    loadProfile()
    return () => { cancelled = true }
  }, [token])

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

  const onChangeAvatar = async (file) => {
    if (!file || !token) return
    setAvatarError('')
    setAvatarSuccess('')
    try {
      setAvatarUploading(true)
      const url = await uploadToImgbb(file)
      const res = await fetch(`${API_BASE}/api/users/me/avatar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ avatarUrl: url }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || 'Failed to update avatar')
      setProfile(data?.user || profile)
      setAvatarSuccess('Profile photo updated successfully')
    } catch (err) {
      setAvatarError(err.message || 'Failed to update avatar')
    } finally {
      setAvatarUploading(false)
    }
  }

  const onRemoveAvatar = async () => {
    if (!token) return
    setAvatarError('')
    setAvatarSuccess('')
    try {
      setAvatarUploading(true)
      const res = await fetch(`${API_BASE}/api/users/me/avatar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ avatarUrl: '' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || 'Failed to remove avatar')
      setProfile(data?.user || profile)
      setAvatarSuccess('Profile photo removed')
    } catch (err) {
      setAvatarError(err.message || 'Failed to remove avatar')
    } finally {
      setAvatarUploading(false)
    }
  }

  const onSubmitPayment = async (e) => {
    e.preventDefault()
    setSaveError('')
    setSaveSuccess('')
    if (!token) return
    if (!method) {
      setSaveError('Please select a payment method')
      return
    }
    try {
      setSaving(true)
      const payload = { method }
      if (method === 'bkash') payload.bkashNumber = bkashNumber
      if (method === 'nagad') payload.nagadNumber = nagadNumber
      if (method === 'bank') {
        payload.bankName = bankName
        payload.accountNumber = accountNumber
        if (branch) payload.branch = branch
      }
      const res = await fetch(`${API_BASE}/api/users/me/payment-method`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || 'Failed to save payment method')
      setSaveSuccess('Payment method saved successfully. Editing has been locked.')
      setProfile(data?.user || profile)
    } catch (err) {
      setSaveError(err.message || 'Failed to save payment method')
    } finally {
      setSaving(false)
    }
  }

  const name = profile?.name || '—'
  const avatarInitial = name?.[0]?.toUpperCase?.() || 'U'
  const userId = profile?.id || profile?._id || '—'

  return (
    <UserLayout>
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">My Profile</h1>

      {/* Header card */}
      <div className="bg-white border rounded-2xl p-6 shadow-sm mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="h-16 w-16 rounded-full overflow-hidden border shrink-0">
            {profile?.avatarUrl ? (
              <img src={profile.avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full rounded-full bg-gradient-to-br from-indigo-200 to-pink-200 flex items-center justify-center text-xl font-bold text-gray-700">
                {avatarInitial}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-lg font-semibold text-gray-900 truncate">{name}</div>
            <div className="text-sm text-gray-500 break-all">Employee ID: {userId}</div>
          </div>
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 sm:ml-auto w-full sm:w-auto">
            <label className="inline-flex items-center justify-center px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-medium cursor-pointer border w-full sm:w-auto">
              {avatarUploading ? 'Uploading…' : 'Change Photo'}
              <input type="file" accept="image/*" className="hidden" onChange={(e) => onChangeAvatar(e.target.files?.[0])} disabled={avatarUploading} />
            </label>
            {profile?.avatarUrl && (
              <button onClick={onRemoveAvatar} disabled={avatarUploading} className="inline-flex items-center justify-center px-3 py-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 text-sm font-medium border w-full sm:w-auto">
                Remove
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal info */}
        <div>
          <div className="text-base font-semibold text-gray-800 mb-3">Personal Information</div>
          <div className="bg-white border rounded-2xl p-6 shadow-sm">
            {loading && <div className="text-sm text-gray-500">Loading…</div>}
            {!loading && error && <div className="text-sm text-red-600">{error}</div>}
            {!loading && !error && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input className="w-full px-3 py-2 border rounded-lg" value={profile?.name || ''} readOnly />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input className="w-full px-3 py-2 border rounded-lg" value={profile?.email || ''} readOnly />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <input className="w-full px-3 py-2 border rounded-lg" value={profile?.role || ''} readOnly />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  <input className="w-full px-3 py-2 border rounded-lg" value={profile?.department || ''} readOnly />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Salary</label>
                  <input className="w-full px-3 py-2 border rounded-lg" value={profile?.salary || ''} readOnly />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Leave</label>
                  <input className="w-full px-3 py-2 border rounded-lg" value={profile?.leave || ''} readOnly />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Salary payment method */}
        <div>
          <div className="text-base font-semibold text-gray-800 mb-3">Salary Payment Method</div>
          <div className="bg-white border rounded-2xl p-6 shadow-sm">
            {avatarError && <div className="mb-3 text-sm text-red-600">{avatarError}</div>}
            {avatarSuccess && <div className="mb-3 text-sm text-green-700">{avatarSuccess}</div>}
            {profile?.paymentMethod?.method ? (
              <div>
                <div className="mb-3 text-sm text-gray-600">A payment method has been saved and locked.</div>
                {profile.paymentMethod.method === 'bkash' && (
                  <div className="space-y-2">
                    <div className="text-sm text-gray-700">Method: bKash</div>
                    <div className="text-sm text-gray-700">bKash Number: {profile.paymentMethod.bkashNumber || '—'}</div>
                  </div>
                )}
                {profile.paymentMethod.method === 'nagad' && (
                  <div className="space-y-2">
                    <div className="text-sm text-gray-700">Method: Nagad</div>
                    <div className="text-sm text-gray-700">Nagad Number: {profile.paymentMethod.nagadNumber || '—'}</div>
                  </div>
                )}
                {profile.paymentMethod.method === 'bank' && (
                  <div className="space-y-2">
                    <div className="text-sm text-gray-700">Method: Bank Transfer</div>
                    <div className="text-sm text-gray-700">Bank Name: {profile.paymentMethod.bankName || '—'}</div>
                    <div className="text-sm text-gray-700">Account Number: {profile.paymentMethod.accountNumber || '—'}</div>
                    <div className="text-sm text-gray-700">Branch: {profile.paymentMethod.branch || '—'}</div>
                  </div>
                )}
                <div className="mt-4 inline-flex items-center px-3 py-1 rounded-md bg-gray-100 text-gray-700 text-xs font-medium border border-gray-200">Editing Locked</div>
              </div>
            ) : (
              <form onSubmit={onSubmitPayment} className="space-y-4">
                <div className="flex items-center gap-4">
                  <label className="inline-flex items-center gap-2 text-sm">
                    <input type="radio" name="method" value="bkash" checked={method === 'bkash'} onChange={() => setMethod('bkash')} />
                    bKash
                  </label>
                  <label className="inline-flex items-center gap-2 text-sm">
                    <input type="radio" name="method" value="nagad" checked={method === 'nagad'} onChange={() => setMethod('nagad')} />
                    Nagad
                  </label>
                  <label className="inline-flex items-center gap-2 text-sm">
                    <input type="radio" name="method" value="bank" checked={method === 'bank'} onChange={() => setMethod('bank')} />
                    Bank
                  </label>
                </div>

                {method === 'bkash' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">bKash Number</label>
                    <input className="w-full px-3 py-2 border rounded-lg" placeholder="01XXXXXXXXX" value={bkashNumber} onChange={e => setBkashNumber(e.target.value)} />
                  </div>
                )}
                {method === 'nagad' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nagad Number</label>
                    <input className="w-full px-3 py-2 border rounded-lg" placeholder="01XXXXXXXXX" value={nagadNumber} onChange={e => setNagadNumber(e.target.value)} />
                  </div>
                )}
                {method === 'bank' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                      <input className="w-full px-3 py-2 border rounded-lg" value={bankName} onChange={e => setBankName(e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                      <input className="w-full px-3 py-2 border rounded-lg" value={accountNumber} onChange={e => setAccountNumber(e.target.value)} />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Branch (optional)</label>
                      <input className="w-full px-3 py-2 border rounded-lg" value={branch} onChange={e => setBranch(e.target.value)} />
                    </div>
                  </div>
                )}

                {saveError && <div className="text-sm text-red-600">{saveError}</div>}
                {saveSuccess && <div className="text-sm text-green-700">{saveSuccess}</div>}

                <button type="submit" disabled={saving} className="inline-flex items-center px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium disabled:opacity-50">
                  {saving ? 'Saving…' : 'Save Payment Method'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </UserLayout>
  )
}