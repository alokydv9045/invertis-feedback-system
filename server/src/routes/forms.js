import { Router } from 'express'
import { supabaseAdmin } from '../config/supabase.js'

export const formRoutes = Router()

// GET /api/forms — list forms with optional filters
formRoutes.get('/', async (req, res, next) => {
  try {
    const { status, course_id } = req.query
    let query = supabaseAdmin.from('feedback_forms').select('*, courses(course_name), trainers(trainer_name)').order('created_at', { ascending: false })
    if (status) query = query.eq('status', status)
    if (course_id) query = query.eq('course_id', course_id)
    const { data, error } = await query
    if (error) throw error
    res.json(data)
  } catch (err) { next(err) }
})

// GET /api/forms/:id
formRoutes.get('/:id', async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin.from('feedback_forms')
      .select('*, courses(course_name), trainers(trainer_name)')
      .eq('id', req.params.id).single()
    if (error) throw error
    res.json(data)
  } catch (err) { next(err) }
})

// POST /api/forms — create new form
formRoutes.post('/', async (req, res, next) => {
  try {
    const { course_id, trainer_id, subject_name, subject_code, published_by } = req.body
    const { data, error } = await supabaseAdmin.from('feedback_forms').insert({
      course_id, trainer_id, subject_name, subject_code, published_by, status: 'active',
    }).select().single()
    if (error) throw error
    res.status(201).json(data)
  } catch (err) { next(err) }
})

// PATCH /api/forms/:id/status
formRoutes.patch('/:id/status', async (req, res, next) => {
  try {
    const { status } = req.body
    const { data, error } = await supabaseAdmin.from('feedback_forms').update({ status }).eq('id', req.params.id).select().single()
    if (error) throw error
    res.json(data)
  } catch (err) { next(err) }
})

// DELETE /api/forms/:id
formRoutes.delete('/:id', async (req, res, next) => {
  try {
    const { error } = await supabaseAdmin.from('feedback_forms').delete().eq('id', req.params.id)
    if (error) throw error
    res.json({ success: true })
  } catch (err) { next(err) }
})
