export function Card({ children, className = '', hover = false, ...props }) {
  return (
    <div
      className={`bg-white rounded-xl border border-gray-100 shadow-card ${
        hover ? 'hover:shadow-card-hover transition-shadow duration-200 cursor-pointer' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className = '' }) {
  return <div className={`px-6 py-4 border-b border-gray-50 ${className}`}>{children}</div>
}

export function CardBody({ children, className = '' }) {
  return <div className={`px-6 py-5 ${className}`}>{children}</div>
}
