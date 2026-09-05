import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  UserCheck, 
  Clock, 
  UserX, 
  AlertOctagon, 
  Timer, 
  FileEdit, 
  History, 
  Calendar 
} from 'lucide-react';
import { useHRData } from '../../context/HRDataContext';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import FilterBar from '../../components/ui/FilterBar';
import AttendanceCorrectionModal from '../../components/attendance/AttendanceCorrectionModal';

export default function AttendancePage() {
  const [searchParams] = useSearchParams();
  const filterQuery = searchParams.get('filter');

  const { attendance, departments } = useHRData();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isCorrectionOpen, setIsCorrectionOpen] = useState(false);

  const [activeFilters, setActiveFilters] = useState({
    department: 'All',
    status: filterQuery === 'exceptions' ? 'Exceptions Only' : 'All',
    date: '2026-09-05'
  });

  // Calculate summary counts
  const summary = useMemo(() => {
    return {
      present: attendance.filter((a) => a.status === 'Present').length,
      late: attendance.filter((a) => a.status === 'Late').length,
      absent: attendance.filter((a) => a.status === 'Absent').length,
      incomplete: attendance.filter((a) => a.status === 'Incomplete').length,
      overtime: attendance.filter((a) => a.status === 'Overtime').length,
      corrected: attendance.filter((a) => !!a.correction).length
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
        { label: 'Exceptions Only', value: 'Exceptions Only' },
        { label: 'Present', value: 'Present' },
        { label: 'Late', value: 'Late' },
        { label: 'Absent', value: 'Absent' },
        { label: 'Incomplete', value: 'Incomplete' },
        { label: 'Overtime', value: 'Overtime' }
      ]
    }
  ];

  const handleFilterChange = (key, value) => {
    setActiveFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleClearAll = () => {
    setActiveFilters({ department: 'All', status: 'All', date: '2026-09-05' });
    setSearchQuery('');
  };

  const filteredAttendance = useMemo(() => {
    return attendance.filter((a) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          a.employeeName.toLowerCase().includes(q) ||
          a.employeeId.toLowerCase().includes(q) ||
          a.department.toLowerCase().includes(q);
        if (!matches) return false;
      }

      if (activeFilters.department !== 'All' && a.department !== activeFilters.department) {
        return false;
      }

      if (activeFilters.status === 'Exceptions Only' && !a.isException) {
        return false;
      } else if (
        activeFilters.status !== 'All' &&
        activeFilters.status !== 'Exceptions Only' &&
        a.status !== activeFilters.status
      ) {
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
          <div className="text-[11px] text-slate-400 font-mono">{row.employeeId}</div>
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
      label: 'Status & Exception',
      sortable: true,
      render: (status, row) => (
        <div className="flex items-center gap-1.5 flex-wrap">
          <StatusBadge status={status} />
          {status === 'Incomplete' ? (
            <span className="rounded bg-rose-50 px-1.5 py-0.5 text-[10px] font-bold text-rose-700 border border-rose-200">
              ⚠ Missing checkout
            </span>
          ) : row.isException ? (
            <span className="rounded bg-rose-50 px-1.5 py-0.5 text-[10px] font-bold text-rose-700 border border-rose-200">
              ⚠ Exception
            </span>
          ) : null}
        </div>
      )
    },
    {
      key: 'correction',
      label: 'Audit Log',
      render: (correction) => {
        if (!correction) return <span className="text-slate-400 italic text-[11px]">Clean</span>;
        return (
          <div className="text-[10px] text-indigo-700 bg-indigo-50/70 p-1 rounded max-w-xs truncate border border-indigo-100">
            <span className="font-semibold">Corrected:</span> {correction.reason}
          </div>
        );
      }
    },
    {
      key: 'actions',
      label: 'Action',
      align: 'right',
      render: (_, row) => (
        <button
          type="button"
          onClick={() => {
            setSelectedRecord(row);
            setIsCorrectionOpen(true);
          }}
          className="inline-flex items-center gap-1 rounded px-2.5 py-1 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 transition-colors"
        >
          <FileEdit className="h-3 w-3" />
          <span>Correct</span>
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
          Attendance Operations
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          Monitor daily employee attendance, flag exceptions, and perform authorized compliance corrections.
        </p>
      </div>

      {/* Summary Metric Pills */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3 shadow-subtle">
          <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-medium">
            <UserCheck className="h-3.5 w-3.5" />
            <span>Present</span>
          </div>
          <div className="mt-1 text-xl font-extrabold text-emerald-900">{summary.present}</div>
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3 shadow-subtle">
          <div className="flex items-center gap-1.5 text-xs text-amber-800 font-medium">
            <Clock className="h-3.5 w-3.5" />
            <span>Late</span>
          </div>
          <div className="mt-1 text-xl font-extrabold text-amber-900">{summary.late}</div>
        </div>

        <div className="rounded-xl border border-rose-200 bg-rose-50/60 p-3 shadow-subtle">
          <div className="flex items-center gap-1.5 text-xs text-rose-800 font-medium">
            <UserX className="h-3.5 w-3.5" />
            <span>Absent</span>
          </div>
          <div className="mt-1 text-xl font-extrabold text-rose-900">{summary.absent}</div>
        </div>

        <div className="rounded-xl border border-purple-200 bg-purple-50/60 p-3 shadow-subtle">
          <div className="flex items-center gap-1.5 text-xs text-purple-800 font-medium">
            <AlertOctagon className="h-3.5 w-3.5" />
            <span>Missing Out</span>
          </div>
          <div className="mt-1 text-xl font-extrabold text-purple-900">{summary.incomplete}</div>
        </div>

        <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-3 shadow-subtle">
          <div className="flex items-center gap-1.5 text-xs text-blue-800 font-medium">
            <Timer className="h-3.5 w-3.5" />
            <span>Overtime</span>
          </div>
          <div className="mt-1 text-xl font-extrabold text-blue-900">{summary.overtime}</div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 shadow-subtle">
          <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium">
            <History className="h-3.5 w-3.5" />
            <span>Corrected</span>
          </div>
          <div className="mt-1 text-xl font-extrabold text-slate-800">{summary.corrected}</div>
        </div>
      </div>

      {/* Filter Bar */}
      <FilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search employee, ID, or department..."
        filters={filterDefs}
        activeFilters={activeFilters}
        onFilterChange={handleFilterChange}
        onClearAll={handleClearAll}
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
