import { Router } from 'express'
import { supabaseAdmin } from '../config/supabase.js'

export const authRoutes = Router()

// POST /api/auth/register
authRoutes.post('/register', async (req, res, next) => {
  try {
    const { email, password, full_name, course_id, batch_year } = req.body
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email, password, email_confirm: true,
    })
    if (authError) throw authError

    const { error: profileError } = await supabaseAdmin.from('profiles').insert({
      id: authData.user.id, role: 'student', full_name, email, course_id, batch_year,
    })
    if (profileError) throw profileError

    res.json({ success: true, user: authData.user })
  } catch (err) { next(err) }
})

// GET /api/auth/profile/:userId
authRoutes.get('/profile/:userId', async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin.from('profiles').select('*').eq('id', req.params.userId).single()
    if (error) throw error
    res.json(data)
  } catch (err) { next(err) }
})

// GET /api/auth/role/:userId
authRoutes.get('/role/:userId', async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin.from('profiles').select('role').eq('id', req.params.userId).single()
    if (error) throw error
    res.json({ role: data.role })
  } catch (err) { next(err) }
})
