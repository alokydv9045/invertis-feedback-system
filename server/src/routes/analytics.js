import { Router } from 'express'
import { supabaseAdmin } from '../config/supabase.js'

export const analyticsRoutes = Router()

// GET /api/analytics/dashboard/admin
analyticsRoutes.get('/dashboard/admin', async (req, res, next) => {
  try {
    const [students, trainers, courses, forms] = await Promise.all([
      supabaseAdmin.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'student'),
      supabaseAdmin.from('trainers').select('id', { count: 'exact', head: true }),
      supabaseAdmin.from('courses').select('id', { count: 'exact', head: true }),
      supabaseAdmin.from('feedback_forms').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    ])
    res.json({
      total_students: students.count || 0,
      total_trainers: trainers.count || 0,
      total_courses: courses.count || 0,
      active_forms: forms.count || 0,
    })
  } catch (err) { next(err) }
})

// GET /api/analytics/dashboard/hod?dept=X
analyticsRoutes.get('/dashboard/hod', async (req, res, next) => {
  try {
    const dept = req.query.dept || 'Computer Science & Engineering'
    const [trainers, forms, reviews] = await Promise.all([
      supabaseAdmin.from('trainers').select('id', { count: 'exact', head: true }).eq('department', dept),
      supabaseAdmin.from('feedback_forms').select('id', { count: 'exact', head: true }).eq('status', 'active'),
      supabaseAdmin.from('reviews').select('id', { count: 'exact', head: true }),
    ])
    res.json({
      total_trainers: trainers.count || 0,
      active_forms: forms.count || 0,
      total_responses: reviews.count || 0,
    })
  } catch (err) { next(err) }
})

// GET /api/analytics/leaderboard
analyticsRoutes.get('/leaderboard', async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin.from('reviews')
      .select('student_id, profiles(full_name)')
    if (error) throw error

    // Count submissions per student
    const counts = {}
    data.forEach(r => {
      const id = r.student_id
      if (!counts[id]) counts[id] = { student_id: id, name: r.profiles?.full_name || 'Unknown', count: 0 }
      counts[id].count++
    })
    const sorted = Object.values(counts).sort((a, b) => b.count - a.count).slice(0, 20)
    res.json(sorted)
  } catch (err) { next(err) }
})
