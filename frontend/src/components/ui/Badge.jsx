const statusColors = {
  active: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  live: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  closed: 'bg-gray-100 text-gray-600 ring-1 ring-gray-200',
  suspended: 'bg-red-50 text-red-600 ring-1 ring-red-200',
  pending: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  high: 'bg-red-50 text-red-600 ring-1 ring-red-200',
  completed: 'bg-blue-50 text-blue-600 ring-1 ring-blue-200',
}

export function Badge({ status, children, className = '' }) {
  const color = statusColors[status?.toLowerCase()] || 'bg-gray-100 text-gray-600'
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${color} ${className}`}>
      {children || status}
    </span>
  )
}
