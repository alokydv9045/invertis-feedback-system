import { useAuth } from '../context/AuthContext';
import { useSidebar } from '../context/SidebarContext';
import { useNavigate } from 'react-router-dom';
import {
  LogOut, Shield, Building2, GraduationCap, Users, Crown,
  Menu, User
} from 'lucide-react';

const ROLE_CONFIG = {
  supreme:     { label: 'Supreme Authority', icon: Crown,         color: '#F59E0B' },
  super_admin: { label: 'Super Admin',        icon: Shield,        color: '#60A5FA' },
  coordinator: { label: 'Coordinator',        icon: Users,         color: '#34D399' },
  hod:         { label: 'Head of Dept',       icon: Building2,     color: '#A78BFA' },
  student:     { label: 'Student',            icon: GraduationCap, color: '#6EE7B7' },
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const { toggle, toggleProfile } = useSidebar();
  const navigate = useNavigate();
  const role = ROLE_CONFIG[user?.role] || ROLE_CONFIG.student;
  const RoleIcon = role.icon;

  return (
    <>
      {/* ── White logo header ──────────────────────────── */}
      <div className="w-full bg-white px-4 py-2.5 flex items-center justify-between shadow-sm shrink-0 border-b border-gray-100 z-40 relative">
        {/* Left: Hamburger + Logo */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={toggle}
            className="h-9 w-9 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-[#1D3557] hover:text-white text-slate-600 transition-all cursor-pointer border border-slate-200 hover:border-[#1D3557]"
            aria-label="Toggle sidebar"
          >
            <Menu size={18} />
          </button>

          <div className="flex items-center gap-3 cursor-pointer shrink-0" onClick={() => navigate('/dashboard')}>
            <img
              src="/main logo.png" alt="Invertis"
              className="h-10 object-contain"
              onError={e => { e.target.style.display = 'none'; }}
            />
            <div className="hidden sm:block">
              <div className="text-[#1D3557] font-bold text-base leading-tight">INVERTIS UNIVERSITY</div>
              <div className="text-gray-400 text-[9px] font-medium tracking-widest uppercase">Bareilly, Uttar Pradesh</div>
            </div>
          </div>
        </div>

        {/* Right: Profile + Name + Logout */}
        {user && (
          <div className="flex items-center gap-2">
            {/* User name (desktop only) */}
            <div className="hidden md:flex items-center gap-2.5 mr-1">
              <div className="text-right">
                <div className="text-xs font-bold text-[#1D3557] leading-none">{user.name}</div>
                <div className="flex items-center gap-1 justify-end mt-0.5">
                  <RoleIcon size={9} style={{ color: role.color }} />
                  <span className="text-[10px] text-gray-500">{role.label}</span>
                </div>
              </div>
            </div>

            {/* Profile avatar button */}
            <button
              onClick={toggleProfile}
              className="h-9 w-9 rounded-full bg-[#1D3557] flex items-center justify-center text-white font-bold text-sm shrink-0 hover:ring-2 hover:ring-[#FF2A00]/30 transition-all cursor-pointer overflow-hidden"
              aria-label="Open profile"
            >
              {user.profile_photo ? (
                <img src={user.profile_photo} alt="" className="h-full w-full object-cover" />
              ) : (
                user.name?.charAt(0) || 'U'
              )}
            </button>

            <div className="w-px h-6 bg-gray-200 mx-1" />

            <button
              onClick={logout}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded text-[11px] font-semibold text-white bg-[#FF2A00] hover:bg-[#CC2200] transition-all cursor-pointer"
            >
              <LogOut size={12} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        )}
      </div>

      {/* ── Red divider ───────────────────────────────────────── */}
      <div className="w-full h-[3px] bg-[#FF2A00] shrink-0 z-40 relative" />
    </>
  );
}
