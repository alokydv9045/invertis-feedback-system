import { useState } from 'react';
import { motion } from 'framer-motion';

export default function RatingScale({ value, onChange }) {
  const [hovered, setHovered] = useState(null);

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

  const getRatingColor = (num) => {
    if (num <= 2) return 'from-red-500 to-red-400';
    if (num <= 4) return 'from-amber-500 to-amber-400';
    return 'from-invertis-blue to-invertis-light-blue';
  };

  return (
    <div className="flex flex-col gap-2 select-none">
      <div className="flex flex-wrap gap-2.5 items-center">
        {[1, 2, 3, 4, 5, 6, 7].map((num) => {
          const isActive = hovered !== null
            ? num <= hovered
            : num <= (value || 0);
          const isExactSelection = num === value;

          return (
            <motion.button
              type="button"
              key={num}
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onChange(num)}
              onMouseEnter={() => setHovered(num)}
              onMouseLeave={() => setHovered(null)}
              aria-label={`Rate ${num} out of 7 — ${getRatingLabel(num)}`}
              className={`w-12 h-12 flex items-center justify-center rounded-2xl text-base font-bold transition-all duration-200 shadow-sm cursor-pointer border ${
                isActive
                  ? `bg-gradient-to-br ${getRatingColor(hovered || value)} border-transparent text-white shadow-lg shadow-invertis-blue/25 ${isExactSelection ? 'ring-4 ring-blue-100' : ''}`
                  : 'bg-gray-50 text-gray-700 hover:bg-blue-50 hover:border-invertis-blue/30 border-gray-200'
              }`}
            >
              {num}
            </motion.button>
          );
        })}
      </div>

      {(value || hovered) && (
        <motion.p
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm font-semibold text-invertis-blue mt-1"
        >
          {hovered
            ? `${hovered} — ${getRatingLabel(hovered)}`
            : `Selected: ${value} — ${getRatingLabel(value)}`}
        </motion.p>
      )}
    </div>
  );
}
