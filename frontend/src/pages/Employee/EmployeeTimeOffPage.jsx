import React, { useState } from 'react';
import PageHeader from '../../components/ui/PageHeader';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import StatCard from '../../components/ui/StatCard';
import LeaveBalanceSection from '../../components/employee/LeaveBalanceSection';
import RequestTimeOffModal from '../../components/employee/RequestTimeOffModal';
import { useEmployeeData } from '../../context/EmployeeDataContext';
import { displayRequestStatus } from '../../services/meService';

export default function EmployeeTimeOffPage() {
  const {
    requests,
    currentPersonalLeave,
    currentSickLeave,
    currentFestivalLeave,
    totalRemainingLeaves,
    isLoading,
    error,
  } = useEmployeeData();
  const [isRequestOpen, setIsRequestOpen] = useState(false);

  const personalRemaining = currentPersonalLeave?.remaining ?? 15;
  const sickRemaining = currentSickLeave?.remaining ?? 10;
  const festivalRemaining = currentFestivalLeave?.remaining ?? 5;

  return (
    <div className="space-y-6">
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

      {/* Multiple Leave KPIs for Sick Leave, Festival Leave, Personal Leave & Total */}
      <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Sick Leave"
          value={`${sickRemaining} Days`}
          subtext="March – August window (2 quarters)"
          icon="health"
          colorScheme="peach"
        />
        <StatCard
          title="Festival Leave"
          value={`${festivalRemaining} Days`}
          subtext="5 days annual allowance"
          icon="calendar"
          colorScheme="lilac"
        />
        <StatCard
          title="Personal Leave"
          value={`${personalRemaining} Days`}
          subtext="15 days annual allowance"
          icon="present"
          colorScheme="mint"
        />
        <StatCard
          title="Total Available"
          value={`${totalRemainingLeaves} Days`}
          subtext="Combined time-off balance"
          icon="contract"
          colorScheme="lime"
        />
      </section>

      <section>
        <h3 className="mb-3 text-sm font-semibold text-slate-900">Leave balance allocation</h3>
        <LeaveBalanceSection />
      </section>

      <section>
        <h3 className="mb-3 text-sm font-semibold text-slate-900">My time off requests</h3>
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
