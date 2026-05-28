export function Input({ label, error, icon: Icon, className = '', ...props }) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-semibold text-gray-700">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
          />
        )}
        <input
          className={`w-full px-4 py-3 bg-gray-50 border rounded-lg text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-invertis-blue/20 focus:border-invertis-blue text-gray-900 placeholder-gray-400 ${
            Icon ? 'pl-10' : ''
          } ${
            error ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500' : 'border-gray-200'
          } ${
            props.disabled ? 'opacity-50 cursor-not-allowed' : ''
          } ${className}`}
          {...props}
        />
      </div>
      {error && (
        <p role="alert" className="text-xs text-red-500 font-medium">{error}</p>
      )}
    </div>
  )
}
