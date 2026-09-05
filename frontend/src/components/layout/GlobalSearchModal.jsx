import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Users, FileText, Clock, CalendarCheck, ArrowRight, CornerDownLeft } from 'lucide-react';
import { useHRData } from '../../context/HRDataContext';

export default function GlobalSearchModal({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { employees, contracts, attendance, timeOffRequests, kpis } = useHRData();

  useEffect(() => {
    if (isOpen) {
      setQuery('');
    }
  }, [isOpen]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return { employees: [], contracts: [], attendance: [], timeOff: [] };

    return {
      employees: employees
        .filter(
          (e) =>
            e.fullName.toLowerCase().includes(q) ||
            e.id.toLowerCase().includes(q) ||
            e.department.toLowerCase().includes(q) ||
            e.jobPosition.toLowerCase().includes(q)
        )
        .slice(0, 4),

      contracts: contracts
        .filter(
          (c) =>
            c.id.toLowerCase().includes(q) ||
            c.employeeName.toLowerCase().includes(q) ||
            c.contractName.toLowerCase().includes(q)
        )
        .slice(0, 3),

      attendance: attendance
        .filter(
          (a) =>
            a.employeeName.toLowerCase().includes(q) ||
            a.status.toLowerCase().includes(q) ||
            a.id.toLowerCase().includes(q)
        )
        .slice(0, 3),

      timeOff: timeOffRequests
        .filter(
          (t) =>
            t.employeeName.toLowerCase().includes(q) ||
            t.timeOffType.toLowerCase().includes(q) ||
            t.status.toLowerCase().includes(q) ||
            t.id.toLowerCase().includes(q)
        )
        .slice(0, 3)
    };
  }, [query, employees, contracts, attendance, timeOffRequests]);

  const hasResults =
    results.employees.length > 0 ||
    results.contracts.length > 0 ||
    results.attendance.length > 0 ||
    results.timeOff.length > 0;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto scroll-smooth bg-slate-900/50 backdrop-blur-sm p-4 sm:p-6 flex items-start justify-center pt-16 sm:pt-24 transition-all duration-200 ease-out">
      <div className="relative w-full max-w-xl rounded-2xl bg-white shadow-2xl overflow-hidden border border-slate-200 transform transition-all duration-200 ease-out">
        {/* Search Input Bar */}
        <div className="flex items-center border-b border-slate-200 px-4 py-3.5 bg-slate-50/50">
          <Search className="h-5 w-5 text-indigo-600 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search employees, contracts, attendance, time off..."
            className="w-full bg-transparent px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="rounded p-1 text-slate-400 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
          ) : (
            <kbd className="rounded border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-400 shadow-subtle">
              ESC to close
            </kbd>
          )}
        </div>

        {/* Search Results & Recent Suggestions */}
        <div className="max-h-96 overflow-y-auto scroll-smooth p-4 text-xs space-y-4">
          {!query ? (
            /* Suggested shortcuts when empty */
            <div className="space-y-4">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Quick Shortcuts
              </div>

              {/* Employees group */}
              <div>
                <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <Users className="h-3.5 w-3.5 text-indigo-500" />
                  <span>Employees</span>
                </div>
                <div className="space-y-1">
                  {employees.slice(0, 2).map((emp) => (
                    <button
                      key={emp.id}
                      type="button"
                      onClick={() => {
                        navigate(`/employees/${emp.id}`);
                        onClose();
                      }}
                      className="flex w-full items-center justify-between rounded-lg p-2 text-left hover:bg-indigo-50 transition-colors"
                    >
                      <div>
                        <span className="font-bold text-slate-900">{emp.fullName}</span>
                        <span className="text-slate-500 text-[11px] ml-2 font-normal">· {emp.jobPosition}</span>
                      </div>
                      <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Attendance group */}
              <div>
                <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <Clock className="h-3.5 w-3.5 text-amber-500" />
                  <span>Attendance</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    navigate('/attendance?filter=exceptions');
                    onClose();
                  }}
                  className="flex w-full items-center justify-between rounded-lg p-2 text-left hover:bg-amber-50/70 transition-colors"
                >
                  <div>
                    <span className="font-bold text-slate-900">David Kim</span>
                    <span className="text-amber-700 text-[11px] ml-2 font-semibold">· Late (09:42) · 05 Sep</span>
                  </div>
                  <span className="text-[10px] font-semibold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                    Audit exception
                  </span>
                </button>
              </div>

              {/* Time Off group */}
              <div>
                <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <CalendarCheck className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Time Off</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    navigate('/time-off?status=Pending');
                    onClose();
                  }}
                  className="flex w-full items-center justify-between rounded-lg p-2 text-left hover:bg-emerald-50/70 transition-colors"
                >
                  <div>
                    <span className="font-bold text-slate-900">{kpis.pendingTimeOff} pending leave requests</span>
                    <span className="text-slate-500 text-[11px] ml-2 font-normal">· Awaiting approval</span>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
                </button>
              </div>
            </div>
          ) : !hasResults ? (
            <div className="py-10 text-center text-slate-500">
              <p className="font-medium">No results found for "{query}".</p>
              <p className="text-[11px] text-slate-400 mt-1">Try typing an employee name, position, contract ID, or status.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Filtered Employees */}
              {results.employees.length > 0 && (
                <div>
                  <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <Users className="h-3.5 w-3.5 text-indigo-600" />
                    <span>Employees</span>
                  </div>
                  <div className="space-y-1">
                    {results.employees.map((emp) => (
                      <button
                        key={emp.id}
                        type="button"
                        onClick={() => {
                          navigate(`/employees/${emp.id}`);
                          onClose();
                        }}
                        className="flex w-full items-center justify-between rounded-lg p-2 text-left hover:bg-indigo-50 transition-colors"
                      >
                        <div>
                          <span className="font-bold text-slate-900">{emp.fullName}</span>
                          <span className="text-slate-500 text-[11px] ml-2">· {emp.jobPosition} ({emp.department})</span>
                        </div>
                        <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Filtered Contracts */}
              {results.contracts.length > 0 && (
                <div>
                  <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <FileText className="h-3.5 w-3.5 text-indigo-600" />
                    <span>Contracts</span>
                  </div>
                  <div className="space-y-1">
                    {results.contracts.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          navigate(`/contracts?search=${c.id}`);
                          onClose();
                        }}
                        className="flex w-full items-center justify-between rounded-lg p-2 text-left hover:bg-indigo-50 transition-colors"
                      >
                        <div>
                          <span className="font-bold text-slate-900 font-mono">{c.id}</span>
                          <span className="text-slate-700 text-[11px] ml-2">· {c.contractName} ({c.employeeName})</span>
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          {c.status}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Filtered Attendance */}
              {results.attendance.length > 0 && (
                <div>
                  <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <Clock className="h-3.5 w-3.5 text-indigo-600" />
                    <span>Attendance</span>
                  </div>
                  <div className="space-y-1">
                    {results.attendance.map((a) => (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => {
                          navigate(`/attendance?search=${a.employeeName}`);
                          onClose();
                        }}
                        className="flex w-full items-center justify-between rounded-lg p-2 text-left hover:bg-indigo-50 transition-colors"
                      >
                        <div>
                          <span className="font-bold text-slate-900">{a.employeeName}</span>
                          <span className="text-slate-600 text-[11px] ml-2">· {a.status} · {a.date}</span>
                        </div>
                        <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Filtered Time Off */}
              {results.timeOff.length > 0 && (
                <div>
                  <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <CalendarCheck className="h-3.5 w-3.5 text-indigo-600" />
                    <span>Time Off</span>
                  </div>
                  <div className="space-y-1">
                    {results.timeOff.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => {
                          navigate(`/time-off?search=${t.employeeName}`);
                          onClose();
                        }}
                        className="flex w-full items-center justify-between rounded-lg p-2 text-left hover:bg-indigo-50 transition-colors"
                      >
                        <div>
                          <span className="font-bold text-slate-900">{t.employeeName}</span>
                          <span className="text-slate-600 text-[11px] ml-2">· {t.timeOffType} ({t.duration}d) · {t.status}</span>
                        </div>
                        <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
