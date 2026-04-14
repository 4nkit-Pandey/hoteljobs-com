import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import Navbar from './components/common/Navbar'
import Footer from './components/common/Footer'
import HomePage from './pages/HomePage'
import JobListingsPage from './pages/JobListingsPage'
import JobDetailsPage from './pages/JobDetailsPage'
import AuthPage from './pages/AuthPage'
import SeekerDashboard from './pages/SeekerDashboard'
import RecruiterDashboard from './pages/RecruiterDashboard'
import CompanyProfilePage from './pages/CompanyProfilePage'
import AdminPanel from './pages/AdminPanel'
import AboutPage from './pages/AboutPage'
import ContactPage from './pages/ContactPage'
import MessagingPage from './pages/MessagingPage'

const ProtectedRoute = ({ children, roles }) => {
  const { user, isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to="/auth" replace />
  if (roles && !roles.includes(user?.role)) return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/jobs" element={<JobListingsPage />} />
            <Route path="/jobs/:id" element={<JobDetailsPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/company/:id" element={<CompanyProfilePage />} />
            <Route path="/messages" element={
              <ProtectedRoute roles={['seeker', 'recruiter']}>
                <MessagingPage />
              </ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute roles={['seeker']}>
                <SeekerDashboard />
              </ProtectedRoute>
            } />
            <Route path="/recruiter" element={
              <ProtectedRoute roles={['recruiter']}>
                <RecruiterDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin" element={
              <ProtectedRoute roles={['admin']}>
                <AdminPanel />
              </ProtectedRoute>
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  )
}
