import React, { useState } from 'react';
import Drawer from '../ui/Drawer';
import { useHRData } from '../../context/HRDataContext';
import { Calendar, User, Clock, AlertCircle } from 'lucide-react';

export default function TimeOffRequestModal({ isOpen, onClose }) {
  const { employees, timeOffTypes, allocations, addTimeOffRequest } = useHRData();

  const [employeeId, setEmployeeId] = useState('');
  const [timeOffType, setTimeOffType] = useState('Annual Leave');
  const [startDate, setStartDate] = useState('2026-09-22');
  const [endDate, setEndDate] = useState('2026-09-26');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Selected employee details
  const selectedEmployee = employees.find((e) => e.id === employeeId || e._id === employeeId);

  // Compute duration in working days (simple calculation excluding weekends)
  const calculateDays = () => {
    if (!startDate || !endDate) return 1;
    const s = new Date(startDate);
    const e = new Date(endDate);
    if (e < s) return 0;
    
    let count = 0;
    const cur = new Date(s);
    while (cur <= e) {
      const day = cur.getDay();
      if (day !== 0 && day !== 6) count++; // Mon-Fri
      cur.setDate(cur.getDate() + 1);
    }
    return count > 0 ? count : 1;
  };

  const duration = calculateDays();

  // Find allocation for selected employee & type
  const employeeAlloc = allocations.find(
    (a) =>
      (a.employeeId === employeeId || a.employeeName === selectedEmployee?.name) &&
      a.typeName &&
      a.typeName.toLowerCase().includes(timeOffType.toLowerCase())
  );

  const remainingDays = employeeAlloc ? employeeAlloc.remaining : 14;
  const balanceAfterApproval = Math.max(0, remainingDays - duration);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!employeeId) {
      setFormError('Please select an employee.');
      return;
    }
    if (!startDate || !endDate) {
      setFormError('Please specify start and end dates.');
      return;
    }
    const todayStr = new Date().toISOString().split('T')[0];
    if (startDate < todayStr) {
      setFormError('Cannot select past dates. Start date must be today or in the future.');
      return;
    }
    if (new Date(endDate) < new Date(startDate)) {
      setFormError('End date must be on or after start date.');
      return;
    }
    if (!reason.trim()) {
      setFormError('Please state a reason for this time-off request.');
      return;
    }

    setFormError('');
    setIsSubmitting(true);

    try {
      await addTimeOffRequest(
        {
          timeOffType,
          startDate,
          endDate,
          duration,
          durationUnit: 'days',
          reason: reason.trim(),
        },
        selectedEmployee
      );
      onClose();
      // Reset form
      setReason('');
    } catch (err) {
      setFormError(err.message || 'Failed to submit time-off request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const footer = (
    <div className="flex items-center justify-end gap-2">
      <button
        type="button"
        onClick={onClose}
        disabled={isSubmitting}
        className="rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
      >
        Cancel
      </button>
      <button
        type="submit"
        form="time-off-request-form"
        disabled={isSubmitting}
        className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 shadow-sm transition-colors disabled:opacity-50"
      >
        {isSubmitting ? 'Submitting...' : 'Submit Request'}
      </button>
    </div>
  );

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Create Time Off Request"
      subtitle="Submit a new employee leave request for HR review and balance consumption."
      footer={footer}
      width="max-w-lg"
    >
      <form id="time-off-request-form" onSubmit={handleSubmit} className="space-y-4">
        {formError && (
          <div className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs font-medium text-rose-700">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        {/* Employee Select */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Employee <span className="text-rose-500">*</span>
          </label>
          <select
            required
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs shadow-2xs focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="">Select Employee...</option>
            {employees.map((emp) => (
              <option key={emp.id || emp._id} value={emp.id || emp._id}>
                {emp.name} — {emp.jobPosition || emp.department || 'Employee'} ({emp.id || emp._id})
              </option>
            ))}
          </select>
        </div>

        {/* Leave Type Select */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Time Off Type <span className="text-rose-500">*</span>
          </label>
          <select
            required
            value={timeOffType}
            onChange={(e) => setTimeOffType(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs shadow-2xs focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            {timeOffTypes.length > 0 ? (
              timeOffTypes.map((t) => (
                <option key={t.id} value={t.name}>
                  {t.name} ({t.paid ? 'Paid' : 'Unpaid'})
                </option>
              ))
            ) : (
              <>
                <option value="Annual Leave">Annual Leave</option>
                <option value="Sick Leave">Sick Leave</option>
                <option value="Unpaid Leave">Unpaid Leave</option>
              </>
            )}
          </select>
        </div>

        {/* Date Range */}
        {/* Date Range with Calendar Past Date Restriction */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Start Date <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              required
              min={new Date().toISOString().split('T')[0]}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs shadow-2xs focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              End Date <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              required
              min={startDate || new Date().toISOString().split('T')[0]}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs shadow-2xs focus:border-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Duration Calculation Display */}
        <div className="flex items-center justify-between rounded-lg bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-xs">
          <div className="flex items-center gap-1.5 text-slate-600 font-medium">
            <Clock className="h-4 w-4 text-indigo-600" />
            <span>Calculated Working Duration:</span>
          </div>
          <span className="font-bold text-indigo-900 text-sm">{duration} working days</span>
        </div>

        {/* Employee Reason */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Reason / Justification <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={3}
            required
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Provide context for this leave request (e.g., Annual family holiday, medical appointment)..."
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs shadow-2xs focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 placeholder:text-slate-400"
          />
        </div>

        {/* Balance Impact Preview */}
        {selectedEmployee && (
          <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-3.5 space-y-2 text-xs">
            <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px] block">
              Estimated Quota Impact
            </span>
            <div className="grid grid-cols-3 gap-2 bg-white rounded-lg p-2.5 border border-indigo-100 text-center">
              <div>
                <span className="text-[10px] text-slate-400 block font-medium">Current Balance</span>
                <span className="font-bold text-slate-800">{remainingDays}d</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-medium">Requested</span>
                <span className="font-bold text-rose-600">-{duration}d</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-medium">After Approval</span>
                <span className="font-bold text-emerald-700">{balanceAfterApproval}d</span>
              </div>
            </div>
          </div>
        )}
      </form>
    </Drawer>
  );
}
