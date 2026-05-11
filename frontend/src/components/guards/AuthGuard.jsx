import { Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

export function AuthGuard({ children, allowedRoles }) {
  const { profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-surface">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!profile) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && !allowedRoles.includes(profile.role)) {
    return <Navigate to={`/${profile.role}/dashboard`} replace />
  }

  return children
}
