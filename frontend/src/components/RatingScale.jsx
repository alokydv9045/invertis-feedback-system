import { motion } from 'framer-motion';

export default function RatingScale({ value, onChange }) {
  const getRatingLabel = (num) => {
    switch (num) {
      case 1: return 'Very Poor';
      case 2: return 'Poor';
      case 3: return 'Below Avg';
      case 4: return 'Neutral';
      case 5: return 'Above Avg';
      case 6: return 'Very Good';
      case 7: return 'Excellent';
      default: return '';
    }
  };

  return (
    <div className="flex flex-col gap-2 select-none">
      <div className="flex flex-wrap gap-2.5 items-center">
        {[1, 2, 3, 4, 5, 6, 7].map((num) => {
          const isSelected = value === num;

          return (
            <motion.button
              type="button"
              key={num}
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onChange(num)}
              className={`w-12 h-12 flex items-center justify-center rounded-2xl text-base font-bold transition-all duration-200 shadow-sm cursor-pointer border ${
                isSelected
                  ? 'bg-primary-600 border-primary-600 text-white scale-110 shadow-lg shadow-primary-300 dark:shadow-primary-950/40 ring-4 ring-primary-100 dark:ring-primary-900/30'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-[var(--text-main)] hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:border-primary-300 dark:hover:border-primary-700 border-slate-200 dark:border-slate-700'
              }`}
            >
              {num}
            </motion.button>
          );
        })}
      </div>

      {value && (
        <motion.p
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm font-semibold text-primary-600 dark:text-primary-400 mt-1"
        >
          Selected: {value} — {getRatingLabel(value)}
        </motion.p>
      )}
    </div>
  );
}
