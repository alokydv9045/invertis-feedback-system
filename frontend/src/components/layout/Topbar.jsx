import { useAuth } from '@/context/AuthContext'
import { Bell, Settings, Search } from 'lucide-react'

export function Topbar() {
  const { profile } = useAuth()

  const initials = profile?.full_name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U'

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-100 px-6 py-3">
      <div className="flex items-center justify-between">
        {/* Left: Brand + Search */}
        <div className="flex items-center gap-6">
          <span className="text-invertis-blue font-bold text-lg">IFS <span className="text-gray-400 font-normal text-sm">v2.0</span></span>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-invertis-blue/20 focus:border-invertis-blue w-64 transition-all"
            />
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          <button className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors">
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          <button className="p-2 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors">
            <Settings size={20} />
          </button>
          <div className="flex items-center gap-3 ml-2 pl-4 border-l border-gray-200">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-gray-800">{profile?.full_name}</p>
              <p className="text-xs text-gray-400 capitalize">{profile?.role}</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-invertis-navy text-white flex items-center justify-center text-sm font-bold">
              {initials}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
