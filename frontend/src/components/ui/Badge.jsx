const statusStyles = {
  active: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  pending: 'bg-amber-50 text-amber-600 border-amber-200',
  closed: 'bg-gray-100 text-gray-500 border-gray-200',
  high: 'bg-red-50 text-red-600 border-red-200',
  completed: 'bg-blue-50 text-blue-600 border-blue-200',
  default: 'bg-gray-50 text-gray-600 border-gray-200',
}

export function Badge({ children, status = 'default', className = '' }) {
  const style = statusStyles[status] || statusStyles.default
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${style} ${className}`}>
      {children}
    </span>
  )
}
