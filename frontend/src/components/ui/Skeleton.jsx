export function Skeleton({ className = '', rounded = 'rounded-xl' }) {
  return (
    <div className={`animate-pulse bg-gray-200 ${rounded} ${className}`} />
  )
}

export function CardSkeleton() {
  return (
    <div className="p-6 rounded-2xl border border-gray-100 space-y-4 bg-white">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-20 w-full" />
    </div>
  )
}

export function TableRowSkeleton({ cols = 4 }) {
  return (
    <div className="flex items-center gap-4 p-4">
      {Array.from({ length: cols }).map((_, i) => (
        <Skeleton key={i} className={`h-4 ${i === 0 ? 'w-10' : 'flex-1'}`} />
      ))}
    </div>
  )
}
