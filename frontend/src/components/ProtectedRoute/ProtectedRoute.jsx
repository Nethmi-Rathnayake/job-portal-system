// src/components/ProtectedRoute/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function ProtectedRoute({ children, roles = [] }) {
  const { user, loading } = useAuth()

  if (loading) return <div className="page-loader"><div className="spinner" /></div>

  if (!user) return <Navigate to="/login" replace />

  if (roles.length > 0 && !roles.includes(user.role)) {
    if (user.role === 'student')  return <Navigate to="/student/dashboard" replace />
    if (user.role === 'company')  return <Navigate to="/company/dashboard" replace />
    if (user.role === 'admin')    return <Navigate to="/admin/dashboard"   replace />
  }

  return children
}
