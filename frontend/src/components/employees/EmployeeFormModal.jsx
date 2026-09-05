import React, { useState, useEffect, useMemo } from 'react';
import { Briefcase, Building2, Clock, Layers, Activity } from 'lucide-react';
import Modal from '../ui/Modal';
import CustomSelect from '../ui/CustomSelect';
import { useHRData } from '../../context/HRDataContext';

const STATUS_OPTIONS = [
  'Active',
  'On Leave',
];

const BASE_JOB_POSITIONS = [
  'Account Executive',
  'Backend Developer',
  'Copywriter',
  'DevOps Engineer',
  'Enterprise Sales Director',
  'Financial Analyst',
  'HR Manager',
  'HR Specialist',
  'Junior Frontend Developer',
  'Legal Counsel',
  'Marketing Specialist',
  'Operations Analyst',
  'Product Manager',
  'QA Test Engineer',
  'Security Engineer',
  'Senior Accountant',
  'Senior Product Designer',
  'Senior Software Engineer',
  'Staff Software Engineer',
  'System Architect',
  'Talent Acquisition Lead',
  'UX Researcher',
  'VP of Engineering & Ops',
];

const EMPLOYMENT_TYPES = [
  'Full-Time Permanent',
  'Part-Time',
  'Contract Based',
];

export default function EmployeeFormModal({ isOpen, onClose, initialData = null }) {
  const { departments, schedules, employees, addEmployee, updateEmployee } = useHRData();

  const uniqueDepartments = useMemo(() => {
    return Array.from(new Set((departments || []).filter(Boolean))).sort();
  }, [departments]);

  const uniqueJobPositions = useMemo(() => {
    const fromEmployees = (employees || []).map((e) => e.jobPosition).filter(Boolean);
    const current = initialData?.jobPosition ? [initialData.jobPosition] : [];
    return Array.from(new Set([...BASE_JOB_POSITIONS, ...fromEmployees, ...current])).sort();
  }, [employees, initialData?.jobPosition]);

  const uniqueSchedules = useMemo(() => {
    const seen = new Set();
    return (schedules || []).filter((s) => {
      if (!s || !s.id || seen.has(s.id)) return false;
      seen.add(s.id);
      return true;
    });
  }, [schedules]);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    workEmail: '',
    phone: '',
    dob: '',
    jobPosition: '',
    department: '',
    scheduleId: '',
    scheduleName: '',
    employmentStatus: 'Active',
    employmentType: 'Full-Time Permanent',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      const matchedSched = uniqueSchedules.find((s) => s.id === initialData.scheduleId) || uniqueSchedules[0];
      const normalizedType =
        initialData.employmentType === 'Contractor'
          ? 'Contract Based'
          : initialData.employmentType === 'Executive'
          ? 'Full-Time Permanent'
          : initialData.employmentType || 'Full-Time Permanent';

      const rawStatus = String(initialData.employmentStatus || initialData.status || '').toLowerCase();
      const initialStatus = rawStatus.includes('leave') ? 'On Leave' : 'Active';

      setFormData({
        firstName: initialData.firstName || '',
        lastName: initialData.lastName || '',
        workEmail: initialData.workEmail || '',
        phone: String(initialData.phone || '').replace(/\D/g, '').slice(0, 10),
        dob: initialData.dob || '',
        jobPosition: initialData.jobPosition || '',
        department: initialData.department || uniqueDepartments[0] || '',
        scheduleId: matchedSched?.id || '',
        scheduleName: matchedSched?.name || '',
        employmentStatus: initialStatus,
        employmentType: normalizedType,
      });
    } else {
      setFormData({
        firstName: '',
        lastName: '',
        workEmail: '',
        phone: '',
        dob: '',
        jobPosition: '',
        department: uniqueDepartments[0] || '',
        scheduleId: uniqueSchedules[0]?.id || '',
        scheduleName: uniqueSchedules[0]?.name || '',
        employmentStatus: 'Active',
        employmentType: 'Full-Time Permanent',
      });
    }
    setErrors({});
  }, [initialData, isOpen, uniqueDepartments, uniqueSchedules]);

  const handleChange = (field, value) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: value };
      if (field === 'scheduleId') {
        const sched = uniqueSchedules.find((s) => s.id === value);
        next.scheduleName = sched ? sched.name : '';
      }
      return next;
    });

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required.';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required.';
    if (!formData.workEmail.trim()) {
      newErrors.workEmail = 'Work email is required.';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.workEmail)) {
      newErrors.workEmail = 'Please enter a valid work email address.';
    }
    if (!formData.jobPosition.trim()) newErrors.jobPosition = 'Job position is required.';
    if (!formData.department) newErrors.department = 'Department selection is required.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    if (initialData?.id) {
      updateEmployee(initialData.id, formData).then(() => onClose()).catch(() => {});
    } else {
      addEmployee(formData).then(() => onClose()).catch(() => {});
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? `Edit Employee: ${initialData.fullName}` : 'Add New Employee'}
      description="Enter personal details, role assignments, and organizational relationships."
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Personal Information */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-4">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
            1. Personal Information
          </h4>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-[11px] font-medium text-slate-700">
                First Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
                placeholder="e.g., Sarah"
                className={`mt-1 w-full rounded-xl border bg-white px-3 py-2 text-xs shadow-subtle focus:outline-none ${
                  errors.firstName ? 'border-rose-300 ring-2 ring-rose-100' : 'border-slate-200/90 focus:border-brand-400 focus:ring-2 focus:ring-brand-100'
                }`}
              />
              {errors.firstName && <p className="mt-1 text-[11px] text-rose-500">{errors.firstName}</p>}
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-700">
                Last Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
                placeholder="e.g., Jenkins"
                className={`mt-1 w-full rounded-xl border bg-white px-3 py-2 text-xs shadow-subtle focus:outline-none ${
                  errors.lastName ? 'border-rose-300 ring-2 ring-rose-100' : 'border-slate-200/90 focus:border-brand-400 focus:ring-2 focus:ring-brand-100'
                }`}
              />
              {errors.lastName && <p className="mt-1 text-[11px] text-rose-500">{errors.lastName}</p>}
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-700">
                Work Email <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                value={formData.workEmail}
                onChange={(e) => handleChange('workEmail', e.target.value)}
                placeholder="s.jenkins@company.com"
                className={`mt-1 w-full rounded-xl border bg-white px-3 py-2 text-xs shadow-subtle focus:outline-none ${
                  errors.workEmail ? 'border-rose-300 ring-2 ring-rose-100' : 'border-slate-200/90 focus:border-brand-400 focus:ring-2 focus:ring-brand-100'
                }`}
              />
              {errors.workEmail && <p className="mt-1 text-[11px] text-rose-500">{errors.workEmail}</p>}
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-700">Phone Number</label>
              <input
                type="tel"
                maxLength={10}
                value={formData.phone}
                onChange={(e) => {
                  const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 10);
                  handleChange('phone', digitsOnly);
                }}
                placeholder="10-digit phone number"
                className="mt-1 w-full rounded-xl border border-slate-200/90 bg-white px-3 py-2 text-xs shadow-subtle focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-700">Date of Birth</label>
              <input
                type="date"
                value={formData.dob}
                onChange={(e) => handleChange('dob', e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200/90 bg-white px-3 py-2 text-xs shadow-subtle focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Work Information */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-4">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
            2. Work Information
          </h4>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <CustomSelect
              label="Job Position"
              required
              icon={Briefcase}
              searchable
              value={formData.jobPosition}
              onChange={(val) => handleChange('jobPosition', val)}
              options={uniqueJobPositions}
              placeholder="Select job position..."
              error={errors.jobPosition}
            />

            <CustomSelect
              label="Department"
              required
              icon={Building2}
              value={formData.department}
              onChange={(val) => handleChange('department', val)}
              options={uniqueDepartments}
              placeholder="Select department..."
              error={errors.department}
            />

            <CustomSelect
              label="Working Schedule"
              icon={Clock}
              value={formData.scheduleId}
              onChange={(val) => handleChange('scheduleId', val)}
              options={uniqueSchedules.map((s) => ({ value: s.id, label: s.name }))}
              placeholder="Select working schedule..."
            />

            <CustomSelect
              label="Employment Type"
              icon={Layers}
              value={formData.employmentType}
              onChange={(val) => handleChange('employmentType', val)}
              options={EMPLOYMENT_TYPES}
              placeholder="Select employment type..."
            />

            {initialData ? (
              <CustomSelect
                label="Employment Status"
                icon={Activity}
                value={formData.employmentStatus}
                onChange={(val) => handleChange('employmentStatus', val)}
                options={STATUS_OPTIONS}
                placeholder="Select employment status..."
              />
            ) : (
              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">
                  Employment Status
                </label>
                <div className="flex h-[38px] items-center gap-2 rounded-xl border border-slate-200/90 bg-slate-50/80 px-3 text-xs font-medium text-slate-700 shadow-subtle">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 ring-4 ring-emerald-100"></span>
                  <span>Active</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-subtle transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary"
          >
            {initialData ? 'Save Changes' : 'Create Employee Record'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
