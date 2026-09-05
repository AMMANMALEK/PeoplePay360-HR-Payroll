import React from 'react';
import Drawer from '../ui/Drawer';
import StatusBadge from '../ui/StatusBadge';
import { formatINR } from '../../utils/formatCurrency';
import {
  FileText,
  Calendar,
  Building,
  CreditCard,
  Download,
  Printer,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  Percent
} from 'lucide-react';

export default function PayslipDetailDrawer({ isOpen, onClose, payslip }) {
  if (!payslip) return null;

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Payslip Breakdown"
      subtitle={`${payslip.periodName} compensation statement`}
      width="max-w-xl"
    >
      <div className="space-y-6">
        {/* Header Profile Summary */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-subtle">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-slate-900">{payslip.employeeName}</h4>
              <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                <span>{payslip.jobPosition}</span>
                <span>·</span>
                <span>{payslip.department}</span>
                <span>·</span>
                <span className="font-mono">{payslip.employeeCode}</span>
              </div>
            </div>
            <StatusBadge status={payslip.status} />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-3 text-xs">
            <div>
              <span className="text-[10px] font-medium text-slate-400">Payrun Period</span>
              <p className="font-medium text-slate-800">{payslip.periodName}</p>
            </div>
            <div>
              <span className="text-[10px] font-medium text-slate-400">Worked Days</span>
              <p className="font-medium text-slate-800">
                {payslip.workedDays} / {payslip.totalWorkDays} days
              </p>
            </div>
            <div>
              <span className="text-[10px] font-medium text-slate-400">Salary Structure</span>
              <p className="font-medium text-slate-800 truncate">{payslip.salaryStructureName}</p>
            </div>
            <div>
              <span className="text-[10px] font-medium text-slate-400">Base Contract Wage</span>
              <p className="font-medium text-slate-800">
                {formatINR(payslip.contractWage || 0)} / mo
              </p>
            </div>
          </div>
        </div>

        {/* Bank & Disbursement Status */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-800 flex items-center gap-1.5">
              <CreditCard className="h-3.5 w-3.5 text-slate-500" />
              Disbursement Method
            </span>
            {payslip.bankDetails ? (
              <span className="text-emerald-700 font-medium flex items-center gap-1 text-[11px]">
                <ShieldCheck className="h-3.5 w-3.5" />
                Electronic Direct Deposit
              </span>
            ) : (
              <span className="text-amber-700 font-semibold flex items-center gap-1 text-[11px]">
                <AlertCircle className="h-3.5 w-3.5" />
                Missing Bank Account
              </span>
            )}
          </div>
          {payslip.bankDetails ? (
            <div className="mt-2 grid grid-cols-2 gap-2 text-[11px] text-slate-600">
              <div>
                <span className="text-slate-400">Bank: </span>
                {payslip.bankDetails.bankName}
              </div>
              <div>
                <span className="text-slate-400">Account: </span>
                •••• {payslip.bankDetails.accountNumber?.slice(-4)}
              </div>
              <div>
                <span className="text-slate-400">Routing: </span>
                {payslip.bankDetails.routingNumber}
              </div>
              <div>
                <span className="text-slate-400">Holder: </span>
                {payslip.bankDetails.accountHolder}
              </div>
            </div>
          ) : (
            <p className="mt-1 text-[11px] text-amber-800">
              Direct deposit details must be added before automated bank transfer can occur.
            </p>
          )}
        </div>

        {/* EARNINGS BREAKDOWN */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-subtle space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Earnings & Allowances
            </span>
            <span className="text-xs font-semibold text-slate-900">
              Gross: {formatINR(payslip.gross || 0)}
            </span>
          </div>

          <div className="space-y-2 text-xs">
            {(payslip.earnings || []).map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-slate-700">
                <span className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                    {item.code}
                  </span>
                  <span>{item.name}</span>
                </span>
                <span className="font-medium text-slate-900">
                  {formatINR(item.amount || 0)}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-100 pt-2 flex items-center justify-between text-xs font-bold text-slate-900">
            <span>Total Gross Earnings</span>
            <span>{formatINR(payslip.gross || 0)}</span>
          </div>
        </div>

        {/* DEDUCTIONS BREAKDOWN */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-subtle space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Statutory & Tax Deductions
            </span>
            <span className="text-xs font-semibold text-rose-700">
              -{formatINR(payslip.totalDeductions || 0)}
            </span>
          </div>

          <div className="space-y-2 text-xs">
            {(payslip.deductions || []).map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-slate-700">
                <span className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100">
                    {item.code}
                  </span>
                  <span>{item.name}</span>
                </span>
                <span className="font-medium text-rose-700">
                  -{formatINR(item.amount || 0)}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-100 pt-2 flex items-center justify-between text-xs font-bold text-rose-700">
            <span>Total Deductions</span>
            <span>-{formatINR(payslip.totalDeductions || 0)}</span>
          </div>
        </div>

        {/* PROMINENT NET SALARY CARD */}
        <div className="rounded-2xl border-2 border-emerald-300 bg-emerald-50/60 p-4 shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                Net Take-Home Pay
              </span>
              <p className="text-2xl font-black text-slate-900 mt-0.5">
                {formatINR(payslip.net || 0)}
              </p>
              <p className="text-[11px] text-emerald-800 mt-1">
                Gross ({formatINR(payslip.gross || 0)}) − Deductions ({formatINR(payslip.totalDeductions || 0)})
              </p>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
              ✓
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={() => window.print()}
            className="btn-secondary"
          >
            <Printer className="h-3.5 w-3.5" />
            Print / PDF
          </button>
          <button type="button" onClick={onClose} className="btn-primary">
            Done
          </button>
        </div>
      </div>
    </Drawer>
  );
}
