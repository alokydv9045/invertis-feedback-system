import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'
import { QUESTIONS } from '@/lib/constants'
import { StarRating } from '@/components/ui/StarRating'
import { Card, CardBody } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { ArrowRight, User } from 'lucide-react'

export default function FeedbackForm() {
  const { formId } = useParams()
  const navigate = useNavigate()
  const { profile } = useAuth()
  const [ratings, setRatings] = useState({})
  const [writtenFeedback, setWrittenFeedback] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadForm()
  }, [formId])

  async function loadForm() {
    try {
      const { data, error } = await supabase
        .from('feedback_forms')
        .select('*, courses(course_name), trainers(trainer_name)')
        .eq('id', formId)
        .single()

      if (error) throw error
      setFormData(data)
    } catch (err) {
      console.error('Failed to load form:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleRating = (questionId, value) => {
    setRatings({ ...ratings, [questionId]: value })
  }

  const allRated = QUESTIONS.every((q) => ratings[q.id] > 0)
  const canSubmit = allRated && writtenFeedback.trim().length >= 10

  const handleSubmit = async () => {
    if (!canSubmit) return
    setSubmitting(true)
    try {
      // Insert review
      const { data: review, error: revErr } = await supabase.from('reviews').insert({
        form_id: formId,
        student_id: profile.id,
        written_feedback: writtenFeedback,
      }).select().single()

      if (revErr) throw revErr

      // Insert 10 answers
      const answers = QUESTIONS.map(q => ({
        review_id: review.id,
        question_id: q.id,
        rating_value: ratings[q.id],
      }))

      const { error: ansErr } = await supabase.from('review_answers').insert(answers)
      if (ansErr) throw ansErr

      setSubmitted(true)
    } catch (err) {
      console.error('Submit error:', err)
      alert(err.message || 'Failed to submit feedback')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <LoadingSpinner size="lg" />

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20 animate-fade-in">
        <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Feedback Submitted!</h2>
        <p className="text-gray-500 mb-8">Thank you for your valuable contribution to academic excellence.</p>
        <Button onClick={() => navigate('/student/dashboard')}>Return to Dashboard</Button>
      </div>
    )
  }

  if (!formData) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Form not found or has been closed.</p>
        <Button className="mt-4" onClick={() => navigate('/student/dashboard')}>Back to Dashboard</Button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="mb-2">
        <h1 className="text-2xl font-bold text-gray-900">Submit Course Feedback</h1>
        <p className="text-sm text-gray-500 mt-1">Your detailed feedback is essential for maintaining high academic standards.</p>
      </div>

      {/* Course Info */}
      <Card className="my-6">
        <div className="flex items-center gap-4 px-6 py-4 border-l-4 border-invertis-blue">
          <div className="w-12 h-12 rounded-full bg-invertis-navy/10 flex items-center justify-center">
            <User size={20} className="text-invertis-navy" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-gray-900">{formData.subject_name}</h3>
            <p className="text-sm text-invertis-blue">{formData.subject_code || ''} • {formData.trainers?.trainer_name}</p>
          </div>
          <div className="flex gap-2">
            <Badge status="active">{formData.courses?.course_name}</Badge>
            <Badge status="pending">Mid-Term</Badge>
          </div>
        </div>
      </Card>

      {/* Rating Questions */}
      <div className="grid grid-cols-1 gap-4 mb-6">
        {QUESTIONS.map((q, idx) => (
          <Card key={q.id}>
            <CardBody className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">
                  <span className="text-gray-400 mr-2">{idx + 1}.</span>
                  {q.question_text}
                </p>
              </div>
              <StarRating value={ratings[q.id] || 0} onChange={(val) => handleRating(q.id, val)} max={7} size={18} />
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Written Feedback */}
      <Card className="mb-6">
        <CardBody>
          <h3 className="font-bold text-gray-900 mb-4">Detailed Written Review</h3>
          <textarea
            value={writtenFeedback}
            onChange={(e) => setWrittenFeedback(e.target.value)}
            placeholder="Please provide detailed feedback, constructive criticism, or suggestions..."
            rows={5}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-invertis-blue/20 focus:border-invertis-blue resize-none transition-all"
          />
          <p className="text-xs text-gray-400 mt-1">{writtenFeedback.length} characters (minimum 10)</p>
        </CardBody>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3">
        <Button variant="secondary" onClick={() => navigate('/student/dashboard')}>Cancel</Button>
        <Button onClick={handleSubmit} disabled={!canSubmit || submitting} icon={ArrowRight} iconPosition="right">
          {submitting ? 'Submitting...' : 'Submit Feedback'}
        </Button>
      </div>
    </div>
  )
}
