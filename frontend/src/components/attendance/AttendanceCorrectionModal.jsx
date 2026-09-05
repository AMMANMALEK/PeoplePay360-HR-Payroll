import React, { useState, useEffect, useMemo } from 'react';
import Modal from '../ui/Modal';
import { ShieldAlert, History, AlertTriangle } from 'lucide-react';
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Correct Attendance"
      description="Adjust timestamps and document reason for the employee's attendance record."
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Employee & Date Information */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3.5 space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500 font-medium">Employee:</span>
            <span className="font-bold text-slate-900">{record.employeeName}</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500 font-medium">Date:</span>
            <span className="font-semibold text-slate-800">{record.date}</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500 font-medium">Current Status:</span>
            <span className="font-bold text-amber-700">{record.status}</span>
          </div>
        </div>

        {/* Timestamps */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-700">
              Check In <span className="text-rose-500">*</span>
            </label>
            <input
              type="time"
              required
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-mono font-medium shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700">
              Check Out <span className="text-rose-500">*</span>
            </label>
            <input
              type="time"
              required
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-mono font-medium shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Calculated Worked Hours Banner */}
        <div className="flex items-center justify-between rounded-lg border border-indigo-100 bg-indigo-50/60 px-3 py-2 text-xs">
          <span className="text-slate-600 font-medium">Worked Hours</span>
          <span className="font-extrabold text-indigo-800 text-sm">{formattedWorkedHours}</span>
        </div>

        {/* Reason * */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-700">
            Reason <span className="text-rose-500">*</span>
          </label>
          <select
            value={reasonCategory}
            onChange={(e) => setReasonCategory(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="Late arrival">Late arrival</option>
            <option value="Turnstile badge malfunction">Turnstile badge reader malfunction</option>
            <option value="Forgot checkout">Forgot checkout</option>
            <option value="Client site appointment">Client site external appointment</option>
            <option value="Remote sync correction">Remote work unlogged sync</option>
            <option value="Other authorized reason">Other authorized reason</option>
          </select>
        </div>

        {/* Correction Note */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-700">
            Correction Note <span className="text-slate-400 font-normal">(Optional note)</span>
          </label>
          <textarea
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add operational or supervisor notes for compliance records..."
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* Audit Compliance Notice */}
        <div className="flex items-start gap-2 text-[11px] text-amber-800 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
          <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
          <span>⚠ This correction will be recorded in the attendance audit history with your HR Manager timestamp.</span>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 shadow-sm transition-colors"
          >
            Save Correction
          </button>
        </div>
      </form>
    </Modal>
  );
}
