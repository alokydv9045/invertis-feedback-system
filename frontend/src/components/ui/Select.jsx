export function Select({ label, children, className = '', error, ...props }) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-semibold text-gray-700">
          {label}
        </label>
      )}
      <select
        className={`w-full px-4 py-3 bg-gray-50 border rounded-lg text-sm text-gray-900 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-invertis-blue/20 focus:border-invertis-blue ${
          error ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500' : 'border-gray-200'
        } ${
          props.disabled ? 'opacity-50 cursor-not-allowed' : ''
        } ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && (
        <p role="alert" className="text-xs text-red-500 font-medium">{error}</p>
      )}
    </div>
  )
}
