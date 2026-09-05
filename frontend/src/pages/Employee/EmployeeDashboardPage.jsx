import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import StatCard from '../../components/ui/StatCard';
import StatusBadge from '../../components/ui/StatusBadge';
import SkeletonLoader from '../../components/ui/SkeletonLoader';
import EmptyState from '../../components/ui/EmptyState';
import TodayAttendanceCard from '../../components/employee/TodayAttendanceCard';
import LeaveBalanceSection from '../../components/employee/LeaveBalanceSection';
import RequestTimeOffModal from '../../components/employee/RequestTimeOffModal';
import { useEmployeeData } from '../../context/EmployeeDataContext';
import { greetingLabel, displayRequestStatus } from '../../services/meService';

export default function EmployeeDashboardPage() {
  const navigate = useNavigate();
  const [isRequestOpen, setIsRequestOpen] = useState(false);
  const {
    profile,
    attendance,
    requests,
    totalRemainingLeaves,
    isLoading,
    error,
  } = useEmployeeData();

  // Calculate unique, non-repetitive metrics for dashboard KPIs
  const currentMonthPrefix = useMemo(() => {
    const d = new Date();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    return `${d.getFullYear()}-${m}`;
  }, []);

  const presentDaysThisMonth = useMemo(() => {
    return attendance.filter(
      (r) =>
        String(r.date || '').startsWith(currentMonthPrefix) &&
        (r.status === 'present' || r.status === 'Present')
    ).length;
  }, [attendance, currentMonthPrefix]);

  const totalWorkedHours = useMemo(() => {
    const sum = attendance.reduce((acc, r) => acc + (Number(r.workedHours) || 0), 0);
    return Math.round(sum * 10) / 10;
  }, [attendance]);

  const scheduleDisplay = useMemo(() => {
    if (profile?.scheduleName) return profile.scheduleName;
    if (profile?.workingSchedule?.name) return profile.workingSchedule.name;
    if (profile?.workingSchedule?.weeklyHours) {
      return `${profile.workingSchedule.weeklyHours}h / week`;
    }
    return 'Standard 40h/wk';
  }, [profile]);

  if (isLoading) {
    return <SkeletonLoader />;
  }

  if (error) {
    return <div className="app-card p-6 text-sm text-rose-600">{error}</div>;
  }

  const firstName = profile?.firstName || profile?.fullName || 'there';
  const recentAttendance = attendance.slice(0, 6);
  const recentRequests = requests.slice(0, 6);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-[28px]">
          {greetingLabel()}, {firstName}
        </h1>
        <p className="mt-1.5 text-sm text-slate-500">Here's your work and leave overview.</p>
      </div>

      {/* 4 Unique Read-Only KPI Cards with proper spacing */}
      <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Monthly Presence"
          value={`${presentDaysThisMonth} ${presentDaysThisMonth === 1 ? 'Day' : 'Days'}`}
          subtext="Current month attendance"
          icon="present"
          colorScheme="mint"
        />
        <StatCard
          title="Hours Logged"
          value={`${totalWorkedHours.toFixed(1)} hrs`}
          subtext="Tracked working hours"
          icon="health"
          colorScheme="sky"
        />
        <StatCard
          title="Total Available Leaves"
          value={`${totalRemainingLeaves} Days`}
          subtext="Across Personal, Sick & Festival"
          icon="calendar"
          colorScheme="lime"
        />
        <StatCard
          title="Working Schedule"
          value={scheduleDisplay}
          subtext="Assigned work shift"
          icon="alert"
          colorScheme="peach"
        />
      </section>

      {/* Today's Attendance & Leave Balance */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
        <div className="xl:col-span-3">
          <TodayAttendanceCard />
        </div>
        <section className="app-card p-5 xl:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-900">Leave balance</h3>
            <button type="button" className="btn-ghost" onClick={() => navigate('/employee/time-off')}>
              View all
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
          <LeaveBalanceSection compact />
        </section>
      </div>

      {/* Recent Tables with proper spacing */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <section className="app-card overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div>
              <h3 className="text-base font-semibold text-slate-900">Recent attendance</h3>
              <p className="text-xs text-slate-500">Your records only.</p>
            </div>
            <button type="button" className="btn-ghost" onClick={() => navigate('/employee/attendance')}>
              View all
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
          {recentAttendance.length === 0 ? (
            <EmptyState
              title="No attendance yet"
              description="Check in to create your first record."
              className="border-0 shadow-none"
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px] text-left text-xs">
                <thead className="bg-slate-50/80 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="px-5 py-3">Date</th>
                    <th className="px-3 py-3">Check in</th>
                    <th className="px-3 py-3">Check out</th>
                    <th className="px-5 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentAttendance.map((row) => (
                    <tr key={row.id}>
                      <td className="px-5 py-3.5 font-medium text-slate-900">{row.date}</td>
                      <td className="px-3 py-3.5 text-slate-700">{row.checkInDisplay || row.checkIn || '--'}</td>
                      <td className="px-3 py-3.5 text-slate-700">{row.checkOutDisplay || row.checkOut || '--'}</td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={row.status} size="sm" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="app-card overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div>
              <h3 className="text-base font-semibold text-slate-900">Time off requests</h3>
              <p className="text-xs text-slate-500">Personal, Sick & Festival leaves.</p>
            </div>
            <button type="button" className="btn-primary" onClick={() => setIsRequestOpen(true)}>
              Request time off
            </button>
          </div>
          {recentRequests.length === 0 ? (
            <EmptyState
              title="No requests yet"
              description="Submit a time off request when you need leave."
              className="border-0 shadow-none"
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] text-left text-xs">
                <thead className="bg-slate-50/80 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="px-5 py-3">Type</th>
                    <th className="px-3 py-3">Start</th>
                    <th className="px-3 py-3">End</th>
                    <th className="px-3 py-3">Duration</th>
                    <th className="px-5 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentRequests.map((row) => (
                    <tr key={row.id}>
                      <td className="px-5 py-3.5 font-medium text-slate-900">{row.timeOffType}</td>
                      <td className="px-3 py-3.5 text-slate-700">{row.startDate}</td>
                      <td className="px-3 py-3.5 text-slate-700">{row.endDate}</td>
                      <td className="px-3 py-3.5 text-slate-700">
                        {row.duration} {row.durationUnit || 'days'}
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={displayRequestStatus(row.status)} size="sm" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      <RequestTimeOffModal isOpen={isRequestOpen} onClose={() => setIsRequestOpen(false)} />
    </div>
  );
}
