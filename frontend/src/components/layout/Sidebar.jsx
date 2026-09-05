import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Clock,
  FileText,
  CalendarDays,
  CalendarCheck,
  BarChart3,
  ChevronLeft,
  X,
  LogOut,
  BadgeDollarSign,
  Calculator,
  Receipt,
  Layers,
  Sliders,
} from 'lucide-react';
import { NAV_ITEMS, PAYROLL_NAV_ITEMS, APP_ROLE } from '../../constants/navigation';
import { useHRData } from '../../context/HRDataContext';

const ICON_MAP = {
  LayoutDashboard,
  Users,
  Clock,
  FileText,
  CalendarDays,
  CalendarCheck,
  BarChart3,
  BadgeDollarSign,
  Calculator,
  Receipt,
  Layers,
  Sliders,
};

export default function Sidebar({ isCollapsed, onToggleCollapse, isMobileOpen, onCloseMobile }) {
  const navigate = useNavigate();
  const { kpis, payruns, currentRole, setCurrentRole } = useHRData();

  const getBadgeValue = (key) => {
    if (key === 'pendingTimeOff') return kpis.pendingTimeOff;
    if (key === 'attendanceExceptions') return kpis.attendanceExceptions;
    if (key === 'totalEmployees') return kpis.totalEmployees;
    return null;
  };

  const pendingPayrunsCount = payruns?.filter(p => p.status === 'Draft' || p.status === 'Validation Required').length || 0;

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    sessionStorage.removeItem('authToken');
    window.location.reload();
  };

  const renderNav = (items, collapsed, isMobile) =>
    items.map((item) => {
      const Icon = ICON_MAP[item.icon] || LayoutDashboard;
      const badge = item.badgeKey ? getBadgeValue(item.badgeKey) : null;

      return (
        <NavLink
          key={item.path}
          to={item.path}
          end={item.path === '/'}
          onClick={isMobile ? onCloseMobile : undefined}
          title={collapsed ? item.label : undefined}
          className={({ isActive }) =>
            `group relative flex items-center rounded-2xl py-2.5 text-sm font-medium transition-colors ${
              isActive
                ? 'bg-brand-400 text-slate-900 font-semibold shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            } ${collapsed ? 'justify-center px-2' : 'px-3'}`
          }
        >
          <Icon className="h-[18px] w-[18px] shrink-0" />
          <span
            className={`truncate whitespace-nowrap transition-all ${
              collapsed ? 'ml-0 max-w-0 overflow-hidden opacity-0' : 'ml-3 max-w-[150px] opacity-100'
            }`}
          >
            {item.label}
          </span>
          {!collapsed && badge > 0 && item.badgeKey !== 'totalEmployees' && (
            <span className="ml-auto rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-bold text-slate-700">
              {badge}
            </span>
          )}
          {collapsed && badge > 0 && item.badgeKey !== 'totalEmployees' && (
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-amber-400" />
          )}
        </NavLink>
      );
    });

  const renderSidebarBody = (collapsed, isMobile = false) => (
    <div className="flex h-full flex-col bg-white text-slate-700">
      <div className="flex h-[72px] shrink-0 items-center justify-between px-4 border-b border-slate-100">
        <div className="flex items-center overflow-hidden">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-brand-400 text-slate-900 font-bold shadow-sm">
            P
          </div>
          <div
            className={`overflow-hidden whitespace-nowrap transition-all ${
              collapsed ? 'ml-0 max-w-0 opacity-0' : 'ml-2.5 max-w-[160px] opacity-100'
            }`}
          >
            <span className="block text-sm font-bold tracking-tight text-slate-900">PeoplePay360</span>
            <span className="block text-[11px] font-medium text-slate-500">HR & Payroll Workspace</span>
          </div>
        </div>
        {isMobile ? (
          <button
            type="button"
            onClick={onCloseMobile}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        ) : (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="hidden h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 md:flex"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <ChevronLeft className={`h-4 w-4 transition-transform ${collapsed ? 'rotate-180' : ''}`} />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-4 pt-3 space-y-5">
        <div>
          <p
            className={`mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400 ${
              collapsed ? 'sr-only' : ''
            }`}
          >
            HR Management
          </p>
          <nav className="space-y-1">{renderNav(NAV_ITEMS.filter((item) => !item.isSecondary), collapsed, isMobile)}</nav>
        </div>

        {currentRole === 'HR_PAYROLL_USER' && (
          <div>
            <div className="flex items-center justify-between px-3 mb-2">
              <p
                className={`text-[10px] font-bold uppercase tracking-[0.14em] text-brand-700 ${
                  collapsed ? 'sr-only' : ''
                }`}
              >
                Payroll Center
              </p>
              {!collapsed && pendingPayrunsCount > 0 && (
                <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold text-amber-800">
                  {pendingPayrunsCount} Action
                </span>
              )}
            </div>
            <nav className="space-y-1">{renderNav(PAYROLL_NAV_ITEMS, collapsed, isMobile)}</nav>
          </div>
        )}

        <div>
          <p
            className={`mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400 ${
              collapsed ? 'sr-only' : ''
            }`}
          >
            Analytics
          </p>
          <nav className="space-y-1">{renderNav(NAV_ITEMS.filter((item) => item.isSecondary), collapsed, isMobile)}</nav>
        </div>
      </div>

      <div className="shrink-0 border-t border-slate-100 p-3">
        <div className={`flex items-center rounded-2xl bg-slate-50 p-2.5 ${collapsed ? 'justify-center' : 'gap-2.5'}`}>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-400 text-xs font-bold text-slate-900 shadow-sm">
            {currentRole === 'HR_MANAGER' ? 'HR' : 'PR'}
          </div>
          <div className={`min-w-0 ${collapsed ? 'hidden' : 'flex-1'}`}>
            <p className="truncate text-xs font-bold text-slate-900">Alex Morgan</p>
            <p className="truncate text-[11px] font-bold text-brand-700">
              {currentRole === 'HR_MANAGER' ? 'HR Manager' : 'HR Payroll User'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            navigate('/login');
          }}
          className={`mt-2 flex w-full items-center rounded-2xl px-2.5 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-800 ${
            collapsed ? 'justify-center' : 'gap-2'
          }`}
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside
        className={`hidden shrink-0 border-r border-slate-200/80 bg-white md:flex md:flex-col ${
          isCollapsed ? 'w-[84px]' : 'w-[260px]'
        }`}
      >
        {renderSidebarBody(isCollapsed, false)}
      </aside>

      <div
        className={`fixed inset-0 z-50 bg-slate-900/30 transition-opacity md:hidden ${
          isMobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onCloseMobile}
        aria-hidden="true"
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 max-w-xs flex-col border-r border-slate-200 bg-white shadow-dropdown md:hidden ${
          isMobileOpen ? 'translate-x-0' : 'pointer-events-none -translate-x-full'
        }`}
        aria-label="Mobile Navigation"
      >
        {renderSidebarBody(false, true)}
      </aside>
    </>
  );
}
