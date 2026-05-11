import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f7fa] flex flex-col items-center justify-center font-sans">
        <div className="h-12 w-12 border-4 border-[#f15a24] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[10px] font-black text-gray-400 mt-6 animate-pulse uppercase tracking-[0.2em]">Authenticating Secure Session...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
