import { motion } from 'framer-motion'
import { X } from 'lucide-react'

export function Alert({ type = 'info', children, onClose, className = '' }) {
  const styles = {
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    error: 'bg-red-50 text-red-600 border-red-200',
    info: 'bg-blue-50 text-blue-600 border-blue-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
  }

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className={`p-3 border text-sm font-semibold rounded-lg flex items-center justify-between ${styles[type] || styles.info} ${className}`}
    >
      <span>{children}</span>
      {onClose && (
        <button
          onClick={onClose}
          className="cursor-pointer p-0.5 rounded hover:bg-black/5 transition-colors"
          aria-label="Dismiss"
        >
          <X size={14} />
        </button>
      )}
    </motion.div>
  )
}
