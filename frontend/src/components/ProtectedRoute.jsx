import { Navigate, useLocation } from 'react-router-dom'

export default function ProtectedRoute({ user, admin = false, children }) {
  const location = useLocation()
  if (!user || (admin && user.role !== 'admin')) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  return children
}
