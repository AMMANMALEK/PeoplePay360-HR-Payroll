import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StatCard from '../../components/ui/StatCard';
import StatusBadge from '../../components/ui/StatusBadge';
import EmployeeFormModal from '../../components/employees/EmployeeFormModal';
import TimeOffReviewModal from '../../components/timeoff/TimeOffReviewModal';
import { useHRData } from '../../context/HRDataContext';
import { UserPlus, ArrowRight, Check, X } from 'lucide-react';

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function weekdayIndex(dateStr) {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return -1;
  return (d.getDay() + 6) % 7;
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { kpis, employees, contracts, timeOffRequests, attendance, approveTimeOff } = useHRData();
  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false);
  const [reviewRequest, setReviewRequest] = useState(null);

  const recentPending = timeOffRequests.filter((r) => r.status === 'Pending').slice(0, 6);

  const attendanceByDay = useMemo(() => {
    const rows = WEEKDAYS.map((label) => ({ label, present: 0, absent: 0, late: 0, leave: 0 }));
    attendance.forEach((a) => {
      const i = weekdayIndex(a.date);
      if (i < 0) return;
      if (a.status === 'Present' || a.status === 'Overtime') rows[i].present += 1;
      else if (a.status === 'Absent') rows[i].absent += 1;
      else if (a.status === 'Late') rows[i].late += 1;
      else if (a.status === 'On Leave') rows[i].leave += 1;
    });
    const max = Math.max(1, ...rows.flatMap((r) => [r.present, r.absent, r.late, r.leave]));
    return { rows, max };
  }, [attendance]);

  const present = attendance.filter((a) => a.status === 'Present').length;
  const absent = attendance.filter((a) => a.status === 'Absent').length;
  const late = attendance.filter((a) => a.status === 'Late').length;
  const onLeave = employees.filter((e) => e.employmentStatus === 'On Leave').length;

  const expiringContractsList = contracts
    .filter((c) => {
      if (c.status !== 'Active' || !c.endDate) return false;
      const diff = Math.ceil((new Date(c.endDate) - new Date()) / (1000 * 60 * 60 * 24));
      return diff >= 0 && diff <= 45;
    })
    .slice(0, 4);

  return (
    <div className="space-y-7">
      <div className="flex justify-end gap-2">
        <button type="button" onClick={() => setIsAddEmployeeOpen(true)} className="btn-primary">
          <UserPlus className="h-4 w-4" />
          Add Employee
        </button>
        <button type="button" onClick={() => navigate('/time-off?status=Pending')} className="btn-secondary">
          Review time off
        </button>
      </div>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Employees"
          value={kpis.totalEmployees}
          subtext="People currently in the directory"
          icon="users"
          colorScheme="lime"
          onClick={() => navigate('/employees')}
        />
        <StatCard
          title="Present Today"
          value={kpis.presentToday}
          subtext="Employees present, late, or overtime today"
          icon="present"
          colorScheme="mint"
          onClick={() => navigate('/attendance')}
        />
        <StatCard
          title="Pending Time Off"
          value={kpis.pendingTimeOff}
          subtext="Personal Leave is approved automatically"
          icon="calendar"
          colorScheme="peach"
          onClick={() => navigate('/time-off?status=Pending')}
        />
        <StatCard
          title="Active Contracts"
          value={kpis.activeContracts}
          secondaryValue={kpis.expiringContracts ? `${kpis.expiringContracts} soon` : undefined}
          subtext="Current employment agreements"
          icon="contract"
          colorScheme="sky"
          onClick={() => navigate('/contracts')}
        />
      </section>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-5">
        <section className="app-card p-5 xl:col-span-3">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-slate-900">Attendance overview</h3>
              <p className="mt-0.5 text-xs text-slate-500">Built from existing attendance records by weekday.</p>
            </div>
            <button type="button" onClick={() => navigate('/attendance')} className="btn-ghost">
              Open attendance
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: 'Present', value: present, tone: 'bg-[#e4f4ea]' },
              { label: 'Absent', value: absent, tone: 'bg-[#fce8e8]' },
              { label: 'Late', value: late, tone: 'bg-[#fde9d8]' },
              { label: 'On Leave', value: onLeave, tone: 'bg-[#e4eefc]' },
            ].map((item) => (
              <div key={item.label} className={`rounded-2xl ${item.tone} px-3 py-3`}>
                <p className="text-[11px] font-medium text-slate-600">{item.label}</p>
                <p className="mt-1 text-xl font-semibold text-slate-900">{item.value}</p>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            {[
              { key: 'present', label: 'Present', color: 'bg-brand-400' },
              { key: 'absent', label: 'Absent', color: 'bg-rose-400' },
              { key: 'late', label: 'Late', color: 'bg-amber-400' },
            ].map((series) => (
              <div key={series.key} className="grid grid-cols-[72px_1fr] items-center gap-3">
                <span className="text-[11px] font-medium text-slate-500">{series.label}</span>
                <div className="grid grid-cols-7 gap-2">
                  {attendanceByDay.rows.map((day) => (
                    <div key={`${series.key}-${day.label}`} className="flex flex-col items-center gap-1">
                      <div className="flex h-16 w-full items-end rounded-lg bg-slate-50 px-1 pb-1">
                        <div
                          className={`w-full rounded-md ${series.color}`}
                          style={{ height: `${Math.max(8, (day[series.key] / attendanceByDay.max) * 100)}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-slate-400">{day.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="app-card p-5 xl:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-900">Contracts expiring</h3>
            <span className="text-[11px] text-slate-400">Next 45 days</span>
          </div>
          <div className="space-y-2.5">
            {expiringContractsList.length === 0 ? (
              <p className="rounded-2xl bg-slate-50 px-4 py-8 text-center text-xs text-slate-500">
                No active contracts expire in the next 45 days.
              </p>
            ) : (
              expiringContractsList.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => navigate('/contracts?filter=expiring')}
                  className="flex w-full items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-3 py-3 text-left hover:border-brand-200"
                >
                  <div>
                    <p className="text-xs font-semibold text-slate-900">{c.employeeName}</p>
                    <p className="text-[11px] text-slate-500">{c.contractName || c.id}</p>
                  </div>
                  <span className="text-[11px] font-medium text-amber-700">{c.endDate}</span>
                </button>
              ))
            )}
          </div>
        </section>
      </div>

      <section className="app-card overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h3 className="text-base font-semibold text-slate-900">Pending time off requests</h3>
            <p className="text-xs text-slate-500">Approve or refuse using the existing time-off workflow.</p>
          </div>
          <button type="button" onClick={() => navigate('/time-off?status=Pending')} className="btn-ghost">
            View all
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
        {recentPending.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-slate-500">No pending leave requests.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-xs">
              <thead className="bg-slate-50/80 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-5 py-3">Employee</th>
                  <th className="px-3 py-3">Type</th>
                  <th className="px-3 py-3">Start</th>
                  <th className="px-3 py-3">End</th>
                  <th className="px-3 py-3">Duration</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentPending.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/70">
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-slate-900">{req.employeeName}</div>
                      <div className="text-[11px] text-slate-400">{req.employeeId}</div>
                    </td>
                    <td className="px-3 py-3.5 text-slate-700">{req.timeOffType}</td>
                    <td className="px-3 py-3.5 text-slate-700">{req.startDate}</td>
                    <td className="px-3 py-3.5 text-slate-700">{req.endDate}</td>
                    <td className="px-3 py-3.5 font-medium text-slate-900">
                      {req.duration} {req.durationUnit || 'days'}
                    </td>
                    <td className="px-3 py-3.5">
                      <StatusBadge status={req.status} />
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          className="btn-success"
                          onClick={() => approveTimeOff(req.id || req._id)}
                        >
                          <Check className="h-3.5 w-3.5" />
                          Approve
                        </button>
                        <button
                          type="button"
                          className="btn-danger"
                          onClick={() => setReviewRequest(req)}
                        >
                          <X className="h-3.5 w-3.5" />
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <EmployeeFormModal isOpen={isAddEmployeeOpen} onClose={() => setIsAddEmployeeOpen(false)} />
      <TimeOffReviewModal
        isOpen={!!reviewRequest}
        onClose={() => setReviewRequest(null)}
        request={reviewRequest}
      />
    </div>
  );
}
