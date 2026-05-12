import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppLayout } from './components/layout/AppLayout';
import Login            from './pages/Login';
import StudentRegister  from './pages/StudentRegister';
import Dashboard        from './pages/Dashboard';
import CoursePage       from './pages/CoursePage';
import TLFQPage         from './pages/TLFQPage';
import Analytics        from './pages/Analytics';
import HODPanel         from './pages/HODPanel';
import CoordinatorPanel from './pages/CoordinatorPanel';
import SuperAdminPanel  from './pages/SuperAdminPanel';
import SupremePanel     from './pages/SupremePanel';
import Leaderboard      from './pages/Leaderboard';
import IdentityReveal   from './pages/IdentityReveal';
import AdminPanel       from './pages/AdminPanel';
import ManageStudents   from './pages/ManageStudents';
import ManageDirectory  from './pages/ManageDirectory';
import ProtectedRoute   from './components/ProtectedRoute';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<StudentRegister />} />

          {/* Authenticated routes with layout */}
          <Route element={
            <ProtectedRoute allowedRoles={['student', 'coordinator', 'hod', 'super_admin', 'supreme']}>
              <AppLayout />
            </ProtectedRoute>
          }>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/courses/:id" element={
              <ProtectedRoute allowedRoles={['student']}><CoursePage /></ProtectedRoute>
            } />
            <Route path="/courses/:id/tlfq/:tlfqId" element={
              <ProtectedRoute allowedRoles={['student']}><TLFQPage /></ProtectedRoute>
            } />
            <Route path="/hod/*" element={
              <ProtectedRoute allowedRoles={['hod']}><HODPanel /></ProtectedRoute>
            } />
            <Route path="/coordinator/*" element={
              <ProtectedRoute allowedRoles={['coordinator', 'super_admin', 'supreme']}><CoordinatorPanel /></ProtectedRoute>
            } />
            <Route path="/analytics" element={
              <ProtectedRoute allowedRoles={['super_admin', 'hod', 'supreme']}><Analytics /></ProtectedRoute>
            } />
            <Route path="/superadmin/*" element={
              <ProtectedRoute allowedRoles={['super_admin', 'supreme']}><SuperAdminPanel /></ProtectedRoute>
            } />
            <Route path="/supreme" element={
              <ProtectedRoute allowedRoles={['supreme']}><SupremePanel /></ProtectedRoute>
            } />
            <Route path="/reveal" element={
              <ProtectedRoute allowedRoles={['super_admin', 'supreme']}><IdentityReveal /></ProtectedRoute>
            } />
            <Route path="/admin/students" element={
              <ProtectedRoute allowedRoles={['super_admin', 'supreme']}><ManageStudents /></ProtectedRoute>
            } />
            <Route path="/hod/students" element={
              <ProtectedRoute allowedRoles={['hod']}><ManageStudents /></ProtectedRoute>
            } />
          </Route>

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
