import { Router } from 'express'
import { supabaseAdmin } from '../config/supabase.js'

export const adminRoutes = Router()

// ---- Users ----
adminRoutes.get('/users', async (req, res, next) => {
  try {
    const { role } = req.query
    let query = supabaseAdmin.from('profiles').select('*').order('created_at', { ascending: false })
    if (role) query = query.eq('role', role)
    const { data, error } = await query
    if (error) throw error
    res.json(data)
  } catch (err) { next(err) }
})

adminRoutes.delete('/users/:id', async (req, res, next) => {
  try {
    await supabaseAdmin.auth.admin.deleteUser(req.params.id)
    res.json({ success: true })
  } catch (err) { next(err) }
})

// ---- Courses ----
adminRoutes.get('/courses', async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin.from('courses').select('*').order('course_name')
    if (error) throw error
    res.json(data)
  } catch (err) { next(err) }
})

adminRoutes.post('/courses', async (req, res, next) => {
  try {
    const { course_name, department } = req.body
    const { data, error } = await supabaseAdmin.from('courses').insert({ course_name, department }).select().single()
    if (error) throw error
    res.status(201).json(data)
  } catch (err) { next(err) }
})

adminRoutes.put('/courses/:id', async (req, res, next) => {
  try {
    const { course_name, department } = req.body
    const { data, error } = await supabaseAdmin.from('courses').update({ course_name, department }).eq('id', req.params.id).select().single()
    if (error) throw error
    res.json(data)
  } catch (err) { next(err) }
})

adminRoutes.delete('/courses/:id', async (req, res, next) => {
  try {
    const { error } = await supabaseAdmin.from('courses').delete().eq('id', req.params.id)
    if (error) throw error
    res.json({ success: true })
  } catch (err) { next(err) }
})

// ---- Trainers ----
adminRoutes.get('/trainers', async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin.from('trainers').select('*').order('trainer_name')
    if (error) throw error
    res.json(data)
  } catch (err) { next(err) }
})

adminRoutes.post('/trainers', async (req, res, next) => {
  try {
    const { trainer_name, department } = req.body
    const { data, error } = await supabaseAdmin.from('trainers').insert({ trainer_name, department }).select().single()
    if (error) throw error
    res.status(201).json(data)
  } catch (err) { next(err) }
})

adminRoutes.put('/trainers/:id', async (req, res, next) => {
  try {
    const { trainer_name, department } = req.body
    const { data, error } = await supabaseAdmin.from('trainers').update({ trainer_name, department }).eq('id', req.params.id).select().single()
    if (error) throw error
    res.json(data)
  } catch (err) { next(err) }
})

adminRoutes.delete('/trainers/:id', async (req, res, next) => {
  try {
    const { error } = await supabaseAdmin.from('trainers').delete().eq('id', req.params.id)
    if (error) throw error
    res.json({ success: true })
  } catch (err) { next(err) }
})

// ---- Subjects ----
adminRoutes.get('/subjects', async (req, res, next) => {
  try {
    const { course_name } = req.query
    let query = supabaseAdmin.from('subjects').select('*').order('subject_name')
    if (course_name) query = query.eq('course_name', course_name)
    const { data, error } = await query
    if (error) throw error
    res.json(data)
  } catch (err) { next(err) }
})
