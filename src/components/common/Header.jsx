import React, { useContext } from 'react';
import { AuthContext } from '../../store/authContext';
import { LogOut, User, Bell, Search, ShieldCheck, Menu } from 'lucide-react';

const Header = ({ onToggleSidebar }) => {
  const { user, logout } = useContext(AuthContext);

  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 flex items-center justify-between px-4 md:px-6 shadow-xs">
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger Toggle */}
        <button
          onClick={onToggleSidebar}
          className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Search Bar */}
        <div className="hidden sm:flex items-center gap-2 bg-slate-100 rounded-lg px-3 py-1.5 text-sm text-slate-500 w-48 md:w-80 border border-slate-200">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search leads, phone, email..."
            className="bg-transparent border-none outline-none text-xs text-slate-700 w-full placeholder-slate-400"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-4">
        <div className="hidden lg:flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-medium border border-emerald-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Kevalon CRM Live
        </div>

        <button className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-500 rounded-full"></span>
        </button>

        <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>

        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-brand-100 text-brand-700 font-bold flex items-center justify-center text-xs md:text-sm border border-brand-200">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'K'}
          </div>

          <div className="hidden sm:block text-left">
            <p className="text-xs font-semibold text-slate-800 leading-tight">{user?.name || 'User'}</p>
            <p className="text-[10px] text-slate-500 flex items-center gap-1 capitalize">
              <ShieldCheck className="w-3 h-3 text-brand-600" />
              {user?.role || 'Sales'}
            </p>
          </div>

          <button
            onClick={logout}
            title="Sign out"
            className="p-1.5 md:p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors ml-1"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
