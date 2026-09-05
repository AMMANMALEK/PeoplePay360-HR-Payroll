import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  CheckCircle, 
  XCircle, 
  Clock,
  Check,
  X,
  Plus
} from 'lucide-react';
import { useHRData } from '../../context/HRDataContext';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import FilterBar from '../../components/ui/FilterBar';
import PageHeader from '../../components/ui/PageHeader';
import AllocationCard from '../../components/timeoff/AllocationCard';
import TimeOffReviewModal from '../../components/timeoff/TimeOffReviewModal';
import HRLeaveRequestModal from '../../components/timeoff/HRLeaveRequestModal';

export default function TimeOffPage() {
  const [searchParams] = useSearchParams();
  const statusParam = searchParams.get('status');
  const searchParam = searchParams.get('search');

  const {
    timeOffRequests,
    allocations,
    timeOffTypes,
    departments,
    approveTimeOff,
  } = useHRData();

  const [activeSubTab, setActiveSubTab] = useState('requests'); // 'requests' | 'allocations' | 'types'
  const [searchQuery, setSearchQuery] = useState(searchParam || '');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isHRLeaveModalOpen, setIsHRLeaveModalOpen] = useState(false);

  const [activeFilters, setActiveFilters] = useState({
    department: 'All',
    status: statusParam || 'All',
  });

  const filterDefs = [
    {
      key: 'department',
      label: 'Department',
      options: departments,
    },
    {
      key: 'status',
      label: 'Status',
      options: ['Pending', 'Approved', 'Refused'],
    },
  ];

  const handleFilterChange = (key, value) => {
    setActiveFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleClearAll = () => {
    setActiveFilters({ department: 'All', status: 'All' });
    setSearchQuery('');
  };

  // Helper to detect if a request belongs to an HR Leader
  const isHRLeaderRequest = (r) => {
    return (
      Boolean(r.requiresAdminApproval) ||
      r.employeeId === 'HRMGR' ||
      r.employeeId === 'HRPAYMGR' ||
      String(r.id || '').startsWith('REQ-HR-') ||
      r.role === 'HR_MANAGER' ||
      r.role === 'HR_PAYROLL_MANAGER' ||
      r.employeeName === 'David Kim' ||
      r.employeeName === 'Sarah Jenkins' ||
      r.jobPosition === 'HR Manager' ||
      r.jobPosition === 'HR Payroll Manager'
    );
  };

  // Strictly filter for employee requests ONLY (exclude all HR leaders)
  const employeeTimeOffRequests = useMemo(() => {
    return timeOffRequests.filter((r) => !isHRLeaderRequest(r));
  }, [timeOffRequests]);

  // Filtered employee requests for table
  const filteredRequests = useMemo(() => {
    return employeeTimeOffRequests.filter((r) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          (r.employeeName || '').toLowerCase().includes(q) ||
          (r.timeOffType || '').toLowerCase().includes(q) ||
          String(r.id || '').toLowerCase().includes(q);
        if (!matches) return false;
      }

      if (activeFilters.department !== 'All' && r.department !== activeFilters.department) {
        return false;
      }

      if (activeFilters.status !== 'All' && r.status !== activeFilters.status) {
        return false;
      }

      return true;
    });
  }, [employeeTimeOffRequests, searchQuery, activeFilters]);

  // Request table columns
  const requestColumns = [
    {
      key: 'employeeName',
      label: 'Employee',
      sortable: true,
      render: (name, row) => (
        <div>
          <div className="font-semibold text-slate-900">{name}</div>
          <div className="text-[11px] text-slate-400 font-mono">{row.employeeId}</div>
        </div>
      ),
    },
    {
      key: 'timeOffType',
      label: 'Leave Type',
      sortable: true,
      render: (type) => <span className="font-medium text-slate-800">{type}</span>,
    },
    {
      key: 'startDate',
      label: 'Dates Requested',
      sortable: true,
      render: (start, row) => (
        <div className="text-xs">
          <span className="font-medium text-slate-800">{start}</span>
          <span className="text-slate-400 mx-1">→</span>
          <span className="font-medium text-slate-800">{row.endDate}</span>
        </div>
      ),
    },
    {
      key: 'duration',
      label: 'Duration',
      sortable: true,
      render: (dur) => <span className="font-semibold text-slate-900">{dur} days</span>,
    },
    {
      key: 'reason',
      label: 'Employee Stated Reason',
      render: (reason) => (
        <span className="text-slate-500 italic max-w-xs truncate block" title={reason}>
          "{reason}"
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (status) => <StatusBadge status={status} />,
    },
    {
      key: 'actions',
      label: 'Action',
      align: 'right',
      render: (_, row) => (
        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          {row.status === 'Pending' && (
            <>
              <button type="button" className="btn-success" onClick={() => approveTimeOff(row.id || row._id)}>
                <Check className="h-3.5 w-3.5" />
                Approve
              </button>
              <button type="button" className="btn-danger" onClick={() => setSelectedRequest(row)}>
                <X className="h-3.5 w-3.5" />
                Reject
              </button>
            </>
          )}
          {row.status !== 'Pending' && (
            <button type="button" className="btn-secondary" onClick={() => setSelectedRequest(row)}>
              View
            </button>
          )}
        </div>
      ),
    },
  ];

  // KPIs strictly for employees
  const pendingCount = employeeTimeOffRequests.filter((r) => r.status === 'Pending').length;
  const approvedCount = employeeTimeOffRequests.filter((r) => r.status === 'Approved').length;
  const refusedCount = employeeTimeOffRequests.filter(
    (r) => r.status === 'Refused' || r.status === 'Rejected'
  ).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Time Off"
        subtitle="Workforce leave management, approvals, and entitlement balances."
        actions={
          <button
            type="button"
            onClick={() => setIsHRLeaveModalOpen(true)}
            className="btn-primary flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Request Leave (Admin Approval)
          </button>
        }
      />

      {/* KPI Cards (strictly employees) */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-[18px] bg-[#fde9d8] p-4">
          <div className="flex items-center gap-1.5 text-xs font-medium text-amber-800">
            <Clock className="h-3.5 w-3.5" />
            Pending Employee Leaves
          </div>
          <div className="mt-2 text-2xl font-semibold text-slate-900">{pendingCount}</div>
        </div>
        <div className="rounded-[18px] bg-[#e4f4ea] p-4">
          <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-800">
            <CheckCircle className="h-3.5 w-3.5" />
            Approved Leaves
          </div>
          <div className="mt-2 text-2xl font-semibold text-slate-900">{approvedCount}</div>
        </div>
        <div className="rounded-[18px] bg-[#fce8e8] p-4">
          <div className="flex items-center gap-1.5 text-xs font-medium text-rose-800">
            <XCircle className="h-3.5 w-3.5" />
            Rejected / Refused
          </div>
          <div className="mt-2 text-2xl font-semibold text-slate-900">{refusedCount}</div>
        </div>
      </div>

      {/* Subtabs */}
      <div className="flex gap-2 rounded-2xl bg-slate-100 p-1 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveSubTab('requests')}
          className={`flex-1 rounded-xl px-3 py-2 ${
            activeSubTab === 'requests' ? 'bg-white text-slate-900 shadow-subtle' : 'text-slate-500'
          }`}
        >
          Employee Requests ({employeeTimeOffRequests.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('allocations')}
          className={`flex-1 rounded-xl px-3 py-2 ${
            activeSubTab === 'allocations' ? 'bg-white text-slate-900 shadow-subtle' : 'text-slate-500'
          }`}
        >
          Allocations
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('types')}
          className={`flex-1 rounded-xl px-3 py-2 ${
            activeSubTab === 'types' ? 'bg-white text-slate-900 shadow-subtle' : 'text-slate-500'
          }`}
        >
          Types
        </button>
      </div>

      {/* SUBTAB 1: EMPLOYEE REQUESTS */}
      {activeSubTab === 'requests' && (
        <div className="space-y-4">
          <FilterBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder="Search by employee name or leave type..."
            filters={filterDefs}
            activeFilters={activeFilters}
            onFilterChange={handleFilterChange}
            onClearAll={handleClearAll}
          />

          <DataTable
            columns={requestColumns}
            data={filteredRequests}
            pageSize={8}
            emptyTitle="No employee time-off requests found"
            emptyDescription="There are no pending or logged leave requests for employees matching your filters."
          />
        </div>
      )}

      {/* SUBTAB 2: ALLOCATIONS */}
      {activeSubTab === 'allocations' && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {allocations.map((alloc) => (
            <AllocationCard key={alloc.id || alloc.typeName} allocation={alloc} />
          ))}
        </div>
      )}

      {/* SUBTAB 3: TYPES */}
      {activeSubTab === 'types' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-subtle">
          <h3 className="text-sm font-bold text-slate-900 mb-4">Configured Time-Off Types</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {timeOffTypes.map((type) => (
              <div key={type.code || type.name} className="rounded-xl border border-slate-100 bg-slate-50/70 p-4 space-y-1">
                <p className="text-xs font-bold text-slate-900">{type.name}</p>
                <p className="text-[11px] text-slate-500 font-mono">Code: {type.code}</p>
                <p className="text-[11px] text-slate-600 mt-2">{type.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Review Modal */}
      <TimeOffReviewModal
        isOpen={Boolean(selectedRequest)}
        onClose={() => setSelectedRequest(null)}
        request={selectedRequest}
      />

      {/* HR Leader Request Modal */}
      <HRLeaveRequestModal
        isOpen={isHRLeaveModalOpen}
        onClose={() => setIsHRLeaveModalOpen(false)}
      />
    </div>
  );
}
