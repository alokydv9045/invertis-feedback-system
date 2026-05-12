export function LoadingSpinner({ size = 'md' }) {
  const s = size === 'lg' ? 'w-10 h-10' : size === 'sm' ? 'w-5 h-5' : 'w-7 h-7'
  return (
    <div className="flex items-center justify-center py-20">
      <div className={`${s} border-3 border-gray-200 border-t-invertis-blue rounded-full animate-spin`} />
    </div>
  )
}
