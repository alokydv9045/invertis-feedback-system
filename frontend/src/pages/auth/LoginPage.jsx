import { useState } from 'react'
import { useNavigate, Link, Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/Button'
import { LogIn, Eye, EyeOff, GraduationCap, Shield, UserCog } from 'lucide-react'

const IS_DEV = import.meta.env.VITE_DEV_MODE === 'true'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login, skipLogin, profile, loading: authLoading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [skipLoading, setSkipLoading] = useState('')

  // Redirect if already logged in
  if (!authLoading && profile) {
    return <Navigate to={`/${profile.role}/dashboard`} replace />
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      // AuthContext will update profile → role → AuthGuard will redirect
    } catch (err) {
      setError(err.message || 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  const handleSkip = async (role) => {
    setError('')
    setSkipLoading(role)
    try {
      await skipLogin(role)
    } catch (err) {
      setError(err.message || 'Failed to sign in')
    } finally {
      setSkipLoading('')
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel — Branding */}
      <div className="hidden lg:flex lg:w-[45%] bg-gradient-to-br from-invertis-navy via-invertis-blue to-blue-500 relative overflow-hidden items-center justify-center p-12">
        <div className="relative z-10 text-white">
          <img src="/logo.png" alt="Invertis University" className="w-20 h-20 rounded-2xl object-contain bg-white/20 backdrop-blur-sm p-2 mb-8" />
          <h1 className="text-4xl font-bold leading-tight mb-4">
            Invertis<br />Feedback System
          </h1>
          <p className="text-blue-100 text-lg leading-relaxed max-w-md">
            Empowering academic excellence through structured, anonymous, and actionable student feedback.
          </p>
          <div className="mt-12 space-y-3 text-blue-200 text-sm">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-400" /> Anonymous & Secure Submissions
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-amber-400" /> Real-time Analytics Dashboard
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-purple-400" /> Role-based Access Control
            </div>
          </div>
        </div>
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/10 rounded-full" />
        <div className="absolute right-20 -bottom-32 w-48 h-48 bg-white/5 rounded-full" />
        <div className="absolute -left-10 bottom-20 w-32 h-32 bg-white/5 rounded-full" />
      </div>

      {/* Right Panel — Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
            <p className="text-gray-500 mt-1">Sign in to access your feedback portal</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@invertis.org" required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-invertis-blue/20 focus:border-invertis-blue transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password" required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-invertis-blue/20 focus:border-invertis-blue transition-all pr-10"
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading} icon={LogIn}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-6">
            New student? <Link to="/register" className="text-invertis-blue font-semibold hover:underline">Register here</Link>
          </p>

          {/* Dev Mode Quick Access */}
          {IS_DEV && (
            <div className="mt-8 pt-6 border-t border-gray-100">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider text-center mb-4">
                🛠 Dev Mode — Quick Access
              </p>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => handleSkip('student')}
                  disabled={!!skipLoading}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl border-2 border-blue-100 bg-blue-50 hover:bg-blue-100 hover:border-blue-300 transition-all disabled:opacity-50"
                >
                  <GraduationCap size={20} className="text-blue-600" />
                  <span className="text-xs font-bold text-blue-700">
                    {skipLoading === 'student' ? '...' : 'Student'}
                  </span>
                </button>
                <button
                  onClick={() => handleSkip('hod')}
                  disabled={!!skipLoading}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl border-2 border-emerald-100 bg-emerald-50 hover:bg-emerald-100 hover:border-emerald-300 transition-all disabled:opacity-50"
                >
                  <Shield size={20} className="text-emerald-600" />
                  <span className="text-xs font-bold text-emerald-700">
                    {skipLoading === 'hod' ? '...' : 'HOD'}
                  </span>
                </button>
                <button
                  onClick={() => handleSkip('admin')}
                  disabled={!!skipLoading}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl border-2 border-orange-100 bg-orange-50 hover:bg-orange-100 hover:border-orange-300 transition-all disabled:opacity-50"
                >
                  <UserCog size={20} className="text-orange-600" />
                  <span className="text-xs font-bold text-orange-700">
                    {skipLoading === 'admin' ? '...' : 'Admin'}
                  </span>
                </button>
              </div>
              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                <p className="text-[10px] text-gray-400 text-center leading-relaxed">
                  Student: <span className="font-mono text-gray-500">aarav.sharma@invertis.org</span> / <span className="font-mono text-gray-500">student@2024</span><br />
                  HOD: <span className="font-mono text-gray-500">rajendra.mishra@invertis.org</span> / <span className="font-mono text-gray-500">hod@cse2024</span><br />
                  Admin: <span className="font-mono text-gray-500">admin@invertis.org</span> / <span className="font-mono text-gray-500">admin@ifs2024</span>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
