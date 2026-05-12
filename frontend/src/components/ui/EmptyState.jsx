export function EmptyState({ icon: Icon, title, message }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {Icon && (
        <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mb-4">
          <Icon size={24} className="text-gray-300" />
        </div>
      )}
      <h3 className="text-sm font-bold text-gray-700 mb-1">{title}</h3>
      {message && <p className="text-xs text-gray-400 max-w-xs">{message}</p>}
    </div>
  )
}
