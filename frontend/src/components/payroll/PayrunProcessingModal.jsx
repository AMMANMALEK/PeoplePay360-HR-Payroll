import React, { useState, useMemo } from 'react';
import Modal from '../ui/Modal';
import StatusBadge from '../ui/StatusBadge';
import { useHRData } from '../../context/HRDataContext';
import { useAuth } from '../../context/AuthContext';
import { canUpdate as checkCanUpdate } from '../../constants/rbac';
import { formatINR } from '../../utils/formatCurrency';
import {
  Calculator,
  CheckCircle2,
  AlertTriangle,
  Send,
  CreditCard,
  Building,
  Calendar,
  Layers,
  ArrowRight,
  FileCheck,
  Download,
  Eye,
  AlertCircle,
  HelpCircle,
  XCircle
} from 'lucide-react';

export default function PayrunProcessingModal({
  isOpen,
  onClose,
  payrun,
  onViewPayslip,
}) {
  const {
    computePayrun,
    validatePayrun,
    markPayrunPaid,
    sendPayslips,
    getPayrunWarnings,
    payslips,
  } = useHRData();

  const { user } = useAuth();
  // HR_PAYROLL_USER has canComputePayrun but NOT canValidatePayrun
  // canValidatePayrun maps to 'delete' level on payruns in rbac (only MANAGER/ADMIN)
  // We check directly against the role string for clarity
  const canValidate = user?.role === 'HR_PAYROLL_MANAGER' || user?.role === 'ADMIN';

  const [isProcessing, setIsProcessing] = useState(false);

  // Retrieve current payrun payslips (Hook must run unconditionally)
  const relatedPayslips = useMemo(() => {
    if (!payrun) return [];
    return payslips.filter((p) => p.payrunId === payrun.id);
  }, [payslips, payrun?.id]);

  // Evaluate operational warnings & readiness (Hook must run unconditionally)
  const evaluation = useMemo(() => {
    if (!payrun) return { warnings: [], hasBlockers: false, isReady: false, checklist: [] };
    return getPayrunWarnings(payrun);
  }, [getPayrunWarnings, payrun]);

  if (!payrun) return null;

  // State handlers
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
      await sendPayslips(payrun.id);
    } finally {
      setIsProcessing(false);
    }
  };

  const isDraft = payrun.status === 'Draft';
  const isComputed = payrun.status === 'Computed';
  const isValidated = payrun.status === 'Validated';
  const isPaid = payrun.status === 'Paid';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${payrun.name} — Command Center`}
      maxWidth="max-w-4xl sm:max-w-5xl"
    >
      <div className="space-y-4">
        {/* Top Header Card */}
        <div className="rounded-2xl border border-slate-200/90 bg-slate-50/70 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  {payrun.periodName} Payroll
                </h3>
                <StatusBadge status={payrun.status} />
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Layers className="h-3.5 w-3.5 text-slate-400" />
                  {payrun.salaryStructureName || 'Standard Structure'}
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  {payrun.periodStart} to {payrun.periodEnd}
                </span>
                <span>·</span>
                <span className="font-mono text-slate-400">{payrun.id}</span>
              </div>
            </div>

            {/* State-Dependent Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              {isDraft && (
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleCompute}
                  className="btn-primary"
                >
                  <Calculator className="h-3.5 w-3.5" />
                  {isProcessing ? 'Computing...' : 'Compute Payroll'}
                </button>
              )}

              {isComputed && (
                <>
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={handleCompute}
                    className="btn-secondary"
                  >
                    <Calculator className="h-3.5 w-3.5" />
                    Re-Compute
                  </button>
                  {canValidate ? (
                    <button
                      type="button"
                      disabled={isProcessing || !evaluation.isReady}
                      onClick={handleValidate}
                      className="btn-primary"
                      title={
                        !evaluation.isReady
                          ? 'Resolve blocking warnings before validation'
                          : undefined
                      }
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {isProcessing ? 'Validating...' : 'Validate Payroll'}
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-[11px] font-semibold text-slate-500">
                      <HelpCircle className="h-3.5 w-3.5" />
                      Validation: Manager required
                    </span>
                  )}
                </>
              )}

              {isValidated && (
                <>
                  {canValidate ? (
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={handleMarkPaid}
                      className="btn-success"
                    >
                      <CreditCard className="h-3.5 w-3.5" />
                      {isProcessing ? 'Recording...' : 'Mark as Paid'}
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-[11px] font-semibold text-slate-500">
                      <HelpCircle className="h-3.5 w-3.5" />
                      Mark Paid: Manager required
                    </span>
                  )}
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={handleSendPayslips}
                    className="btn-secondary"
                  >
                    <Send className="h-3.5 w-3.5" />
                    Send Payslips
                  </button>
                </>
              )}

              {isPaid && (
                <>
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={handleSendPayslips}
                    className="btn-secondary"
                  >
                    <Send className="h-3.5 w-3.5" />
                    Re-Send Payslips
                  </button>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="btn-secondary"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Export Batch
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Operational Metrics Bar */}
          <div className="mt-3.5 grid grid-cols-2 gap-3 sm:grid-cols-4 border-t border-slate-200/70 pt-3">
            <div className="rounded-xl bg-white p-2.5 border border-slate-200/80 shadow-subtle">
              <span className="text-[11px] font-medium text-slate-500">Employees Included</span>
              <p className="mt-0.5 text-base font-bold text-slate-900">{payrun.employeesCount}</p>
            </div>
            <div className="rounded-xl bg-white p-2.5 border border-slate-200/80 shadow-subtle">
              <span className="text-[11px] font-medium text-slate-500">Total Gross Salary</span>
              <p className="mt-0.5 text-base font-bold text-slate-900">
                {formatINR(payrun.totalGross || 0)}
              </p>
            </div>
            <div className="rounded-xl bg-white p-2.5 border border-slate-200/80 shadow-subtle">
              <span className="text-[11px] font-medium text-slate-500">Total Deductions</span>
              <p className="mt-0.5 text-base font-bold text-rose-700">
                -{formatINR(payrun.totalDeductions || 0)}
              </p>
            </div>
            <div className="rounded-xl bg-white p-2.5 border border-emerald-200 bg-emerald-50/40 shadow-subtle">
              <span className="text-[11px] font-medium text-emerald-800">Total Net Salary</span>
              <p className="mt-0.5 text-base font-bold text-emerald-900">
                {formatINR(payrun.totalNet || 0)}
              </p>
            </div>
          </div>
        </div>

        {/* SECTION: PAYROLL VALIDATION UX & READINESS */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* Readiness Checklist Card */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-subtle lg:col-span-1">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Payroll Readiness
              </span>
              <StatusBadge
                status={evaluation.isReady ? 'Ready for Validation' : 'Action Required'}
              />
            </div>
            <div className="space-y-2 text-xs">
              {evaluation.checklist.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between py-1">
                  <span className="text-slate-700">{item.label}</span>
                  {item.passed ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  ) : item.warning ? (
                    <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
                  ) : (
                    <XCircle className="h-4 w-4 text-rose-500 shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Actionable Warning Cards */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-subtle lg:col-span-2">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Operational Warning Center
              </span>
              <span className="text-[11px] text-slate-400">
                {evaluation.warnings.length} items surfaced
              </span>
            </div>

            {evaluation.warnings.length === 0 ? (
              <div className="flex items-center gap-2 rounded-xl bg-emerald-50/70 p-3 text-xs text-emerald-800 border border-emerald-200">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>All verification checks passed. Zero blockers or data discrepancies detected.</span>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-52 overflow-y-auto pr-1">
                {evaluation.warnings.map((warn) => (
                  <div
                    key={warn.id}
                    className={`rounded-xl border p-3 text-xs transition-colors ${
                      warn.severity === 'high' || warn.severity === 'critical'
                        ? 'border-amber-200 bg-amber-50/60'
                        : 'border-slate-200 bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2">
                        <AlertTriangle
                          className={`h-4 w-4 shrink-0 mt-0.5 ${
                            warn.severity === 'high' ? 'text-amber-600' : 'text-slate-500'
                          }`}
                        />
                        <div>
                          <p className="font-semibold text-slate-900">{warn.title}</p>
                          <p className="mt-0.5 text-[11px] text-slate-600 font-medium">
                            {warn.subtitle}
                          </p>
                          <p className="mt-1 text-[11px] text-slate-500">
                            {warn.description}
                          </p>
                          {warn.affectedEmployees?.length > 0 && (
                            <div className="mt-1.5 flex flex-wrap items-center gap-1">
                              <span className="text-[10px] font-semibold text-slate-500">Affected:</span>
                              {warn.affectedEmployees.map((emp) => (
                                <span
                                  key={emp.employeeId}
                                  className="rounded-md bg-white border border-slate-200 px-1.5 py-0.5 text-[10px] font-medium text-slate-800"
                                >
                                  {emp.employeeName}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <a
                        href={warn.actionRoute}
                        onClick={(e) => {
                          e.preventDefault();
                          onClose();
                          window.location.assign(warn.actionRoute);
                        }}
                        className="inline-flex items-center gap-1 rounded-lg bg-white border border-slate-200 px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 shadow-subtle shrink-0"
                      >
                        <span>{warn.actionLabel}</span>
                        <ArrowRight className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* SECTION: ASSOCIATED PAYSLIPS TABLE */}
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-subtle">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 bg-slate-50/60">
            <div>
              <span className="text-xs font-semibold text-slate-900">
                Generated Payslips ({relatedPayslips.length})
              </span>
              <span className="ml-2 text-[11px] text-slate-500">
                Individual salary computations and deductions
              </span>
            </div>
          </div>

          {relatedPayslips.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              <Calculator className="mx-auto h-6 w-6 text-slate-400 mb-1" />
              <p className="font-semibold text-slate-700">No payslips computed yet.</p>
              <p className="mt-0.5">Click &quot;Compute Payroll&quot; above to execute salary rules.</p>
            </div>
          ) : (
            <div className="max-h-72 overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 sticky top-0 z-10 text-[10px] font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                  <tr>
                    <th className="px-4 py-2.5">Employee</th>
                    <th className="px-3 py-2.5">Worked Days</th>
                    <th className="px-3 py-2.5 text-right">Gross Pay</th>
                    <th className="px-3 py-2.5 text-right">Deductions</th>
                    <th className="px-3 py-2.5 text-right">Net Pay</th>
                    <th className="px-3 py-2.5">Bank Status</th>
                    <th className="px-4 py-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {relatedPayslips.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900">{p.employeeName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{p.employeeCode}</div>
                      </td>
                      <td className="px-3 py-3 text-slate-600">
                        {p.workedDays} / {p.totalWorkDays} days
                      </td>
                      <td className="px-3 py-3 text-right font-medium text-slate-900">
                        {formatINR(p.gross || 0)}
                      </td>
                      <td className="px-3 py-3 text-right text-rose-600 font-medium">
                        -{formatINR(p.totalDeductions || 0)}
                      </td>
                      <td className="px-3 py-3 text-right font-bold text-slate-900">
                        {formatINR(p.net || 0)}
                      </td>
                      <td className="px-3 py-3">
                        {p.bankDetails ? (
                          <span className="text-emerald-700 text-[11px] font-medium">Verified</span>
                        ) : (
                          <span className="text-amber-700 text-[11px] font-semibold">⚠ Missing</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            if (onViewPayslip) onViewPayslip(p);
                          }}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          <Eye className="h-3 w-3" />
                          <span>View Detail</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-3 border-t border-slate-100">
          <button type="button" onClick={onClose} className="btn-secondary">
            Close Command Center
          </button>
        </div>
      </div>
    </Modal>
  );
}
