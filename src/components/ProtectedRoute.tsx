import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { getCurrentSessionUser } from '../services/authService'

interface ProtectedRouteProps {
  allowedRoles?: Array<'Super Admin' | 'Admin' | 'Staff'>
  requireAdmin?: boolean
}

export function ProtectedRoute({ allowedRoles, requireAdmin }: ProtectedRouteProps) {
  const location = useLocation()
  const user = getCurrentSessionUser()

  if (!user) {
    return <Navigate to="/auth" replace state={{ from: location }} />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />
  }

  if (requireAdmin && user.role === 'Staff') {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
