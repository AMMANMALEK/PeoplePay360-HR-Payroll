import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import { useHRData } from '../../context/HRDataContext';

export default function EmployeeFormModal({ isOpen, onClose, initialData = null }) {
  const { departments, schedules, employees, addEmployee, updateEmployee } = useHRData();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    workEmail: '',
    phone: '',
    dob: '',
    jobPosition: '',
    department: departments[0] || '',
    managerId: '',
    managerName: '',
    scheduleId: schedules[0]?.id || '',
    scheduleName: schedules[0]?.name || '',
    employmentStatus: 'Active',
    employmentType: 'Full-Time Permanent'
  });

  const [errors, setErrors] = useState({});

  const defaultManager = employees.find(
    (e) =>
      String(e.employeeCode || e.id || '').toUpperCase() === 'HRMGR' ||
      String(e.jobPosition || '').toLowerCase() === 'hr manager' ||
      String(e.workEmail || '').toLowerCase() === 'hr.manager@peoplepay360.local'
  );

  useEffect(() => {
    if (initialData) {
      setFormData({
        firstName: initialData.firstName || '',
        lastName: initialData.lastName || '',
        workEmail: initialData.workEmail || '',
        phone: initialData.phone || '',
        dob: initialData.dob || '',
        jobPosition: initialData.jobPosition || '',
        department: initialData.department || departments[0],
        managerId: initialData.managerId || '',
        managerName: initialData.managerName || '',
        scheduleId: initialData.scheduleId || schedules[0]?.id || '',
        scheduleName: initialData.scheduleName || '',
        employmentStatus: initialData.employmentStatus || 'Active',
        employmentType: initialData.employmentType || 'Full-Time Permanent'
      });
    } else {
      setFormData({
        firstName: '',
        lastName: '',
        workEmail: '',
        phone: '',
        dob: '',
        jobPosition: '',
        department: departments[0] || '',
        managerId: defaultManager?.id || '',
        managerName: defaultManager?.fullName || '',
        scheduleId: schedules[0]?.id || '',
        scheduleName: schedules[0]?.name || '',
        employmentStatus: 'Active',
        employmentType: 'Full-Time Permanent'
      });
    }
    setErrors({});
  }, [initialData, isOpen, departments, schedules, defaultManager?.id, defaultManager?.fullName]);

  const handleChange = (field, value) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: value };
      if (field === 'scheduleId') {
        const sched = schedules.find((s) => s.id === value);
        next.scheduleName = sched ? sched.name : '';
      }
      if (field === 'managerId') {
        const mgr = employees.find((e) => e.id === value);
        next.managerName = mgr ? mgr.fullName : 'None';
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
                className={`mt-1 w-full rounded-lg border bg-white px-3 py-2 text-xs shadow-sm focus:outline-none ${
                  errors.firstName ? 'border-rose-400 focus:ring-rose-400' : 'border-slate-300 focus:ring-indigo-500'
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
                className={`mt-1 w-full rounded-lg border bg-white px-3 py-2 text-xs shadow-sm focus:outline-none ${
                  errors.lastName ? 'border-rose-400 focus:ring-rose-400' : 'border-slate-300 focus:ring-indigo-500'
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
                className={`mt-1 w-full rounded-lg border bg-white px-3 py-2 text-xs shadow-sm focus:outline-none ${
                  errors.workEmail ? 'border-rose-400 focus:ring-rose-400' : 'border-slate-300 focus:ring-indigo-500'
                }`}
              />
              {errors.workEmail && <p className="mt-1 text-[11px] text-rose-500">{errors.workEmail}</p>}
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-700">Phone Number</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-700">Date of Birth</label>
              <input
                type="date"
                value={formData.dob}
                onChange={(e) => handleChange('dob', e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Work Information */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-4">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
            2. Work Information & Hierarchy
          </h4>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-[11px] font-medium text-slate-700">
                Job Position <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.jobPosition}
                onChange={(e) => handleChange('jobPosition', e.target.value)}
                placeholder="e.g., Staff Software Engineer"
                className={`mt-1 w-full rounded-lg border bg-white px-3 py-2 text-xs shadow-sm focus:outline-none ${
                  errors.jobPosition ? 'border-rose-400 focus:ring-rose-400' : 'border-slate-300 focus:ring-indigo-500'
                }`}
              />
              {errors.jobPosition && <p className="mt-1 text-[11px] text-rose-500">{errors.jobPosition}</p>}
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-700">
                Department <span className="text-rose-500">*</span>
              </label>
              <input
                list="department-options"
                value={formData.department}
                onChange={(e) => handleChange('department', e.target.value)}
                placeholder="Department"
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <datalist id="department-options">
                {departments.map((dept) => (
                  <option key={dept} value={dept} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-700">Reports To (Manager)</label>
              <select
                value={formData.managerId}
                onChange={(e) => handleChange('managerId', e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="">None / Executive Level</option>
                {employees
                  .filter((e) => !initialData || e.id !== initialData.id)
                  .map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.fullName} ({e.jobPosition})
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-700">Working Schedule</label>
              <select
                value={formData.scheduleId}
                onChange={(e) => handleChange('scheduleId', e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="">No schedule assigned</option>
                {schedules.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-700">Employment Status</label>
              <select
                value={formData.employmentStatus}
                onChange={(e) => handleChange('employmentStatus', e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="Active">Active</option>
                <option value="On Leave">On Leave</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-700">Employment Type</label>
              <select
                value={formData.employmentType}
                onChange={(e) => handleChange('employmentType', e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="Full-Time Permanent">Full-Time Permanent</option>
                <option value="Part-Time">Part-Time</option>
                <option value="Contractor">Contractor</option>
                <option value="Executive">Executive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
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
