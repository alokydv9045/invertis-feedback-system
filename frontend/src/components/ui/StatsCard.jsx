import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

const bgColors = {
  blue: 'bg-blue-50 text-blue-600',
  orange: 'bg-orange-50 text-orange-600',
  green: 'bg-emerald-50 text-emerald-600',
  purple: 'bg-purple-50 text-purple-600',
  red: 'bg-red-50 text-red-600',
  indigo: 'bg-indigo-50 text-indigo-600',
}

export function StatsCard({ icon: Icon, label, value, trend, trendLabel, color = 'blue' }) {
  const isPositive = trend > 0
  const isNeutral = trend === 0 || trend === undefined || trend === null

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-card p-5 hover:shadow-card-hover transition-all duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-11 h-11 rounded-lg ${bgColors[color]} flex items-center justify-center`}>
          <Icon size={20} />
        </div>
        {!isNeutral && (
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
            isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
          }`}>
            {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {isPositive ? '+' : ''}{trend}%
          </span>
        )}
        {isNeutral && trendLabel && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-500">
            {trendLabel}
          </span>
        )}
      </div>
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  )
}
