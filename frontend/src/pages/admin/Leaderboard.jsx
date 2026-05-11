import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardBody } from '@/components/ui/Card'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { Trophy, Search, Users } from 'lucide-react'

const rankBg = ['bg-amber-400', 'bg-gray-400', 'bg-orange-600']

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadLeaderboard() }, [])

  async function loadLeaderboard() {
    try {
      const { data: reviews } = await supabase
        .from('reviews')
        .select('student_id, profiles(full_name, courses(course_name))')

      if (reviews) {
        const counts = {}
        reviews.forEach(r => {
          const sid = r.student_id
          if (!counts[sid]) counts[sid] = {
            name: r.profiles?.full_name || 'Unknown',
            course: r.profiles?.courses?.course_name || 'N/A',
            submissions: 0,
          }
          counts[sid].submissions++
        })
        const sorted = Object.values(counts)
          .sort((a, b) => b.submissions - a.submissions)
          .map((e, i) => ({ ...e, rank: i + 1 }))
        setLeaderboard(sorted)
      }
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const filtered = leaderboard.filter(e => e.name.toLowerCase().includes(search.toLowerCase()))

  if (loading) return <LoadingSpinner size="lg" />

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Trophy className="text-amber-500" size={24} /> Student Leaderboard
          </h1>
          <p className="text-sm text-gray-500 mt-1">Students ranked by feedback submissions</p>
        </div>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search students..."
            className="pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-invertis-blue/20" />
        </div>
      </div>

      {leaderboard.length === 0 ? (
        <Card><EmptyState icon={Users} title="No submissions yet" message="The leaderboard will populate once students submit feedback." /></Card>
      ) : (
        <>
          {/* Top 3 Podium */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {leaderboard.slice(0, 3).map(entry => (
              <Card key={entry.rank} hover>
                <CardBody className="text-center">
                  <div className={`w-12 h-12 rounded-full ${rankBg[entry.rank - 1]} text-white text-lg font-bold flex items-center justify-center mx-auto mb-3`}>
                    {entry.rank}
                  </div>
                  <div className="w-14 h-14 rounded-full bg-invertis-navy/10 text-invertis-navy text-lg font-bold flex items-center justify-center mx-auto mb-3">
                    {entry.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <h3 className="font-bold text-gray-900">{entry.name}</h3>
                  <p className="text-xs text-gray-400 mb-2">{entry.course}</p>
                  <p className="text-2xl font-bold text-invertis-blue">{entry.submissions}</p>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider">Submissions</p>
                </CardBody>
              </Card>
            ))}
          </div>

          {/* Full Table */}
          <Card>
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Rank</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Course</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-400 uppercase">Submissions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(e => (
                  <tr key={e.rank} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center ${
                        e.rank <= 3 ? `${rankBg[e.rank - 1]} text-white` : 'bg-gray-100 text-gray-500'
                      }`}>{e.rank}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-invertis-blue/10 text-invertis-blue text-xs font-bold flex items-center justify-center">
                          {e.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <span className="text-sm font-semibold text-gray-900">{e.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{e.course}</td>
                    <td className="px-6 py-4 text-right text-sm font-bold text-invertis-blue">{e.submissions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </>
      )}
    </div>
  )
}
