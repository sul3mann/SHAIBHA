import type { AuthUser, CreateUserInput, LoginInput, UserRole, AccountStatus } from '../types/auth'

const STORAGE_KEY = 'shaibah_users'
const LEGACY_STORAGE_KEY = 'shaibha_users'
const SESSION_KEY = 'shaibah_session_user'
const LEGACY_SESSION_KEY = 'shaibha_session_user'
const REMEMBER_KEY = 'shaibah_remember_session'
const LEGACY_REMEMBER_KEY = 'shaibha_remember_session'

function simpleHash(value: string) {
  let hash = 0
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i)
    hash |= 0
  }
  return `h${Math.abs(hash).toString(16)}`
}

export function loadUsers(): AuthUser[] {
  if (typeof window === 'undefined') return []
  for (const key of [STORAGE_KEY, LEGACY_STORAGE_KEY]) {
    try {
      const raw = window.localStorage.getItem(key)
      if (raw) {
        const parsed = JSON.parse(raw) as AuthUser[]
        if (key !== STORAGE_KEY) {
          saveUsers(parsed)
        }
        return parsed
      }
    } catch {
      continue
    }
  }
  return []
}

export function saveUsers(users: AuthUser[]) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(users))
  window.localStorage.removeItem(LEGACY_STORAGE_KEY)
}

export function getCurrentSessionUser(): AuthUser | null {
  if (typeof window === 'undefined') return null
  for (const key of [SESSION_KEY, LEGACY_SESSION_KEY]) {
    try {
      const raw = window.localStorage.getItem(key)
      if (raw) {
        const parsed = JSON.parse(raw) as AuthUser
        if (key !== SESSION_KEY) {
          setCurrentSessionUser(parsed)
        }
        return parsed
      }
    } catch {
      continue
    }
  }
  return null
}

export function setCurrentSessionUser(user: AuthUser | null) {
  if (typeof window === 'undefined') return
  if (user) {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(user))
    window.localStorage.removeItem(LEGACY_SESSION_KEY)
  } else {
    window.localStorage.removeItem(SESSION_KEY)
    window.localStorage.removeItem(LEGACY_SESSION_KEY)
  }
}

export function hasAnyUsers() {
  return loadUsers().length > 0
}

export function hasSuperAdmin() {
  return loadUsers().some((user) => user.role === 'Super Admin' && user.status === 'Approved')
}

export function createUser(input: CreateUserInput, role: UserRole = 'Staff', status: AccountStatus = 'Pending') {
  const users = loadUsers()
  const existing = users.some((user) => user.username.toLowerCase() === input.username.trim().toLowerCase() || user.email.toLowerCase() === input.email.trim().toLowerCase())
  if (existing) {
    throw new Error('Username or email already exists')
  }

  const user: AuthUser = {
    id: crypto.randomUUID(),
    fullName: input.fullName.trim(),
    username: input.username.trim(),
    email: input.email.trim(),
    passwordHash: simpleHash(input.password),
    profilePicture: input.profilePicture,
    role,
    status,
    createdAt: new Date().toISOString(),
  }

  users.push(user)
  saveUsers(users)
  return user
}

export function authenticateUser(input: LoginInput): AuthUser | null {
  const users = loadUsers()
  const user = users.find((entry) => (entry.username.toLowerCase() === input.identifier.trim().toLowerCase() || entry.email.toLowerCase() === input.identifier.trim().toLowerCase()) && entry.passwordHash === simpleHash(input.password))
  if (!user) return null
  if (user.status !== 'Approved') return null
  const updatedUsers = users.map((entry) => (entry.id === user.id ? { ...entry, lastLoginAt: new Date().toISOString() } : entry))
  saveUsers(updatedUsers)
  const nextUser = { ...user, lastLoginAt: new Date().toISOString() }
  setCurrentSessionUser(nextUser)
  return nextUser
}

export function logoutUser() {
  setCurrentSessionUser(null)
  window.localStorage.removeItem(REMEMBER_KEY)
  window.localStorage.removeItem(LEGACY_REMEMBER_KEY)
}

export function updateUser(userId: string, changes: Partial<AuthUser>) {
  const users = loadUsers()
  const nextUsers = users.map((user) => (user.id === userId ? { ...user, ...changes } : user))
  saveUsers(nextUsers)
  const current = getCurrentSessionUser()
  if (current?.id === userId) {
    setCurrentSessionUser(nextUsers.find((user) => user.id === userId) ?? null)
  }
}

export function deleteUser(userId: string) {
  const users = loadUsers()
  const filtered = users.filter((user) => user.id !== userId)
  saveUsers(filtered)
  const current = getCurrentSessionUser()
  if (current?.id === userId) {
    logoutUser()
  }
}

export function getUserById(userId: string) {
  return loadUsers().find((user) => user.id === userId) ?? null
}

export function getUsersByRole(role: UserRole) {
  return loadUsers().filter((user) => user.role === role)
}

export function getPendingUsers() {
  return loadUsers().filter((user) => user.status === 'Pending')
}

export function getApprovedUsers() {
  return loadUsers().filter((user) => user.status === 'Approved')
}

export function canAccessAdminPanel(user: AuthUser | null) {
  return Boolean(user && (user.role === 'Super Admin' || user.role === 'Admin'))
}

export function canManageSystem(user: AuthUser | null) {
  return Boolean(user && user.role === 'Super Admin')
}

export function canManageUsers(user: AuthUser | null) {
  return Boolean(user && user.role === 'Super Admin')
}

export function canManageCustomers(user: AuthUser | null) {
  return Boolean(user && (user.role === 'Super Admin' || user.role === 'Admin' || user.role === 'Staff'))
}

export function canManageEntries(user: AuthUser | null) {
  return Boolean(user && (user.role === 'Super Admin' || user.role === 'Admin' || user.role === 'Staff'))
}

export function canViewReports(user: AuthUser | null) {
  return Boolean(user && (user.role === 'Super Admin' || user.role === 'Admin' || user.role === 'Staff'))
}

export function canUseCalculator(user: AuthUser | null) {
  return Boolean(user && (user.role === 'Super Admin' || user.role === 'Admin' || user.role === 'Staff'))
}

export function canManagePhotos(user: AuthUser | null) {
  return Boolean(user && (user.role === 'Super Admin' || user.role === 'Admin'))
}
