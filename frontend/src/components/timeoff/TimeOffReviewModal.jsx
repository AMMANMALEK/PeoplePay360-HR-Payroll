import React, { useState } from 'react';
import Modal from '../ui/Modal';
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
  const remainingDays = employeeAlloc ? employeeAlloc.remaining : request.currentBalance;
  const balanceAfterApproval = Math.max(0, remainingDays - request.duration);

  const handleApprove = () => {
    approveTimeOff(request.id);
    setMode('approved_feedback');
    setTimeout(() => {
      onClose();
      setMode('view');
    }, 1800);
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Review Time Off Request: ${request.id}`}
      description="Inspect requested duration, reason, and employee leave balance impact."
      maxWidth="max-w-lg"
    >
      <div className="space-y-4">
        {/* Success Banner After Approval */}
        {mode === 'approved_feedback' && (
          <div className="rounded-xl border-2 border-emerald-300 bg-emerald-50 p-4 text-emerald-900 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-2 font-bold text-sm">
              <CheckCircle className="h-5 w-5 text-emerald-600" />
              <span>✓ Time-off request approved</span>
            </div>
            <p className="mt-1 text-xs text-emerald-700">
              Leave balance updated. {request.duration} days deducted from available quota.
            </p>
          </div>
        )}

        {/* Request Overview Header */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 font-bold">
                <User className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">{request.employeeName}</h4>
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
              <span className="text-[11px] text-slate-400 font-medium block">Start Date</span>
              <span className="font-semibold text-slate-800">{request.startDate}</span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 font-medium block">End Date</span>
              <span className="font-semibold text-slate-800">{request.endDate}</span>
            </div>
          </div>
        </div>

        {/* Stated Reason */}
        <div className="rounded-lg border border-slate-200 p-3 bg-white">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Reason
          </span>
          <p className="text-xs text-slate-700 italic leading-relaxed">
            "{request.reason || 'No detailed reason specified.'}"
          </p>
        </div>

        {/* Visually Obvious Balance Impact */}
        <div className="rounded-xl border border-indigo-200 bg-indigo-50/40 p-4 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
              CURRENT BALANCE
            </span>
            <span className="text-[11px] text-slate-500 font-medium">Annual Quota Status</span>
          </div>

          {/* Current balance 3 numbers */}
          <div className="grid grid-cols-3 gap-2 bg-white rounded-lg p-2.5 border border-indigo-100 text-center text-xs">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Allocated</span>
              <div className="font-bold text-slate-800 text-sm">{allocatedDays} days</div>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Taken</span>
              <div className="font-bold text-amber-600 text-sm">{takenDays} days</div>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Remaining</span>
              <div className="font-extrabold text-indigo-700 text-sm">{remainingDays} days</div>
            </div>
          </div>

          {/* Projected after approval */}
          <div className="flex items-center justify-between rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2 text-xs">
            <div className="flex items-center gap-1.5 font-semibold text-emerald-900">
              <span className="text-[11px] uppercase tracking-wider">AFTER APPROVAL</span>
            </div>
            <div className="flex items-center gap-1 font-bold text-emerald-800">
              <span className="text-slate-400 line-through font-normal text-[11px] mr-1">{remainingDays}d</span>
              <span>Remaining:</span>
              <span className="text-sm font-extrabold text-emerald-700">{balanceAfterApproval} days</span>
            </div>
          </div>
        </div>

        {/* Logged refusal reason if refused */}
        {request.status === 'Refused' && request.refusalReason && (
          <div className="rounded-lg border border-rose-200 bg-rose-50/60 p-3 text-xs text-rose-900">
            <span className="font-bold block mb-0.5">Logged Refusal Reason:</span>
            <p className="italic">{request.refusalReason}</p>
          </div>
        )}

        {/* Refusal Form */}
        {mode === 'refuse' && (
          <form onSubmit={handleConfirmRefusal} className="space-y-3 rounded-xl border border-rose-200 bg-rose-50/40 p-3.5 animate-in fade-in">
            <div>
              <label className="block text-[11px] font-bold text-rose-900">
                Reason for Refusal <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={2}
                required
                value={refusalReason}
                onChange={(e) => {
                  setRefusalReason(e.target.value);
                  if (refusalError) setRefusalError('');
                }}
                placeholder="State the operational or scheduling reason for refusing this leave..."
                className="mt-1 w-full rounded-lg border border-rose-300 bg-white px-3 py-2 text-xs shadow-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
              {refusalError && <p className="mt-1 text-[11px] text-rose-600">{refusalError}</p>}
            </div>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setMode('view')}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                Back
              </button>
              <button
                type="submit"
                className="rounded-lg bg-rose-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-rose-700 shadow-sm"
              >
                Confirm Refusal
              </button>
            </div>
          </form>
        )}

        {/* Actions for Pending Requests */}
        {request.status === 'Pending' && mode === 'view' && (
          <div className="flex items-center justify-between border-t border-slate-100 pt-3">
            <button
              type="button"
              onClick={() => setMode('refuse')}
              className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition-colors"
            >
              <XCircle className="h-4 w-4" />
              <span>Refuse Request</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApprove}
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 shadow-sm transition-colors"
              >
                <CheckCircle className="h-4 w-4" />
                <span>Approve & Update Balance</span>
              </button>
            </div>
          </div>
        )}

        {request.status !== 'Pending' && mode === 'view' && (
          <div className="flex justify-end pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
}
