import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import useAuthStore from './store/authStore'

import Login        from './pages/Login'
import Register     from './pages/Register'
import Home         from './pages/Home'
import EventPage    from './pages/EventPage'
import MyPhotos     from './pages/MyPhotos'
import Favourites   from './pages/Favourites'
import AdminDashboard from './pages/AdminDashboard'
import Layout       from './components/Layout'

const ProtectedRoute = ({ children }) => {
  const { user } = useAuthStore()
  return user ? children : <Navigate to="/login" />
}

const AdminRoute = ({ children }) => {
  const { user } = useAuthStore()
  return user?.role === 'ADMIN' ? children : <Navigate to="/" />
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ style: { background: '#1a1a1a', color: '#fff', border: '1px solid #333' } }} />
      <Routes>
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index                  element={<Home />} />
          <Route path="events/:id"      element={<EventPage />} />
          <Route path="my-photos"       element={<MyPhotos />} />
          <Route path="favourites"      element={<Favourites />} />
          <Route path="admin"           element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}