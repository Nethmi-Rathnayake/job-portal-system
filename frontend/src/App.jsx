// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute'
import Navbar  from './components/Navbar/Navbar'
import Footer  from './components/Footer/Footer'

// Pages
import Home             from './pages/Home/Home'
import Login            from './pages/Login/Login'
import Register         from './pages/Register/Register'
import Jobs             from './pages/Jobs/Jobs'
import JobDetail        from './pages/JobDetail/JobDetail'
import Companies        from './pages/Companies/Companies'
import About            from './pages/About/About'
import Contact          from './pages/Contact/Contact'
import StudentDashboard from './pages/StudentDashboard/StudentDashboard'
import CompanyDashboard from './pages/CompanyDashboard/CompanyDashboard'
import AdminDashboard   from './pages/AdminDashboard/AdminDashboard'

// Layout that includes Navbar + Footer (public pages)
function PublicLayout({ children }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* ── Public pages (with Navbar + Footer) ── */}
          <Route path="/" element={<PublicLayout><Home/></PublicLayout>} />
          <Route path="/jobs" element={<PublicLayout><Jobs/></PublicLayout>} />
          <Route path="/jobs/:id" element={<PublicLayout><JobDetail/></PublicLayout>} />
          <Route path="/companies" element={<PublicLayout><Companies/></PublicLayout>} />
          <Route path="/about"   element={<PublicLayout><About/></PublicLayout>} />
          <Route path="/contact" element={<PublicLayout><Contact/></PublicLayout>} />

          {/* ── Auth pages (no Navbar/Footer — full-page split layout) ── */}
          <Route path="/login"    element={<Login/>} />
          <Route path="/register" element={<Register/>} />

          {/* ── Protected dashboards ── */}
          <Route path="/student/dashboard" element={
            <ProtectedRoute roles={['student']}>
              <StudentDashboard/>
            </ProtectedRoute>
          }/>

          <Route path="/company/dashboard" element={
            <ProtectedRoute roles={['company']}>
              <CompanyDashboard/>
            </ProtectedRoute>
          }/>

          <Route path="/admin/dashboard" element={
            <ProtectedRoute roles={['admin']}>
              <AdminDashboard/>
            </ProtectedRoute>
          }/>

          {/* ── Catch-all → home ── */}
          <Route path="*" element={<Navigate to="/" replace/>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
