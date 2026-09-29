import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  FileSpreadsheet,
  MessageSquareText,
  FileCode,
  CalendarCheck,
  History,
  BarChart3,
  UserCog,
  Settings,
  ShieldAlert
} from 'lucide-react';

const navItems = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Leads CRM', path: '/leads', icon: Users },
  { label: 'Import Leads', path: '/import-leads', icon: FileSpreadsheet },
  { label: 'Messages', path: '/messages', icon: MessageSquareText },
  { label: 'Templates', path: '/templates', icon: FileCode },
  { label: 'Follow-ups', path: '/followups', icon: CalendarCheck },
  { label: 'Communications', path: '/communications', icon: History },
  { label: 'Reports', path: '/reports', icon: BarChart3 },
  { label: 'Users', path: '/users', icon: UserCog },
  { label: 'Settings', path: '/settings', icon: Settings },
  { label: 'Audit Logs', path: '/audit-logs', icon: ShieldAlert }
];

const Sidebar = () => {
  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-screen sticky top-0 z-40 border-r border-slate-800">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-slate-800 gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-blue-400 flex items-center justify-center text-white font-black text-lg shadow-md">
          K
        </div>
        <div>
          <h1 className="font-bold text-sm text-white tracking-wide leading-tight">KEVALON</h1>
          <p className="text-[10px] text-brand-400 font-medium tracking-wider uppercase">Outreach CRM System</p>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-brand-600 text-white font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/70'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800 text-[11px] text-slate-500">
        <p className="font-semibold text-slate-400">Kevalon Technology</p>
        <p className="text-[10px] mt-0.5">Harsh Kothari • CEO & Founder</p>
        <p className="text-[10px] text-slate-600 mt-1">v1.0.0 Enterprise Build</p>
      </div>
    </aside>
  );
};

export default Sidebar;
