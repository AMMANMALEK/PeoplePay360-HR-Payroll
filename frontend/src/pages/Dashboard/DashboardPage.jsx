import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StatCard from '../../components/ui/StatCard';
import AttentionCard from '../../components/ui/AttentionCard';
import EmployeeFormModal from '../../components/employees/EmployeeFormModal';
import { useHRData } from '../../context/HRDataContext';
import { 
  UserPlus, 
  CalendarCheck, 
  Clock, 
  ArrowRight, 
  CalendarDays, 
  AlertTriangle, 
  UserCheck, 
  FileText,
  Sparkles
} from 'lucide-react';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { kpis, attentionItems, employees, contracts, timeOffRequests, attendance } = useHRData();
  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false);

  // Recent pending leave submissions
  const recentPending = timeOffRequests.filter((r) => r.status === 'Pending').slice(0, 4);

  // Upcoming expiring contracts
  const expiringContractsList = contracts
    .filter((c) => {
      if (c.status !== 'Active' || !c.endDate) return false;
      const end = new Date(c.endDate);
      const now = new Date('2026-09-05');
      const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
      return diff >= 0 && diff <= 45;
    })
    .slice(0, 3);

  // Employees on leave
  const employeesOnLeave = employees.filter((e) => e.employmentStatus === 'On Leave');

  return (
    <div className="space-y-7">
      {/* 1. Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
              Good morning, Elena 👋
            </h1>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Here's what needs your attention today.
          </p>
        </div>

        {/* Primary action buttons */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsAddEmployeeOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-subtle transition-colors"
          >
            <UserPlus className="h-4 w-4 text-slate-500" />
            <span>+ Add Employee</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/time-off?status=Pending')}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 shadow-sm transition-colors"
          >
            <CalendarCheck className="h-4 w-4" />
            <span>Review Time Off ({kpis.pendingTimeOff})</span>
          </button>
        </div>
      </div>

      {/* 2. NEEDS YOUR ATTENTION (Action Before Information - Strongest Section) */}
      <section aria-labelledby="attention-heading" className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
            <h2 id="attention-heading" className="text-sm font-bold tracking-tight text-slate-900 uppercase tracking-wider">
              Needs Your Attention
            </h2>
            <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-bold text-rose-700">
              {attentionItems.length} Urgent Items
            </span>
          </div>
          <span className="text-xs text-slate-400">Direct 1-click resolution</span>
        </div>

        {attentionItems.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-xs text-slate-500 shadow-subtle">
            ✓ You're all caught up. No pending operational exceptions require your intervention.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            {attentionItems.map((item) => (
              <AttentionCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>

      {/* 3. WORKFORCE SNAPSHOT (Clickable Operational KPIs) */}
      <section aria-labelledby="snapshot-heading" className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 id="snapshot-heading" className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Workforce Snapshot
          </h2>
          <span className="text-[11px] text-indigo-600 font-medium">Click any card to inspect filtered records</span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard
            title="Total Employees"
            value={kpis.totalEmployees}
            secondaryValue="+3 this month"
            subtext="Workforce directory"
            icon="users"
            colorScheme="indigo"
            onClick={() => navigate('/employees')}
          />
          <StatCard
            title="Present Today"
            value={`${kpis.presentToday} / ${kpis.totalEmployees}`}
            secondaryValue={`${kpis.presentRate}%`}
            subtext="Logged in shifts"
            icon="present"
            colorScheme="emerald"
            onClick={() => navigate('/attendance')}
          />
          <StatCard
            title="Pending Time Off"
            value={kpis.pendingTimeOff}
            secondaryValue="Awaiting review"
            subtext="Requires HR approval"
            icon="calendar"
            colorScheme="amber"
            onClick={() => navigate('/time-off?status=Pending')}
          />
          <StatCard
            title="Active Contracts"
            value={kpis.activeContracts}
            secondaryValue={`${kpis.expiringContracts} Expiring`}
            subtext="Employment agreements"
            icon="contract"
            colorScheme="sky"
            onClick={() => navigate('/contracts?status=Active')}
          />
          <StatCard
            title="Attendance Health"
            value={`${kpis.attendanceExceptions} Exceptions`}
            secondaryValue="Requires audit"
            subtext="Late / Missing checkout"
            icon="health"
            colorScheme="rose"
            onClick={() => navigate('/attendance?filter=exceptions')}
          />
        </div>
      </section>

      {/* 4. UPCOMING & 5. TODAY'S ATTENDANCE RECENT ACTIVITY */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left 2 Cols: Urgent Time Off Approvals & Exceptions Quick Glance */}
        <div className="lg:col-span-2 space-y-6">
          {/* Urgent Leave Submissions */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-subtle space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Urgent Leave Approvals</h3>
                <p className="text-xs text-slate-500">Submissions waiting on your decision.</p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/time-off?status=Pending')}
                className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                <span>View all ({kpis.pendingTimeOff})</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {recentPending.map((req) => (
                <div
                  key={req.id}
                  onClick={() => navigate('/time-off?status=Pending')}
                  className="flex cursor-pointer items-center justify-between py-3 hover:bg-slate-50/80 px-2.5 rounded-lg transition-colors"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 text-xs">{req.employeeName}</span>
                      <span className="text-[11px] text-slate-400 font-mono">({req.id})</span>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {req.timeOffType} • {req.duration} days ({req.startDate} → {req.endDate})
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700">
                      Pending
                    </span>
                    <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Today's Attendance Overview Quick Glance */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-subtle space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Today's Attendance Snapshot</h3>
                <p className="text-xs text-slate-500">Live operational status across departments.</p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/attendance')}
                className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                <span>Full Attendance Log</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 pt-1 text-xs">
              <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-3">
                <span className="text-slate-500 block text-[11px]">Present On Time</span>
                <span className="text-lg font-bold text-emerald-800">
                  {attendance.filter((a) => a.status === 'Present').length}
                </span>
              </div>
              <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-3">
                <span className="text-slate-500 block text-[11px]">Late Check-ins</span>
                <span className="text-lg font-bold text-amber-800">
                  {attendance.filter((a) => a.status === 'Late').length}
                </span>
              </div>
              <div className="rounded-xl border border-purple-100 bg-purple-50/50 p-3">
                <span className="text-slate-500 block text-[11px]">Missing Checkout</span>
                <span className="text-lg font-bold text-purple-800">
                  {attendance.filter((a) => a.status === 'Incomplete').length}
                </span>
              </div>
              <div className="rounded-xl border border-rose-100 bg-rose-50/50 p-3">
                <span className="text-slate-500 block text-[11px]">Unexcused Absent</span>
                <span className="text-lg font-bold text-rose-800">
                  {attendance.filter((a) => a.status === 'Absent').length}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: UPCOMING Items (Expiring Contracts & Returning Employees) */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-subtle space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">Upcoming Operations</h3>
              </div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Next 45 Days
              </span>
            </div>

            {/* Contracts Expiring Soon */}
            <div className="space-y-2">
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Contracts Expiring Soon ({expiringContractsList.length})
              </div>
              {expiringContractsList.map((c) => (
                <div
                  key={c.id}
                  onClick={() => navigate(`/contracts?search=${c.id}`)}
                  className="cursor-pointer rounded-xl border border-amber-200 bg-amber-50/40 p-3 hover:bg-amber-50/80 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-slate-900">{c.employeeName}</span>
                    <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded border border-amber-200">
                      Exp: {c.endDate}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1 flex justify-between">
                    <span>{c.contractName}</span>
                    <span className="font-mono text-slate-400">{c.id}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Employees Currently On Leave */}
            <div className="space-y-2 border-t border-slate-100 pt-3">
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Employees on Leave ({employeesOnLeave.length})
              </div>
              {employeesOnLeave.map((emp) => (
                <div
                  key={emp.id}
                  onClick={() => navigate(`/employees/${emp.id}`)}
                  className="cursor-pointer flex items-center justify-between rounded-xl border border-slate-200 p-2.5 hover:bg-slate-50 transition-colors text-xs"
                >
                  <div>
                    <div className="font-semibold text-slate-800">{emp.fullName}</div>
                    <div className="text-[10px] text-slate-400">{emp.jobPosition} • {emp.department}</div>
                  </div>
                  <span className="rounded bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
                    On Leave
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Add Employee Modal Accessible directly from Dashboard */}
      <EmployeeFormModal
        isOpen={isAddEmployeeOpen}
        onClose={() => setIsAddEmployeeOpen(false)}
      />
    </div>
  );
}
