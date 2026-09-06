import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IndianRupee,
  Receipt,
  Calculator,
  AlertTriangle,
  Plus,
  ArrowRight,
  TrendingUp,
  Building,
  Eye,
  Lock,
  Layers,
  CreditCard,
  Info,
  Users,
  Clock,
  CalendarCheck,
  FileText,
  CalendarDays,
  CheckCircle,
  XCircle,
  Check,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  Briefcase,
} from 'lucide-react';
import { formatINR, formatINRCompact } from '../../utils/formatCurrency';
import { useHRData } from '../../context/HRDataContext';
import { useAuth } from '../../context/AuthContext';
import { getGreeting, getHRDisplayName } from '../../utils/greeting';
import StatusBadge from '../../components/ui/StatusBadge';
import PayrunWizard from './PayrunWizard';
import ContractFormModal from '../../components/contracts/ContractFormModal';

export default function HRPayrollUserDashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    payruns,
    payslips,
    employees,
    attendance,
    contracts,
    timeOffRequests,
    salaryStructures,
    salaryRules,
    kpis,
    approveTimeOff,
  } = useHRData();

  const greeting = getGreeting();
  const hrName = getHRDisplayName(user, employees);

  const [activeTab, setActiveTab] = useState('payroll'); // 'payroll' | 'workforce'
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);
  const [selectedPayrunFilter, setSelectedPayrunFilter] = useState('ALL');

  // Monthly trends for payruns
  const monthlyTrends = useMemo(() => {
    const byMonth = {};
    payruns.forEach((p) => {
      const month = p.periodMonth || p.periodName || 'Regular Period';
      if (!byMonth[month]) {
        byMonth[month] = { month, netDisbursement: 0, gross: 0 };
      }
      byMonth[month].netDisbursement += Number(p.totalNetSalary || p.totalNet || 0);
      byMonth[month].gross += Number(p.totalGross || p.grossSalary || 0);
    });
    const entries = Object.values(byMonth);
    return entries.length > 0
      ? entries
      : [{ month: 'Current Cycle', netDisbursement: kpis.totalPayrollCost || 0, gross: kpis.totalGrossPayroll || 0 }];
  }, [payruns, kpis]);

  // Department salary cost distribution
  const departmentSalaryDistribution = useMemo(() => {
    const byDept = {};
    payslips.forEach((s) => {
      const dept = s.department || 'Unassigned';
      byDept[dept] = (byDept[dept] || 0) + Number(s.gross || s.grossSalary || 0);
    });
    const total = Object.values(byDept).reduce((sum, value) => sum + value, 0) || 1;
    return Object.entries(byDept).map(([department, totalGross]) => ({
      department,
      totalGross,
      percentage: Math.round((totalGross / total) * 100),
    }));
  }, [payslips]);

  const totalNetDisbursed = payruns
    .filter((p) => p.status === 'Paid' || p.status === 'Validated')
    .reduce((acc, curr) => acc + (curr.totalNetSalary || curr.totalNet || 0), 0);

  const pendingDraftPayruns = payruns.filter(
    (p) => p.status === 'Draft' || p.status === 'Computed'
  );

  const filteredPayruns = payruns.filter((p) => {
    if (selectedPayrunFilter === 'DRAFT') return p.status === 'Draft' || p.status === 'Computed';
    if (selectedPayrunFilter === 'PAID') return p.status === 'Paid' || p.status === 'Validated';
    return true;
  });

  // Pending employee leave requests
  const pendingLeaves = useMemo(() => {
    return timeOffRequests
      .filter((r) => r.status === 'Pending' && !r.requiresAdminApproval)
      .slice(0, 5);
  }, [timeOffRequests]);

  // Recent contracts
  const recentContracts = useMemo(() => {
    return contracts.slice(0, 5);
  }, [contracts]);

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Hero Greeting & Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 md:p-8 text-white shadow-xl">
        <div className="absolute right-0 top-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 -mb-10 h-48 w-48 rounded-full bg-brand-400/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-brand-300 backdrop-blur-md border border-white/10">
              <Sparkles className="h-3.5 w-3.5 text-brand-300" />
              <span>HR & Payroll Specialist Operations Console</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              {greeting}, {hrName}
            </h1>
            <p className="text-xs md:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Full HR management permissions enabled with payrun execution, payslip generation, and verified read-only salary blueprint access.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => setIsWizardOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-400 px-4 py-2.5 text-xs font-bold text-slate-900 shadow-md hover:bg-brand-500 transition-all active:scale-95"
            >
              <Plus className="h-4 w-4" />
              Generate Payrun
            </button>
            <button
              type="button"
              onClick={() => setIsContractModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-xs font-semibold text-white hover:bg-white/20 transition-all border border-white/15"
            >
              <FileText className="h-4 w-4" />
              Issue Contract
            </button>
            <button
              type="button"
              onClick={() => navigate('/employees')}
              className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-xs font-semibold text-white hover:bg-white/20 transition-all border border-white/15"
            >
              <Users className="h-4 w-4" />
              Directory
            </button>
          </div>
        </div>
      </div>

      {/* KPI Tiles Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {/* Total Net Disbursed */}
        <div
          onClick={() => {
            setActiveTab('payroll');
            setSelectedPayrunFilter('ALL');
          }}
          className="rounded-2xl border border-slate-200/80 bg-white p-4 md:p-5 shadow-2xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Payroll Disbursed</span>
            <div className="rounded-xl bg-emerald-50 p-2 text-emerald-600 group-hover:bg-emerald-100 transition-colors">
              <IndianRupee className="h-4 w-4" />
            </div>
          </div>
          <p className="text-xl md:text-2xl font-black text-slate-900 mt-2">
            {formatINR(totalNetDisbursed || kpis.totalPayrollCost || 0)}
          </p>
          <div className="flex items-center gap-1.5 mt-1 text-[11px] text-emerald-600 font-semibold">
            <TrendingUp className="h-3 w-3" />
            <span>Active disbursement volume</span>
          </div>
        </div>

        {/* Drafts to Compute */}
        <div
          onClick={() => {
            setActiveTab('payroll');
            setSelectedPayrunFilter('DRAFT');
          }}
          className={`rounded-2xl border p-4 md:p-5 shadow-2xs hover:shadow-md transition-all cursor-pointer group ${
            pendingDraftPayruns.length > 0
              ? 'border-amber-300 bg-amber-50/30'
              : 'border-slate-200/80 bg-white'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider">Pending Batches</span>
            <div className="rounded-xl bg-amber-100 p-2 text-amber-700">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <p className="text-xl md:text-2xl font-black text-amber-800 mt-2">
            {pendingDraftPayruns.length}
          </p>
          <p className="text-[11px] text-amber-700 mt-1 font-medium">
            {pendingDraftPayruns.length > 0 ? 'Ready for payrun computation' : 'All batches computed'}
          </p>
        </div>

        {/* Workforce Attendance */}
        <div
          onClick={() => navigate('/attendance')}
          className="rounded-2xl border border-slate-200/80 bg-white p-4 md:p-5 shadow-2xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Present Today</span>
            <div className="rounded-xl bg-blue-50 p-2 text-blue-600 group-hover:bg-blue-100 transition-colors">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <p className="text-xl md:text-2xl font-black text-slate-900 mt-2">
            {kpis.presentToday} <span className="text-xs font-normal text-slate-400">/ {employees.length}</span>
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            {kpis.attendanceExceptions > 0 ? `${kpis.attendanceExceptions} exceptions to verify` : 'Attendance logs clean'}
          </p>
        </div>

        {/* Pending Time Off */}
        <div
          onClick={() => {
            setActiveTab('workforce');
            navigate('/time-off');
          }}
          className="rounded-2xl border border-slate-200/80 bg-white p-4 md:p-5 shadow-2xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Leaves</span>
            <div className="rounded-xl bg-purple-50 p-2 text-purple-600 group-hover:bg-purple-100 transition-colors">
              <CalendarCheck className="h-4 w-4" />
            </div>
          </div>
          <p className="text-xl md:text-2xl font-black text-slate-900 mt-2">
            {kpis.pendingTimeOff || pendingLeaves.length}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            Employee requests awaiting approval
          </p>
        </div>
      </div>

      {/* Primary Console Navigation Switcher */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('payroll')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              activeTab === 'payroll'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <CreditCard className="h-3.5 w-3.5" />
            Payroll Execution & Batches ({payruns.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('workforce')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              activeTab === 'workforce'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Users className="h-3.5 w-3.5" />
            Workforce HR Operations ({employees.length})
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
            <ShieldCheck className="h-3.5 w-3.5" />
            HR Payroll User Permissions
          </span>
        </div>
      </div>

      {/* ================= TAB 1: PAYROLL EXECUTION & BATCHES ================= */}
      {activeTab === 'payroll' && (
        <div className="space-y-6">
          {/* Salary Blueprint Read-Only Notice Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div
              onClick={() => navigate('/payroll?tab=structures')}
              className="flex items-center justify-between rounded-2xl border border-slate-200/90 bg-gradient-to-r from-white to-blue-50/40 p-4 shadow-2xs hover:border-blue-300 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-blue-100 p-2.5 text-blue-700 group-hover:scale-105 transition-transform">
                  <Layers className="h-4 w-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-slate-900">Salary Structures ({salaryStructures.length})</h4>
                    <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600 border border-slate-200">
                      <Lock className="h-2.5 w-2.5" />
                      Read Only
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Engineering, Sales, & Corporate salary blueprints
                  </p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
            </div>

            <div
              onClick={() => navigate('/payroll?tab=rules')}
              className="flex items-center justify-between rounded-2xl border border-slate-200/90 bg-gradient-to-r from-white to-indigo-50/40 p-4 shadow-2xs hover:border-indigo-300 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-indigo-100 p-2.5 text-indigo-700 group-hover:scale-105 transition-transform">
                  <Calculator className="h-4 w-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-slate-900">Salary Rules ({salaryRules.length})</h4>
                    <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600 border border-slate-200">
                      <Lock className="h-2.5 w-2.5" />
                      Read Only
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Basic, HRA, PF 12%, PTAX ₹200, & TDS formulas
                  </p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
            </div>
          </div>

          {/* Payruns List Table */}
          <div className="rounded-2xl border border-slate-200/80 bg-white shadow-2xs overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 px-6 py-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Active Payrun Cycles ({filteredPayruns.length})</h3>
                <p className="text-[11px] text-slate-500">
                  Select any payrun to execute computation, inspect draft payslips, or generate exports
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedPayrunFilter('ALL')}
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                    selectedPayrunFilter === 'ALL' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  All ({payruns.length})
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedPayrunFilter('DRAFT')}
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                    selectedPayrunFilter === 'DRAFT' ? 'bg-amber-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Drafts ({pendingDraftPayruns.length})
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedPayrunFilter('PAID')}
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                    selectedPayrunFilter === 'PAID' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Paid
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-100 bg-slate-50/70 font-bold uppercase tracking-wider text-slate-500 text-[10px]">
                  <tr>
                    <th className="px-6 py-3.5">Payrun Identifier</th>
                    <th className="px-6 py-3.5">Payroll Period</th>
                    <th className="px-6 py-3.5">Workforce Headcount</th>
                    <th className="px-6 py-3.5">Total Net Payable</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {filteredPayruns.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                        No payrun records match the selected filter.
                      </td>
                    </tr>
                  ) : (
                    filteredPayruns.map((run) => (
                      <tr
                        key={run.id}
                        className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                        onClick={() => navigate('/payroll?payrun=' + run.id)}
                      >
                        <td className="px-6 py-4 font-bold text-slate-900">
                          <div>
                            <span>{run.name}</span>
                            <span className="block text-[11px] font-mono font-normal text-slate-400">{run.id}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          {run.periodMonth || run.periodName || 'Regular Month'}
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-bold text-slate-900">{run.employeesCount || run.employeeCount || 0}</span>
                          <span className="text-slate-400 text-[11px] ml-1">staff</span>
                        </td>
                        <td className="px-6 py-4 font-bold text-emerald-700">
                          {formatINR(run.totalNetSalary || run.totalNet || 0)}
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={run.status} />
                        </td>
                        <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => navigate('/payroll?payrun=' + run.id)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-2xs transition-all"
                          >
                            <span>Open / Compute</span>
                            <ArrowRight className="h-3 w-3" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Visual Analytics Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Monthly Trend Chart */}
            <div className="lg:col-span-2 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-brand-700" />
                    Monthly Payroll Disbursement Trends
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Calculated net payroll payouts across billing cycles</p>
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                  Disbursements Active
                </span>
              </div>
              <div className="pt-4 flex items-end justify-between gap-4 h-52">
                {monthlyTrends.map((item) => {
                  const maxVal = Math.max(...monthlyTrends.map((t) => t.netDisbursement), 1);
                  const heightPercent = Math.round((item.netDisbursement / maxVal) * 100);
                  return (
                    <div key={item.month} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                      <span className="text-[10px] font-bold text-slate-600">
                        {formatINRCompact(item.netDisbursement)}
                      </span>
                      <div
                        style={{ height: `${Math.max(heightPercent, 8)}%` }}
                        className="w-full max-w-[42px] rounded-t-xl bg-gradient-to-t from-indigo-600 to-sky-400 hover:to-sky-300 transition-all group relative cursor-pointer shadow-xs"
                      >
                        <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold py-1 px-2 rounded whitespace-nowrap transition-opacity shadow-lg z-20">
                          {formatINR(item.netDisbursement)}
                        </div>
                      </div>
                      <span className="text-[11px] font-semibold text-slate-500">{item.month}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Department Breakdown */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Building className="h-4 w-4 text-brand-700" />
                  Department Cost Allocation
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Gross salary budget consumption</p>
              </div>
              <div className="space-y-3.5 pt-2">
                {departmentSalaryDistribution.map((dept) => (
                  <div key={dept.department} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-800">{dept.department}</span>
                      <span className="text-slate-900 font-bold">{formatINR(dept.totalGross)}</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div
                        style={{ width: `${dept.percentage}%` }}
                        className="h-full bg-indigo-500 rounded-full"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: WORKFORCE HR OPERATIONS ================= */}
      {activeTab === 'workforce' && (
        <div className="space-y-6">
          {/* Quick HR Navigation Tiles */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button
              type="button"
              onClick={() => navigate('/employees')}
              className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 text-left hover:border-indigo-300 hover:bg-indigo-50/20 transition-all shadow-2xs"
            >
              <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600">
                <Users className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Employees</p>
                <p className="text-[11px] text-slate-500">{employees.length} active records</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => navigate('/attendance')}
              className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 text-left hover:border-blue-300 hover:bg-blue-50/20 transition-all shadow-2xs"
            >
              <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600">
                <Clock className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Attendance</p>
                <p className="text-[11px] text-slate-500">{kpis.presentToday} checked in</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => navigate('/contracts')}
              className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 text-left hover:border-emerald-300 hover:bg-emerald-50/20 transition-all shadow-2xs"
            >
              <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600">
                <FileText className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Contracts</p>
                <p className="text-[11px] text-slate-500">{contracts.length} agreements</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => navigate('/schedules')}
              className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 text-left hover:border-amber-300 hover:bg-amber-50/20 transition-all shadow-2xs"
            >
              <div className="rounded-xl bg-amber-50 p-2.5 text-amber-600">
                <CalendarDays className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Schedules</p>
                <p className="text-[11px] text-slate-500">Working shifts</p>
              </div>
            </button>
          </div>

          {/* Pending Leaves Review Table */}
          <div className="rounded-2xl border border-slate-200/80 bg-white shadow-2xs overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Pending Employee Time-Off Requests ({pendingLeaves.length})</h3>
                <p className="text-[11px] text-slate-500">Review, approve, or refuse workforce leave applications</p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/time-off')}
                className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:underline"
              >
                View All in Time-Off
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-100 bg-slate-50/70 font-bold uppercase tracking-wider text-slate-500 text-[10px]">
                  <tr>
                    <th className="px-6 py-3.5">Employee</th>
                    <th className="px-6 py-3.5">Leave Type</th>
                    <th className="px-6 py-3.5">Dates Requested</th>
                    <th className="px-6 py-3.5">Duration</th>
                    <th className="px-6 py-3.5">Reason</th>
                    <th className="px-6 py-3.5 text-right">Quick Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {pendingLeaves.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                        <CheckCircle className="h-6 w-6 text-emerald-500 mx-auto mb-1.5" />
                        No pending time-off requests. All employee leaves are up to date!
                      </td>
                    </tr>
                  ) : (
                    pendingLeaves.map((req) => (
                      <tr key={req.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-6 py-3.5 font-bold text-slate-900">
                          <div>
                            <span>{req.employeeName}</span>
                            <span className="block text-[11px] font-mono font-normal text-slate-400">{req.employeeId}</span>
                          </div>
                        </td>
                        <td className="px-6 py-3.5 font-semibold text-slate-800">{req.timeOffType}</td>
                        <td className="px-6 py-3.5 text-slate-600">{req.startDate} → {req.endDate}</td>
                        <td className="px-6 py-3.5 font-bold text-indigo-700">{req.duration} days</td>
                        <td className="px-6 py-3.5 text-slate-500 italic truncate max-w-xs">"{req.reason}"</td>
                        <td className="px-6 py-3.5 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => approveTimeOff(req.id || req._id)}
                              className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-emerald-700 shadow-2xs"
                            >
                              <Check className="h-3 w-3" />
                              Approve
                            </button>
                            <button
                              type="button"
                              onClick={() => navigate('/time-off')}
                              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50"
                            >
                              Review
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Employment Contracts */}
          <div className="rounded-2xl border border-slate-200/80 bg-white shadow-2xs overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Active Employment Agreements</h3>
                <p className="text-[11px] text-slate-500">Agreed compensation, basic pay, and contract status</p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/contracts')}
                className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:underline"
              >
                View All Contracts
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-100 bg-slate-50/70 font-bold uppercase tracking-wider text-slate-500 text-[10px]">
                  <tr>
                    <th className="px-6 py-3.5">Contract Code</th>
                    <th className="px-6 py-3.5">Employee</th>
                    <th className="px-6 py-3.5">Role & Department</th>
                    <th className="px-6 py-3.5">Agreed Salary</th>
                    <th className="px-6 py-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {recentContracts.map((c) => (
                    <tr
                      key={c.id || c.contractCode}
                      className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                      onClick={() => navigate('/contracts')}
                    >
                      <td className="px-6 py-3.5 font-bold font-mono text-slate-900">{c.contractCode || c.id}</td>
                      <td className="px-6 py-3.5 font-semibold text-slate-800">{c.employeeName}</td>
                      <td className="px-6 py-3.5 text-slate-600">{c.position} • {c.department}</td>
                      <td className="px-6 py-3.5 font-bold text-emerald-700">
                        {formatINR(c.wageAmount || c.wage || 0)}/mo
                      </td>
                      <td className="px-6 py-3.5">
                        <StatusBadge status={c.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Payrun Wizard Modal */}
      <PayrunWizard
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onCreated={(newRun) => {
          navigate('/payroll?payrun=' + newRun.id);
        }}
      />

      {/* Contract Creation Modal */}
      <ContractFormModal
        isOpen={isContractModalOpen}
        onClose={() => setIsContractModalOpen(false)}
      />
    </div>
  );
}
