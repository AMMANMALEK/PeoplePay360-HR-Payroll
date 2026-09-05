import React, { useState } from 'react';
import PageHeader from '../../components/ui/PageHeader';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import LeaveBalanceSection from '../../components/employee/LeaveBalanceSection';
import RequestTimeOffModal from '../../components/employee/RequestTimeOffModal';
import { useEmployeeData } from '../../context/EmployeeDataContext';
import { displayRequestStatus } from '../../services/meService';

export default function EmployeeTimeOffPage() {
  const { requests, isLoading, error } = useEmployeeData();
  const [isRequestOpen, setIsRequestOpen] = useState(false);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Time off"
        subtitle="Request Personal Leave. Approved requests update your remaining balance immediately."
        actions={
          <button type="button" className="btn-primary" onClick={() => setIsRequestOpen(true)}>
            Request time off
          </button>
        }
      />

      {error && <div className="app-card p-4 text-sm text-rose-600">{error}</div>}

      <section>
        <h3 className="mb-3 text-sm font-semibold text-slate-900">Leave balance</h3>
        <LeaveBalanceSection />
      </section>

      <section>
        <h3 className="mb-3 text-sm font-semibold text-slate-900">My time off requests</h3>
        <DataTable
          isLoading={isLoading}
          data={requests}
          emptyTitle="No requests yet"
          emptyDescription="Use Request time off to submit Personal Leave for yourself."
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
