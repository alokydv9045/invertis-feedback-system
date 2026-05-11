import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'
import { ArrowRight, ShieldCheck } from 'lucide-react'

export default function RegisterPage() {
  const [form, setForm] = useState({
    full_name: '', email: '', password: '', confirmPassword: '',
    course_id: '', batch_year: '2024',
  })
  const [courses, setCourses] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    supabase.from('courses').select('id, course_name, department').order('course_name').then(({ data }) => {
      if (data) setCourses(data)
    })
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    setLoading(true)
    try {
      await register({
        email: form.email,
        password: form.password,
        full_name: form.full_name,
        course_id: form.course_id || null,
        batch_year: form.batch_year,
      })
      navigate('/student/dashboard')
    } catch (err) {
      setError(err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  const years = Array.from({ length: 6 }, (_, i) => 2020 + i)

  return (
    <div className="min-h-screen flex">
      {/* Left panel — blue branding */}
      <div className="hidden lg:flex lg:w-5/12 bg-invertis-navy relative flex-col justify-between p-10 overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 text-white mb-16">
            <img src="/logo.png" alt="Invertis University" className="w-10 h-10 rounded-lg object-contain" />
            <span className="font-bold text-sm text-white/80">INVERTIS UNIVERSITY</span>
          </div>
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Shape Your<br />Academic<br />Experience
          </h1>
          <p className="text-blue-200 text-sm leading-relaxed max-w-xs">
            Join the Invertis Feedback System to provide valuable insights, track course analytics, and contribute to continuous institutional improvement.
          </p>
        </div>
        <div className="relative z-10 flex items-center gap-2 text-white/60 text-xs">
          <ShieldCheck size={14} />
          <span>Secure Institutional Portal</span>
        </div>
        {/* Decorative shapes */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-surface">
        <div className="w-full max-w-lg animate-fade-in">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Student Registration</h2>
          <p className="text-gray-500 text-sm mb-8">Create your account to access the feedback portal.</p>

          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name + Email */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
                <input
                  type="text" value={form.full_name} onChange={update('full_name')}
                  placeholder="e.g. Jane Doe" required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-invertis-blue/20 focus:border-invertis-blue"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">University Email</label>
                <input
                  type="email" value={form.email} onChange={update('email')}
                  placeholder="jane.doe@invertis.org" required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-invertis-blue/20 focus:border-invertis-blue"
                />
              </div>
            </div>

            {/* Passwords */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
                <input
                  type="password" value={form.password} onChange={update('password')}
                  placeholder="••••••••" required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-invertis-blue/20 focus:border-invertis-blue"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Confirm Password</label>
                <input
                  type="password" value={form.confirmPassword} onChange={update('confirmPassword')}
                  placeholder="••••••••" required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-invertis-blue/20 focus:border-invertis-blue"
                />
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* Course + Years */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Enrolled Course</label>
              <select
                value={form.course_id} onChange={update('course_id')}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-invertis-blue/20 focus:border-invertis-blue"
              >
                <option value="">Select your current program</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>{c.course_name} — {c.department}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Start Year</label>
                <select
                  value={form.batch_year} onChange={update('batch_year')}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-invertis-blue/20 focus:border-invertis-blue"
                >
                  {years.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Expected Graduation</label>
                <select
                  value={parseInt(form.batch_year) + 4}
                  disabled
                  className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-lg text-sm text-gray-500"
                >
                  <option>{parseInt(form.batch_year) + 4}</option>
                </select>
              </div>
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full bg-invertis-blue text-white py-3.5 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-sm shadow-invertis-blue/25 disabled:opacity-50"
            >
              {loading ? 'Creating account...' : 'Complete Registration'}
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already registered?{' '}
            <Link to="/login" className="text-invertis-blue font-semibold hover:underline">Login to Portal</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
