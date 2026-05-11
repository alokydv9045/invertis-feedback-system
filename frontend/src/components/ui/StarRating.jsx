import { Star } from 'lucide-react'

export function StarRating({ value = 0, onChange, max = 7, readOnly = false, size = 20 }) {
  return (
    <div className="star-rating flex items-center gap-1">
      {Array.from({ length: max }, (_, i) => i + 1).map((star) => (
        <button
          key={star}
          type="button"
          disabled={readOnly}
          onClick={() => onChange?.(star)}
          className={`star transition-all duration-150 ${
            star <= value ? 'filled text-amber-400' : 'empty text-gray-300'
          } ${readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-110'}`}
        >
          <Star size={size} fill={star <= value ? 'currentColor' : 'none'} />
        </button>
      ))}
      {value > 0 && (
        <span className="ml-2 text-sm font-semibold text-gray-600">{value}/{max}</span>
      )}
    </div>
  )
}
