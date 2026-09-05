import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import ContractConflictAlert from './ContractConflictAlert';
import { useHRData } from '../../context/HRDataContext';

export default function ContractFormModal({ isOpen, onClose, initialEmployeeId = null }) {
  const { employees, contracts, addContract } = useHRData();

  const [formData, setFormData] = useState({
    employeeId: initialEmployeeId || (employees[0]?.id ?? ''),
    contractName: '',
    startDate: '',
    endDate: '',
    wage: '$110,000 / yr',
    salaryStructure: 'Standard Band Level 3',
    status: 'Active',
    notes: ''
  });

  const [conflictWarning, setConflictWarning] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      const empId = initialEmployeeId || employees[0]?.id || '';
      const targetEmp = employees.find((e) => e.id === empId);
      setFormData({
        employeeId: empId,
        contractName: targetEmp ? `${targetEmp.jobPosition} Term Agreement` : 'Employment Agreement',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        wage: '$110,000 / yr',
        salaryStructure: 'Standard Tech Band 3',
        status: 'Active',
        notes: ''
      });
      setErrors({});
      setConflictWarning(null);
    }
  }, [isOpen, initialEmployeeId, employees]);

  // Check for active contract overlap whenever employeeId or status or dates change
  useEffect(() => {
    if (!formData.employeeId || formData.status !== 'Active') {
      setConflictWarning(null);
      return;
    }

    const existingActive = contracts.find(
      (c) => c.employeeId === formData.employeeId && c.isCurrent && c.status === 'Active'
    );

    if (existingActive) {
      setConflictWarning({
        message: `An active contract (${existingActive.id}) already exists for this employee. Creating this active contract will supersede or conflict with the existing agreement period.`,
        contract: existingActive
      });
    } else {
      setConflictWarning(null);
    }
  }, [formData.employeeId, formData.status, formData.startDate, contracts]);

  const validate = () => {
    const newErrors = {};
    if (!formData.contractName.trim()) newErrors.contractName = 'Contract name is required.';
    if (!formData.startDate) newErrors.startDate = 'Start date is required.';
    if (formData.endDate && formData.startDate && formData.endDate < formData.startDate) {
      newErrors.endDate = 'End date cannot be prior to start date.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    if (conflictWarning && formData.status === 'Active') {
      setErrors((prev) => ({
        ...prev,
        conflict: 'Conflict unresolved. Change contract status to Scheduled or resolve existing active agreement before issuing another active term.'
      }));
      return;
    }

    const targetEmp = employees.find((e) => e.id === formData.employeeId);

    addContract({
      ...formData,
      employeeName: targetEmp?.fullName || 'Employee',
      department: targetEmp?.department || 'Operations',
      position: targetEmp?.jobPosition || 'Specialist'
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Employment Contract"
      description="Issue a new or renewed legal employment contract and define salary terms."
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Conflict Warning Banner */}
        {conflictWarning && (
          <ContractConflictAlert
            message={conflictWarning.message}
            overlappingContract={conflictWarning.contract}
            onCancel={onClose}
          />
        )}
        {errors.conflict && (
          <p className="text-xs font-bold text-rose-600 bg-rose-50 p-2.5 rounded-lg border border-rose-200">
            ⚠ {errors.conflict}
          </p>
        )}

        <div>
          <label className="block text-[11px] font-medium text-slate-700">
            Employee <span className="text-rose-500">*</span>
          </label>
          <select
            value={formData.employeeId}
            onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.fullName} ({emp.id}) — {emp.jobPosition}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-medium text-slate-700">
            Contract Title / Agreement Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={formData.contractName}
            onChange={(e) => setFormData({ ...formData, contractName: e.target.value })}
            placeholder="e.g. Senior Software Engineer Term v2"
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          {errors.contractName && <p className="mt-1 text-[11px] text-rose-500">{errors.contractName}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-medium text-slate-700">
              Start Date <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            {errors.startDate && <p className="mt-1 text-[11px] text-rose-500">{errors.startDate}</p>}
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-700">End Date</label>
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            {errors.endDate && <p className="mt-1 text-[11px] text-rose-500">{errors.endDate}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-medium text-slate-700">Agreed Wage / Rate</label>
            <input
              type="text"
              value={formData.wage}
              onChange={(e) => setFormData({ ...formData, wage: e.target.value })}
              placeholder="$120,000 / yr or $45 / hr"
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-700">Salary Structure</label>
            <input
              type="text"
              value={formData.salaryStructure}
              onChange={(e) => setFormData({ ...formData, salaryStructure: e.target.value })}
              placeholder="e.g. Standard Tech Band 4"
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-medium text-slate-700">Status</label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="Active">Active (Current Contract)</option>
            <option value="Scheduled">Scheduled (Future Term)</option>
            <option value="Expired">Expired (Historical Term)</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-medium text-slate-700">Contract Notes</label>
          <textarea
            rows={2}
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Renewal terms, signing stipulations, retention clauses..."
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
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
            Save Contract
          </button>
        </div>
      </form>
    </Modal>
  );
}
