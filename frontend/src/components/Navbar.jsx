import { useAuth } from '../context/AuthContext';
import { Sun, Moon, LogOut, Shield, Building2, GraduationCap } from 'lucide-react';
import { motion } from 'framer-motion';

const ROLE_COLORS = {
  admin: 'bg-violet-50 text-violet-600 border-violet-100',
  hod:   'bg-blue-50 text-blue-600 border-blue-100',
  student: 'bg-emerald-50 text-emerald-600 border-emerald-100',
};
const ROLE_ICONS = { admin: Shield, hod: Building2, student: GraduationCap };

export default function Navbar({ onMenuClick }) {
  const { user } = useAuth();

  return (
    <header className="flex justify-between items-center w-full px-4 md:px-8 h-16 z-40 bg-white/80 backdrop-blur-xl border-b border-[#e0e0e0] shadow-sm sticky top-0 transition-all duration-300">
      <div className="flex items-center gap-4 md:gap-8">
        <button 
          onClick={onMenuClick}
          className="p-2 text-[#ff6b00] hover:bg-[#f5f5f5] rounded-lg md:hidden cursor-pointer"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>
        <span className="text-lg md:text-xl font-bold text-[#1A1A1A]">Dashboard</span>
        <div className="hidden sm:flex bg-[#f9f9f9] rounded-full px-4 py-1.5 items-center gap-2 border border-[#e0e0e0]">
          <span className="material-symbols-outlined text-[#474747] text-[20px]">search</span>
          <input
            className="bg-transparent border-none focus:ring-0 text-sm text-[#1A1A1A] placeholder:text-[#474747]/50 w-32 lg:w-64"
            placeholder="Search data..."
            type="text"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <div className="flex items-center gap-1 md:gap-2 pr-2 md:pr-6 border-r border-[#e0e0e0]">
          <button className="p-2 text-[#474747] hover:bg-[#f5f5f5] rounded-full transition-colors cursor-pointer">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button className="p-2 text-[#474747] hover:bg-[#f5f5f5] rounded-full transition-colors cursor-pointer">
            <span className="material-symbols-outlined">help</span>
          </button>
        </div>

        <div className="flex items-center gap-2 md:gap-3 pl-2 md:pl-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-[#1A1A1A]">{user?.name || 'Alex Rivera'}</p>
            <p className="text-[10px] font-bold text-[#474747] uppercase tracking-wider">{user?.role || 'System Admin'}</p>
          </div>
          <img
            alt="Profile photo"
            className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-[#ff6b00] object-cover shadow-sm"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAKvSCXIgJi4yqwGI1klz6Pm-VGWszFULwdtx-D7Z7rLk9Smak56ratiRPiuMMag4wdrJrEeR8cm8ilY30lGlTEaoPZlu9Tl_umAQYI89BLFPLPI7e3AJH6qa-SfwbhOvb4_-8fjx6AaxpnEjr7navlsxVHGXDbBR7YjHvIB_I93dTo-SowZgupnCk8ICmyGdHczb_4RsoSqhrCmBO0IOzpM32UWkjt8EViL0I53jmnaGLEYrRdXO5SKxfcS3yFTS-3Eq6xn_W_3m8"
          />
        </div>
      </div>
    </header>
  );
}
