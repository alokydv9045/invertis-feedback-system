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
    <div className="flex flex-col gap-4 select-none">
      <div className="flex flex-wrap gap-3 items-center">
        {[1, 2, 3, 4, 5, 6, 7].map((num) => {
          const isSelected = value === num;

          return (
            <motion.button
              type="button"
              key={num}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onChange(num)}
              className={`w-12 h-12 flex items-center justify-center rounded-xl text-sm font-black transition-all duration-300 shadow-sm cursor-pointer border ${
                isSelected
                  ? 'bg-[#ff6b00] border-[#ff6b00] text-white scale-110 shadow-lg shadow-[#ff6b00]/30 ring-4 ring-[#ff6b00]/10'
                  : 'bg-[#f9f9f9] text-[#474747] hover:bg-white hover:border-[#ff6b00]/30 border-[#e0e0e0]'
              }`}
            >
              {num}
            </motion.button>
          );
        })}
      </div>

      {value && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2 text-[10px] font-black text-[#ff6b00] uppercase tracking-[0.15em] bg-[#ff6b00]/5 px-4 py-2 rounded-lg border border-[#ff6b00]/10 w-fit"
        >
          <span className="material-symbols-outlined text-[16px]">verified</span>
          Selected: {value} — {getRatingLabel(value)}
        </motion.div>
      )}
    </div>
  );
}
