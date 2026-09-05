import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Menu, Search, Bell, Shield, Check, ExternalLink } from 'lucide-react';
import { APP_ROLE } from '../../constants/navigation';
import { useHRData } from '../../context/HRDataContext';
import GlobalSearchModal from './GlobalSearchModal';

export default function TopBar({ onOpenMobileMenu }) {
  const location = useLocation();
  const { kpis, attentionItems } = useHRData();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Keyboard shortcut listener for Global Search (Cmd/Ctrl + K)
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Compute clean breadcrumbs
  const pathnames = location.pathname.split('/').filter((x) => x);
  const breadcrumbMap = {
    employees: 'Employees',
    attendance: 'Attendance',
    contracts: 'Contracts',
    schedules: 'Working Schedules',
    'time-off': 'Time Off',
    reports: 'Reports'
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 w-full shrink-0 items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 backdrop-blur sm:px-6">
        {/* Left: Mobile menu toggle & Breadcrumbs */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 md:hidden"
            aria-label="Open sidebar menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <nav aria-label="Breadcrumb" className="flex items-center text-xs font-medium text-slate-500">
            <Link to="/" className="hover:text-slate-900 transition-colors">
              PeoplePay360
            </Link>
            {pathnames.length === 0 ? (
              <>
                <span className="mx-2 text-slate-300">/</span>
                <span className="text-slate-900 font-semibold">Overview</span>
              </>
            ) : (
              pathnames.map((segment, index) => {
                const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
                const isLast = index === pathnames.length - 1;
                const displayName = breadcrumbMap[segment] || segment;

                return (
                  <React.Fragment key={routeTo}>
                    <span className="mx-2 text-slate-300">/</span>
                    {isLast ? (
                      <span className="font-semibold text-slate-900 truncate max-w-[160px] sm:max-w-xs">
                        {displayName}
                      </span>
                    ) : (
                      <Link to={routeTo} className="hover:text-slate-900 transition-colors">
                        {displayName}
                      </Link>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </nav>
        </div>

        {/* Center / Right: Global Search, Notification Popover, Profile */}
        <div className="flex items-center gap-2.5 sm:gap-4">
          {/* Global Search Button */}
          <button
            type="button"
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-1.5 text-xs text-slate-400 hover:border-slate-300 hover:bg-white hover:text-slate-600 transition-all shadow-subtle"
          >
            <Search className="h-3.5 w-3.5 text-slate-400" />
            <span className="hidden sm:inline">Search records...</span>
            <kbd className="hidden rounded bg-white px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 border border-slate-200 sm:inline-block">
              ⌘K
            </kbd>
          </button>

          {/* Notifications Bell */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
              aria-label="View attention notifications"
            >
              <Bell className="h-4 w-4" />
              {attentionItems.length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white ring-2 ring-white">
                  {attentionItems.length}
                </span>
              )}
            </button>

            {/* Actionable Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-84 rounded-xl border border-slate-200 bg-white p-3 shadow-dropdown z-40 text-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
                  <span className="font-bold text-slate-900">Actionable HR Events</span>
                  <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    4 pending
                  </span>
                </div>
                <div className="space-y-1.5 max-h-72 overflow-y-auto">
                  <Link
                    to="/attendance?filter=exceptions"
                    onClick={() => setShowNotifications(false)}
                    className="block p-2.5 rounded-lg border border-rose-100 bg-rose-50/40 hover:bg-rose-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-rose-900 text-xs">Attendance correction required</span>
                      <span className="text-[10px] text-rose-700 font-medium">Today</span>
                    </div>
                    <div className="text-[11px] text-slate-600 mt-0.5">David Kim · Late check-in exception</div>
                  </Link>

                  <Link
                    to="/time-off?status=Pending"
                    onClick={() => setShowNotifications(false)}
                    className="block p-2.5 rounded-lg border border-amber-100 bg-amber-50/40 hover:bg-amber-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-amber-900 text-xs">Time-off request pending</span>
                      <span className="text-[10px] text-amber-700 font-medium">3 days</span>
                    </div>
                    <div className="text-[11px] text-slate-600 mt-0.5">Amina Diallo · Annual leave request</div>
                  </Link>

                  <Link
                    to="/contracts?filter=expiring"
                    onClick={() => setShowNotifications(false)}
                    className="block p-2.5 rounded-lg border border-sky-100 bg-sky-50/40 hover:bg-sky-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sky-900 text-xs">Contract expiring soon</span>
                      <span className="text-[10px] text-sky-700 font-medium">18 days</span>
                    </div>
                    <div className="text-[11px] text-slate-600 mt-0.5">Sarah Jenkins · Renewal review required</div>
                  </Link>

                  <Link
                    to="/employees?filter=incomplete"
                    onClick={() => setShowNotifications(false)}
                    className="block p-2.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-indigo-50/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 text-xs">Incomplete employee profile</span>
                      <span className="text-[10px] text-slate-500 font-medium">Action</span>
                    </div>
                    <div className="text-[11px] text-slate-600 mt-0.5">Chloe Bennett · Missing emergency documents</div>
                  </Link>
                </div>
                <div className="mt-3 border-t border-slate-100 pt-2 text-center">
                  <Link
                    to="/"
                    onClick={() => setShowNotifications(false)}
                    className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800"
                  >
                    Go to Needs Your Attention in Dashboard →
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Role Pill */}
          <div className="hidden lg:flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50/80 px-2.5 py-1 text-xs font-semibold text-emerald-800">
            <Shield className="h-3.5 w-3.5 text-emerald-600" />
            <span>{APP_ROLE.name}</span>
          </div>

          {/* Profile Avatar */}
          <div className="flex items-center gap-2 pl-1">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
              alt="User profile"
              className="h-8 w-8 rounded-full object-cover ring-2 ring-indigo-500/30"
            />
          </div>
        </div>
      </header>

      {/* Global Search Dialog */}
      <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
