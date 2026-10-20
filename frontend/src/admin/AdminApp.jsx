import { lazy } from 'react'
import { Route, Routes } from 'react-router'
import AuthProvider from './auth/AuthProvider.jsx'
import RequireAuth from './RequireAuth.jsx'
import AdminLayout from './AdminLayout.jsx'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Posts from './pages/Posts.jsx'
import AdminNotFound from './pages/AdminNotFound.jsx'

// The post editor is large, so it is only downloaded when someone opens the new or edit page.
const NewPost = lazy(() => import('./pages/NewPost.jsx'))
const EditPost = lazy(() => import('./pages/EditPost.jsx'))

// Everything under /admin. The public website never downloads this code.
export default function AdminApp() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="login" element={<Login />} />
        <Route element={<RequireAuth />}>
          <Route element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="posts" element={<Posts />} />
            <Route path="posts/new" element={<NewPost />} />
            <Route path="posts/:id/edit" element={<EditPost />} />
            <Route path="*" element={<AdminNotFound />} />
          </Route>
        </Route>
      </Routes>
    </AuthProvider>
  )
}