import React, { useState } from 'react';
import Modal from '../ui/Modal';
import { useHRData } from '../../context/HRDataContext';
import { ShieldCheck, Lock } from 'lucide-react';

export default function TimeOffTypeModal({ isOpen, onClose }) {
  const { addTimeOffType } = useHRData();

  const [formData, setFormData] = useState({
    name: '',
    unit: 'Days',
    allocationRequired: true,
    approvalWorkflow: 'Manager + HR Approval',
    payrollIntegration: 'Auto-synced to payroll leave register (Read-Only sync)'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    addTimeOffType(formData);
    setFormData({
      name: '',
      unit: 'Days',
      allocationRequired: true,
      approvalWorkflow: 'Manager + HR Approval',
      payrollIntegration: 'Auto-synced to payroll leave register (Read-Only sync)'
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Time Off Type"
      description="Configure entitlement rules, approval workflows, and backend payroll registry mapping."
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-[11px] font-medium text-slate-700">
            Type Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Compassionate Bereavement"
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-medium text-slate-700">Tracking Unit</label>
            <select
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="Days">Days</option>
              <option value="Hours">Hours</option>
              <option value="Weeks">Weeks</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-700">Allocation Required</label>
            <select
              value={formData.allocationRequired ? 'Yes' : 'No'}
              onChange={(e) => setFormData({ ...formData, allocationRequired: e.target.value === 'Yes' })}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="Yes">Yes (Deducts Balance)</option>
              <option value="No">No (Uncapped/Special)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-medium text-slate-700">Approval Workflow</label>
          <select
            value={formData.approvalWorkflow}
            onChange={(e) => setFormData({ ...formData, approvalWorkflow: e.target.value })}
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="Manager + HR Approval">Manager + HR Approval</option>
            <option value="Direct HR Notification">Direct HR Notification Only</option>
            <option value="Executive Level Approval">Executive Level Approval</option>
          </select>
        </div>

        {/* Payroll Notice */}
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs space-y-1">
          <div className="flex items-center gap-1.5 font-semibold text-slate-800">
            <Lock className="h-3.5 w-3.5 text-slate-400" />
            <span>Payroll Integration Mapping</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Approved leaves automatically sync to the internal payroll register for salary deductions or statutory allowances. As HR Manager, payroll processing actions remain restricted.
          </p>
        </div>

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
            className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-medium text-white hover:bg-indigo-700 shadow-sm transition-colors"
          >
            Save Time Off Type
          </button>
        </div>
      </form>
    </Modal>
  );
}
