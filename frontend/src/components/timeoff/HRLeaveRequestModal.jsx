import React, { useState, useEffect, useMemo } from 'react';
import Modal from '../ui/Modal';
import { useHRData } from '../../context/HRDataContext';
import { useAuth } from '../../context/AuthContext';
import { Calendar, ShieldAlert, Clock, Info, CheckCircle2, UserCheck } from 'lucide-react';

const LEAVE_TYPES = [
  { value: 'Personal Leave', label: 'Personal Leave' },
  { value: 'Sick Leave', label: 'Sick Leave' },
  { value: 'Festival Leave', label: 'Festival Leave' },
];

export default function HRLeaveRequestModal({ isOpen, onClose }) {
  const { addHRLeaveRequest, fixedLeaveAllowances, employees } = useHRData();
  const { user } = useAuth();

  const todayStr = new Date().toISOString().split('T')[0];
  const currentYear = new Date().getFullYear();
  const sickMinDate = `${currentYear}-03-01`;
  const sickMaxDate = `${currentYear}-08-31`;

  const HR_LEADERS = useMemo(() => {
    const fromEmployees = (employees || [])
      .filter((e) => {
        const role = String(e.role || '');
        const position = String(e.jobPosition || '');
        return (
          role === 'HR_MANAGER' ||
          role === 'HR_PAYROLL_MANAGER' ||
          position === 'HR Manager' ||
          position === 'HR Payroll Manager'
        );
      })
      .map((e) => ({
        id: e.employeeId || e.id || e.employeeCode,
        name: e.fullName || e.name || `${e.firstName || ''} ${e.lastName || ''}`.trim(),
        role: e.role || (e.jobPosition === 'HR Payroll Manager' ? 'HR_PAYROLL_MANAGER' : 'HR_MANAGER'),
        roleName: e.roleName || e.jobPosition || 'HR Manager',
        department: e.department || 'Human Resources',
        jobPosition: e.jobPosition || 'HR Manager',
      }));

    if (fromEmployees.length > 0) {
      return fromEmployees;
    }

    if (user) {
      return [
        {
          id: user.employeeCode || user.id || 'current-user',
          name: user.name || user.fullName || 'HR User',
          role: user.role || 'HR_MANAGER',
          roleName: user.roleName || 'HR Manager',
          department: user.department || 'Human Resources',
          jobPosition: user.jobPosition || 'HR Manager',
        },
      ];
    }

    return [];
  }, [employees, user]);

  const initialLeaderId = useMemo(() => {
    if (!HR_LEADERS.length) return '';
    const payrollLeader = HR_LEADERS.find(
      (l) => l.role === 'HR_PAYROLL_MANAGER' || l.jobPosition === 'HR Payroll Manager'
    );
    if (user?.role === 'HR_PAYROLL_MANAGER' && payrollLeader) {
      return payrollLeader.id;
    }
    return HR_LEADERS[0].id;
  }, [HR_LEADERS, user]);

  const [selectedLeaderId, setSelectedLeaderId] = useState(initialLeaderId);
  const [timeOffType, setTimeOffType] = useState('Personal Leave');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedLeaderId(initialLeaderId);
      setTimeOffType('Personal Leave');
      setStartDate('');
      setEndDate('');
      setReason('');
      setErrors({});
      setIsSubmitting(false);
    }
  }, [isOpen, initialLeaderId]);

  const selectedLeader = HR_LEADERS.find((l) => l.id === selectedLeaderId) || HR_LEADERS[0];
  const isSickLeave = timeOffType === 'Sick Leave';

  // Calculate duration in days
  const calculatedDuration = useMemo(() => {
    if (!startDate || !endDate) return 1;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    return Math.max(1, diff);
  }, [startDate, endDate]);

  const handleTypeChange = (newType) => {
    setTimeOffType(newType);
    setErrors((prev) => ({ ...prev, date: '' }));
    if (newType === 'Sick Leave') {
      if ((startDate && (startDate < sickMinDate || startDate > sickMaxDate)) ||
          (endDate && (endDate < sickMinDate || endDate > sickMaxDate))) {
        setStartDate('');
        setEndDate('');
      }
    }
  };

  const validate = () => {
    const errs = {};
    if (!startDate) errs.startDate = 'Start date is required.';
    if (!endDate) errs.endDate = 'End date is required.';
    if (startDate && endDate && endDate < startDate) {
      errs.endDate = 'End date cannot be prior to start date.';
    }

    if (isSickLeave) {
      if (startDate && (startDate < sickMinDate || startDate > sickMaxDate)) {
        errs.startDate = `Sick leave must fall between March 1 and August 31 (${currentYear}).`;
      }
      if (endDate && (endDate < sickMinDate || endDate > sickMaxDate)) {
        errs.endDate = `Sick leave must fall between March 1 and August 31 (${currentYear}).`;
      }
    }

    if (!reason.trim()) {
      errs.reason = 'Please state a reason for this leave request.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    if (!selectedLeader) return;

    setIsSubmitting(true);
    try {
      addHRLeaveRequest({
        employeeId: selectedLeader.id,
        employeeName: selectedLeader.name,
        role: selectedLeader.role,
        roleName: selectedLeader.roleName,
        department: selectedLeader.department,
        jobPosition: selectedLeader.jobPosition,
        timeOffType,
        startDate,
        endDate,
        duration: calculatedDuration,
        reason: reason.trim(),
        status: 'Pending',
        requiresAdminApproval: true,
      });
      onClose();
    } catch (err) {
      setErrors((prev) => ({ ...prev, submit: 'Failed to submit request.' }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Request HR Leadership Leave"
      description="Submit a personal leave request for governance approval by the Platform Administrator."
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Governance Alert Banner */}
        <div className="flex items-start gap-2.5 rounded-xl border border-amber-200/90 bg-amber-50/80 p-3.5 text-xs text-amber-900 shadow-2xs">
          <ShieldAlert className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-bold text-amber-950">Administrator Approval Required</p>
            <p className="text-amber-800 leading-relaxed">
              As an HR Leader, your leave request cannot be self-approved. It is routed directly
              to the <strong>Platform Administrator</strong> under <strong>HR Governance</strong> for approval.
            </p>
          </div>
        </div>

        {errors.submit && (
          <p className="text-xs font-bold text-rose-600 bg-rose-50 p-2.5 rounded-lg border border-rose-200">
            ⚠ {errors.submit}
          </p>
        )}

        {/* HR Leader Selector */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-700">
            Requesting HR Leader <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-2 mt-1">
            {HR_LEADERS.map((leader) => {
              const isSelected = selectedLeaderId === leader.id;
              return (
                <button
                  type="button"
                  key={leader.id}
                  onClick={() => setSelectedLeaderId(leader.id)}
                  className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-50/60 ring-2 ring-indigo-500/20'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs font-bold text-slate-900">{leader.name}</span>
                    {isSelected && <CheckCircle2 className="h-3.5 w-3.5 text-indigo-600" />}
                  </div>
                  <span className="text-[11px] font-medium text-slate-500 mt-0.5">{leader.roleName}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Leave Type Selector */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-700">
            Time Off Type <span className="text-rose-500">*</span>
          </label>
          <select
            value={timeOffType}
            onChange={(e) => handleTypeChange(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            {LEAVE_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label} (Allowance: {fixedLeaveAllowances[t.value] ?? 15} days)
              </option>
            ))}
          </select>
        </div>

        {/* Sick Leave Notice */}
        {isSickLeave && (
          <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-3 text-xs text-blue-900 flex items-start gap-2">
            <Info className="h-4 w-4 shrink-0 text-blue-600 mt-0.5" />
            <div>
              <p className="font-semibold text-blue-950">Sick Leave Policy Window</p>
              <p className="text-blue-800 leading-relaxed mt-0.5">
                Eligible window: March 1st to August 31st ({currentYear}) across two consecutive quarters.
              </p>
            </div>
          </div>
        )}

        {/* Dates */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="block text-[11px] font-semibold text-slate-700">
              Start Date <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              value={startDate}
              min={isSickLeave ? (sickMinDate > todayStr ? sickMinDate : todayStr) : todayStr}
              max={isSickLeave ? sickMaxDate : undefined}
              onChange={(e) => setStartDate(e.target.value)}
              className={`mt-1 w-full rounded-lg border bg-white px-3 py-2 text-xs shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                errors.startDate ? 'border-rose-400' : 'border-slate-300'
              }`}
            />
            {errors.startDate && <p className="mt-1 text-[11px] text-rose-500">{errors.startDate}</p>}
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700">
              End Date <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              value={endDate}
              min={startDate || (isSickLeave ? (sickMinDate > todayStr ? sickMinDate : todayStr) : todayStr)}
              max={isSickLeave ? sickMaxDate : undefined}
              onChange={(e) => setEndDate(e.target.value)}
              className={`mt-1 w-full rounded-lg border bg-white px-3 py-2 text-xs shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                errors.endDate ? 'border-rose-400' : 'border-slate-300'
              }`}
            />
            {errors.endDate && <p className="mt-1 text-[11px] text-rose-500">{errors.endDate}</p>}
          </div>
        </div>

        {/* Duration badge */}
        {startDate && endDate && startDate <= endDate && (
          <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs">
            <span className="text-slate-600">Total Requested Duration:</span>
            <span className="font-bold text-slate-900">{calculatedDuration} day{calculatedDuration === 1 ? '' : 's'}</span>
          </div>
        )}

        {/* Reason */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-700">
            Stated Reason for Leave <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={2}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Describe the nature of your leave for Administrator review..."
            className={`mt-1 w-full rounded-lg border bg-white px-3 py-2 text-xs shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
              errors.reason ? 'border-rose-400' : 'border-slate-300'
            }`}
          />
          {errors.reason && <p className="mt-1 text-[11px] text-rose-500">{errors.reason}</p>}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary"
          >
            {isSubmitting ? 'Submitting...' : 'Submit to Admin for Approval'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
