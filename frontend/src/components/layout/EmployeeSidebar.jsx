import React from 'react';
import { NavLink } from 'react-router-dom';
import { UserRound, Clock, CalendarCheck, ChevronLeft, X, LogOut, LayoutDashboard } from 'lucide-react';
import { EMPLOYEE_NAV_ITEMS } from '../../constants/employeeNav';
import { useAuth } from '../../context/AuthContext';
import { useEmployeeData } from '../../context/EmployeeDataContext';

const ICON_MAP = {
  LayoutDashboard,
  UserRound,
  Clock,
  CalendarCheck,
};

export default function EmployeeSidebar({ isCollapsed, onToggleCollapse, isMobileOpen, onCloseMobile }) {
  const { user, logout } = useAuth();
  const { profile } = useEmployeeData();
  const displayName = profile?.fullName || user?.employeeCode || 'Employee';
  const initials = (profile?.firstName || user?.email || 'E').slice(0, 1).toUpperCase();

  const handleLogout = () => {
    logout().finally(() => {
      window.location.assign('/login');
    });
  };

  const renderNav = (collapsed, isMobile) =>
    EMPLOYEE_NAV_ITEMS.map((item) => {
      const Icon = ICON_MAP[item.icon] || UserRound;
      return (
        <NavLink
          key={item.path}
          to={item.path}
          end={item.path === '/employee'}
          onClick={isMobile ? onCloseMobile : undefined}
          title={collapsed ? item.label : undefined}
          className={({ isActive }) =>
            `group relative flex items-center rounded-2xl py-2.5 text-sm font-medium transition-colors ${
              isActive
                ? 'bg-brand-400 text-slate-900'
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
        </NavLink>
      );
    });

  const renderSidebarBody = (collapsed, isMobile = false) => (
    <div className="flex h-full flex-col bg-white text-slate-700">
      <div className="flex h-[72px] shrink-0 items-center justify-between px-4">
        <div className="flex items-center overflow-hidden">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-brand-400 text-slate-900 font-bold">
            P
          </div>
          <div
            className={`overflow-hidden whitespace-nowrap transition-all ${
              collapsed ? 'ml-0 max-w-0 opacity-0' : 'ml-2.5 max-w-[160px] opacity-100'
            }`}
          >
            <span className="block text-sm font-semibold tracking-tight text-slate-900">PeopleFlow</span>
            <span className="block text-[11px] font-medium text-slate-400">PeoplePay360</span>
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

      <div className="flex-1 overflow-y-auto px-3 pb-4 pt-2">
        <p
          className={`mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400 ${
            collapsed ? 'sr-only' : ''
          }`}
        >
          Menu
        </p>
        <nav className="space-y-1">{renderNav(collapsed, isMobile)}</nav>
      </div>

      <div className="shrink-0 border-t border-slate-100 p-3">
        <div className={`flex items-center rounded-2xl bg-slate-50 p-2 ${collapsed ? 'justify-center' : 'gap-2.5'}`}>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-200 text-xs font-semibold text-slate-800">
            {initials}
          </div>
          <div className={`min-w-0 ${collapsed ? 'hidden' : 'flex-1'}`}>
            <p className="truncate text-xs font-semibold text-slate-900">{displayName}</p>
            <p className="truncate text-[11px] text-slate-500">{user?.email}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className={`mt-2 flex w-full items-center rounded-2xl px-2 py-2 text-xs font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-800 ${
            collapsed ? 'justify-center' : 'gap-2'
          }`}
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && <span>Logout</span>}
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
        aria-label="Employee navigation"
      >
        {renderSidebarBody(false, true)}
      </aside>
    </>
  );
}
