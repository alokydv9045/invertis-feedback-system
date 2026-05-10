import { useAuth } from '../context/AuthContext';
import { Search, Bell, User, Settings } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Navbar() {
  const { user } = useAuth();

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 flex items-center justify-between px-8 py-3 bg-white border-b border-[#e2e8f0] select-none shadow-sm"
    >
      <div className="flex items-center gap-6">
        <div className="hidden md:flex items-center bg-[#f5f7fa] px-4 py-2 rounded border border-[#e2e8f0] group focus-within:border-[#2d3fe0] transition-all">
          <Search size={16} className="text-gray-400 group-focus-within:text-[#2d3fe0]" />
          <input 
            type="text" 
            placeholder="Search categories..." 
            className="bg-transparent border-none outline-none text-xs ml-3 w-64 placeholder-gray-400"
          />
        </div>
      </div>

      <div className="flex items-center gap-5">
        <div className="flex items-center gap-2 pr-5 border-r border-[#e2e8f0]">
          <button className="p-2 text-gray-400 hover:text-[#2d3fe0] transition-colors">
            <Bell size={18} />
          </button>
          <button className="p-2 text-gray-400 hover:text-[#2d3fe0] transition-colors">
            <Settings size={18} />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-[11px] font-bold text-slate-900">{user?.name}</p>
            <p className="text-[9px] uppercase tracking-widest text-gray-400 font-black">{user?.role}</p>
          </div>
          <div className="h-9 w-9 rounded-full bg-[#f5f7fa] border border-[#e2e8f0] flex items-center justify-center text-[#1a2233] font-bold shadow-sm cursor-pointer hover:border-[#2d3fe0] transition-colors">
            {user?.name?.[0] || 'U'}
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
