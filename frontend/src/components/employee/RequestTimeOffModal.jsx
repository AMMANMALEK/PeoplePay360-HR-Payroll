import React, { useEffect, useMemo, useState } from 'react';
import Modal from '../ui/Modal';
import { useEmployeeData } from '../../context/EmployeeDataContext';
import { CheckCircle } from 'lucide-react';

export default function RequestTimeOffModal({ isOpen, onClose }) {
  const { types, allocations, createTimeOffRequest } = useEmployeeData();
  const personalType = types.find((type) => type.name === 'Personal Leave') || types[0];
  const personalAllocation = useMemo(
    () => allocations.find((row) => row.typeName === 'Personal Leave') || allocations[0],
    [allocations]
  );

  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({
    startDate: '',
    endDate: '',
    reason: '',
  });
  const [confirmation, setConfirmation] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setForm({ startDate: '', endDate: '', reason: '' });
      setConfirmation(null);
      setIsSaving(false);
    }
  }, [isOpen]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    try {
      const persisted = await createTimeOffRequest({
        ...form,
        timeOffType: personalType?.typeCode || 'PERSONAL',
      });
      setConfirmation(persisted);
    } catch {
      /* toast from context */
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={confirmation ? 'Personal Leave approved' : 'Request Personal Leave'}
      description={
        confirmation
          ? 'Your request was approved automatically.'
          : 'Personal Leave is approved immediately when your remaining balance is sufficient.'
      }
      maxWidth="max-w-md"
    >
      {confirmation ? (
        <div className="space-y-4">
          <div className="rounded-[18px] bg-[#eef8d8] px-4 py-4">
            <div className="flex items-start gap-2.5">
              <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-slate-800" />
              <div>
                <p className="text-sm font-semibold text-slate-900">Personal Leave approved</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">
                  Your leave from {confirmation.startDate} to {confirmation.endDate} has been approved
                  automatically.
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
            <p className="text-[11px] font-medium text-slate-700">Time Off Type</p>
            <p className="mt-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-900">
              {personalType?.name || 'Personal Leave'}
            </p>
          </div>
          {personalAllocation && (
            <p className="text-xs text-slate-500">
              Remaining:{' '}
              <span className="font-semibold text-slate-800">{personalAllocation.remaining} days</span>
              {' · '}
              Annual allowance: {personalAllocation.allocated} days
            </p>
          )}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="block text-[11px] font-medium text-slate-700">
              Start date
              <input
                type="date"
                required
                className="field-input"
                value={form.startDate}
                onChange={(e) => setForm((prev) => ({ ...prev, startDate: e.target.value }))}
              />
            </label>
            <label className="block text-[11px] font-medium text-slate-700">
              End date
              <input
                type="date"
                required
                className="field-input"
                value={form.endDate}
                onChange={(e) => setForm((prev) => ({ ...prev, endDate: e.target.value }))}
              />
            </label>
          </div>
          <label className="block text-[11px] font-medium text-slate-700">
            Reason
            <textarea
              className="field-input min-h-[80px]"
              value={form.reason}
              onChange={(e) => setForm((prev) => ({ ...prev, reason: e.target.value }))}
            />
          </label>
          <div className="flex justify-end gap-2">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={isSaving}>
              {isSaving ? 'Submitting…' : 'Request Personal Leave'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
