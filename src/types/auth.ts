export type UserRole = 'Super Admin' | 'Admin' | 'Staff'
export type AccountStatus = 'Pending' | 'Approved' | 'Disabled' | 'Rejected'

export interface AuthUser {
  id: string
  fullName: string
  username: string
  email: string
  passwordHash: string
  profilePicture?: string
  role: UserRole
  status: AccountStatus
  createdAt: string
  lastLoginAt?: string
}

export interface CreateUserInput {
  fullName: string
  username: string
  email: string
  password: string
  confirmPassword: string
  profilePicture?: string
}

export interface LoginInput {
  identifier: string
  password: string
  rememberMe?: boolean
}
