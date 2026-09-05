import React, { useState, useEffect, useMemo } from 'react';
import Drawer from '../ui/Drawer';
import { AlertTriangle, Clock, Calendar, User, ShieldCheck } from 'lucide-react';
import { useHRData } from '../../context/HRDataContext';

export default function AttendanceCorrectionModal({ isOpen, onClose, record = null }) {
  const { correctAttendance } = useHRData();

  const [checkIn, setCheckIn] = useState('09:00');
  const [checkOut, setCheckOut] = useState('17:30');
  const [reasonCategory, setReasonCategory] = useState('Late arrival');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (record) {
      setCheckIn(record.checkIn === '--:--' ? '09:00' : record.checkIn);
      setCheckOut(record.checkOut === '--:--' ? '17:30' : record.checkOut);
      setReasonCategory(
        record.status === 'Late'
          ? 'Late arrival'
          : record.status === 'Incomplete'
          ? 'Forgot checkout'
          : 'Badge reader malfunction'
      );
      setNote('');
      setError('');
    }
  }, [record, isOpen]);

  // Live calculation of worked hours formatted like "8h 05m"
  const formattedWorkedHours = useMemo(() => {
    if (!checkIn || !checkOut || checkIn === '--:--' || checkOut === '--:--') return '0h 00m';
    const [h1, m1] = checkIn.split(':').map(Number);
    const [h2, m2] = checkOut.split(':').map(Number);
    const totalMinutes = h2 * 60 + m2 - (h1 * 60 + m1);
    if (totalMinutes <= 0) return '0h 00m';
    const hrs = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    return `${hrs}h ${String(mins).padStart(2, '0')}m`;
  }, [checkIn, checkOut]);

  if (!record) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reasonCategory.trim()) {
      setError('Correction reason is mandatory for compliance auditing.');
      return;
    }

    const fullReason = note.trim()
      ? `${reasonCategory}: ${note.trim()}`
      : reasonCategory;

    correctAttendance(record.id, {
      checkIn,
      checkOut,
      reason: fullReason
    });

    onClose();
  };

  const footerActions = (
    <>
      <button
        type="button"
        onClick={onClose}
        className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-subtle transition-colors"
      >
        Cancel
      </button>
      <button
        type="button"
        onClick={handleSubmit}
        className="btn-primary"
      >
        Save Correction
      </button>
    </>
  );

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Correct Attendance"
      subtitle="Authorized HR audit correction of daily shift record"
      footer={footerActions}
      width="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Validation error */}
        {error && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-700 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Employee & Date Summary Card */}
        <div className="rounded-xl border border-slate-200/90 bg-slate-50/80 p-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500">Employee</span>
            <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs">
              <User className="h-3.5 w-3.5 text-indigo-600" />
              <span>{record.employeeName}</span>
            </div>
          </div>
          <div className="flex items-center justify-between border-t border-slate-200/60 pt-2">
            <span className="text-[11px] font-medium text-slate-500">Date</span>
            <div className="flex items-center gap-1.5 font-semibold text-slate-800 text-xs">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              <span>{record.date}</span>
            </div>
          </div>
          <div className="flex items-center justify-between border-t border-slate-200/60 pt-2">
            <span className="text-[11px] font-medium text-slate-500">Current Status</span>
            <span className="rounded bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-800">
              ● {record.status}
            </span>
          </div>
        </div>

        {/* Timestamps */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Check In <span className="text-rose-500">*</span>
            </label>
            <input
              type="time"
              required
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-mono font-medium shadow-subtle focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Check Out <span className="text-rose-500">*</span>
            </label>
            <input
              type="time"
              required
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-mono font-medium shadow-subtle focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Calculated Worked Hours Banner */}
        <div className="flex items-center justify-between rounded-xl border border-indigo-100 bg-indigo-50/70 px-4 py-2.5">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-indigo-600" />
            <span className="text-xs font-semibold text-indigo-950">Worked Hours</span>
          </div>
          <span className="text-sm font-extrabold text-indigo-700">{formattedWorkedHours}</span>
        </div>

        {/* Reason * */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-700 mb-1">
            Reason <span className="text-rose-500">*</span>
          </label>
          <select
            value={reasonCategory}
            onChange={(e) => setReasonCategory(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium shadow-subtle focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="Late arrival">Late arrival</option>
            <option value="Turnstile badge malfunction">Turnstile badge reader malfunction</option>
            <option value="Forgot checkout">Forgot checkout</option>
            <option value="Client site external appointment">Client site external appointment</option>
            <option value="Remote sync correction">Remote work unlogged sync</option>
            <option value="Other authorized reason">Other authorized reason</option>
          </select>
        </div>

        {/* Correction Note (Optional) */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-700 mb-1">
            Correction Note <span className="text-slate-400 font-normal">(Optional)</span>
          </label>
          <textarea
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add operational details for audit compliance log..."
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs shadow-subtle focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 placeholder:text-slate-400"
          />
        </div>

        {/* Audit Trail Notice */}
        <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50/70 p-3 text-[11px] text-amber-900">
          <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <span className="font-bold">⚠ Audit Compliance Notice:</span> This correction will be recorded in the attendance audit history with your authorized HR Manager credential.
          </p>
        </div>
      </form>
    </Drawer>
  );
}
