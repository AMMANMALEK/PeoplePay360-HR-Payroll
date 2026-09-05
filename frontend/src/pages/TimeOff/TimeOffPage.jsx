import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Plus, 
  CheckCircle, 
  XCircle, 
  Clock,
  Check,
  X
} from 'lucide-react';
import { useHRData } from '../../context/HRDataContext';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import FilterBar from '../../components/ui/FilterBar';
import PageHeader from '../../components/ui/PageHeader';
import AllocationCard from '../../components/timeoff/AllocationCard';
import TimeOffReviewModal from '../../components/timeoff/TimeOffReviewModal';
import TimeOffTypeModal from '../../components/timeoff/TimeOffTypeModal';

export default function TimeOffPage() {
  const [searchParams] = useSearchParams();
  const statusParam = searchParams.get('status');
  const searchParam = searchParams.get('search');

  const { timeOffRequests, allocations, timeOffTypes, departments, approveTimeOff } = useHRData();

  const [activeSubTab, setActiveSubTab] = useState('requests'); // 'requests' | 'allocations' | 'types'
  const [searchQuery, setSearchQuery] = useState(searchParam || '');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);

  const [activeFilters, setActiveFilters] = useState({
    department: 'All',
    status: statusParam || 'All'
  });

  const filterDefs = [
    {
      key: 'department',
      label: 'Department',
      options: departments
    },
    {
      key: 'status',
      label: 'Status',
      options: ['Pending', 'Approved', 'Refused']
    }
  ];

  const handleFilterChange = (key, value) => {
    setActiveFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleClearAll = () => {
    setActiveFilters({ department: 'All', status: 'All' });
    setSearchQuery('');
  };

  // Filtered requests
  const filteredRequests = useMemo(() => {
    return timeOffRequests.filter((r) => {
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
  }, [timeOffRequests, searchQuery, activeFilters]);

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
      )
    },
    {
      key: 'timeOffType',
      label: 'Leave Type',
      sortable: true,
      render: (type) => <span className="font-medium text-slate-800">{type}</span>
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
      )
    },
    {
      key: 'duration',
      label: 'Duration',
      sortable: true,
      render: (dur) => <span className="font-semibold text-slate-900">{dur} days</span>
    },
    {
      key: 'reason',
      label: 'Employee Stated Reason',
      render: (reason) => (
        <span className="text-slate-500 italic max-w-xs truncate block" title={reason}>
          "{reason}"
        </span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (status) => <StatusBadge status={status} />
    },
    {
      key: 'actions',
      label: 'Action',
      align: 'right',
      render: (_, row) => (
        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          {row.status === 'Pending' && (
            <>
              <button type="button" className="btn-success" onClick={() => approveTimeOff(row.id)}>
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
      )
    }
  ];

  const pendingCount = timeOffRequests.filter((r) => r.status === 'Pending').length;
  const approvedCount = timeOffRequests.filter((r) => r.status === 'Approved').length;
  const refusedCount = timeOffRequests.filter((r) => r.status === 'Refused' || r.status === 'Rejected').length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Time Off"
        subtitle="Review leave requests, balances, and time-off types."
        actions={
          activeSubTab === 'types' ? (
            <button type="button" onClick={() => setIsTypeModalOpen(true)} className="btn-primary">
              <Plus className="h-4 w-4" />
              Add Time Off Type
            </button>
          ) : null
        }
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-[18px] bg-[#fde9d8] p-4">
          <div className="flex items-center gap-1.5 text-xs font-medium text-amber-800">
            <Clock className="h-3.5 w-3.5" />
            Pending
          </div>
          <div className="mt-2 text-2xl font-semibold text-slate-900">{pendingCount}</div>
        </div>
        <div className="rounded-[18px] bg-[#e4f4ea] p-4">
          <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-800">
            <CheckCircle className="h-3.5 w-3.5" />
            Approved
          </div>
          <div className="mt-2 text-2xl font-semibold text-slate-900">{approvedCount}</div>
        </div>
        <div className="rounded-[18px] bg-[#fce8e8] p-4">
          <div className="flex items-center gap-1.5 text-xs font-medium text-rose-800">
            <XCircle className="h-3.5 w-3.5" />
            Rejected
          </div>
          <div className="mt-2 text-2xl font-semibold text-slate-900">{refusedCount}</div>
        </div>
      </div>

      <div className="flex gap-2 rounded-2xl bg-slate-100 p-1 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveSubTab('requests')}
          className={`flex-1 rounded-xl px-3 py-2 ${
            activeSubTab === 'requests' ? 'bg-white text-slate-900 shadow-subtle' : 'text-slate-500'
          }`}
        >
          Requests
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

      {/* SUBTAB 1: REQUESTS */}
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
            emptyTitle="No time-off requests found"
            emptyDescription="There are no pending or logged leave requests matching your filters."
          />
        </div>
      )}

      {/* SUBTAB 2: ALLOCATIONS */}
      {activeSubTab === 'allocations' && (
        <div className="space-y-4">
          <div className="text-xs text-slate-500">
            Current balance consumption per employee across annual leave and statutory quotas.
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {allocations.map((alc) => (
              <div key={alc.id} className="space-y-2">
                <div className="text-xs font-bold text-slate-800 px-1">{alc.employeeName}</div>
                <AllocationCard allocation={alc} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBTAB 3: TIME OFF TYPES */}
      {activeSubTab === 'types' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {timeOffTypes.map((t) => (
              <div
                key={t.id}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-card space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{t.name}</h3>
                    <span className="text-[11px] text-slate-400 font-mono">{t.id}</span>
                  </div>
                  <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                    Unit: {t.unit}
                  </span>
                </div>

                <div className="text-xs space-y-1.5 border-t border-slate-100 pt-3 text-slate-600">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Allocation Required:</span>
                    <span className="font-semibold">{t.allocationRequired ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Approval Workflow:</span>
                    <span className="font-medium text-right">{t.approvalWorkflow}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Review Modal */}
      <TimeOffReviewModal
        isOpen={!!selectedRequest}
        onClose={() => setSelectedRequest(null)}
        request={selectedRequest}
      />

      {/* Time Off Type Modal */}
      <TimeOffTypeModal
        isOpen={isTypeModalOpen}
        onClose={() => setIsTypeModalOpen(false)}
      />
    </div>
  );
}
