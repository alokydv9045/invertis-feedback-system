import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

const AuthContext = createContext(null)
export const useAuth = () => useContext(AuthContext)

// Dev mode quick-login credentials
const DEV_ACCOUNTS = {
  student: { email: 'aarav.sharma@invertis.org', password: 'student@2024' },
  hod: { email: 'rajendra.mishra@invertis.org', password: 'hod@cse2024' },
  admin: { email: 'admin@invertis.org', password: 'admin@ifs2024' },
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check existing session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user)
        fetchProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user)
        fetchProfile(session.user.id)
      } else {
        setUser(null)
        setProfile(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function fetchProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*, courses(course_name)')
        .eq('id', userId)
        .single()

      if (error) throw error
      setProfile(data)
    } catch (err) {
      console.error('Failed to fetch profile:', err.message)
      // If profile fetch fails (RLS), create a minimal profile from user metadata
      setProfile(null)
    } finally {
      setLoading(false)
    }
  }

  async function login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  }

  async function register({ email, password, full_name, course_id, batch_year }) {
    // Sign up the user
    const { data: authData, error: authError } = await supabase.auth.signUp({ email, password })
    if (authError) throw authError

    // Create profile
    if (authData.user) {
      const { error: profileError } = await supabase.from('profiles').insert({
        id: authData.user.id,
        role: 'student',
        full_name,
        email,
        course_id,
        batch_year,
      })
      if (profileError) throw profileError
    }

    return authData
  }

  async function skipLogin(role) {
    const creds = DEV_ACCOUNTS[role]
    if (!creds) throw new Error(`No dev account for role: ${role}`)
    return login(creds.email, creds.password)
  }

  async function logout() {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
  }

  const value = {
    user,
    profile,
    loading,
    login,
    register,
    logout,
    skipLogin,
    isAuthenticated: !!user,
    role: profile?.role || null,
    isStudent: profile?.role === 'student',
    isHod: profile?.role === 'hod',
    isAdmin: profile?.role === 'admin',
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
