import { Router } from 'express'
import { supabaseAdmin } from '../config/supabase.js'

export const reviewRoutes = Router()

// POST /api/reviews — submit review + answers (transactional)
reviewRoutes.post('/', async (req, res, next) => {
  try {
    const { form_id, student_id, written_feedback, answers } = req.body
    // answers: [{ question_id: 'q1', rating_value: 5 }, ...]

    // Insert review
    const { data: review, error: reviewError } = await supabaseAdmin.from('reviews').insert({
      form_id, student_id, written_feedback,
    }).select().single()
    if (reviewError) throw reviewError

    // Insert answers
    const answerRows = answers.map((a) => ({
      review_id: review.id,
      question_id: a.question_id,
      rating_value: a.rating_value,
    }))
    const { error: answersError } = await supabaseAdmin.from('review_answers').insert(answerRows)
    if (answersError) throw answersError

    res.status(201).json({ success: true, review_id: review.id })
  } catch (err) { next(err) }
})

// GET /api/reviews/history/:studentId
reviewRoutes.get('/history/:studentId', async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin.from('reviews')
      .select('*, feedback_forms(subject_name, subject_code, trainers(trainer_name))')
      .eq('student_id', req.params.studentId)
      .order('created_at', { ascending: false })
    if (error) throw error
    res.json(data)
  } catch (err) { next(err) }
})

// GET /api/reviews/form/:formId — all reviews for a form
reviewRoutes.get('/form/:formId', async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin.from('reviews')
      .select('*, review_answers(*)')
      .eq('form_id', req.params.formId)
      .order('created_at', { ascending: false })
    if (error) throw error
    res.json(data)
  } catch (err) { next(err) }
})
