import { Route, Routes } from 'react-router'
import AuthProvider from './auth/AuthProvider.jsx'
import RequireAuth from './RequireAuth.jsx'
import AdminLayout from './AdminLayout.jsx'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import AdminNotFound from './pages/AdminNotFound.jsx'

// Everything under /admin. The public website never downloads this code.
export default function AdminApp() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="login" element={<Login />} />
        <Route element={<RequireAuth />}>
          <Route element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="*" element={<AdminNotFound />} />
          </Route>
        </Route>
      </Routes>
    </AuthProvider>
  )
}