import React, { useState, useEffect, useMemo } from 'react';
import Modal from '../ui/Modal';
import ContractConflictAlert from './ContractConflictAlert';
import { useHRData } from '../../context/HRDataContext';
import { AlertCircle, Lock, Calendar, FileText, User, IndianRupee, Sparkles, TrendingUp, ShieldAlert } from 'lucide-react';
import { formatINR } from '../../utils/formatCurrency';

export default function ContractFormModal({
  isOpen,
  onClose,
  initialEmployeeId = null,
  initialContract = null,
}) {
  const { employees, contracts, addContract, updateContract } = useHRData();

  const isEdit = Boolean(initialContract);

  // Helper to extract a clean number
  const parseNumeric = (val) => {
    if (val == null || val === '') return '';
    if (typeof val === 'number') return val;
    const cleaned = String(val).replace(/[^0-9.]/g, '');
    return cleaned === '' ? '' : Number(cleaned);
  };

  // Filter employees who do NOT have an existing contract (for creation mode)
  const availableEmployees = useMemo(() => {
    if (isEdit) return employees;
    return employees.filter((emp) => {
      const empId = emp.id || emp._id || emp.employeeCode;
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
    basicSalary: '',
    hra: '',
    specialAllowance: '',
    bonus: '',
    pfDeduction: '',
    professionalTax: '',
    tdsDeduction: '',
    salaryStructure: 'monthly',
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
        const rawWage = parseNumeric(initialContract.wage ?? initialContract.wageAmount);
        const bSalary = parseNumeric(initialContract.basicSalary) || (rawWage ? Math.round(rawWage * 0.5) : '');
        const hraVal = parseNumeric(initialContract.hra) || (rawWage ? Math.round(rawWage * 0.25) : '');
        const specVal = parseNumeric(initialContract.specialAllowance) || (rawWage ? Math.round(rawWage * 0.15) : '');
        const bonusVal = parseNumeric(initialContract.bonus) || 0;
        const pfVal = parseNumeric(initialContract.pfDeduction) || (bSalary ? Math.round(bSalary * 0.12) : 0);
        const ptaxVal = parseNumeric(initialContract.professionalTax) ?? 200;
        const tdsVal = parseNumeric(initialContract.tdsDeduction) || (rawWage ? Math.round(rawWage * 0.10) : 0);

        setFormData({
          employeeId: initialContract.employeeId || emp?.id || '',
          contractName: initialContract.contractName || '',
          startDate: initialContract.startDate || '',
          endDate: initialContract.endDate || '',
          wage: rawWage,
          basicSalary: bSalary,
          hra: hraVal,
          specialAllowance: specVal,
          bonus: bonusVal,
          pfDeduction: pfVal,
          professionalTax: ptaxVal,
          tdsDeduction: tdsVal,
          salaryStructure: initialContract.salaryStructure || initialContract.wageType || 'monthly',
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
          wage: 65000,
          basicSalary: 32500,
          hra: 16250,
          specialAllowance: 9750,
          bonus: 6500,
          pfDeduction: 3900,
          professionalTax: 200,
          tdsDeduction: 6500,
          salaryStructure: 'monthly',
          status: 'Active',
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

  // Recalculate breakdown from Base Salary or Gross Wage
  const autoCalculateBreakdown = (baseInput) => {
    const base = Number(baseInput) || 0;
    if (base <= 0) return;
    const hraVal = Math.round(base * 0.5); // HRA = 50% of Basic
    const specVal = Math.round(base * 0.3); // Special Allowance = 30% of Basic
    const bonusVal = Math.round(base * 0.15); // Performance Bonus = 15% of Basic
    const totalGross = base + hraVal + specVal + bonusVal;
    const pfVal = Math.round(base * 0.12); // PF = 12% of Basic
    const ptaxVal = 200;
    const tdsVal = Math.round(totalGross * 0.10); // TDS = 10% of Gross

    setFormData((prev) => ({
      ...prev,
      basicSalary: base,
      hra: hraVal,
      specialAllowance: specVal,
      bonus: bonusVal,
      wage: totalGross,
      pfDeduction: pfVal,
      professionalTax: ptaxVal,
      tdsDeduction: tdsVal,
    }));
  };

  // Computed summary numbers
  const numBasic = Number(formData.basicSalary) || 0;
  const numHra = Number(formData.hra) || 0;
  const numSpecial = Number(formData.specialAllowance) || 0;
  const numBonus = Number(formData.bonus) || 0;

  const totalGrossEarnings = numBasic + numHra + numSpecial + numBonus;
  const numPf = Number(formData.pfDeduction) || 0;
  const numPtax = Number(formData.professionalTax) || 0;
  const numTds = Number(formData.tdsDeduction) || 0;

  const totalDeductions = numPf + numPtax + numTds;
  const netTakeHome = Math.max(0, totalGrossEarnings - totalDeductions);

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
    if (numBasic <= 0 && totalGrossEarnings <= 0) {
      newErrors.basicSalary = 'Base Salary is required and must be greater than 0.';
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

    const grossAmount = totalGrossEarnings > 0 ? totalGrossEarnings : Number(formData.wage || numBasic);

    const payload = {
      ...formData,
      wage: grossAmount,
      wageAmount: grossAmount,
      basicSalary: numBasic,
      hra: numHra,
      specialAllowance: numSpecial,
      bonus: numBonus,
      pfDeduction: numPf,
      professionalTax: numPtax,
      tdsDeduction: numTds,
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
          status: 'Active',
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
      title={isEdit ? 'Edit Salary & Employment Contract' : 'Create Salary & Employment Agreement'}
      description={
        isEdit
          ? 'Review and adjust compensation terms, base salary, allowances, bonuses, and statutory deductions.'
          : 'Define salary breakdown (Base Pay, Allowances, PF, Tax) for employee or HR staff to govern monthly payruns.'
      }
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[80vh] overflow-y-auto pr-1">
        {/* Conflict Warning Banner */}
        {conflictWarning && (
          <ContractConflictAlert
            message={conflictWarning.message}
            overlappingContract={conflictWarning.contract}
            onCancel={onClose}
          />
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
                Every employee/HR member currently has an active agreement. To modify compensation, use the <strong>Edit</strong> button.
              </p>
            </div>
          </div>
        )}

        {/* Employee Selection */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-700">
            Employee / Staff Member <span className="text-rose-500">*</span>
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
                    {emp.fullName} ({emp.id || emp.employeeCode}) — {emp.jobPosition} ({emp.department})
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
            placeholder="e.g. Senior Staff Compensation Agreement"
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
              min={formData.startDate}
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              className={`mt-1 w-full rounded-lg border bg-white px-3 py-2 text-xs shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                errors.endDate ? 'border-rose-400' : 'border-slate-300'
              }`}
            />
            {errors.endDate && <p className="mt-1 text-[11px] text-rose-500">{errors.endDate}</p>}
          </div>
        </div>

        {/* ================= SALARY DISCUSSION BREAKDOWN SECTION ================= */}
        <div className="rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50/40 via-white to-sky-50/30 p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-indigo-600 text-white shadow-xs">
                <IndianRupee className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Salary Breakdown & Compensation Structure</h4>
                <p className="text-[10px] text-slate-500">Define individual components agreed during salary discussion</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => autoCalculateBreakdown(formData.basicSalary || 30000)}
              className="flex items-center gap-1 rounded-md border border-indigo-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-indigo-700 shadow-2xs hover:bg-indigo-50 transition-colors"
            >
              <Sparkles className="h-3 w-3 text-indigo-600" />
              Auto-Split from Base
            </button>
          </div>

          {/* Earnings Grid */}
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700">1. Monthly Earnings & Allowances</span>
            <div className="mt-2 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {/* Base Salary */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700">
                  Base Salary (Basic Pay) <span className="text-rose-500">*</span>
                </label>
                <div className="relative mt-1">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5 text-slate-400 text-xs font-semibold">₹</span>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={formData.basicSalary}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData((prev) => ({
                        ...prev,
                        basicSalary: val,
                      }));
                    }}
                    placeholder="e.g. 40,000"
                    className="w-full rounded-lg border border-slate-300 bg-white pl-6 pr-3 py-1.5 text-xs font-semibold text-slate-900 shadow-2xs focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                {errors.basicSalary && <p className="mt-1 text-[10px] text-rose-500">{errors.basicSalary}</p>}
              </div>

              {/* HRA */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700">
                  House Rent Allowance (HRA)
                </label>
                <div className="relative mt-1">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5 text-slate-400 text-xs font-semibold">₹</span>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={formData.hra}
                    onChange={(e) => setFormData({ ...formData, hra: e.target.value })}
                    placeholder="e.g. 20,000"
                    className="w-full rounded-lg border border-slate-300 bg-white pl-6 pr-3 py-1.5 text-xs font-medium text-slate-900 shadow-2xs focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Special Allowance */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700">
                  Special / Other Allowance
                </label>
                <div className="relative mt-1">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5 text-slate-400 text-xs font-semibold">₹</span>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={formData.specialAllowance}
                    onChange={(e) => setFormData({ ...formData, specialAllowance: e.target.value })}
                    placeholder="e.g. 10,000"
                    className="w-full rounded-lg border border-slate-300 bg-white pl-6 pr-3 py-1.5 text-xs font-medium text-slate-900 shadow-2xs focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Bonus / Variable */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700">
                  Bonus / Performance Incentive
                </label>
                <div className="relative mt-1">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5 text-slate-400 text-xs font-semibold">₹</span>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={formData.bonus}
                    onChange={(e) => setFormData({ ...formData, bonus: e.target.value })}
                    placeholder="e.g. 5,000"
                    className="w-full rounded-lg border border-slate-300 bg-white pl-6 pr-3 py-1.5 text-xs font-medium text-slate-900 shadow-2xs focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Deductions Grid */}
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700">2. Statutory & Tax Deductions</span>
            <div className="mt-2 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
              {/* PF Deduction */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700">
                  Provident Fund (PF)
                </label>
                <div className="relative mt-1">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5 text-slate-400 text-xs font-semibold">₹</span>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={formData.pfDeduction}
                    onChange={(e) => setFormData({ ...formData, pfDeduction: e.target.value })}
                    placeholder="e.g. 4,800"
                    className="w-full rounded-lg border border-slate-300 bg-white pl-6 pr-3 py-1.5 text-xs font-medium text-slate-900 shadow-2xs focus:border-rose-400 focus:outline-none focus:ring-1 focus:ring-rose-400"
                  />
                </div>
              </div>

              {/* Professional Tax */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700">
                  Professional Tax (PTAX)
                </label>
                <div className="relative mt-1">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5 text-slate-400 text-xs font-semibold">₹</span>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={formData.professionalTax}
                    onChange={(e) => setFormData({ ...formData, professionalTax: e.target.value })}
                    placeholder="200"
                    className="w-full rounded-lg border border-slate-300 bg-white pl-6 pr-3 py-1.5 text-xs font-medium text-slate-900 shadow-2xs focus:border-rose-400 focus:outline-none focus:ring-1 focus:ring-rose-400"
                  />
                </div>
              </div>

              {/* TDS Deduction */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700">
                  Income Tax / TDS
                </label>
                <div className="relative mt-1">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5 text-slate-400 text-xs font-semibold">₹</span>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={formData.tdsDeduction}
                    onChange={(e) => setFormData({ ...formData, tdsDeduction: e.target.value })}
                    placeholder="e.g. 5,000"
                    className="w-full rounded-lg border border-slate-300 bg-white pl-6 pr-3 py-1.5 text-xs font-medium text-slate-900 shadow-2xs focus:border-rose-400 focus:outline-none focus:ring-1 focus:ring-rose-400"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Realtime Salary Calculation Summary Card */}
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 rounded-lg border border-indigo-200/80 bg-white p-3 shadow-2xs">
            <div className="border-r border-slate-100 pr-2">
              <span className="text-[10px] font-semibold text-slate-500 uppercase">Gross Monthly Wage</span>
              <p className="text-sm font-bold text-slate-900 mt-0.5">{formatINR(totalGrossEarnings)}</p>
            </div>
            <div className="border-r border-slate-100 pr-2">
              <span className="text-[10px] font-semibold text-rose-500 uppercase">Total Deductions</span>
              <p className="text-sm font-bold text-rose-600 mt-0.5">- {formatINR(totalDeductions)}</p>
            </div>
            <div>
              <span className="text-[10px] font-semibold text-emerald-600 uppercase">Net In-Hand (Take-Home)</span>
              <p className="text-sm font-extrabold text-emerald-700 mt-0.5">{formatINR(netTakeHome)}</p>
            </div>
          </div>
        </div>

        {/* Salary Cycle / Structure & Status */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="block text-[11px] font-semibold text-slate-700">
              Salary Structure Cycle <span className="text-rose-500">*</span>
            </label>
            <select
              value={formData.salaryStructure}
              onChange={(e) => setFormData({ ...formData, salaryStructure: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="monthly">Monthly Disbursement</option>
              <option value="annually">Annualized Package (CTC)</option>
              <option value="hourly">Hourly Contract Rate</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700">
              Contract Status <span className="text-rose-500">*</span>
            </label>
            {!isEdit ? (
              <div className="mt-1 flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50/70 px-3 py-2 text-xs font-semibold text-emerald-800">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                  Active (Locked for new agreement)
                </span>
                <Lock className="h-3.5 w-3.5 text-emerald-600" />
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
        </div>

        {/* Notes */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-700">Salary Discussion Notes & Stipulations</label>
          <textarea
            rows={2}
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Document appraisal notes, variable pay milestones, probation conditions..."
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
            {isSubmitting ? 'Saving...' : isEdit ? 'Save Salary & Terms' : 'Issue Salary Contract'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
