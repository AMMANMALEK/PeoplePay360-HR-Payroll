import React, { useState } from 'react';
import Drawer from '../ui/Drawer';
import StatusBadge from '../ui/StatusBadge';
import { Calendar, User, Clock, AlertCircle, CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import { useHRData } from '../../context/HRDataContext';

export default function TimeOffReviewModal({ isOpen, onClose, request = null }) {
  const { approveTimeOff, refuseTimeOff, allocations } = useHRData();

  const [mode, setMode] = useState('view'); // 'view' | 'refuse' | 'approved_feedback'
  const [refusalReason, setRefusalReason] = useState('');
  const [refusalError, setRefusalError] = useState('');

  if (!request) return null;

  // Find matching allocation balance
  const employeeAlloc = allocations.find(
    (a) => a.employeeId === request.employeeId && a.typeName.toLowerCase().includes(request.timeOffType.toLowerCase())
  );

  const allocatedDays = employeeAlloc ? employeeAlloc.allocated : 24;
  const takenDays = employeeAlloc ? employeeAlloc.taken : 8;
  const remainingDays = employeeAlloc ? employeeAlloc.remaining : (request.currentBalance || 16);
  const balanceAfterApproval = Math.max(0, remainingDays - request.duration);

  const handleApprove = () => {
    approveTimeOff(request.id);
    setMode('approved_feedback');
    setTimeout(() => {
      onClose();
      setMode('view');
    }, 1500);
  };

  const handleConfirmRefusal = (e) => {
    e.preventDefault();
    if (!refusalReason.trim()) {
      setRefusalError('Refusal reason is mandatory to document the decision for the employee.');
      return;
    }
    refuseTimeOff(request.id, refusalReason.trim());
    setMode('view');
    setRefusalReason('');
    onClose();
  };

  const footerActions = (
    <>
      {request.status === 'Pending' && mode === 'view' ? (
        <div className="flex w-full items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setMode('refuse')}
            className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition-colors shadow-2xs"
          >
            <XCircle className="h-3.5 w-3.5" />
            <span>Refuse</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-subtle"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApprove}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 shadow-sm transition-colors"
            >
              <CheckCircle className="h-3.5 w-3.5" />
              <span>Approve & Deduct</span>
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-subtle"
        >
          Close
        </button>
      )}
    </>
  );

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={`Review Leave: ${request.id}`}
      subtitle="Examine employee leave balance and record HR decision"
      footer={footerActions}
      width="max-w-lg"
    >
      <div className="space-y-4">
        {/* Approved Success Feedback Banner */}
        {mode === 'approved_feedback' && (
          <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-emerald-900 animate-in fade-in">
            <div className="flex items-center gap-2 font-bold text-xs">
              <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>✓ Time-off request approved</span>
            </div>
            <p className="mt-1 text-[11px] text-emerald-700">
              Leave balance updated. {request.duration} days deducted from available quota.
            </p>
          </div>
        )}

        {/* Employee Overview Card */}
        <div className="rounded-xl border border-slate-200/90 bg-slate-50/80 p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 font-bold">
                <User className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">{request.employeeName}</h3>
                <p className="text-xs text-slate-500">{request.jobPosition} • {request.department}</p>
              </div>
            </div>
            <StatusBadge status={request.status} />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-200/80 pt-3 text-xs">
            <div>
              <span className="text-[11px] text-slate-400 font-medium block">Leave Type</span>
              <span className="font-semibold text-slate-800">{request.timeOffType}</span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 font-medium block">Requested Duration</span>
              <span className="font-bold text-indigo-700 text-sm">{request.duration} {request.durationUnit || 'days'}</span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 font-medium block">Requested Dates</span>
              <span className="font-semibold text-slate-800 font-mono text-[11px]">{request.startDate} → {request.endDate}</span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 font-medium block">Application Date</span>
              <span className="font-medium text-slate-600 text-[11px]">{request.appliedDate || '04 Sep 2026'}</span>
            </div>
          </div>
        </div>

        {/* Stated Reason */}
        <div className="rounded-xl border border-slate-200 p-3.5 bg-white space-y-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Stated Reason
          </span>
          <p className="text-xs text-slate-700 italic leading-relaxed">
            "{request.reason || 'No detailed reason provided with this request.'}"
          </p>
        </div>

        {/* CURRENT BALANCE & AFTER APPROVAL PREVIEW */}
        <div className="rounded-xl border border-indigo-200 bg-indigo-50/40 p-4 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
              CURRENT BALANCE
            </span>
            <span className="text-[11px] text-indigo-700 font-semibold">{request.timeOffType} Quota</span>
          </div>

          {/* 3 Metrics: Allocated, Taken, Remaining */}
          <div className="grid grid-cols-3 gap-2 bg-white rounded-lg p-3 border border-indigo-100 text-center">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Allocated</span>
              <div className="font-bold text-slate-800 text-sm mt-0.5">{allocatedDays} days</div>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Taken</span>
              <div className="font-bold text-amber-600 text-sm mt-0.5">{takenDays} days</div>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Remaining</span>
              <div className="font-extrabold text-indigo-700 text-sm mt-0.5">{remainingDays} days</div>
            </div>
          </div>

          {/* AFTER APPROVAL Visually Obvious Preview */}
          <div className="flex items-center justify-between rounded-lg bg-emerald-50 border border-emerald-200 px-3.5 py-2.5 text-xs">
            <span className="text-[11px] font-bold text-emerald-950 uppercase tracking-wider">
              AFTER APPROVAL
            </span>
            <div className="flex items-center gap-1.5 font-semibold text-emerald-800">
              <span className="text-slate-400 line-through font-normal text-[11px]">{remainingDays}d</span>
              <span className="text-slate-500 text-[11px]">Remaining:</span>
              <span className="text-sm font-extrabold text-emerald-700">{balanceAfterApproval} days</span>
            </div>
          </div>
        </div>

        {/* Logged Refusal Reason (if already refused) */}
        {request.status === 'Refused' && request.refusalReason && (
          <div className="rounded-xl border border-rose-200 bg-rose-50/60 p-3.5 text-xs text-rose-900 space-y-1">
            <span className="font-bold block text-[11px] uppercase tracking-wider text-rose-800">Logged Refusal Reason:</span>
            <p className="italic text-slate-700">"{request.refusalReason}"</p>
          </div>
        )}

        {/* Refusal Reason Form */}
        {mode === 'refuse' && (
          <form onSubmit={handleConfirmRefusal} className="space-y-3 rounded-xl border border-rose-200 bg-rose-50/50 p-4 animate-in fade-in">
            <div>
              <label className="block text-[11px] font-bold text-rose-900 mb-1">
                Reason for Refusal <span className="text-rose-500">* (Mandatory)</span>
              </label>
              <textarea
                rows={3}
                required
                value={refusalReason}
                onChange={(e) => {
                  setRefusalReason(e.target.value);
                  if (refusalError) setRefusalError('');
                }}
                placeholder="State the operational or scheduling justification for refusing this leave..."
                className="w-full rounded-lg border border-rose-300 bg-white px-3 py-2 text-xs shadow-subtle focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500 placeholder:text-slate-400"
              />
              {refusalError && <p className="mt-1 text-[11px] font-medium text-rose-600">{refusalError}</p>}
            </div>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setMode('view')}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Back
              </button>
              <button
                type="submit"
                className="rounded-lg bg-rose-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-rose-700 shadow-sm transition-colors"
              >
                Confirm Refusal
              </button>
            </div>
          </form>
        )}
      </div>
    </Drawer>
  );
}
