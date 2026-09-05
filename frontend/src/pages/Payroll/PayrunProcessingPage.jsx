import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Play,
  CheckCircle,
  CreditCard,
  Send,
  AlertTriangle,
  Users,
  Calendar,
  FileText,
  Eye,
  Building,
} from 'lucide-react';
import { useHRData } from '../../context/HRDataContext';
import StatusBadge from '../../components/ui/StatusBadge';
import PayrollWarning from '../../components/payroll/PayrollWarning';

export default function PayrunProcessingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    payruns,
    payslips,
    computePayrun,
    validatePayrun,
    markPayrunPaid,
    sendPayrunPayslips,
  } = useHRData();

  const [isProcessing, setIsProcessing] = useState(false);

  const payrun = payruns.find((p) => p.id === id);
  const runPayslips = payslips.filter((ps) => ps.payrunId === id);

  if (!payrun) {
    return (
      <div className="p-8 text-center max-w-xl mx-auto">
        <h2 className="text-lg font-bold text-slate-800">Payrun Not Found</h2>
        <p className="text-xs text-slate-500 mt-1">
          No payrun record with ID <span className="font-semibold">{id}</span> could be located.
        </p>
        <button
          type="button"
          onClick={() => navigate('/payroll/payruns')}
          className="mt-4 rounded-xl bg-brand-400 px-4 py-2 text-xs font-bold text-slate-900"
        >
          Back to Payruns
        </button>
      </div>
    );
  }

  const handleCompute = async () => {
    setIsProcessing(true);
    try {
      await computePayrun(payrun.id);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleValidate = async () => {
    setIsProcessing(true);
    try {
      await validatePayrun(payrun.id);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMarkPaid = async () => {
    setIsProcessing(true);
    try {
      await markPayrunPaid(payrun.id);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSendPayslips = async () => {
    setIsProcessing(true);
    try {
      await sendPayrunPayslips(payrun.id);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Back & Title Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={() => navigate('/payroll/payruns')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 mb-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Payruns
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900">{payrun.name}</h1>
            <StatusBadge status={payrun.status} />
            {payrun.isSent && (
              <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-700">
                Payslips Sent
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {payrun.id} • Period: {payrun.periodMonth} ({payrun.startDate} to {payrun.endDate})
          </p>
        </div>

        {/* Dynamic Action Buttons based on Status */}
        <div className="flex items-center gap-3">
          {payrun.status === 'Draft' && (
            <button
              type="button"
              disabled={isProcessing}
              onClick={handleCompute}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-400 px-5 py-2.5 text-xs font-bold text-slate-900 shadow-sm hover:bg-brand-500 disabled:opacity-50"
            >
              <Play className="h-4 w-4 fill-slate-900" />
              {isProcessing ? 'Computing...' : 'Compute Payroll'}
            </button>
          )}

          {(payrun.status === 'Computed' || payrun.status === 'Validation Required') && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleCompute}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Re-Compute
              </button>
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleValidate}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-600 disabled:opacity-50"
              >
                <CheckCircle className="h-4 w-4" />
                {isProcessing ? 'Validating...' : 'Validate Payrun'}
              </button>
            </div>
          )}

          {payrun.status === 'Validated' && (
            <button
              type="button"
              disabled={isProcessing}
              onClick={handleMarkPaid}
              className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-teal-700 disabled:opacity-50"
            >
              <CreditCard className="h-4 w-4" />
              {isProcessing ? 'Processing...' : 'Mark as Paid & Disburse'}
            </button>
          )}

          {payrun.status === 'Paid' && !payrun.isSent && (
            <button
              type="button"
              disabled={isProcessing}
              onClick={handleSendPayslips}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
              {isProcessing ? 'Sending...' : 'Send Payslips to Employees'}
            </button>
          )}
        </div>
      </div>

      {/* Warnings & Alerts */}
      {payrun.warnings && payrun.warnings.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-800">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <span>Payroll Warnings ({payrun.warnings.length})</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {payrun.warnings.map((w, idx) => (
              <PayrollWarning key={idx} warning={w} />
            ))}
          </div>
        </div>
      )}

      {/* Financial Summary KPI Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">Target Employees</span>
          <p className="text-xl font-bold text-slate-900 mt-1">{payrun.employeeCount || runPayslips.length}</p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">Total Gross Salary</span>
          <p className="text-xl font-bold text-slate-900 mt-1">${(payrun.totalGross || 0).toLocaleString()}</p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">Total Deductions</span>
          <p className="text-xl font-bold text-rose-700 mt-1">${(payrun.totalDeductions || 0).toLocaleString()}</p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">Net Disbursement</span>
          <p className="text-xl font-bold text-emerald-700 mt-1">${(payrun.totalNetSalary || 0).toLocaleString()}</p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">Scheduled Payment</span>
          <p className="text-xl font-bold text-slate-900 mt-1">{payrun.paymentDate || 'N/A'}</p>
        </div>
      </div>

      {/* Payslips Generated Table */}
      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-2xs overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h3 className="text-sm font-bold text-slate-900">
            Generated Payslips ({runPayslips.length})
          </h3>
          <span className="text-xs text-slate-500 font-medium">
            Rule engine calculated line items
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-100 bg-slate-50/60 font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-6 py-3.5">Employee</th>
                <th className="px-6 py-3.5">Department</th>
                <th className="px-6 py-3.5">Contract Wage</th>
                <th className="px-6 py-3.5">Worked Days</th>
                <th className="px-6 py-3.5">Gross</th>
                <th className="px-6 py-3.5">Deductions</th>
                <th className="px-6 py-3.5">Net Salary</th>
                <th className="px-6 py-3.5 text-right">Payslip</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {runPayslips.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-10 text-center text-slate-400">
                    No payslips computed yet. Click "Compute Payroll" above to run calculation rules.
                  </td>
                </tr>
              ) : (
                runPayslips.map((ps) => (
                  <tr key={ps.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">
                      <div>
                        <span>{ps.employeeName}</span>
                        <span className="block text-[11px] font-normal text-slate-400">
                          {ps.employeeCode}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{ps.department}</td>
                    <td className="px-6 py-4 text-slate-900 font-semibold">
                      ${(ps.wageAmount || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-slate-700">
                      {ps.workedDays}/{ps.totalWorkingDays} days
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-900">
                      ${(ps.grossSalary || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 font-semibold text-rose-700">
                      -${(ps.totalDeductions || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 font-bold text-emerald-700">
                      ${(ps.netSalary || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => navigate(`/payroll/payslips/${ps.id}`)}
                        className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        View Detail
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
