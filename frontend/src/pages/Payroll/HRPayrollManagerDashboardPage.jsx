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
  ShieldCheck,
  Layers,
  CreditCard,
  Trash2,
} from 'lucide-react';
import { formatINR, formatINRCompact } from '../../utils/formatCurrency';
import { useHRData } from '../../context/HRDataContext';
import { useAuth } from '../../context/AuthContext';
import { getGreeting, getHRDisplayName } from '../../utils/greeting';
import StatusBadge from '../../components/ui/StatusBadge';
import PayrunWizard from './PayrunWizard';
import ConfirmDialog from '../../components/ui/ConfirmDialog';

export default function HRPayrollManagerDashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { payruns, payslips, employees, deletePayrun } = useHRData();

  const greeting = getGreeting();
  const hrName = getHRDisplayName(user, employees);

  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [selectedKpiFilter, setSelectedKpiFilter] = useState('ALL');
  const [deleteTarget, setDeleteTarget] = useState(null);

  const monthlyTrends = useMemo(() => {
    const byMonth = {};
    payruns.forEach((p) => {
      const month = p.periodMonth || p.periodName || 'Unknown';
      if (!byMonth[month]) {
        byMonth[month] = { month, netDisbursement: 0 };
      }
      byMonth[month].netDisbursement += Number(p.totalNetSalary || p.totalNet || 0);
    });
    return Object.values(byMonth);
  }, [payruns]);

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

  const pendingValidationCount = payruns.filter(
    (p) => p.status === 'Validation Required' || p.status === 'Draft' || p.status === 'Computed'
  ).length;

  const filteredPayruns = payruns.filter((p) => {
    if (selectedKpiFilter === 'PENDING')
      return p.status === 'Validation Required' || p.status === 'Draft' || p.status === 'Computed';
    if (selectedKpiFilter === 'PAID') return p.status === 'Paid';
    return true;
  });

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deletePayrun(deleteTarget.id);
    setDeleteTarget(null);
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Dashboard Top Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{greeting}, {hrName}</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Payroll command center — manage payruns, validate disbursements, and configure salary structures and rules.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsWizardOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-brand-400 px-4 py-2.5 text-xs font-bold text-slate-900 shadow-sm hover:bg-brand-500 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Create New Payrun
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => setSelectedKpiFilter('ALL')}
          className={`rounded-2xl border bg-white p-5 cursor-pointer transition-all shadow-2xs ${
            selectedKpiFilter === 'ALL'
              ? 'border-brand-400 ring-2 ring-brand-400/20'
              : 'border-slate-200/80 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Net Disbursed</span>
            <div className="rounded-xl bg-emerald-50 p-2 text-emerald-600">
              <IndianRupee className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{formatINR(totalNetDisbursed)}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Validated & Paid disbursements</p>
        </div>

        <div
          onClick={() => setSelectedKpiFilter('ALL')}
          className="rounded-2xl border border-slate-200/80 bg-white p-5 cursor-pointer transition-all shadow-2xs hover:border-slate-300"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Payslips Generated</span>
            <div className="rounded-xl bg-indigo-50 p-2 text-indigo-600">
              <Receipt className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{payslips.length}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Across active payrun periods</p>
        </div>

        <div
          onClick={() => setSelectedKpiFilter('PAID')}
          className={`rounded-2xl border bg-white p-5 cursor-pointer transition-all shadow-2xs ${
            selectedKpiFilter === 'PAID'
              ? 'border-brand-400 ring-2 ring-brand-400/20'
              : 'border-slate-200/80 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Payruns</span>
            <div className="rounded-xl bg-blue-50 p-2 text-blue-600">
              <Calculator className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{payruns.length}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Click to filter paid payruns</p>
        </div>

        <div
          onClick={() => setSelectedKpiFilter('PENDING')}
          className={`rounded-2xl border bg-white p-5 cursor-pointer transition-all shadow-2xs ${
            selectedKpiFilter === 'PENDING'
              ? 'border-amber-400 ring-2 ring-amber-400/20 bg-amber-50/20'
              : 'border-slate-200/80 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Action Needed</span>
            <div className="rounded-xl bg-amber-50 p-2 text-amber-600">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-700 mt-2">{pendingValidationCount}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Draft, Computed or Pending Validation</p>
        </div>
      </div>

      {/* Manager Quick Access Panel */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          type="button"
          onClick={() => navigate('/payroll?tab=structures')}
          className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 text-left hover:border-purple-300 hover:bg-purple-50/20 transition-all shadow-2xs group"
        >
          <div className="rounded-xl bg-purple-100 p-2.5 text-purple-700 group-hover:bg-purple-200 transition-colors">
            <Layers className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900">Salary Structures</p>
            <p className="text-[11px] text-slate-500">Full CRUD — Create, edit & delete</p>
          </div>
          <ArrowRight className="ml-auto h-3.5 w-3.5 text-slate-400 group-hover:text-purple-600" />
        </button>
        <button
          type="button"
          onClick={() => navigate('/payroll?tab=rules')}
          className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 text-left hover:border-purple-300 hover:bg-purple-50/20 transition-all shadow-2xs group"
        >
          <div className="rounded-xl bg-purple-100 p-2.5 text-purple-700 group-hover:bg-purple-200 transition-colors">
            <Calculator className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900">Salary Rules</p>
            <p className="text-[11px] text-slate-500">Full CRUD — Manage computation rules</p>
          </div>
          <ArrowRight className="ml-auto h-3.5 w-3.5 text-slate-400 group-hover:text-purple-600" />
        </button>
        <button
          type="button"
          onClick={() => navigate('/payroll?tab=payslips')}
          className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 text-left hover:border-purple-300 hover:bg-purple-50/20 transition-all shadow-2xs group"
        >
          <div className="rounded-xl bg-purple-100 p-2.5 text-purple-700 group-hover:bg-purple-200 transition-colors">
            <CreditCard className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900">Payslips</p>
            <p className="text-[11px] text-slate-500">Full CRUD — View, edit & delete</p>
          </div>
          <ArrowRight className="ml-auto h-3.5 w-3.5 text-slate-400 group-hover:text-purple-600" />
        </button>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-brand-700" />
                Monthly Payroll Disbursement Trend
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Total Net Payroll payout history</p>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
              +4.8% YoY Growth
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
                    style={{ height: `${Math.max(heightPercent, 4)}%` }}
                    className="w-full max-w-[36px] rounded-t-xl bg-purple-400 hover:bg-purple-500 transition-all group relative"
                  >
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold py-1 px-2 rounded whitespace-nowrap transition-opacity">
                      {formatINR(item.netDisbursement)}
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-500">{item.month}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Building className="h-4 w-4 text-brand-700" />
              Department Salary Cost
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Budget allocation breakdown</p>
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
                    className="h-full bg-purple-400 rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Payrun Table — Full Manager View with Delete */}
      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-2xs overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Payruns ({filteredPayruns.length})</h3>
            {selectedKpiFilter !== 'ALL' && (
              <p className="text-xs text-purple-700 font-semibold mt-0.5">
                Filtered: {selectedKpiFilter}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={() => navigate('/payroll')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-700 hover:underline"
          >
            Manage All Payruns
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-100 bg-slate-50/60 font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-6 py-3.5">Payrun Name</th>
                <th className="px-6 py-3.5">Period</th>
                <th className="px-6 py-3.5">Employees</th>
                <th className="px-6 py-3.5">Net Salary</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredPayruns.map((run) => (
                <tr
                  key={run.id}
                  className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                  onClick={() => navigate('/payroll?payrun=' + run.id)}
                >
                  <td className="px-6 py-4 font-bold text-slate-900">
                    <div>
                      <span>{run.name}</span>
                      <span className="block text-[11px] font-normal text-slate-400">{run.id}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{run.periodMonth || run.periodName}</td>
                  <td className="px-6 py-4 font-bold text-slate-800">{run.employeeCount || run.employeesCount}</td>
                  <td className="px-6 py-4 font-bold text-emerald-700">
                    {formatINR(run.totalNetSalary || run.totalNet || 0)}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={run.status} />
                  </td>
                  <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => navigate('/payroll?payrun=' + run.id)}
                        className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                      >
                        Process
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                      {run.status === 'Draft' && (
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(run)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                          title="Delete draft payrun"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <PayrunWizard
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onCreated={(newRun) => {
          navigate('/payroll?payrun=' + newRun.id);
        }}
      />

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Delete Payrun Batch"
        message={`Are you sure you want to permanently delete payrun "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel="Delete Payrun"
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
