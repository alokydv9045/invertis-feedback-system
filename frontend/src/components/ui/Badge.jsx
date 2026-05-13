const statusStyles = {
  active: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  pending: 'bg-amber-50 text-amber-600 border-amber-200',
  closed: 'bg-gray-100 text-gray-500 border-gray-200',
  high: 'bg-red-50 text-red-600 border-red-200',
  completed: 'bg-blue-50 text-blue-600 border-blue-200',
  default: 'bg-gray-50 text-gray-600 border-gray-200',
}

// Additional color-based styles (new API, optional)
const colorStyles = {
  blue: 'bg-blue-50 text-blue-700 border-blue-200',
  green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  orange: 'bg-orange-50 text-orange-700 border-orange-200',
  red: 'bg-red-50 text-red-700 border-red-200',
  purple: 'bg-purple-50 text-purple-700 border-purple-200',
}

export function Badge({ children, status = 'default', color, className = '' }) {
  // color prop takes priority if provided, otherwise use status
  const style = color
    ? (colorStyles[color] || colorStyles.blue)
    : (statusStyles[status] || statusStyles.default)

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${style} ${className}`}>
      {children}
    </span>
  )
}
