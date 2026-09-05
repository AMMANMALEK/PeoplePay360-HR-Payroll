import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Filter } from 'lucide-react';
import StatusBadge from '../ui/StatusBadge';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function TimeOffCalendarView({
  requests = [],
  onRequestClick = () => {},
  initialYear = 2026,
  initialMonth = 8 // 0-indexed, 8 = September
}) {
  const [currentYear, setCurrentYear] = useState(initialYear);
  const [currentMonth, setCurrentMonth] = useState(initialMonth); // 0 = Jan, 8 = Sep
  const [selectedDepartment, setSelectedDepartment] = useState('All');

  // Available departments from requests
  const departments = useMemo(() => {
    const set = new Set();
    requests.forEach((r) => {
      if (r.department) set.add(r.department);
    });
    return ['All', ...Array.from(set)];
  }, [requests]);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleGoToday = () => {
    setCurrentYear(2026);
    setCurrentMonth(8); // September 2026
  };

  // Calendar grid calculation (Monday-first)
  const calendarDays = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const totalDays = lastDay.getDate();

    // JS getDay(): 0 = Sun, 1 = Mon ... 6 = Sat
    // Convert to Monday = 0, Tuesday = 1, ... Sunday = 6
    let startingDayOfWeek = firstDay.getDay() - 1;
    if (startingDayOfWeek === -1) startingDayOfWeek = 6;

    const days = [];

    // Previous month filler days
    const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        date: prevMonthLastDay - i,
        isCurrentMonth: false,
        fullDateStr: ''
      });
    }

    // Current month days
    for (let day = 1; day <= totalDays; day++) {
      const monthPadded = String(currentMonth + 1).padStart(2, '0');
      const dayPadded = String(day).padStart(2, '0');
      const fullDateStr = `${currentYear}-${monthPadded}-${dayPadded}`;
      days.push({
        date: day,
        isCurrentMonth: true,
        fullDateStr
      });
    }

    // Next month filler days to complete grid (multiples of 7)
    const remaining = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      days.push({
        date: i,
        isCurrentMonth: false,
        fullDateStr: ''
      });
    }

    return days;
  }, [currentYear, currentMonth]);

  // Index requests by date string (YYYY-MM-DD)
  const requestsByDate = useMemo(() => {
    const map = {};

    requests.forEach((req) => {
      if (selectedDepartment !== 'All' && req.department !== selectedDepartment) return;

      const start = new Date(req.startDate);
      const end = new Date(req.endDate);

      // Fill every date in the request range
      const curr = new Date(start);
      while (curr <= end) {
        const y = curr.getFullYear();
        const m = String(curr.getMonth() + 1).padStart(2, '0');
        const d = String(curr.getDate()).padStart(2, '0');
        const key = `${y}-${m}-${d}`;

        if (!map[key]) map[key] = [];
        map[key].push(req);

        curr.setDate(curr.getDate() + 1);
      }
    });

    return map;
  }, [requests, selectedDepartment]);

  // Today reference check
  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-4">
      {/* Calendar Top Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs">
        {/* Month Navigation */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1">
            <button
              type="button"
              onClick={handlePrevMonth}
              aria-label="Previous Month"
              className="rounded p-1 text-slate-600 hover:bg-white hover:text-slate-900 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="min-w-[150px] text-center font-bold text-slate-900 text-sm">
              {MONTH_NAMES[currentMonth]} {currentYear}
            </span>
            <button
              type="button"
              onClick={handleNextMonth}
              aria-label="Next Month"
              className="rounded p-1 text-slate-600 hover:bg-white hover:text-slate-900 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={handleGoToday}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            Today
          </button>
        </div>

        {/* Filter by Department */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">Department:</span>
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 shadow-2xs focus:border-indigo-500 focus:outline-none"
          >
            {departments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-card overflow-hidden">
        {/* Day Header */}
        <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50/80 text-center text-xs font-bold text-slate-600">
          {DAY_NAMES.map((name) => (
            <div key={name} className="py-2.5 border-r border-slate-200/60 last:border-r-0">
              <span className="hidden sm:inline">{name}</span>
              <span className="sm:hidden">{name.slice(0, 3)}</span>
            </div>
          ))}
        </div>

        {/* Days Matrix */}
        <div className="grid grid-cols-7 divide-x divide-y divide-slate-200/70">
          {calendarDays.map((dayItem, index) => {
            const dayRequests = dayItem.fullDateStr ? requestsByDate[dayItem.fullDateStr] || [] : [];
            const isToday = dayItem.fullDateStr === todayStr;
            const isPast = dayItem.fullDateStr && dayItem.fullDateStr < todayStr;

            return (
              <div
                key={index}
                className={`min-h-[110px] p-2 flex flex-col justify-between transition-colors ${
                  !dayItem.isCurrentMonth
                    ? 'bg-slate-50/40 text-slate-300'
                    : isToday
                    ? 'bg-indigo-50/30'
                    : isPast
                    ? 'bg-slate-50/40 text-slate-400 select-none cursor-not-allowed'
                    : 'bg-white hover:bg-slate-50/60'
                }`}
              >
                {/* Date header */}
                <div className="flex items-center justify-between">
                  <span
                    className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                      isToday
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : dayItem.isCurrentMonth
                        ? 'text-slate-700'
                        : 'text-slate-300'
                    }`}
                  >
                    {dayItem.date}
                  </span>
                  {dayRequests.length > 0 && dayItem.isCurrentMonth && (
                    <span className="text-[10px] font-semibold text-slate-400">
                      {dayRequests.length} off
                    </span>
                  )}
                </div>

                {/* Event Chips */}
                <div className="mt-1 space-y-1 overflow-y-auto max-h-[85px] no-scrollbar">
                  {dayRequests.slice(0, 3).map((req) => {
                    const isApproved = req.status === 'Approved';
                    const isPending = req.status === 'Pending';
                    const isRefused = req.status === 'Refused' || req.status === 'Rejected';

                    const chipBg = isApproved
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200/90 hover:bg-emerald-100'
                      : isPending
                      ? 'bg-amber-50 text-amber-900 border-amber-200/90 hover:bg-amber-100'
                      : 'bg-rose-50 text-rose-800 border-rose-200/90 hover:bg-rose-100';

                    const dotBg = isApproved
                      ? 'bg-emerald-500'
                      : isPending
                      ? 'bg-amber-500'
                      : 'bg-rose-500';

                    return (
                      <button
                        key={`${req.id}-${dayItem.fullDateStr}`}
                        type="button"
                        onClick={() => onRequestClick(req)}
                        title={`${req.employeeName} - ${req.timeOffType} (${req.status})\n${req.startDate} → ${req.endDate}`}
                        className={`w-full text-left rounded px-1.5 py-0.5 text-[10px] font-medium border flex items-center gap-1 truncate shadow-2xs transition-all ${chipBg}`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${dotBg}`} />
                        <span className="font-semibold truncate">{req.employeeName}</span>
                        <span className="text-[9px] opacity-75 hidden md:inline truncate">
                          • {req.timeOffType}
                        </span>
                      </button>
                    );
                  })}
                  {dayRequests.length > 3 && (
                    <div className="text-[9px] font-semibold text-slate-500 pl-1">
                      +{dayRequests.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Legend */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-2.5 text-xs">
        <div className="flex items-center gap-4 text-slate-700">
          <span className="font-bold text-[11px] text-slate-500 uppercase tracking-wider">Legend:</span>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="font-medium text-emerald-900">Approved</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            <span className="font-medium text-amber-900">Pending</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-rose-500" />
            <span className="font-medium text-rose-900">Rejected / Refused</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-indigo-600" />
            <span className="font-medium text-indigo-950">Today (Sep 15)</span>
          </div>
        </div>

        <span className="text-[11px] text-slate-400">
          Click on any leave event chip to inspect or review the request.
        </span>
      </div>
    </div>
  );
}
