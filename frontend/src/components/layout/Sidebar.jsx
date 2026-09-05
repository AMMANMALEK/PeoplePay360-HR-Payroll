import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Clock,
  FileText,
  CalendarDays,
  CalendarCheck,
  BarChart3,
  ShieldCheck,
  ChevronLeft,
  Layers,
  X
} from 'lucide-react';
import { NAV_ITEMS, APP_ROLE } from '../../constants/navigation';
import { useHRData } from '../../context/HRDataContext';

const ICON_MAP = {
  LayoutDashboard,
  Users,
  Clock,
  FileText,
  CalendarDays,
  CalendarCheck,
  BarChart3
};

export default function Sidebar({ isCollapsed, onToggleCollapse, isMobileOpen, onCloseMobile }) {
  const { kpis } = useHRData();

  const getBadgeValue = (key) => {
    if (key === 'pendingTimeOff') return kpis.pendingTimeOff;
    if (key === 'attendanceExceptions') return kpis.attendanceExceptions;
    if (key === 'totalEmployees') return kpis.totalEmployees;
    return null;
  };

  const mainNav = NAV_ITEMS.filter((item) => !item.isSecondary);
  const secondaryNav = NAV_ITEMS.filter((item) => item.isSecondary);

  // Helper function to render sidebar internal markup for both Desktop and Mobile
  const renderSidebarBody = (collapsed, isMobile = false) => (
    <div className="flex h-full flex-col justify-between bg-slate-900 text-slate-300 select-none">
      <div className="flex flex-col flex-1 min-h-0">
        {/* Brand Header */}
        <div className="flex h-16 shrink-0 items-center justify-between px-4 border-b border-slate-800">
          <div className="flex items-center overflow-hidden">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 text-white font-bold shadow-md shadow-indigo-500/20">
              <Layers className="h-5 w-5" />
            </div>
            <div
              className={`flex flex-col transition-all duration-300 ease-in-out overflow-hidden whitespace-nowrap ${
                collapsed ? 'max-w-0 opacity-0 ml-0' : 'max-w-[160px] opacity-100 ml-2.5'
              }`}
            >
              <span className="text-sm font-bold tracking-tight text-white">PeoplePay360</span>
              <span className="text-[10px] font-medium text-indigo-400 tracking-wider uppercase">HR Operations</span>
            </div>
          </div>

          {isMobile ? (
            <button
              type="button"
              onClick={onCloseMobile}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onToggleCollapse}
              className="hidden md:flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <ChevronLeft
                className={`h-4 w-4 transition-transform duration-300 ease-in-out ${
                  collapsed ? 'rotate-180' : ''
                }`}
              />
            </button>
          )}
        </div>

        {/* Scrollable Navigation Area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden scroll-smooth px-3 py-4 space-y-6">
          {/* Main Core Operations */}
          <div>
            <div
              className={`text-[10px] font-semibold uppercase tracking-wider text-slate-500 transition-all duration-300 ease-in-out overflow-hidden whitespace-nowrap ${
                collapsed ? 'max-h-0 opacity-0 mb-0 px-0' : 'max-h-6 opacity-100 mb-2 px-2'
              }`}
            >
              Core Operations
            </div>
            <nav className="space-y-1">
              {mainNav.map((item) => {
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
                      `group relative flex items-center rounded-lg py-2.5 text-xs font-medium transition-all duration-300 ease-in-out ${
                        isActive
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                      } ${collapsed ? 'justify-center px-2' : 'px-3'}`
                    }
                  >
                    <Icon className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:scale-110" />

                    <span
                      className={`truncate transition-all duration-300 ease-in-out whitespace-nowrap ${
                        collapsed ? 'max-w-0 opacity-0 ml-0 pointer-events-none' : 'max-w-[140px] opacity-100 ml-3'
                      }`}
                    >
                      {item.label}
                    </span>

                    {/* Badge when expanded */}
                    {!collapsed && badge > 0 && item.badgeKey !== 'totalEmployees' && (
                      <span className="ml-auto rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300 border border-amber-500/30 transition-opacity duration-300">
                        {badge}
                      </span>
                    )}

                    {/* Dot on collapsed badge */}
                    {collapsed && badge > 0 && item.badgeKey !== 'totalEmployees' && (
                      <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-amber-400 ring-2 ring-slate-900 transition-opacity duration-300" />
                    )}
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {/* Secondary / Analytics Navigation */}
          <div>
            <div
              className={`text-[10px] font-semibold uppercase tracking-wider text-slate-500 transition-all duration-300 ease-in-out overflow-hidden whitespace-nowrap ${
                collapsed ? 'max-h-0 opacity-0 mb-0 px-0' : 'max-h-6 opacity-100 mb-2 px-2'
              }`}
            >
              Analytics
            </div>
            <nav className="space-y-1">
              {secondaryNav.map((item) => {
                const Icon = ICON_MAP[item.icon] || BarChart3;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={isMobile ? onCloseMobile : undefined}
                    title={collapsed ? item.label : undefined}
                    className={({ isActive }) =>
                      `group relative flex items-center rounded-lg py-2.5 text-xs font-medium transition-all duration-300 ease-in-out ${
                        isActive
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                      } ${collapsed ? 'justify-center px-2' : 'px-3'}`
                    }
                  >
                    <Icon className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:scale-110" />
                    <span
                      className={`truncate transition-all duration-300 ease-in-out whitespace-nowrap ${
                        collapsed ? 'max-w-0 opacity-0 ml-0 pointer-events-none' : 'max-w-[140px] opacity-100 ml-3'
                      }`}
                    >
                      {item.label}
                    </span>
                  </NavLink>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Footer Role & Profile Status */}
      <div className="border-t border-slate-800 p-3 space-y-2 shrink-0">
        {/* Role indicator badge */}
        <div
          className={`flex items-center rounded-lg bg-slate-800/70 p-2 text-xs border border-slate-700/50 transition-all duration-300 ${
            collapsed ? 'justify-center' : 'gap-2'
          }`}
          title={collapsed ? `${APP_ROLE.name} (Full HR Authority)` : undefined}
        >
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out whitespace-nowrap ${
              collapsed ? 'max-w-0 opacity-0 ml-0 pointer-events-none' : 'max-w-[150px] opacity-100 ml-2'
            }`}
          >
            <div className="text-[11px] font-semibold text-white truncate">{APP_ROLE.name}</div>
            <div className="text-[10px] text-emerald-400 font-medium truncate">Full HR Authority</div>
          </div>
        </div>

        {/* User Card */}
        <div
          className={`flex items-center rounded-lg p-2 transition-all duration-300 ${
            collapsed ? 'justify-center' : 'gap-2.5'
          }`}
        >
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
            alt="Elena Rostova"
            className="h-8 w-8 shrink-0 rounded-full object-cover ring-1 ring-slate-700"
          />
          <div
            className={`min-w-0 flex-1 overflow-hidden transition-all duration-300 ease-in-out whitespace-nowrap ${
              collapsed ? 'max-w-0 opacity-0 ml-0 pointer-events-none' : 'max-w-[150px] opacity-100 ml-2.5'
            }`}
          >
            <p className="truncate text-xs font-semibold text-white">Elena Rostova</p>
            <p className="truncate text-[10px] text-slate-400">elena.rostova@internal</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Collapsible Sidebar */}
      <aside
        className={`hidden md:flex flex-col shrink-0 z-30 transition-[width] duration-300 ease-in-out ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {renderSidebarBody(isCollapsed, false)}
      </aside>

      {/* Mobile Drawer Backdrop */}
      <div
        className={`fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300 ease-in-out md:hidden ${
          isMobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onCloseMobile}
        aria-hidden="true"
      />

      {/* Mobile Drawer Panel with Smooth Slide Animation */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 max-w-xs flex-col shadow-2xl transform transition-transform duration-300 ease-in-out md:hidden ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full pointer-events-none'
        }`}
        aria-label="Mobile Navigation"
      >
        {renderSidebarBody(false, true)}
      </aside>
    </>
  );
}
