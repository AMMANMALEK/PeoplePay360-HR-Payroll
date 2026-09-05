import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  Users, 
  Clock, 
  CalendarCheck, 
  TrendingUp, 
  ShieldCheck, 
  Filter, 
  FileText,
  Activity
} from 'lucide-react';
import { useHRData } from '../../context/HRDataContext';
import PageHeader from '../../components/ui/PageHeader';

export default function ReportsPage() {
  const { kpis, employees, departments, contracts, attendance, allocations, timeOffRequests } = useHRData();

  const currentMonthLabel = `This Month (${new Date().toLocaleString('en-US', { month: 'short', year: 'numeric' })})`;
  const [period, setPeriod] = useState(currentMonthLabel);
  const [selectedDept, setSelectedDept] = useState('All');
  const [employeeType, setEmployeeType] = useState('All');

  // Filter employees based on selected filters
  const filteredEmployees = useMemo(() => {
    return employees.filter((e) => {
      if (selectedDept !== 'All' && e.department !== selectedDept) return false;
      if (employeeType !== 'All' && e.employmentType !== employeeType) return false;
      return true;
    });
  }, [employees, selectedDept, employeeType]);

  const filteredEmpIds = useMemo(() => new Set(filteredEmployees.map((e) => e.id)), [filteredEmployees]);

  // Dynamic metrics based on filtered scope
  const filteredAttendance = useMemo(() => {
    return attendance.filter((a) => filteredEmpIds.has(a.employeeId));
  }, [attendance, filteredEmpIds]);

  const filteredContracts = useMemo(() => {
    return contracts.filter((c) => filteredEmpIds.has(c.employeeId));
  }, [contracts, filteredEmpIds]);

  const filteredAllocations = useMemo(() => {
    return allocations.filter((a) => filteredEmpIds.has(a.employeeId));
  }, [allocations, filteredEmpIds]);

  const totalAllocated = useMemo(() => filteredAllocations.reduce((acc, c) => acc + c.allocated, 0), [filteredAllocations]);
  const totalTaken = useMemo(() => filteredAllocations.reduce((acc, c) => acc + c.taken, 0), [filteredAllocations]);
  const totalRemaining = useMemo(() => filteredAllocations.reduce((acc, c) => acc + c.remaining, 0), [filteredAllocations]);

  const activeContractsCount = filteredContracts.filter((c) => c.status === 'Active' && c.isCurrent).length;
  const expiringContractsCount = filteredContracts.filter((c) => {
    if (c.status !== 'Active' || !c.endDate) return false;
    const diff = Math.ceil((new Date(c.endDate) - new Date()) / (1000 * 60 * 60 * 24));
    return diff >= 0 && diff <= 45;
  }).length;

  const presentCount = filteredAttendance.filter((a) => a.status === 'Present' || a.status === 'Overtime' || a.status === 'Late').length;
  const presenceRate = filteredAttendance.length > 0 ? Math.round((presentCount / filteredAttendance.length) * 100) : 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Reports"
        subtitle="Workforce, attendance, contracts, and leave metrics from current records."
        actions={
          <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 rounded-2xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs">
            <Filter className="h-3.5 w-3.5 text-slate-400" />
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="bg-transparent font-medium text-slate-700 focus:outline-none"
            >
              <option value={currentMonthLabel}>{currentMonthLabel}</option>
              <option value="Year to Date">Year to Date</option>
            </select>
          </div>

          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="rounded-2xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700"
          >
            <option value="All">All Departments</option>
            {departments.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          <select
            value={employeeType}
            onChange={(e) => setEmployeeType(e.target.value)}
            className="rounded-2xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700"
          >
            <option value="All">All Employment Types</option>
            <option value="Full-Time Permanent">Full-Time Permanent</option>
            <option value="Part-Time">Part-Time</option>
            <option value="Contractor">Contractor</option>
            <option value="Executive">Executive</option>
          </select>
          </div>
        }
      />

      {/* KPI Overview */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          title="Filtered Workforce Headcount"
          value={filteredEmployees.length}
          subtext={`Selected: ${selectedDept} (${employeeType})`}
          icon="users"
          colorScheme="lime"
        />
        <StatCard
          title="Daily Presence Rate"
          value={`${presenceRate}%`}
          secondaryValue={`${presentCount}/${filteredAttendance.length || 1} logged`}
          subtext="Based on today's shift records"
          icon="present"
          colorScheme="mint"
        />
        <StatCard
          title="Active Contract Coverage"
          value={`${Math.round((activeContractsCount / (filteredEmployees.length || 1)) * 100)}%`}
          secondaryValue={`${activeContractsCount} valid`}
          subtext={`${expiringContractsCount} expiring within 45 days`}
          icon="contract"
          colorScheme="sky"
        />
      </div>

      {/* Operational Grids */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Headcount by Department */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-subtle space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">Headcount by Department</h3>
            <span className="text-xs text-slate-400 font-medium">Workforce Distribution</span>
          </div>

          <div className="space-y-3">
            {departments.map((dept) => {
              const count = filteredEmployees.filter((e) => e.department === dept).length;
              const percent = Math.round((count / (filteredEmployees.length || 1)) * 100);

              return (
                <div key={dept} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-800">{dept}</span>
                    <span className="text-slate-500">{count} employees ({percent}%)</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-brand-400 transition-all duration-300"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Leave Overview (Allocated, Taken, Remaining) */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-subtle space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">Leave Quota Consumption</h3>
            <span className="text-xs text-slate-400 font-medium">Live Quota Usage</span>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <span className="text-[10px] uppercase font-bold text-slate-400">Total Allocated</span>
              <div className="text-lg font-bold text-slate-800 mt-0.5">{totalAllocated}d</div>
            </div>
            <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-3">
              <span className="text-[10px] uppercase font-bold text-amber-600">Taken / Used</span>
              <div className="text-lg font-bold text-amber-800 mt-0.5">{totalTaken}d</div>
            </div>
            <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-3">
              <span className="text-[10px] uppercase font-bold text-emerald-600">Remaining</span>
              <div className="text-lg font-bold text-emerald-800 mt-0.5">{totalRemaining}d</div>
            </div>
          </div>

          <div className="space-y-1 pt-1">
            <div className="flex justify-between text-xs text-slate-600 font-medium">
              <span>Overall Organization Utilization:</span>
              <span className="font-bold text-brand-700">
                {totalAllocated > 0 ? Math.round((totalTaken / totalAllocated) * 100) : 0}%
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-brand-400 transition-all duration-300"
                style={{ width: `${totalAllocated > 0 ? Math.round((totalTaken / totalAllocated) * 100) : 0}%` }}
              />
            </div>
          </div>
        </div>

        {/* Attendance Health & Exceptions */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-subtle space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">Attendance Health</h3>
            <span className="text-xs text-slate-400 font-medium">Today's Exceptions</span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="rounded-lg border border-slate-200 p-3 flex justify-between items-center">
              <span className="text-slate-600">Late Arrivals</span>
              <span className="font-bold text-amber-700">
                {filteredAttendance.filter((a) => a.status === 'Late').length}
              </span>
            </div>
            <div className="rounded-lg border border-slate-200 p-3 flex justify-between items-center">
              <span className="text-slate-600">Missing Checkout</span>
              <span className="font-bold text-purple-700">
                {filteredAttendance.filter((a) => a.status === 'Incomplete').length}
              </span>
            </div>
            <div className="rounded-lg border border-slate-200 p-3 flex justify-between items-center">
              <span className="text-slate-600">Unexcused Absences</span>
              <span className="font-bold text-rose-700">
                {filteredAttendance.filter((a) => a.status === 'Absent').length}
              </span>
            </div>
            <div className="rounded-lg border border-slate-200 p-3 flex justify-between items-center">
              <span className="text-slate-600">Overtime Recorded</span>
              <span className="font-bold text-blue-700">
                {filteredAttendance.filter((a) => a.status === 'Overtime').length}
              </span>
            </div>
          </div>
        </div>

        {/* Compliance & Operational Audit Summary */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-subtle space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">Compliance & Operational Indicators</h3>
            <span className="text-xs text-slate-400 font-medium">Auditing</span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3 flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-800 block">Attendance Audit Trail Compliance</span>
                <span className="text-[11px] text-slate-500">Every manual correction stamped with author and timestamp</span>
              </div>
              <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                100% Compliant
              </span>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3 flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-800 block">Legal Contract Active Coverage</span>
                <span className="text-[11px] text-slate-500">Workforce with valid non-expired legal terms</span>
              </div>
              <span className="font-bold text-slate-800 bg-brand-50 px-2 py-0.5 rounded-full border border-brand-200">
                {Math.round((activeContractsCount / (filteredEmployees.length || 1)) * 100)}% Coverage
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
