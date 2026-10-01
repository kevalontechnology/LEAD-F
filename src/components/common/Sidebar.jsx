import React, { useContext, useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../../store/authContext';
import api from '../../services/api';
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
  ShieldAlert,
  ShieldCheck,
  X,
  UserCheck
} from 'lucide-react';

const navItems = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'MANAGER', 'SALES'] },
  { label: 'Leads CRM', path: '/leads', icon: Users, roles: ['ADMIN', 'MANAGER', 'SALES'] },
  { label: 'Import Leads', path: '/import-leads', icon: FileSpreadsheet, roles: ['ADMIN', 'MANAGER', 'SALES'] },
  { label: 'Messages', path: '/messages', icon: MessageSquareText, roles: ['ADMIN', 'MANAGER', 'SALES'] },
  { label: 'Templates', path: '/templates', icon: FileCode, roles: ['ADMIN', 'MANAGER', 'SALES'] },
  { label: 'Follow-ups', path: '/followups', icon: CalendarCheck, roles: ['ADMIN', 'MANAGER', 'SALES'] },
  { label: 'Communications', path: '/communications', icon: History, roles: ['ADMIN', 'MANAGER', 'SALES'] },
  { label: 'Edit Approvals', path: '/approvals', icon: ShieldCheck, roles: ['ADMIN', 'MANAGER'], hasBadge: true },
  { label: 'Reports', path: '/reports', icon: BarChart3, roles: ['ADMIN', 'MANAGER', 'SALES'] },
  { label: 'Users', path: '/users', icon: UserCog, roles: ['ADMIN'] },
  { label: 'Settings', path: '/settings', icon: Settings, roles: ['ADMIN'] },
  { label: 'Audit Logs', path: '/audit-logs', icon: ShieldAlert, roles: ['ADMIN'] }
];

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useContext(AuthContext);
  const userRole = user?.role || 'SALES';
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState(0);

  useEffect(() => {
    if (['ADMIN', 'MANAGER'].includes(userRole)) {
      const fetchCount = async () => {
        try {
          const res = await api.get('/approvals/count');
          if (res.data.success) {
            setPendingApprovalsCount(res.data.count || 0);
          }
        } catch (err) {
          // ignore
        }
      };

      fetchCount();
      const interval = setInterval(fetchCount, 15000); // refresh count every 15s
      return () => clearInterval(interval);
    }
  }, [userRole]);

  const filteredNavItems = navItems.filter((item) =>
    !item.roles || item.roles.includes(userRole)
  );

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 z-40 md:hidden backdrop-blur-xs transition-opacity"
        ></div>
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-50 md:z-30 w-64 bg-slate-900 text-slate-300 flex flex-col h-screen border-r border-slate-800 transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="bg-white/95 p-1 rounded-xl shadow-xs border border-white/20">
              <img src="/logo.png" alt="Kevalon Technology Logo" className="h-8 object-contain" />
            </div>
          </div>

          {/* Close button on mobile */}
          <button
            onClick={onClose}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => onClose && onClose()}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-brand-600 text-white font-semibold shadow-sm'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/70'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="flex-1">{item.label}</span>
                {item.hasBadge && pendingApprovalsCount > 0 && (
                  <span className="bg-amber-500 text-slate-950 font-black px-2 py-0.5 rounded-full text-[10px] animate-pulse">
                    {pendingApprovalsCount}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* User Info Footer */}
        <div className="p-4 border-t border-slate-800 text-[11px] text-slate-400 space-y-1 bg-slate-950/40">
          <div className="flex items-center justify-between">
            <p className="font-bold text-slate-200 truncate">{user?.name || 'Kevalon User'}</p>
            <span className={`px-2 py-0.5 rounded text-[10px] font-black tracking-wide ${
              userRole === 'ADMIN'
                ? 'bg-purple-950 text-purple-300 border border-purple-800'
                : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
            }`}>
              {userRole}
            </span>
          </div>
          <p className="text-[10px] text-slate-500 truncate">{user?.email || 'sales@kevalontechnology.in'}</p>
          <p className="text-[9px] text-slate-600 pt-1 border-t border-slate-800/60">Kevalon Technology CRM v1.0</p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
