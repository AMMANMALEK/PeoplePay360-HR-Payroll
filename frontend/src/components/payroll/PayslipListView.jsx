import React, { useState, useMemo } from 'react';
import StatusBadge from '../ui/StatusBadge';
import EmployeeAvatar from '../ui/EmployeeAvatar';
import EmptyState from '../ui/EmptyState';
import { useHRData } from '../../context/HRDataContext';
import { Search, Eye, Filter, Download, CreditCard, ShieldCheck, AlertCircle } from 'lucide-react';

export default function PayslipListView({ onSelectPayslip }) {
  const { payslips, payruns } = useHRData();

  const [search, setSearch] = useState('');
  const [payrunFilter, setPayrunFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const filteredPayslips = useMemo(() => {
    return payslips.filter((p) => {
      const matchSearch =
        p.employeeName.toLowerCase().includes(search.toLowerCase()) ||
        p.employeeCode.toLowerCase().includes(search.toLowerCase()) ||
        p.periodName.toLowerCase().includes(search.toLowerCase());

      const matchPayrun = payrunFilter === 'All' || p.payrunId === payrunFilter;
      const matchStatus = statusFilter === 'All' || p.status.toLowerCase() === statusFilter.toLowerCase();

      return matchSearch && matchPayrun && matchStatus;
    });
  }, [payslips, search, payrunFilter, statusFilter]);

  return (
    <div className="space-y-4">
      {/* Search & Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[220px]">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              className="field-input pl-8 py-1.5 text-xs"
              placeholder="Search by employee name or code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="field-input py-1.5 text-xs w-auto min-w-[150px]"
            value={payrunFilter}
            onChange={(e) => setPayrunFilter(e.target.value)}
          >
            <option value="All">All Payruns</option>
            {payruns.map((pr) => (
              <option key={pr.id} value={pr.id}>
                {pr.name}
              </option>
            ))}
          </select>

          <select
            className="field-input py-1.5 text-xs w-auto min-w-[130px]"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Draft">Draft</option>
            <option value="Computed">Computed</option>
            <option value="Validated">Validated</option>
            <option value="Paid">Paid</option>
          </select>
        </div>

        <div className="text-xs text-slate-500 font-medium shrink-0">
          Showing {filteredPayslips.length} of {payslips.length} payslips
        </div>
      </div>

      {/* Table */}
      <div className="app-card overflow-hidden">
        {filteredPayslips.length === 0 ? (
          <EmptyState
            title="No payslips found"
            description="No employee payslips match your query."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-xs">
              <thead className="bg-slate-50/80 text-[10px] font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3">Employee</th>
                  <th className="px-3 py-3">Payrun / Period</th>
                  <th className="px-3 py-3">Structure</th>
                  <th className="px-3 py-3 text-center">Worked Days</th>
                  <th className="px-3 py-3 text-right">Gross</th>
                  <th className="px-3 py-3 text-right">Deductions</th>
                  <th className="px-3 py-3 text-right">Net Salary</th>
                  <th className="px-3 py-3">Bank Status</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPayslips.map((payslip) => (
                  <tr
                    key={payslip.id}
                    onClick={() => onSelectPayslip(payslip)}
                    className="hover:bg-slate-50/70 transition-colors cursor-pointer group"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <EmployeeAvatar name={payslip.employeeName} size="sm" />
                        <div>
                          <div className="font-semibold text-slate-900 group-hover:text-brand-900 leading-snug">
                            {payslip.employeeName}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">{payslip.employeeCode}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3.5 text-slate-700">
                      <div className="font-medium text-slate-900">{payslip.periodName}</div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[150px]">
                        {payslip.payrunName}
                      </div>
                    </td>
                    <td className="px-3 py-3.5 text-slate-600 truncate max-w-[140px]">
                      {payslip.salaryStructureName}
                    </td>
                    <td className="px-3 py-3.5 text-center text-slate-600 font-medium">
                      {payslip.workedDays} / {payslip.totalWorkDays}d
                    </td>
                    <td className="px-3 py-3.5 text-right font-medium text-slate-900">
                      ${Number(payslip.gross || 0).toLocaleString()}
                    </td>
                    <td className="px-3 py-3.5 text-right text-rose-600 font-medium">
                      -${Number(payslip.totalDeductions || 0).toLocaleString()}
                    </td>
                    <td className="px-3 py-3.5 text-right font-bold text-slate-900">
                      ${Number(payslip.net || 0).toLocaleString()}
                    </td>
                    <td className="px-3 py-3.5">
                      {payslip.bankDetails ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700">
                          <ShieldCheck className="h-3.5 w-3.5" />
                          Ready
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700">
                          <AlertCircle className="h-3.5 w-3.5" />
                          Missing
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-3.5">
                      <StatusBadge status={payslip.status} />
                    </td>
                    <td
                      className="px-5 py-3.5 text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => onSelectPayslip(payslip)}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 shadow-subtle"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>Breakdown</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
