export function LoadingSpinner({ size = 'md' }) {
  const sizeMap = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12' }
  return (
    <div className="flex items-center justify-center p-8">
      <div className={`${sizeMap[size]} border-3 border-gray-200 border-t-invertis-blue rounded-full animate-spin`}></div>
    </div>
  )
}
