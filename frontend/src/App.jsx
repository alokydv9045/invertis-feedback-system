import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/context/AuthContext'
import { AuthGuard } from '@/components/guards/AuthGuard'
import { AppLayout } from '@/components/layout/AppLayout'

// Auth pages
import LoginPage from '@/pages/auth/LoginPage'
import RegisterPage from '@/pages/auth/RegisterPage'

// Student pages
import StudentDashboard from '@/pages/student/StudentDashboard'
import FeedbackForm from '@/pages/student/FeedbackForm'
import SubmissionHistory from '@/pages/student/SubmissionHistory'
import StudentProfile from '@/pages/student/StudentProfile'

// HOD pages
import HodDashboard from '@/pages/hod/HodDashboard'
import FormManagement from '@/pages/hod/FormManagement'
import HodAnalytics from '@/pages/hod/HodAnalytics'
import StudentDirectory from '@/pages/hod/StudentDirectory'

// Admin pages
import AdminDashboard from '@/pages/admin/AdminDashboard'
import UserManagement from '@/pages/admin/UserManagement'
import AdminFormManagement from '@/pages/admin/AdminFormManagement'
import CourseManagement from '@/pages/admin/CourseManagement'
import TrainerManagement from '@/pages/admin/TrainerManagement'
import Leaderboard from '@/pages/admin/Leaderboard'

function RootRedirect() {
  const { profile, loading } = useAuth()
  if (loading) return null
  if (!profile) return <Navigate to="/login" replace />
  return <Navigate to={`/${profile.role}/dashboard`} replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/" element={<RootRedirect />} />

          {/* Student routes */}
          <Route path="/student" element={
            <AuthGuard allowedRoles={['student']}>
              <AppLayout />
            </AuthGuard>
          }>
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="feedback/:formId" element={<FeedbackForm />} />
            <Route path="history" element={<SubmissionHistory />} />
            <Route path="profile" element={<StudentProfile />} />
            <Route index element={<Navigate to="dashboard" replace />} />
          </Route>

          {/* HOD routes */}
          <Route path="/hod" element={
            <AuthGuard allowedRoles={['hod']}>
              <AppLayout />
            </AuthGuard>
          }>
            <Route path="dashboard" element={<HodDashboard />} />
            <Route path="forms" element={<FormManagement />} />
            <Route path="analytics" element={<HodAnalytics />} />
            <Route path="students" element={<StudentDirectory />} />
            <Route index element={<Navigate to="dashboard" replace />} />
          </Route>

          {/* Admin routes */}
          <Route path="/admin" element={
            <AuthGuard allowedRoles={['admin']}>
              <AppLayout />
            </AuthGuard>
          }>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="forms" element={<AdminFormManagement />} />
            <Route path="courses" element={<CourseManagement />} />
            <Route path="trainers" element={<TrainerManagement />} />
            <Route path="leaderboard" element={<Leaderboard />} />
            <Route index element={<Navigate to="dashboard" replace />} />
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
