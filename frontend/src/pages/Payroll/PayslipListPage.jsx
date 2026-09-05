import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Receipt, Eye, Printer, Download, Users } from 'lucide-react';
import { formatINR } from '../../utils/formatCurrency';
import { useHRData } from '../../context/HRDataContext';
import StatusBadge from '../../components/ui/StatusBadge';

export default function PayslipListPage() {
  const navigate = useNavigate();
  const { payslips, departments } = useHRData();

  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filteredPayslips = payslips.filter((ps) => {
    const matchesSearch =
      ps.employeeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ps.employeeCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ps.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ps.payrunName?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDept = deptFilter === 'ALL' ? true : ps.department === deptFilter;
    const matchesStatus = statusFilter === 'ALL' ? true : ps.status === statusFilter;

    return matchesSearch && matchesDept && matchesStatus;
  });

  const totalNetSalarySum = filteredPayslips.reduce((acc, curr) => acc + (curr.netSalary || 0), 0);

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-brand-100 px-2 py-0.5 text-xs font-bold text-slate-800">
              HR Payroll User
            </span>
            <span className="text-xs font-semibold text-slate-400">• Employee Payslip Directory</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">Generated Payslips</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            View detailed salary breakdowns, deduction line items, and print or export payslips.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500">Total Payslips</span>
          <p className="text-2xl font-bold text-slate-900 mt-2">{payslips.length}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Calculated across payruns</p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500">Filtered Net Payroll Value</span>
          <p className="text-2xl font-bold text-emerald-700 mt-2">{formatINR(totalNetSalarySum)}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Combined net pay of current filter</p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500">Employees Paid</span>
          <p className="text-2xl font-bold text-slate-900 mt-2">
            {[...new Set(payslips.map((p) => p.employeeId))].length}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Unique staff members</p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search employee, ID or payrun..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-9 pr-4 py-2 text-xs font-medium text-slate-800 placeholder-slate-400 focus:bg-white focus:border-brand-400 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-400">Dept:</span>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700"
            >
              <option value="ALL">All Departments</option>
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-400">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700"
            >
              <option value="ALL">All Statuses</option>
              <option value="Draft">Draft</option>
              <option value="Paid">Paid</option>
            </select>
          </div>
        </div>
      </div>

      {/* Payslips Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-100 bg-slate-50/60 font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-3.5">Payslip ID</th>
                <th className="px-5 py-3.5">Employee</th>
                <th className="px-5 py-3.5">Department</th>
                <th className="px-5 py-3.5">Payrun Period</th>
                <th className="px-5 py-3.5">Gross</th>
                <th className="px-5 py-3.5">Deductions</th>
                <th className="px-5 py-3.5">Net Salary</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredPayslips.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-5 py-8 text-center text-slate-400">
                    No payslips found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredPayslips.map((ps) => (
                  <tr
                    key={ps.id}
                    className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                    onClick={() => navigate(`/payroll/payslips/${ps.id}`)}
                  >
                    <td className="px-5 py-4 font-bold text-slate-900">{ps.id}</td>
                    <td className="px-5 py-4">
                      <div>
                        <span className="font-bold text-slate-900">{ps.employeeName}</span>
                        <span className="block text-[11px] font-normal text-slate-400">
                          {ps.employeeCode}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-600">{ps.department}</td>
                    <td className="px-5 py-4 text-slate-600">{ps.payrunPeriod}</td>
                    <td className="px-5 py-4 font-semibold text-slate-900">
                      {formatINR(ps.grossSalary || 0)}
                    </td>
                    <td className="px-5 py-4 font-semibold text-rose-700">
                      -{formatINR(ps.totalDeductions || 0)}
                    </td>
                    <td className="px-5 py-4 font-bold text-emerald-700">
                      {formatINR(ps.netSalary || 0)}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={ps.status} />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/payroll/payslips/${ps.id}`);
                        }}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
