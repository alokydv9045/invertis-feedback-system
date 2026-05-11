import { Inbox } from 'lucide-react'
import { Button } from './Button'

export function EmptyState({ icon: Icon = Inbox, title = 'No data found', message = '', actionLabel, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
        <Icon size={28} className="text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-700 mb-1">{title}</h3>
      {message && <p className="text-sm text-gray-400 max-w-sm mb-4">{message}</p>}
      {actionLabel && onAction && (
        <Button onClick={onAction} size="sm">{actionLabel}</Button>
      )}
    </div>
  )
}
