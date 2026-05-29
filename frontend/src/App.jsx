import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SidebarProvider } from './context/SidebarContext';
import Login            from './pages/Login';
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
import ManageStudents     from './pages/ManageStudents';
import ProtectedRoute   from './components/ProtectedRoute';
import ProfilePopup     from './components/ProfilePopup';
import { Toaster }      from 'sonner';

export default function App() {
  return (
    <AuthProvider>
      <SidebarProvider>
      <Toaster position="top-center" richColors expand={false} closeButton />
      <Router>
        <ProfilePopup />
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />
          <Route path="/"     element={<Navigate to="/dashboard" replace />} />

          {/* All logged-in users */}
          <Route path="/dashboard" element={
            <ProtectedRoute allowedRoles={['student', 'coordinator', 'hod', 'super_admin', 'supreme']}>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/leaderboard" element={
            <ProtectedRoute allowedRoles={['student', 'coordinator', 'hod', 'super_admin', 'supreme']}>
              <Leaderboard />
            </ProtectedRoute>
          } />

          {/* Student */}
          <Route path="/courses/:id"             element={<ProtectedRoute allowedRoles={['student']}><CoursePage /></ProtectedRoute>} />
          <Route path="/courses/:id/tlfq/:tlfqId" element={<ProtectedRoute allowedRoles={['student']}><TLFQPage /></ProtectedRoute>} />

          {/* HOD */}
          <Route path="/hod/*" element={
            <ProtectedRoute allowedRoles={['hod']}>
              <HODPanel />
            </ProtectedRoute>
          } />

          {/* Coordinator */}
          <Route path="/coordinator/*" element={
            <ProtectedRoute allowedRoles={['coordinator', 'super_admin', 'supreme']}>
              <CoordinatorPanel />
            </ProtectedRoute>
          } />
          <Route path="/hod/students" element={
            <ProtectedRoute allowedRoles={['hod']}>
              <ManageStudents />
            </ProtectedRoute>
          } />

          {/* Analytics (HOD + Super Admin) */}
          <Route path="/analytics" element={
            <ProtectedRoute allowedRoles={['super_admin', 'hod', 'supreme']}>
              <Analytics />
            </ProtectedRoute>
          } />

          {/* Super Admin */}
          <Route path="/superadmin/*" element={
            <ProtectedRoute allowedRoles={['super_admin', 'supreme']}>
              <SuperAdminPanel />
            </ProtectedRoute>
          } />

          {/* Supreme Authority */}
          <Route path="/supreme" element={
            <ProtectedRoute allowedRoles={['supreme']}>
              <SupremePanel />
            </ProtectedRoute>
          } />

          {/* Identity Reveal — Super Admin, HOD, and Supreme */}
          <Route path="/reveal" element={
            <ProtectedRoute allowedRoles={['super_admin', 'hod', 'supreme']}>
              <IdentityReveal />
            </ProtectedRoute>
          } />
          <Route path="/admin/students" element={
            <ProtectedRoute allowedRoles={['super_admin']}>
              <ManageStudents />
            </ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
      </SidebarProvider>
    </AuthProvider>
  );
}
