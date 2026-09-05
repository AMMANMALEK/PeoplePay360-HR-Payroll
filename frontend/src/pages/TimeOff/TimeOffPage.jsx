import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Plus, 
  CalendarCheck, 
  PieChart, 
  Sliders, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Lock 
} from 'lucide-react';
import { useHRData } from '../../context/HRDataContext';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import FilterBar from '../../components/ui/FilterBar';
import AllocationCard from '../../components/timeoff/AllocationCard';
import TimeOffReviewModal from '../../components/timeoff/TimeOffReviewModal';
import TimeOffTypeModal from '../../components/timeoff/TimeOffTypeModal';

export default function TimeOffPage() {
  const [searchParams] = useSearchParams();
  const statusParam = searchParams.get('status');
  const searchParam = searchParams.get('search');

  const { timeOffRequests, allocations, timeOffTypes, departments } = useHRData();

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
          r.employeeName.toLowerCase().includes(q) ||
          r.timeOffType.toLowerCase().includes(q) ||
          r.id.toLowerCase().includes(q);
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
      render: (dur) => <span className="font-bold text-indigo-700">{dur} days</span>
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
        <button
          type="button"
          onClick={() => setSelectedRequest(row)}
          className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
            row.status === 'Pending'
              ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm'
              : 'border border-slate-300 text-slate-700 hover:bg-slate-50'
          }`}
        >
          {row.status === 'Pending' ? 'Review & Decision' : 'View Detail'}
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            Time Off & Leave Management
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Review incoming leave applications, inspect employee balances, and configure organizational leave types.
          </p>
        </div>

        {activeSubTab === 'types' && (
          <button
            type="button"
            onClick={() => setIsTypeModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-medium text-white hover:bg-indigo-700 shadow-sm transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>+ Add Time Off Type</span>
          </button>
        )}
      </div>

      {/* Sub-Navigation */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-6 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveSubTab('requests')}
            className={`border-b-2 pb-3 transition-colors ${
              activeSubTab === 'requests'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Requests ({timeOffRequests.filter((r) => r.status === 'Pending').length} Pending)
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('allocations')}
            className={`border-b-2 pb-3 transition-colors ${
              activeSubTab === 'allocations'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Employee Allocations ({allocations.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('types')}
            className={`border-b-2 pb-3 transition-colors ${
              activeSubTab === 'types'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Time Off Types ({timeOffTypes.length})
          </button>
        </nav>
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
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-subtle space-y-3"
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

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-[11px] text-slate-600 space-y-1">
                  <div className="flex items-center gap-1 font-semibold text-slate-800">
                    <Lock className="h-3 w-3 text-slate-400" />
                    <span>Payroll Synchronization</span>
                  </div>
                  <p className="text-[10px] text-slate-500">{t.payrollIntegration}</p>
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
