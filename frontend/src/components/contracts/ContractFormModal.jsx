import React, { useState, useEffect, useMemo } from 'react';
import Modal from '../ui/Modal';
import ContractConflictAlert from './ContractConflictAlert';
import { useHRData } from '../../context/HRDataContext';
import { AlertCircle, Lock, DollarSign, Calendar, FileText, User } from 'lucide-react';

export default function ContractFormModal({
  isOpen,
  onClose,
  initialEmployeeId = null,
  initialContract = null,
}) {
  const { employees, contracts, addContract, updateContract } = useHRData();

  const isEdit = Boolean(initialContract);

  // Helper to extract a clean number from wage
  const parseNumericWage = (val) => {
    if (val == null || val === '') return '';
    if (typeof val === 'number') return val;
    const cleaned = String(val).replace(/[^0-9.]/g, '');
    return cleaned === '' ? '' : Number(cleaned);
  };

  // Helper to normalize salary structure to 'hourly' or 'annually'
  const normalizeStructure = (val) => {
    const s = String(val || '').toLowerCase();
    if (s.includes('hour')) return 'hourly';
    return 'annually';
  };

  // Filter employees who do NOT have an existing contract (for creation mode)
  const availableEmployees = useMemo(() => {
    if (isEdit) return employees;
    return employees.filter((emp) => {
      const empId = emp.id || emp._id || emp.employeeCode;
      // Allow initialEmployeeId if provided
      if (initialEmployeeId && empId === initialEmployeeId) return true;

      return !contracts.some(
        (c) =>
          c.employeeId === empId ||
          c.employeeCode === empId ||
          c.employeeId === emp.employeeCode ||
          (c.employeeName && emp.fullName && c.employeeName.trim().toLowerCase() === emp.fullName.trim().toLowerCase())
      );
    });
  }, [employees, contracts, isEdit, initialEmployeeId]);

  const [formData, setFormData] = useState({
    employeeId: '',
    contractName: '',
    startDate: '',
    endDate: '',
    wage: '',
    salaryStructure: 'annually',
    status: 'Active',
    notes: '',
  });

  const [conflictWarning, setConflictWarning] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialContract) {
        // Edit Mode
        const emp = employees.find(
          (e) =>
            e.id === initialContract.employeeId ||
            e.employeeCode === initialContract.employeeId
        );
        setFormData({
          employeeId: initialContract.employeeId || emp?.id || '',
          contractName: initialContract.contractName || '',
          startDate: initialContract.startDate || '',
          endDate: initialContract.endDate || '',
          wage: parseNumericWage(initialContract.wage ?? initialContract.wageAmount),
          salaryStructure: normalizeStructure(initialContract.salaryStructure || initialContract.wageType),
          status: initialContract.status || 'Active',
          notes: initialContract.notes || '',
        });
      } else {
        // Create Mode
        const defaultEmpId = initialEmployeeId || availableEmployees[0]?.id || '';
        const targetEmp = employees.find((e) => e.id === defaultEmpId);
        setFormData({
          employeeId: defaultEmpId,
          contractName: targetEmp?.jobPosition ? `${targetEmp.jobPosition} Agreement` : '',
          startDate: new Date().toISOString().split('T')[0],
          endDate: '',
          wage: '',
          salaryStructure: 'annually',
          status: 'Active', // strictly Active and not changeable on create
          notes: '',
        });
      }
      setErrors({});
      setConflictWarning(null);
      setIsSubmitting(false);
    }
  }, [isOpen, initialContract, initialEmployeeId, availableEmployees, employees]);

  // Handle employee change in create mode to auto-suggest agreement title
  const handleEmployeeChange = (newEmpId) => {
    const targetEmp = employees.find((e) => e.id === newEmpId);
    setFormData((prev) => ({
      ...prev,
      employeeId: newEmpId,
      contractName: targetEmp?.jobPosition ? `${targetEmp.jobPosition} Agreement` : prev.contractName,
    }));
  };

  // Check for active contract overlap in create mode
  useEffect(() => {
    if (isEdit || !formData.employeeId || formData.status !== 'Active') {
      setConflictWarning(null);
      return;
    }

    const existingActive = contracts.find(
      (c) =>
        (c.employeeId === formData.employeeId || c.employeeCode === formData.employeeId) &&
        c.isCurrent &&
        c.status === 'Active'
    );

    if (existingActive) {
      setConflictWarning({
        message: `An active contract (${existingActive.id || existingActive.contractCode}) already exists for this employee.`,
        contract: existingActive,
      });
    } else {
      setConflictWarning(null);
    }
  }, [formData.employeeId, formData.status, contracts, isEdit]);

  const validate = () => {
    const newErrors = {};
    if (!formData.employeeId) newErrors.employeeId = 'Employee selection is required.';
    if (!formData.contractName.trim()) newErrors.contractName = 'Contract name is required.';
    if (formData.wage === '' || formData.wage === null || isNaN(Number(formData.wage))) {
      newErrors.wage = 'Agreed Wage is required and must be a valid number.';
    } else if (Number(formData.wage) < 0) {
      newErrors.wage = 'Wage must be a non-negative number.';
    }
    if (!formData.startDate) newErrors.startDate = 'Start date is required.';
    if (formData.endDate && formData.startDate && formData.endDate < formData.startDate) {
      newErrors.endDate = 'End date cannot be prior to start date.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    const targetEmp = employees.find((e) => e.id === formData.employeeId);

    const payload = {
      ...formData,
      wage: Number(formData.wage),
      wageAmount: Number(formData.wage),
      salaryStructure: formData.salaryStructure,
      employeeName: targetEmp?.fullName || initialContract?.employeeName || '',
      department: targetEmp?.department || initialContract?.department || '',
      position: targetEmp?.jobPosition || initialContract?.position || '',
    };

    try {
      if (isEdit) {
        await updateContract(initialContract.id || initialContract._id, payload);
      } else {
        await addContract({
          ...payload,
          status: 'Active', // strictly Active on creation
        });
      }
      onClose();
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        submit: err?.message || 'Failed to save contract.',
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Employment Contract' : 'Create New Employment Contract'}
      description={
        isEdit
          ? 'Modify agreement terms, compensation rate, and contract validity status.'
          : 'Issue a new legal employment contract for an employee without an active contract.'
      }
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
        {errors.submit && (
          <p className="text-xs font-bold text-rose-600 bg-rose-50 p-2.5 rounded-lg border border-rose-200">
            ⚠ {errors.submit}
          </p>
        )}

        {/* Create Mode: Check if any available employees */}
        {!isEdit && availableEmployees.length === 0 && (
          <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-xs text-amber-900">
            <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
            <div>
              <p className="font-semibold">All Employees Have Existing Contracts</p>
              <p className="mt-0.5 text-amber-700 leading-relaxed">
                Every employee in your organization currently has an existing contract. To adjust
                terms, use the <strong>Edit</strong> option on their existing contract.
              </p>
            </div>
          </div>
        )}

        {/* Employee Field */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-700">
            Employee <span className="text-rose-500">*</span>
          </label>
          {isEdit ? (
            <div className="mt-1 flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-800">
              <span className="font-semibold">{formData.employeeId ? `${initialContract?.employeeName || 'Employee'} (${formData.employeeId})` : 'Employee'}</span>
              <span className="text-[11px] text-slate-400 italic">Locked on edit</span>
            </div>
          ) : (
            <select
              value={formData.employeeId}
              onChange={(e) => handleEmployeeChange(e.target.value)}
              disabled={availableEmployees.length === 0}
              className={`mt-1 w-full rounded-lg border bg-white px-3 py-2 text-xs font-medium shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                errors.employeeId ? 'border-rose-400' : 'border-slate-300'
              }`}
            >
              {availableEmployees.length === 0 ? (
                <option value="">No eligible employees without contract</option>
              ) : (
                availableEmployees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.fullName} ({emp.id}) — {emp.jobPosition} ({emp.department})
                  </option>
                ))
              )}
            </select>
          )}
          {errors.employeeId && <p className="mt-1 text-[11px] text-rose-500">{errors.employeeId}</p>}
        </div>

        {/* Contract Title */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-700">
            Contract Title / Agreement Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={formData.contractName}
            onChange={(e) => setFormData({ ...formData, contractName: e.target.value })}
            placeholder="e.g. Senior Software Engineer Term Agreement"
            className={`mt-1 w-full rounded-lg border bg-white px-3 py-2 text-xs shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
              errors.contractName ? 'border-rose-400' : 'border-slate-300'
            }`}
          />
          {errors.contractName && <p className="mt-1 text-[11px] text-rose-500">{errors.contractName}</p>}
        </div>

        {/* Start Date & End Date */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="block text-[11px] font-semibold text-slate-700">
              Start Date <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className={`mt-1 w-full rounded-lg border bg-white px-3 py-2 text-xs shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                errors.startDate ? 'border-rose-400' : 'border-slate-300'
              }`}
            />
            {errors.startDate && <p className="mt-1 text-[11px] text-rose-500">{errors.startDate}</p>}
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700">
              End Date <span className="text-slate-400 font-normal">(Optional for open-ended)</span>
            </label>
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              className={`mt-1 w-full rounded-lg border bg-white px-3 py-2 text-xs shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                errors.endDate ? 'border-rose-400' : 'border-slate-300'
              }`}
            />
            {errors.endDate && <p className="mt-1 text-[11px] text-rose-500">{errors.endDate}</p>}
          </div>
        </div>

        {/* Agreed Wage (strictly number) & Salary Structure (hourly or annually dropdown) */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="block text-[11px] font-semibold text-slate-700">
              Agreed Wage / Rate <span className="text-rose-500">*</span>
            </label>
            <div className="relative mt-1">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 text-xs font-semibold">
                $
              </span>
              <input
                type="number"
                min="0"
                step="any"
                required
                value={formData.wage}
                onChange={(e) => setFormData({ ...formData, wage: e.target.value })}
                placeholder="e.g. 85000 or 45"
                className={`w-full rounded-lg border bg-white pl-7 pr-3 py-2 text-xs font-semibold text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                  errors.wage ? 'border-rose-400' : 'border-slate-300'
                }`}
              />
            </div>
            {errors.wage && <p className="mt-1 text-[11px] text-rose-500">{errors.wage}</p>}
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700">
              Salary Structure <span className="text-rose-500">*</span>
            </label>
            <select
              value={formData.salaryStructure}
              onChange={(e) => setFormData({ ...formData, salaryStructure: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="hourly">hourly</option>
              <option value="annually">annually</option>
            </select>
          </div>
        </div>

        {/* Contract Status: Active only & locked on create, changeable on edit */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-700">
            Status <span className="text-rose-500">*</span>
          </label>
          {!isEdit ? (
            <div className="mt-1">
              <div className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50/70 px-3 py-2 text-xs font-semibold text-emerald-800">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                  Active (Locked for new contracts)
                </span>
                <Lock className="h-3.5 w-3.5 text-emerald-600" />
              </div>
              <p className="mt-1 text-[10px] text-slate-400">
                Newly issued contracts are automatically set to Active. Status can be changed later via Edit.
              </p>
            </div>
          ) : (
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="Active">Active</option>
              <option value="Expiring Soon">Expiring Soon</option>
              <option value="Expired">Expired</option>
            </select>
          )}
        </div>

        {/* Notes */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-700">Contract Notes & Clauses</label>
          <textarea
            rows={2}
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Renewal parameters, bonus terms, severance clauses..."
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* Footer Actions */}
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
            disabled={isSubmitting || (!isEdit && availableEmployees.length === 0)}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Contract'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
