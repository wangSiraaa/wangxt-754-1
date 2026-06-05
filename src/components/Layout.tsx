import { NavLink, Outlet } from 'react-router-dom';
import { MapPin, ClipboardCheck, Filter, Download, Users } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { ROLE_LABELS } from '@/types';
import type { UserRole } from '@/types';

const NAV_ITEMS = [
  { to: '/', label: '巡检总览', icon: MapPin },
  { to: '/points', label: '点位管理', icon: Filter },
  { to: '/export', label: '数据导出', icon: Download },
];

const ROLES: UserRole[] = ['cleaner', 'supervisor', 'citizen'];

export default function Layout() {
  const { currentUser, setRole } = useAppStore();

  return (
    <div className="flex h-screen bg-slate-50">
      <aside className="w-64 bg-teal-800 text-white flex flex-col shrink-0">
        <div className="px-5 py-6 border-b border-teal-700">
          <h1 className="text-lg font-bold tracking-wide">公厕巡检系统</h1>
          <p className="text-teal-300 text-xs mt-1">城市保洁巡检管理平台</p>
        </div>

        <nav className="flex-1 py-4">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-5 py-3 text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-teal-700 text-white border-r-3 border-amber-400'
                    : 'text-teal-200 hover:bg-teal-700/50 hover:text-white'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="px-5 py-4 border-t border-teal-700">
          <div className="flex items-center gap-2 mb-3">
            <Users size={14} className="text-teal-300" />
            <span className="text-xs text-teal-300">角色切换</span>
          </div>
          <div className="flex flex-col gap-1.5">
            {ROLES.map((role) => (
              <button
                key={role}
                onClick={() => setRole(role)}
                className={`text-left text-xs px-3 py-1.5 rounded-full transition-all duration-200 ${
                  currentUser.role === role
                    ? 'bg-amber-500 text-white font-medium'
                    : 'bg-teal-700/50 text-teal-200 hover:bg-teal-600'
                }`}
              >
                {ROLE_LABELS[role]}
              </button>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-teal-700">
            <p className="text-xs text-teal-300">
              当前：<span className="text-white font-medium">{currentUser.name}</span>
            </p>
            <p className="text-xs text-teal-400">{ROLE_LABELS[currentUser.role]} · {currentUser.district || '全市'}</p>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
