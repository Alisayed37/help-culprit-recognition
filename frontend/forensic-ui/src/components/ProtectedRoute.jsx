import { Navigate } from 'react-router-dom'

// Guards routes that require authentication.
// No token in localStorage => redirect to the login page.
function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token')

  if (!token) {
    return <Navigate to="/" replace />
  }

  return children
}

export default ProtectedRoute
