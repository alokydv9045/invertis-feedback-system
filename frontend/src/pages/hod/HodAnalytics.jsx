import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardBody } from '@/components/ui/Card'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { QUESTIONS } from '@/lib/constants'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

export default function HodAnalytics() {
  const [trainerData, setTrainerData] = useState([])
  const [questionData, setQuestionData] = useState([])
  const [sentimentData, setSentimentData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadAnalytics() }, [])

  async function loadAnalytics() {
    try {
      const { data: answers } = await supabase
        .from('review_answers')
        .select('question_id, rating_value, reviews(feedback_forms(trainer_id, trainers(trainer_name)))')

      if (!answers || answers.length === 0) { setLoading(false); return }

      // Trainer performance
      const trainerScores = {}
      answers.forEach(a => {
        const tname = a.reviews?.feedback_forms?.trainers?.trainer_name
        if (!tname) return
        if (!trainerScores[tname]) trainerScores[tname] = { total: 0, count: 0 }
        trainerScores[tname].total += a.rating_value
        trainerScores[tname].count++
      })
      setTrainerData(
        Object.entries(trainerScores)
          .map(([name, s]) => ({ name: name.split(' ').slice(-2).join(' '), avg: parseFloat((s.total / s.count).toFixed(1)) }))
          .sort((a, b) => b.avg - a.avg).slice(0, 8)
      )

      // Question breakdown
      const qScores = {}
      answers.forEach(a => {
        if (!qScores[a.question_id]) qScores[a.question_id] = { total: 0, count: 0 }
        qScores[a.question_id].total += a.rating_value
        qScores[a.question_id].count++
      })
      const qLabels = {}
      QUESTIONS.forEach(q => { qLabels[q.id] = q.short_label || q.question_text.split(' ').slice(0, 2).join(' ') })
      setQuestionData(Object.entries(qScores).map(([qid, s]) => ({
        question: qLabels[qid] || qid, avg: parseFloat((s.total / s.count).toFixed(1)),
      })))

      // Sentiment
      let positive = 0, neutral = 0, negative = 0
      answers.forEach(a => {
        if (a.rating_value >= 5) positive++
        else if (a.rating_value >= 3) neutral++
        else negative++
      })
      const total = positive + neutral + negative
      setSentimentData([
        { name: 'Positive', value: Math.round((positive / total) * 100), color: '#10B981' },
        { name: 'Neutral', value: Math.round((neutral / total) * 100), color: '#F59E0B' },
        { name: 'Negative', value: Math.round((negative / total) * 100), color: '#EF4444' },
      ])
    } catch (err) { console.error('Analytics error:', err) }
    finally { setLoading(false) }
  }

  if (loading) return <LoadingSpinner size="lg" />

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Department Analytics</h1>
        <p className="text-sm text-gray-500 mt-1">Performance insights from real feedback data</p>
      </div>
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-8">
          <Card><CardBody>
            <h3 className="font-bold text-gray-900 mb-4">Trainer Performance</h3>
            {trainerData.length === 0 ? <p className="text-sm text-gray-400 text-center py-8">No ratings yet</p> : (
              <div className="h-72"><ResponsiveContainer width="100%" height="100%">
                <BarChart data={trainerData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis type="number" domain={[0, 7]} tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 12, fill: '#6B7280' }} width={120} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB' }} />
                  <Bar dataKey="avg" fill="#1A56DB" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer></div>
            )}
          </CardBody></Card>
        </div>
        <div className="col-span-4">
          <Card><CardBody>
            <h3 className="font-bold text-gray-900 mb-4">Review Sentiment</h3>
            {sentimentData.length === 0 ? <p className="text-sm text-gray-400 text-center py-8">No data</p> : (<>
              <div className="h-52"><ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={sentimentData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" stroke="none">
                    {sentimentData.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie><Tooltip />
                </PieChart>
              </ResponsiveContainer></div>
              <div className="flex justify-center gap-4 mt-2">
                {sentimentData.map(s => (
                  <div key={s.name} className="flex items-center gap-1.5 text-xs text-gray-500">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />{s.name} ({s.value}%)
                  </div>
                ))}
              </div>
            </>)}
          </CardBody></Card>
        </div>
      </div>
      <Card><CardBody>
        <h3 className="font-bold text-gray-900 mb-4">Average Scores by Question</h3>
        {questionData.length === 0 ? <p className="text-sm text-gray-400 text-center py-8">No data</p> : (
          <div className="h-64"><ResponsiveContainer width="100%" height="100%">
            <BarChart data={questionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="question" tick={{ fontSize: 11, fill: '#9CA3AF' }} />
              <YAxis domain={[0, 7]} tick={{ fontSize: 12, fill: '#9CA3AF' }} />
              <Tooltip /><Bar dataKey="avg" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer></div>
        )}
      </CardBody></Card>
    </div>
  )
}
