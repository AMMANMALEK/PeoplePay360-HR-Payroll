import React from 'react';
import PageHeader from '../../components/ui/PageHeader';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import TodayAttendanceCard from '../../components/employee/TodayAttendanceCard';
import { useEmployeeData } from '../../context/EmployeeDataContext';

export default function EmployeeAttendancePage() {
  const { attendance, isLoading, error } = useEmployeeData();

  return (
    <div className="space-y-6">
      <PageHeader
        title="My attendance"
        subtitle="Check in and out for today, then review your history."
        count={attendance.length}
      />

      {error && <div className="app-card p-4 text-sm text-rose-600">{error}</div>}

      <TodayAttendanceCard />

      <DataTable
        isLoading={isLoading}
        data={attendance}
        emptyTitle="No attendance yet"
        emptyDescription="Check in to create your first attendance record."
        columns={[
          { key: 'date', label: 'Date' },
          {
            key: 'checkInDisplay',
            label: 'Check in',
            render: (value, row) => value || row.checkIn,
          },
          {
            key: 'checkOutDisplay',
            label: 'Check out',
            render: (value, row) => value || row.checkOut,
          },
          { key: 'workedHours', label: 'Hours' },
          {
            key: 'status',
            label: 'Status',
            render: (value) => <StatusBadge status={value} size="sm" />,
          },
        ]}
      />
    </div>
  );
}
