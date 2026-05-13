export function Tabs({ tabs, activeTab, onTabChange, className = '' }) {
  return (
    <div className={`flex bg-gray-100 rounded-lg p-1 w-fit flex-wrap ${className}`}>
      {tabs.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => onTabChange(id)}
          className={`flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-md transition-all duration-200 cursor-pointer ${
            activeTab === id
              ? 'bg-white text-invertis-blue shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {Icon && <Icon size={14} />}
          {label}
        </button>
      ))}
    </div>
  )
}
