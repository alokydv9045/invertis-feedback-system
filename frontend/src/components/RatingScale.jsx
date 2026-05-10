import { motion } from 'framer-motion';

const RATINGS = [
  { id: 5, label: 'Excellent', icon: 'fa-face-grin-stars', color: 'group-hover:border-emerald-500 group-hover:text-emerald-500', active: 'border-emerald-500 bg-emerald-50 text-emerald-600' },
  { id: 4, label: 'Good', icon: 'fa-face-smile', color: 'group-hover:border-blue-500 group-hover:text-blue-500', active: 'border-blue-500 bg-blue-50 text-blue-600' },
  { id: 3, label: 'Average', icon: 'fa-face-meh', color: 'group-hover:border-orange-500 group-hover:text-orange-500', active: 'border-orange-600 bg-orange-50 text-orange-600' },
  { id: 2, label: 'Fair', icon: 'fa-face-frown', color: 'group-hover:border-orange-400 group-hover:text-orange-400', active: 'border-orange-400 bg-orange-50 text-orange-500' },
  { id: 1, label: 'Poor', icon: 'fa-face-dizzy', color: 'group-hover:border-red-500 group-hover:text-red-500', active: 'border-red-500 bg-red-50 text-red-600' },
];

export default function RatingScale({ value, onChange }) {
  return (
    <div className="flex flex-col gap-6 select-none">
      <p className="text-sm text-gray-500 font-medium">Please rate based on your experience this semester:</p>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {RATINGS.map((rating) => {
          const isSelected = value === rating.id;

          return (
            <button
              key={rating.id}
              type="button"
              onClick={() => onChange(rating.id)}
              className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all group ${
                isSelected
                  ? rating.active + ' shadow-sm scale-105'
                  : 'border-transparent hover:bg-white hover:border-gray-200 hover:shadow-sm'
              }`}
            >
              <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center mb-3 text-2xl transition-all ${
                isSelected 
                  ? 'bg-current text-white border-transparent' 
                  : 'border-gray-300 text-gray-400 bg-white ' + rating.color
              }`}>
                <i className={`fa-regular ${rating.icon}`}></i>
              </div>
              <span className={`text-xs font-bold transition-colors ${
                isSelected ? 'text-current' : 'text-gray-500 group-hover:text-gray-700'
              }`}>
                {rating.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
