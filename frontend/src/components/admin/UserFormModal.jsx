import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import { useHRData } from '../../context/HRDataContext';
import { PLATFORM_ROLES } from '../../constants/rbac';
import { User, Mail, Shield, Building, AlertCircle } from 'lucide-react';

export default function UserFormModal({ isOpen, onClose, initialData = null }) {
  const { addUser, updateUser, departments } = useHRData();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'EMPLOYEE',
    department: 'Engineering',
    status: 'Active'
  });

  const [errors, setErrors] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        email: initialData.email || '',
        role: initialData.role || 'EMPLOYEE',
        department: initialData.department || 'Engineering',
        status: initialData.status || 'Active'
      });
    } else {
      setFormData({
        name: '',
        email: '',
        role: 'EMPLOYEE',
        department: departments?.[0] || 'Engineering',
        status: 'Active'
      });
    }
    setErrors({});
  }, [initialData, isOpen, departments]);

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Full name is required.';
    if (!formData.email.trim()) {
      errs.email = 'Email address is required.';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email.trim())) {
      errs.email = 'Please enter a valid business email address.';
    }
    if (!formData.role) errs.role = 'Role assignment is required.';
    if (!formData.department) errs.department = 'Department is required.';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsProcessing(true);
    try {
      if (initialData?.id) {
        await updateUser(initialData.id, formData);
      } else {
        await addUser(formData);
      }
      onClose();
    } finally {
      setIsProcessing(false);
    }
  };

  const modalFooter = (
    <>
      <button
        type="button"
        disabled={isProcessing}
        onClick={onClose}
        className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
      >
        Cancel
      </button>
      <button
        type="submit"
        form="user-form"
        disabled={isProcessing}
        className="btn-primary"
      >
        {isProcessing ? 'Saving...' : initialData ? 'Save User' : 'Create User'}
      </button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? `Edit User: ${initialData.name}` : 'New Platform User'}
      description="Configure user credentials, administrative permissions, and organizational role."
      maxWidth="max-w-xl sm:max-w-2xl"
      footer={modalFooter}
    >
      <form id="user-form" onSubmit={handleSubmit} className="space-y-4">
        {/* User Identity Preview Banner */}
        <div className="flex items-center justify-between rounded-xl border border-indigo-100 bg-gradient-to-r from-indigo-50/70 via-white to-slate-50 p-3.5 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-600 font-bold text-white shadow-sm text-sm">
              {formData.name
                ? formData.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .substring(0, 2)
                    .toUpperCase()
                : 'US'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-slate-900">
                  {formData.name.trim() || 'New User Account'}
                </h4>
                <span className="rounded-md bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                  {formData.status}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {PLATFORM_ROLES[formData.role]?.name || formData.role} • {formData.department}
              </p>
            </div>
          </div>
          <div className="hidden sm:block text-right text-xs font-mono text-slate-500">
            {formData.email || 'user@company.com'}
          </div>
        </div>

        {/* Input Fields */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="block text-[11px] font-semibold text-slate-700">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Sarah Jenkins"
              className={`mt-1 w-full rounded-lg border bg-white px-3 py-1.5 text-xs shadow-sm focus:outline-none ${
                errors.name ? 'border-rose-400 focus:ring-rose-400' : 'border-slate-300 focus:ring-indigo-500'
              }`}
            />
            {errors.name && <p className="mt-1 text-[11px] text-rose-500">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700">
              Email Address <span className="text-rose-500">*</span>
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="s.jenkins@peoplepay360.internal"
              className={`mt-1 w-full rounded-lg border bg-white px-3 py-1.5 text-xs shadow-sm focus:outline-none ${
                errors.email ? 'border-rose-400 focus:ring-rose-400' : 'border-slate-300 focus:ring-indigo-500'
              }`}
            />
            {errors.email && <p className="mt-1 text-[11px] text-rose-500">{errors.email}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="block text-[11px] font-semibold text-slate-700">
              Assigned Role <span className="text-rose-500">*</span>
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {Object.values(PLATFORM_ROLES).map((r) => (
                <option key={r.code} value={r.code}>
                  {r.name} ({r.scope})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700">
              Department <span className="text-rose-500">*</span>
            </label>
            <input
              list="user-department-options"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              placeholder="e.g. Engineering"
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <datalist id="user-department-options">
              {['Engineering', 'Human Resources', 'Finance', 'Operations', 'Product', 'Design', 'Sales', 'Legal', 'Executive'].map(
                (d) => (
                  <option key={d} value={d} />
                )
              )}
            </datalist>
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-700">Account Status</label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="Active">Active (Permits platform authentication)</option>
            <option value="Inactive">Inactive (Suspended / Deactivated)</option>
          </select>
        </div>

        {/* Role Capability Preview Card */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
            <Shield className="h-3.5 w-3.5 text-indigo-600" />
            <span>Role Scope: {PLATFORM_ROLES[formData.role]?.name}</span>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            {PLATFORM_ROLES[formData.role]?.description}
          </p>
        </div>
      </form>
    </Modal>
  );
}
