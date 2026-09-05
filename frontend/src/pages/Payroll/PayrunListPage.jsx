import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, Calculator, ArrowRight, IndianRupee, Users, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { formatINR } from '../../utils/formatCurrency';
import { useHRData } from '../../context/HRDataContext';
import StatusBadge from '../../components/ui/StatusBadge';
import PayrunWizard from './PayrunWizard';

export default function PayrunListPage() {
  const navigate = useNavigate();
  const { payruns } = useHRData();

  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filteredPayruns = payruns.filter((run) => {
    const matchesSearch =
      run.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      run.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      run.periodMonth?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' ? true : run.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalGrossSum = payruns.reduce((acc, curr) => acc + (curr.totalGross || 0), 0);
  const totalNetSum = payruns.reduce((acc, curr) => acc + (curr.totalNetSalary || 0), 0);
  const validationRequiredCount = payruns.filter((p) => p.status === 'Validation Required').length;

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-brand-100 px-2 py-0.5 text-xs font-bold text-slate-800">
              HR Payroll User
            </span>
            <span className="text-xs font-semibold text-slate-400">• Operational Workspace</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">Payrun Operations</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Create, compute, validate, and process regular & off-cycle payroll executions.
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

      {/* KPI Cards Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Payruns</span>
            <div className="rounded-xl bg-slate-100 p-2 text-slate-600">
              <Calculator className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{payruns.length}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Across all execution periods</p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Net Salary Paid</span>
            <div className="rounded-xl bg-emerald-50 p-2 text-emerald-600">
              <IndianRupee className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{formatINR(totalNetSum)}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Disbursed to employees</p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Action Required</span>
            <div className="rounded-xl bg-amber-50 p-2 text-amber-600">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-amber-700 mt-2">{validationRequiredCount}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Payruns awaiting validation</p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Gross Payroll Volume</span>
            <div className="rounded-xl bg-indigo-50 p-2 text-indigo-600">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{formatINR(totalGrossSum)}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Before tax & deductions</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search payrun ID or name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-9 pr-4 py-2 text-xs font-medium text-slate-800 placeholder-slate-400 focus:bg-white focus:border-brand-400 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <Filter className="h-4 w-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700"
          >
            <option value="ALL">All Statuses</option>
            <option value="Draft">Draft</option>
            <option value="Computed">Computed</option>
            <option value="Validation Required">Validation Required</option>
            <option value="Validated">Validated</option>
            <option value="Paid">Paid</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-100 bg-slate-50/60 font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-3.5">Payrun Ref & Name</th>
                <th className="px-5 py-3.5">Period Month</th>
                <th className="px-5 py-3.5">Employees</th>
                <th className="px-5 py-3.5">Gross Amount</th>
                <th className="px-5 py-3.5">Net Salary</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredPayruns.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-slate-400">
                    No payruns found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredPayruns.map((run) => (
                  <tr
                    key={run.id}
                    className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                    onClick={() => navigate(`/payroll/payruns/${run.id}`)}
                  >
                    <td className="px-5 py-4 font-bold text-slate-900">
                      <div>
                        <span>{run.name}</span>
                        <span className="block text-[11px] font-normal text-slate-400">{run.id}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-600">{run.periodMonth}</td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1 font-semibold text-slate-800">
                        <Users className="h-3.5 w-3.5 text-slate-400" />
                        {run.employeeCount || 0}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-semibold text-slate-900">
                      {formatINR(run.totalGross || 0)}
                    </td>
                    <td className="px-5 py-4 font-bold text-emerald-700">
                      {formatINR(run.totalNetSalary || 0)}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={run.status} />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/payroll/payruns/${run.id}`);
                        }}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                      >
                        View & Process
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
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
