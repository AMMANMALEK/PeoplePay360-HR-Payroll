import React, { useState } from 'react';
import PageHeader from '../../components/ui/PageHeader';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import LeaveBalanceSection from '../../components/employee/LeaveBalanceSection';
import RequestTimeOffModal from '../../components/employee/RequestTimeOffModal';
import { useEmployeeData } from '../../context/EmployeeDataContext';
import { displayRequestStatus } from '../../services/meService';

export default function EmployeeTimeOffPage() {
  const {
    requests,
    isLoading,
    error,
  } = useEmployeeData();
  const [isRequestOpen, setIsRequestOpen] = useState(false);

  return (
    <div className="space-y-4 sm:space-y-5">
      <PageHeader
        title="Time off"
        subtitle="Manage and request Personal, Sick, and Festival leave. Track real-time balances and approvals."
        actions={
          <button type="button" className="btn-primary" onClick={() => setIsRequestOpen(true)}>
            Request time off
          </button>
        }
      />

      {error && <div className="app-card p-4 text-sm text-rose-600">{error}</div>}

      {/* Colored Leave Balance Allocation Cards (Personal, Sick, Festival) */}
      <section>
        <div className="mb-2.5 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900">
            Leave balance allocation
          </h3>
        </div>
        <LeaveBalanceSection />
      </section>

      {/* Time Off Requests Table */}
      <section>
        <div className="mb-2.5 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900">My time off requests</h3>
        </div>
        <DataTable
          isLoading={isLoading}
          data={requests}
          emptyTitle="No requests yet"
          emptyDescription="Use Request time off to submit Sick, Festival, or Personal leave."
          columns={[
            { key: 'timeOffType', label: 'Type' },
            { key: 'startDate', label: 'Start date' },
            { key: 'endDate', label: 'End date' },
            {
              key: 'duration',
              label: 'Duration',
              render: (value, row) => `${value} ${row.durationUnit || 'days'}`,
            },
            {
              key: 'status',
              label: 'Status',
              render: (value) => <StatusBadge status={displayRequestStatus(value)} size="sm" />,
            },
            { key: 'reason', label: 'Reason' },
          ]}
        />
      </section>

      <RequestTimeOffModal isOpen={isRequestOpen} onClose={() => setIsRequestOpen(false)} />
    </div>
  );
}
