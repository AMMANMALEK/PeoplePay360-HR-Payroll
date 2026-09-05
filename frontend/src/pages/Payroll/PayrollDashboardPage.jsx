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
  CheckCircle2,
} from 'lucide-react';
import { formatINR, formatINRCompact } from '../../utils/formatCurrency';
import { useHRData } from '../../context/HRDataContext';
import StatusBadge from '../../components/ui/StatusBadge';
import PayrunWizard from './PayrunWizard';

export default function PayrollDashboardPage() {
  const navigate = useNavigate();
  const { payruns, payslips } = useHRData();

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

  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [selectedKpiFilter, setSelectedKpiFilter] = useState('ALL');

  const totalNetDisbursed = payruns
    .filter((p) => p.status === 'Paid' || p.status === 'Validated')
    .reduce((acc, curr) => acc + (curr.totalNetSalary || 0), 0);

  const pendingValidationCount = payruns.filter(
    (p) => p.status === 'Validation Required' || p.status === 'Draft'
  ).length;

  const filteredPayruns = payruns.filter((p) => {
    if (selectedKpiFilter === 'PENDING')
      return p.status === 'Validation Required' || p.status === 'Draft';
    if (selectedKpiFilter === 'PAID') return p.status === 'Paid';
    return true;
  });

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Dashboard Top Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-brand-100 px-2 py-0.5 text-xs font-bold text-slate-800">
              HR Payroll Workspace
            </span>
            <span className="text-xs font-semibold text-slate-400">• Real-Time Payroll Operations</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">Payroll Dashboard</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Operational summary, monthly disbursement trends, department cost allocations, and payrun workflows.
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
          <p className="text-2xl font-black text-slate-900 mt-2">
            {formatINR(totalNetDisbursed)}
          </p>
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
            <span className="text-xs font-semibold text-slate-500">Active Payruns</span>
            <div className="rounded-xl bg-blue-50 p-2 text-blue-600">
              <Calculator className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{payruns.length}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Click to view paid payruns</p>
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
          <p className="text-[11px] text-slate-400 mt-0.5">Drafts or Validation Required</p>
        </div>
      </div>

      {/* Visual Charts & Breakdown Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Payroll Trend */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-brand-700" />
                Monthly Payroll Disbursement Trend
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Total Net Payroll payout history (Apr 2026 – Sep 2026)
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
              +4.8% YoY Growth
            </span>
          </div>

          <div className="pt-4 flex items-end justify-between gap-4 h-52">
            {monthlyTrends.map((item) => {
              const maxVal = 180000;
              const heightPercent = Math.round((item.netDisbursement / maxVal) * 100);

              return (
                <div key={item.month} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                  <span className="text-[10px] font-bold text-slate-600">
                    {formatINRCompact(item.netDisbursement)}
                  </span>
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className="w-full max-w-[36px] rounded-t-xl bg-brand-400 hover:bg-brand-500 transition-all group relative"
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

        {/* Department Salary Distribution */}
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
                    className="h-full bg-brand-400 rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Payrun Table Section */}
      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-2xs overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Payruns ({filteredPayruns.length})
            </h3>
            {selectedKpiFilter !== 'ALL' && (
              <p className="text-xs text-brand-700 font-semibold mt-0.5">
                Filtered by KPI view ({selectedKpiFilter})
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() => navigate('/payroll/payruns')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-700 hover:underline"
          >
            View All Payruns
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-100 bg-slate-50/60 font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-6 py-3.5">Payrun Name</th>
                <th className="px-6 py-3.5">Period Month</th>
                <th className="px-6 py-3.5">Employees</th>
                <th className="px-6 py-3.5">Gross Total</th>
                <th className="px-6 py-3.5">Net Salary</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredPayruns.map((run) => (
                <tr
                  key={run.id}
                  className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                  onClick={() => navigate(`/payroll/payruns/${run.id}`)}
                >
                  <td className="px-6 py-4 font-bold text-slate-900">
                    <div>
                      <span>{run.name}</span>
                      <span className="block text-[11px] font-normal text-slate-400">{run.id}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{run.periodMonth}</td>
                  <td className="px-6 py-4 font-bold text-slate-800">{run.employeeCount}</td>
                  <td className="px-6 py-4 font-semibold text-slate-900">
                    {formatINR(run.totalGross || 0)}
                  </td>
                  <td className="px-6 py-4 font-bold text-emerald-700">
                    {formatINR(run.totalNetSalary || 0)}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={run.status} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/payroll/payruns/${run.id}`);
                      }}
                      className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                    >
                      Process
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payrun Wizard Overlay */}
      <PayrunWizard
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onCreated={(newRun) => {
          navigate(`/payroll/payruns/${newRun.id}`);
        }}
      />
    </div>
  );
}
