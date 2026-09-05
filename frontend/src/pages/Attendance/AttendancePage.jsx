import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { UserCheck, Clock, UserX, CalendarCheck, FileEdit, LogIn, LogOut, CheckCircle2 } from 'lucide-react';
import { useHRData } from '../../context/HRDataContext';
import { useAuth } from '../../context/AuthContext';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import FilterBar from '../../components/ui/FilterBar';
import PageHeader from '../../components/ui/PageHeader';
import AttendanceCorrectionModal from '../../components/attendance/AttendanceCorrectionModal';

export default function AttendancePage() {
  const [searchParams] = useSearchParams();
  const filterQuery = searchParams.get('filter');

  const { user, isHrManager, isAdmin } = useAuth();
  const { attendance, departments, hrCheckIn, hrCheckOut } = useHRData();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isCorrectionOpen, setIsCorrectionOpen] = useState(false);
  const [isProcessingHrAction, setIsProcessingHrAction] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  const [activeFilters, setActiveFilters] = useState({
    department: 'All',
    status: 'All',
    date: ''
  });

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Find HR Manager's today record
  const hrTodayRecord = useMemo(() => {
    return (
      attendance.find(
        (a) =>
          a.date === todayStr &&
          (a.employeeCode === 'HRMGR' ||
            a.employeeId === 'HRMGR' ||
            a.employeeName?.toLowerCase().includes('hr manager'))
      ) || null
    );
  }, [attendance, todayStr]);

  const canCheckIn = !hrTodayRecord?.hasCheckIn && (!hrTodayRecord?.checkIn || hrTodayRecord?.checkIn === '--:--');
  const canCheckOut = Boolean(
    (hrTodayRecord?.hasCheckIn || (hrTodayRecord?.checkIn && hrTodayRecord?.checkIn !== '--:--')) &&
      (!hrTodayRecord?.hasCheckOut && (!hrTodayRecord?.checkOut || hrTodayRecord?.checkOut === '--:--'))
  );

  useEffect(() => {
    if (!hrTodayRecord?.hasCheckIn || hrTodayRecord?.hasCheckOut) {
      setCooldownSeconds(0);
      return;
    }

    const getCheckInMs = () => {
      try {
        const stored = Number(localStorage.getItem(`hr_checkin_time_${todayStr}`));
        if (stored && Date.now() - stored < 60000 && Date.now() - stored >= 0) return stored;
      } catch {}
      if (hrTodayRecord.checkInTimeMs) return hrTodayRecord.checkInTimeMs;
      if (hrTodayRecord.rawCheckIn) {
        const ms = new Date(hrTodayRecord.rawCheckIn).getTime();
        if (!isNaN(ms)) return ms;
      }
      if (hrTodayRecord.checkIn && hrTodayRecord.checkIn !== '--:--') {
        const parts = hrTodayRecord.checkIn.split(':');
        if (parts.length >= 2) {
          const d = new Date();
          d.setHours(Number(parts[0]), Number(parts[1]), 0, 0);
          return d.getTime();
        }
      }
      return null;
    };

    const updateCooldown = () => {
      const checkInMs = getCheckInMs();
      if (!checkInMs) {
        setCooldownSeconds(0);
        return;
      }
      const diffMs = Date.now() - checkInMs;
      if (diffMs >= 0 && diffMs < 60000) {
        setCooldownSeconds(Math.ceil((60000 - diffMs) / 1000));
      } else {
        setCooldownSeconds(0);
      }
    };

    updateCooldown();
    const interval = setInterval(updateCooldown, 1000);
    return () => clearInterval(interval);
  }, [hrTodayRecord, todayStr]);

  const handleHrCheckIn = async () => {
    setIsProcessingHrAction(true);
    try {
      await hrCheckIn('HRMGR');
    } finally {
      setIsProcessingHrAction(false);
    }
  };

  const handleHrCheckOut = async () => {
    setIsProcessingHrAction(true);
    try {
      await hrCheckOut('HRMGR');
    } finally {
      setIsProcessingHrAction(false);
    }
  };

  // Calculate summary counts strictly for the 4 valid statuses
  const summary = useMemo(() => {
    const norm = (s) => String(s || '').toLowerCase().replace(/[\s-_]/g, '');
    return {
      present: attendance.filter((a) => norm(a.status) === 'present').length,
      absent: attendance.filter((a) => norm(a.status) === 'absent').length,
      halfDay: attendance.filter((a) => norm(a.status) === 'halfday').length,
      onLeave: attendance.filter((a) => norm(a.status) === 'onleave' || norm(a.status) === 'leave').length,
    };
  }, [attendance]);

  const filterDefs = [
    {
      key: 'department',
      label: 'Department',
      options: departments
    },
    {
      key: 'status',
      label: 'Status',
      options: [
        { label: 'All', value: 'All' },
        { label: 'Present', value: 'Present' },
        { label: 'Absent', value: 'Absent' },
        { label: 'Half-day', value: 'Half-day' },
        { label: 'On Leave', value: 'On Leave' }
      ]
    }
  ];

  const handleFilterChange = (key, value) => {
    setActiveFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleClearAll = () => {
    setActiveFilters({ department: 'All', status: 'All', date: '' });
    setSearchQuery('');
  };

  const filteredAttendance = useMemo(() => {
    return attendance.filter((a) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          a.employeeName?.toLowerCase().includes(q) ||
          a.employeeId?.toLowerCase().includes(q) ||
          a.department?.toLowerCase().includes(q);
        if (!matches) return false;
      }

      if (activeFilters.department !== 'All' && a.department !== activeFilters.department) {
        return false;
      }

      if (activeFilters.status !== 'All') {
        const normFilter = activeFilters.status.toLowerCase().replace(/[\s-_]/g, '');
        const normRow = (a.status || '').toLowerCase().replace(/[\s-_]/g, '');
        if (normFilter !== normRow) return false;
      }

      if (activeFilters.date && a.date && a.date !== activeFilters.date) {
        return false;
      }

      return true;
    });
  }, [attendance, searchQuery, activeFilters]);

  const columns = [
    {
      key: 'employeeName',
      label: 'Employee',
      sortable: true,
      render: (name, row) => (
        <div>
          <div className="font-semibold text-slate-900">{name}</div>
          <div className="text-[11px] text-slate-400 font-mono">{row.employeeId || row.employeeCode}</div>
        </div>
      )
    },
    {
      key: 'department',
      label: 'Department',
      render: (dept) => <span className="text-slate-600">{dept}</span>
    },
    {
      key: 'date',
      label: 'Date',
      sortable: true
    },
    {
      key: 'checkIn',
      label: 'Check In',
      render: (inTime) => (
        <span className={`font-mono font-medium ${inTime === '--:--' ? 'text-rose-500' : 'text-slate-800'}`}>
          {inTime}
        </span>
      )
    },
    {
      key: 'checkOut',
      label: 'Check Out',
      render: (outTime) => (
        <span className={`font-mono font-medium ${outTime === '--:--' ? 'text-rose-500' : 'text-slate-800'}`}>
          {outTime}
        </span>
      )
    },
    {
      key: 'workedHours',
      label: 'Hours Worked',
      render: (hours) => (
        <span className="font-semibold text-slate-900">{hours > 0 ? `${hours}h` : '0h'}</span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (status) => <StatusBadge status={status} />
    },
    {
      key: 'correction',
      label: 'Audit Log',
      render: (correction) => {
        if (!correction) return <span className="text-slate-400 italic text-[11px]">Clean</span>;
        return (
          <div className="text-[10px] text-brand-800 bg-brand-50 p-1.5 rounded-lg max-w-xs truncate border border-brand-100">
            <span className="font-semibold">Corrected:</span> {correction.reason}
          </div>
        );
      }
    },
    {
      key: 'actions',
      label: 'Action',
      align: 'right',
      render: (_, row) => {
        const isAbsent = String(row.status || '').toLowerCase() === 'absent';
        if (!isAbsent) return null;

        return (
          <button
            type="button"
            onClick={() => {
              setSelectedRecord(row);
              setIsCorrectionOpen(true);
            }}
            className="inline-flex items-center gap-1 rounded-xl px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-brand-50 transition-colors"
          >
            <FileEdit className="h-3 w-3" />
            <span>Correct</span>
          </button>
        );
      }
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendance"
        subtitle="Review presence, shift check-ins, and authorized corrections."
      />

      {/* HR Manager / Admin Check-In and Check-Out Bar */}
      <div className="rounded-[18px] border border-slate-200/80 bg-white p-4 shadow-card">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-100 text-brand-900 font-bold text-sm shadow-subtle">
              HR
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-semibold text-slate-900">
                  {isHrManager ? 'My Attendance (HR Manager)' : 'HR Manager Daily Attendance'}
                </h3>
                <StatusBadge
                  status={hrTodayRecord?.status || (hrTodayRecord?.checkIn && hrTodayRecord.checkIn !== '--:--' ? 'Present' : 'Absent')}
                  size="sm"
                />
                {isAdmin && (
                  <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                    Visible to Admin
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 text-xs">
              <div className="rounded-xl bg-slate-50 px-3 py-1.5 border border-slate-200/70">
                <span className="text-[10px] text-slate-400 block font-medium">Check In</span>
                <span className="font-semibold text-slate-800 font-mono">{hrTodayRecord?.checkIn || '--:--'}</span>
              </div>
              <div className="rounded-xl bg-slate-50 px-3 py-1.5 border border-slate-200/70">
                <span className="text-[10px] text-slate-400 block font-medium">Check Out</span>
                <span className="font-semibold text-slate-800 font-mono">{hrTodayRecord?.checkOut || '--:--'}</span>
              </div>
              <div className="rounded-xl bg-slate-50 px-3 py-1.5 border border-slate-200/70">
                <span className="text-[10px] text-slate-400 block font-medium">Worked</span>
                <span className="font-semibold text-slate-800 font-mono">
                  {hrTodayRecord?.workedHours ? `${hrTodayRecord.workedHours}h` : '0h'}
                </span>
              </div>
            </div>

            {canCheckIn && (
              <button
                type="button"
                disabled={isProcessingHrAction}
                onClick={handleHrCheckIn}
                className="btn-primary"
              >
                <LogIn className="h-3.5 w-3.5" />
                <span>{isProcessingHrAction ? 'Checking In…' : 'Check In'}</span>
              </button>
            )}

            {canCheckOut && (
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  disabled={isProcessingHrAction || cooldownSeconds > 0}
                  onClick={handleHrCheckOut}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>
                    {isProcessingHrAction
                      ? 'Checking Out…'
                      : cooldownSeconds > 0
                      ? `Wait ${cooldownSeconds}s`
                      : 'Check Out'}
                  </span>
                </button>
                {cooldownSeconds > 0 && (
                  <div className="flex items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs text-amber-700">
                    <Clock className="h-3.5 w-3.5 shrink-0 text-amber-600" />
                    <span>Cannot check out at the same time as check in. Available in {cooldownSeconds}s.</span>
                  </div>
                )}
              </div>
            )}

            {!canCheckIn && !canCheckOut && (
              <div className="flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 border border-emerald-200/80">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                <span>Shift Completed</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4 Attendance Status KPI Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-4">
        <div className="rounded-[18px] bg-[#e4f4ea] p-4 border border-emerald-100/60 shadow-subtle">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800">
            <UserCheck className="h-4 w-4" />
            Present
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">{summary.present}</div>
        </div>

        <div className="rounded-[18px] bg-[#fce8e8] p-4 border border-rose-100/60 shadow-subtle">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-800">
            <UserX className="h-4 w-4" />
            Absent
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">{summary.absent}</div>
        </div>

        <div className="rounded-[18px] bg-[#fde9d8] p-4 border border-amber-100/60 shadow-subtle">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-800">
            <Clock className="h-4 w-4" />
            Half-day
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">{summary.halfDay}</div>
        </div>

        <div className="rounded-[18px] bg-[#e4eefc] p-4 border border-sky-100/60 shadow-subtle">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-sky-800">
            <CalendarCheck className="h-4 w-4" />
            On Leave
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">{summary.onLeave}</div>
        </div>
      </div>

      <FilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search employee, ID, or department..."
        filters={filterDefs}
        activeFilters={activeFilters}
        onFilterChange={handleFilterChange}
        onClearAll={handleClearAll}
        extraActions={
          <input
            type="date"
            value={activeFilters.date}
            onChange={(e) => handleFilterChange('date', e.target.value)}
            className="rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-medium text-slate-700 shadow-subtle focus:border-brand-400 focus:outline-none"
          />
        }
      />

      {/* Table */}
      <DataTable
        columns={columns}
        data={filteredAttendance}
        pageSize={8}
        emptyTitle="No attendance records found"
        emptyDescription="Try clearing filters to display organization attendance logs."
      />

      {/* Attendance Correction Modal */}
      <AttendanceCorrectionModal
        isOpen={isCorrectionOpen}
        onClose={() => {
          setIsCorrectionOpen(false);
          setSelectedRecord(null);
        }}
        record={selectedRecord}
      />
    </div>
  );
}
