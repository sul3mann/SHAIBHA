import { useEffect, useMemo, useState } from 'react'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Modal } from '../components/ui/Modal'
import { useLanguage } from '../context/LanguageContext'
import { canManageUsers, createUser, deleteUser, getCurrentSessionUser, getPendingUsers, loadUsers, updateUser } from '../services/authService'
import type { AuthUser, UserRole, AccountStatus } from '../types/auth'

function formatDate(value?: string) {
  if (!value) return '—'
  return new Date(value).toLocaleString()
}

export default function UserManagementPage() {
  const { isUrdu } = useLanguage()
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null)
  const [users, setUsers] = useState<AuthUser[]>([])
  const [pendingUsers, setPendingUsers] = useState<AuthUser[]>([])
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [form, setForm] = useState({ fullName: '', username: '', email: '', password: '', role: 'Staff' as UserRole, status: 'Approved' as AccountStatus })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const loadState = () => {
    const sessionUser = getCurrentSessionUser()
    setCurrentUser(sessionUser)
    const nextUsers = loadUsers()
    setUsers(nextUsers)
    setPendingUsers(getPendingUsers())
  }

  useEffect(() => {
    loadState()
  }, [])

  const selectedUser = useMemo(() => users.find((user) => user.id === selectedUserId) ?? null, [selectedUserId, users])

  const updateSelectedUser = (changes: Partial<AuthUser>) => {
    if (!selectedUser) return
    updateUser(selectedUser.id, changes)
    setUsers(loadUsers())
    setPendingUsers(getPendingUsers())
  }

  const handleCreateUser = (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    setSuccess('')
    try {
      const user = createUser({ fullName: form.fullName, username: form.username, email: form.email, password: form.password, confirmPassword: form.password }, form.role, form.status)
      setUsers(loadUsers())
      setPendingUsers(getPendingUsers())
      setSuccess(isUrdu ? 'صارف بنایا گیا۔' : `User created: ${user.username}`)
      setForm({ fullName: '', username: '', email: '', password: '', role: 'Staff', status: 'Approved' })
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unable to create user')
    }
  }

  const handleApprove = (userId: string) => {
    updateUser(userId, { status: 'Approved' })
    setUsers(loadUsers())
    setPendingUsers(getPendingUsers())
    setSuccess(isUrdu ? 'اکاؤنٹ منظور ہو گیا۔' : 'Account approved')
  }

  const handleReject = (userId: string) => {
    updateUser(userId, { status: 'Rejected' })
    setUsers(loadUsers())
    setPendingUsers(getPendingUsers())
    setSuccess(isUrdu ? 'اکاؤنٹ مسترد کر دیا گیا۔' : 'Account rejected')
  }

  const handleDisable = (userId: string) => {
    updateUser(userId, { status: 'Disabled' })
    setUsers(loadUsers())
    setPendingUsers(getPendingUsers())
    setSuccess(isUrdu ? 'اکاؤنٹ غیر فعال کر دیا گیا۔' : 'Account disabled')
  }

  const handleEnable = (userId: string) => {
    updateUser(userId, { status: 'Approved' })
    setUsers(loadUsers())
    setPendingUsers(getPendingUsers())
    setSuccess(isUrdu ? 'اکاؤنٹ فعال کر دیا گیا۔' : 'Account enabled')
  }

  const handleDelete = (userId: string) => {
    deleteUser(userId)
    setUsers(loadUsers())
    setPendingUsers(getPendingUsers())
    setSuccess(isUrdu ? 'صارف حذف کر دیا گیا۔' : 'User deleted')
  }

  if (!currentUser || !canManageUsers(currentUser)) {
    return <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-600">{isUrdu ? 'آپ کو یہ صفحہ دیکھنے کی اجازت نہیں۔' : 'You are not allowed to view this page.'}</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-slate-500">{isUrdu ? 'یوزر مینجمنٹ' : 'User Management'}</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-950">{isUrdu ? 'صارفوں کی نگرانی' : 'Manage users'}</h1>
      </div>

      {error ? <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</div> : null}
      {success ? <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{success}</div> : null}

      <Card className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-950">{isUrdu ? 'نیا صارف' : 'Create user'}</h2>
        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleCreateUser}>
          <Input label={isUrdu ? 'پورا نام' : 'Full Name'} value={form.fullName} onChange={(event) => setForm({ ...form, fullName: event.target.value })} />
          <Input label={isUrdu ? 'صارف نام' : 'Username'} value={form.username} onChange={(event) => setForm({ ...form, username: event.target.value })} />
          <Input label={isUrdu ? 'ای میل' : 'Email'} type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
          <Input label={isUrdu ? 'پاس ورڈ' : 'Password'} type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
          <label className="grid gap-2 text-sm text-slate-700">
            <span>{isUrdu ? 'کردار' : 'Role'}</span>
            <select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value as UserRole })} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900">
              <option value="Super Admin">{isUrdu ? 'سپر ایڈمن' : 'Super Admin'}</option>
              <option value="Admin">{isUrdu ? 'ایڈمن' : 'Admin'}</option>
              <option value="Staff">{isUrdu ? 'اسٹاف' : 'Staff'}</option>
            </select>
          </label>
          <label className="grid gap-2 text-sm text-slate-700">
            <span>{isUrdu ? 'حالت' : 'Status'}</span>
            <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as AccountStatus })} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900">
              <option value="Approved">{isUrdu ? 'منظور' : 'Approved'}</option>
              <option value="Pending">{isUrdu ? 'زیر التواء' : 'Pending'}</option>
              <option value="Disabled">{isUrdu ? 'غیر فعال' : 'Disabled'}</option>
            </select>
          </label>
          <div className="md:col-span-2">
            <Button type="submit">{isUrdu ? 'صارف بنائیں' : 'Create user'}</Button>
          </div>
        </form>
      </Card>

      <Card className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-950">{isUrdu ? 'زیر التواء اکاؤنٹس' : 'Pending accounts'}</h2>
        <div className="space-y-3">
          {pendingUsers.length === 0 ? <p className="text-sm text-slate-600">{isUrdu ? 'کوئی زیر التواء اکاؤنٹ نہیں۔' : 'No pending accounts.'}</p> : pendingUsers.map((user) => (
            <div key={user.id} className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-semibold text-slate-900">{user.fullName} ({user.username})</p>
                <p className="text-sm text-slate-600">{user.email}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={() => handleApprove(user.id)}>{isUrdu ? 'منظور' : 'Approve'}</Button>
                <Button variant="ghost" onClick={() => handleReject(user.id)}>{isUrdu ? 'رد' : 'Reject'}</Button>
                <Button variant="ghost" onClick={() => handleDelete(user.id)}>{isUrdu ? 'حذف' : 'Delete'}</Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-950">{isUrdu ? 'تمام صارفین' : 'All users'}</h2>
        <div className="space-y-3">
          {users.map((user) => (
            <div key={user.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-semibold text-slate-900">{user.fullName} · {user.role}</p>
                  <p className="text-sm text-slate-600">{user.username} · {user.email}</p>
                  <p className="text-xs text-slate-500">{isUrdu ? 'حالت' : 'Status'}: {user.status} · {isUrdu ? 'آخری لاگ ان' : 'Last login'}: {formatDate(user.lastLoginAt)}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {user.status === 'Disabled' ? <Button variant="outline" onClick={() => handleEnable(user.id)}>{isUrdu ? 'فعال' : 'Enable'}</Button> : <Button variant="ghost" onClick={() => handleDisable(user.id)}>{isUrdu ? 'غیر فعال' : 'Disable'}</Button>}
                  <Button variant="outline" onClick={() => setSelectedUserId(user.id)}>{isUrdu ? 'ترمیم' : 'Edit'}</Button>
                  <Button variant="ghost" onClick={() => handleDelete(user.id)}>{isUrdu ? 'حذف' : 'Delete'}</Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Modal open={Boolean(selectedUser)} title={isUrdu ? 'صارف کی معلومات' : 'User details'} onClose={() => setSelectedUserId(null)}>
        {selectedUser ? (
          <div className="space-y-4">
            <Input label={isUrdu ? 'پورا نام' : 'Full Name'} value={selectedUser.fullName} onChange={(event) => updateSelectedUser({ fullName: event.target.value })} />
            <Input label={isUrdu ? 'صارف نام' : 'Username'} value={selectedUser.username} onChange={(event) => updateSelectedUser({ username: event.target.value })} />
            <Input label={isUrdu ? 'ای میل' : 'Email'} value={selectedUser.email} onChange={(event) => updateSelectedUser({ email: event.target.value })} />
            <label className="grid gap-2 text-sm text-slate-700">
              <span>{isUrdu ? 'کردار' : 'Role'}</span>
              <select value={selectedUser.role} onChange={(event) => updateSelectedUser({ role: event.target.value as UserRole })} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900">
                <option value="Super Admin">{isUrdu ? 'سپر ایڈمن' : 'Super Admin'}</option>
                <option value="Admin">{isUrdu ? 'ایڈمن' : 'Admin'}</option>
                <option value="Staff">{isUrdu ? 'اسٹاف' : 'Staff'}</option>
              </select>
            </label>
            <Button onClick={() => { setUsers(loadUsers()); setSelectedUserId(null) }}>
              {isUrdu ? 'محفوظ کریں' : 'Save'}
            </Button>
          </div>
        ) : null}
      </Modal>
    </div>
  )
}
