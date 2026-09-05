import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { UserCheck, Clock, UserX, AlertOctagon, Timer, FileEdit, History } from 'lucide-react';
import { useHRData } from '../../context/HRDataContext';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import FilterBar from '../../components/ui/FilterBar';
import PageHeader from '../../components/ui/PageHeader';
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
    date: ''
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

      if (activeFilters.status === 'Exceptions Only' && !a.isException) {
        return false;
      } else if (
        activeFilters.status !== 'All' &&
        activeFilters.status !== 'Exceptions Only' &&
        a.status !== activeFilters.status
      ) {
        return false;
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
      render: (_, row) => (
        <button
          type="button"
          onClick={() => {
            setSelectedRecord(row);
            setIsCorrectionOpen(true);
          }}
          className="inline-flex items-center gap-1 rounded-xl px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-brand-50"
        >
          <FileEdit className="h-3 w-3" />
          <span>Correct</span>
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendance"
        subtitle="Review presence, exceptions, and authorized corrections."
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <div className="rounded-[18px] bg-[#e4f4ea] p-4">
          <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-800">
            <UserCheck className="h-3.5 w-3.5" />
            Present
          </div>
          <div className="mt-2 text-2xl font-semibold text-slate-900">{summary.present}</div>
        </div>
        <div className="rounded-[18px] bg-[#fde9d8] p-4">
          <div className="flex items-center gap-1.5 text-xs font-medium text-amber-800">
            <Clock className="h-3.5 w-3.5" />
            Late
          </div>
          <div className="mt-2 text-2xl font-semibold text-slate-900">{summary.late}</div>
        </div>
        <div className="rounded-[18px] bg-[#fce8e8] p-4">
          <div className="flex items-center gap-1.5 text-xs font-medium text-rose-800">
            <UserX className="h-3.5 w-3.5" />
            Absent
          </div>
          <div className="mt-2 text-2xl font-semibold text-slate-900">{summary.absent}</div>
        </div>
        <div className="rounded-[18px] bg-[#eee8fb] p-4">
          <div className="flex items-center gap-1.5 text-xs font-medium text-violet-800">
            <AlertOctagon className="h-3.5 w-3.5" />
            Incomplete
          </div>
          <div className="mt-2 text-2xl font-semibold text-slate-900">{summary.incomplete}</div>
        </div>
        <div className="rounded-[18px] bg-[#e4eefc] p-4">
          <div className="flex items-center gap-1.5 text-xs font-medium text-sky-800">
            <Timer className="h-3.5 w-3.5" />
            Overtime
          </div>
          <div className="mt-2 text-2xl font-semibold text-slate-900">{summary.overtime}</div>
        </div>
        <div className="rounded-[18px] bg-slate-100 p-4">
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-700">
            <History className="h-3.5 w-3.5" />
            Corrected
          </div>
          <div className="mt-2 text-2xl font-semibold text-slate-900">{summary.corrected}</div>
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
