import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle, Info, Calendar } from 'lucide-react';
import Modal from '../ui/Modal';
import CustomSelect from '../ui/CustomSelect';
import { useEmployeeData } from '../../context/EmployeeDataContext';

const LEAVE_OPTIONS = [
  { value: 'SICK', label: 'Sick Leave' },
  { value: 'FESTIVAL', label: 'Festival Leave' },
  { value: 'PERSONAL', label: 'Personal Leave' },
];

export default function RequestTimeOffModal({ isOpen, onClose }) {
  const { allocations, createTimeOffRequest } = useEmployeeData();
  const currentYear = new Date().getFullYear();

  // Two quarters from March: March 1st to August 31st
  const sickMinDate = `${currentYear}-03-01`;
  const sickMaxDate = `${currentYear}-08-31`;

  const [selectedType, setSelectedType] = useState('SICK');
  const [isSaving, setIsSaving] = useState(false);
  const [dateError, setDateError] = useState('');
  const [form, setForm] = useState({
    startDate: '',
    endDate: '',
    reason: '',
  });
  const [confirmation, setConfirmation] = useState(null);

  // Find allocation for the currently selected type
  const activeAllocation = useMemo(() => {
    return (
      allocations.find(
        (row) =>
          row.typeCode === selectedType ||
          (selectedType === 'SICK' && row.typeName === 'Sick Leave') ||
          (selectedType === 'FESTIVAL' && row.typeName === 'Festival Leave') ||
          (selectedType === 'PERSONAL' && row.typeName === 'Personal Leave')
      ) || null
    );
  }, [allocations, selectedType]);

  const isSickLeave = selectedType === 'SICK';

  useEffect(() => {
    if (isOpen) {
      setSelectedType('SICK');
      setForm({ startDate: '', endDate: '', reason: '' });
      setDateError('');
      setConfirmation(null);
      setIsSaving(false);
    }
  }, [isOpen]);

  const handleTypeChange = (newType) => {
    setSelectedType(newType);
    setDateError('');
    // If switching to sick leave and dates are outside March - August, clear them
    if (newType === 'SICK') {
      if (
        (form.startDate && (form.startDate < sickMinDate || form.startDate > sickMaxDate)) ||
        (form.endDate && (form.endDate < sickMinDate || form.endDate > sickMaxDate))
      ) {
        setForm((prev) => ({ ...prev, startDate: '', endDate: '' }));
      }
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  const handleStartDateChange = (e) => {
    const val = e.target.value;
    setDateError('');
    if (val && val < todayStr) {
      setDateError('Cannot select past dates. Start date must be today or in the future.');
    } else if (isSickLeave && (val < sickMinDate || val > sickMaxDate)) {
      setDateError('Sick leave start date must be between March 1 and August 31 (2 quarters).');
    }
    setForm((prev) => ({
      ...prev,
      startDate: val,
      endDate: prev.endDate && prev.endDate < val ? val : prev.endDate,
    }));
  };

  const handleEndDateChange = (e) => {
    const val = e.target.value;
    setDateError('');
    if (isSickLeave && (val < sickMinDate || val > sickMaxDate)) {
      setDateError('Sick leave end date must be between March 1 and August 31 (2 quarters).');
    }
    setForm((prev) => ({ ...prev, endDate: val }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setDateError('');

    if (form.startDate && form.startDate < todayStr) {
      setDateError('Cannot select past dates. Start date must be today or in the future.');
      return;
    }

    if (isSickLeave) {
      if (
        form.startDate < sickMinDate ||
        form.startDate > sickMaxDate ||
        form.endDate < sickMinDate ||
        form.endDate > sickMaxDate
      ) {
        setDateError('Sick leave can only be requested between March 1 and August 31 (2 quarters).');
        return;
      }
    }

    if (form.endDate < form.startDate) {
      setDateError('End date must be on or after start date.');
      return;
    }

    setIsSaving(true);
    try {
      const persisted = await createTimeOffRequest({
        ...form,
        timeOffType: selectedType,
      });
      setConfirmation({
        ...persisted,
        leaveTypeLabel:
          LEAVE_OPTIONS.find((opt) => opt.value === selectedType)?.label || 'Time off',
      });
    } catch (err) {
      setDateError(err.message || 'Failed to submit request');
    } finally {
      setIsSaving(false);
    }
  };

  const selectedLabel =
    LEAVE_OPTIONS.find((opt) => opt.value === selectedType)?.label || 'Time Off';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={confirmation ? `${confirmation.leaveTypeLabel} approved` : 'Request Time Off'}
      description={
        confirmation
          ? 'Your request was approved automatically.'
          : 'Submit a leave request. Requests are processed against your remaining balance.'
      }
      maxWidth="max-w-md"
    >
      {confirmation ? (
        <div className="space-y-4">
          <div className="rounded-[18px] bg-[#eef8d8] px-4 py-4">
            <div className="flex items-start gap-2.5">
              <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-slate-800" />
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {confirmation.leaveTypeLabel} approved
                </p>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">
                  Your leave from {confirmation.startDate} to {confirmation.endDate} has been
                  approved automatically.
                </p>
              </div>
            </div>
          </div>
          {confirmation.remaining != null && (
            <p className="text-xs text-slate-600">
              Remaining balance:{' '}
              <span className="font-semibold text-slate-900">{confirmation.remaining} days</span>
            </p>
          )}
          <div className="flex justify-end">
            <button type="button" className="btn-primary" onClick={onClose}>
              Done
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <CustomSelect
              label="Time Off Type"
              value={selectedType}
              onChange={handleTypeChange}
              options={LEAVE_OPTIONS}
              icon={Calendar}
              required
            />
          </div>

          {activeAllocation && (
            <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3.5 py-2.5 text-xs text-slate-600">
              <span>
                Available:{' '}
                <strong className="text-slate-900">{activeAllocation.remaining} days</strong>
              </span>
              <span>
                Allowance:{' '}
                <strong className="text-slate-900">{activeAllocation.allocated} days</strong>
              </span>
            </div>
          )}

          {isSickLeave && (
            <div className="rounded-xl border border-amber-200/80 bg-amber-50/70 p-3 text-xs text-amber-800">
              <div className="flex items-start gap-2">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                <div>
                  <p className="font-semibold text-amber-900">Sick Leave Date Window</p>
                  <p className="mt-0.5 leading-relaxed text-amber-700">
                    Eligible dates for Sick Leave are strictly restricted to two quarters starting
                    from March ({currentYear}-03-01 to {currentYear}-08-31).
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="block text-[11px] font-medium text-slate-700">
              Start date
              <input
                type="date"
                required
                min={isSickLeave ? (sickMinDate > todayStr ? sickMinDate : todayStr) : todayStr}
                max={isSickLeave ? sickMaxDate : undefined}
                className="field-input mt-1"
                value={form.startDate}
                onChange={handleStartDateChange}
              />
            </label>
            <label className="block text-[11px] font-medium text-slate-700">
              End date
              <input
                type="date"
                required
                min={form.startDate || todayStr}
                max={isSickLeave ? sickMaxDate : undefined}
                className="field-input mt-1"
                value={form.endDate}
                onChange={handleEndDateChange}
              />
            </label>
          </div>

          {dateError && (
            <p className="rounded-lg bg-rose-50 px-3 py-2 text-xs font-medium text-rose-600">
              {dateError}
            </p>
          )}

          <label className="block text-[11px] font-medium text-slate-700">
            Reason
            <textarea
              className="field-input mt-1 min-h-[80px]"
              placeholder="Optional notes or reason for leave"
              value={form.reason}
              onChange={(e) => setForm((prev) => ({ ...prev, reason: e.target.value }))}
            />
          </label>

          <div className="flex justify-end gap-2 pt-1">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={isSaving}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={isSaving}>
              {isSaving ? 'Submitting…' : `Request ${selectedLabel}`}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
