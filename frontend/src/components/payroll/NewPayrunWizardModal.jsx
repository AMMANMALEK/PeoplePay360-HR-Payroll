import React, { useState, useMemo } from 'react';
import Modal from '../ui/Modal';
import StatusBadge from '../ui/StatusBadge';
import { useHRData } from '../../context/HRDataContext';
import { formatINR } from '../../utils/formatCurrency';
import { Layers, Calendar, Users, Check, ArrowRight, ArrowLeft, AlertCircle, ShieldCheck } from 'lucide-react';

export default function NewPayrunWizardModal({ isOpen, onClose, onCreated }) {
  const { salaryStructures, employees, contracts, createPayrun } = useHRData();

  // Wizard state: 1 (Scope) or 2 (Employee Selection)
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 1 Form Data
  const [name, setName] = useState('September 2026 Regular Payrun');
  const [salaryStructureId, setSalaryStructureId] = useState(salaryStructures[0]?.id || 'STRUC-ENG-01');
  const [periodStart, setPeriodStart] = useState('2026-09-01');
  const [periodEnd, setPeriodEnd] = useState('2026-09-30');
  const [periodName, setPeriodName] = useState('September 2026');
  const [notes, setNotes] = useState('Regular monthly salary run');

  // Step 2 Selection State: Array of selected employee IDs
  const [selectedEmpIds, setSelectedEmpIds] = useState([]);

  // Filter eligible employees based on active contracts and selected structure
  const eligibleEmployees = useMemo(() => {
    return employees.map((emp) => {
      const activeContract = contracts.find(
        (c) => c.employeeId === emp.id && c.status === 'Active'
      );
      const isStructureMatch = activeContract?.salaryStructureId === salaryStructureId;
      const hasBank = Boolean(emp.bankDetails?.accountNumber);
      const isEligible = Boolean(activeContract);

      return {
        ...emp,
        activeContract,
        isStructureMatch,
        hasBank,
        isEligible,
      };
    });
  }, [employees, contracts, salaryStructureId]);

  // When step 2 is entered, pre-select all eligible employees by default
  const handleProceedToStep2 = (e) => {
    e.preventDefault();
    if (!salaryStructureId || !periodStart || !periodEnd) return;
    const defaultSelected = eligibleEmployees
      .filter((e) => e.isEligible)
      .map((e) => e.id);
    setSelectedEmpIds(defaultSelected);
    setStep(2);
  };

  const handleToggleEmployee = (id) => {
    setSelectedEmpIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedEmpIds.length === eligibleEmployees.filter((e) => e.isEligible).length) {
      setSelectedEmpIds([]);
    } else {
      setSelectedEmpIds(eligibleEmployees.filter((e) => e.isEligible).map((e) => e.id));
    }
  };

  const handleCreatePayrun = async () => {
    if (selectedEmpIds.length === 0) return;
    setIsSubmitting(true);
    try {
      const selectedStructure = salaryStructures.find((s) => s.id === salaryStructureId);
      const payload = {
        name,
        periodName,
        periodStart,
        periodEnd,
        salaryStructureId,
        salaryStructureName: selectedStructure?.name || 'Standard Structure',
        notes,
      };
      const selectedEmployeesList = employees.filter((e) => selectedEmpIds.includes(e.id));
      const newPayrun = await createPayrun(payload, selectedEmployeesList);
      setIsSubmitting(false);
      onClose();
      if (onCreated) onCreated(newPayrun);
    } catch (err) {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    onClose();
  };

  const selectedStructureObj = salaryStructures.find((s) => s.id === salaryStructureId);

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create New Payrun"
      maxWidth="max-w-3xl sm:max-w-4xl"
    >
      <div className="space-y-4">
        {/* Two-Step Wizard Progress Bar */}
        <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-3">
          <div className="flex items-center justify-between">
            {/* Step 1 Indicator */}
            <div className="flex items-center gap-3">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-xl text-xs font-bold transition-colors ${
                  step === 1
                    ? 'bg-brand-400 text-slate-900 shadow-sm'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {step > 1 ? <Check className="h-4 w-4" /> : '1'}
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-900">Step 1 — Payroll Scope</p>
                <p className="text-[11px] text-slate-500">Structure & pay period</p>
              </div>
            </div>

            <div className="h-0.5 flex-1 mx-4 bg-slate-200" />

            {/* Step 2 Indicator */}
            <div className="flex items-center gap-3">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-xl text-xs font-bold transition-colors ${
                  step === 2
                    ? 'bg-brand-400 text-slate-900 shadow-sm'
                    : 'bg-slate-200 text-slate-500'
                }`}
              >
                2
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-900">Step 2 — Employee Selection</p>
                <p className="text-[11px] text-slate-500">Eligible staff confirmation</p>
              </div>
            </div>
          </div>
        </div>

        {/* STEP 1: PAYROLL SCOPE */}
        {step === 1 && (
          <form onSubmit={handleProceedToStep2} className="space-y-3.5">
            <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-3 text-xs text-blue-900 flex items-start gap-2.5">
              <Layers className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">Step 1 Scope Definition:</span> Define the salary structure and the target accounting cycle. In the next step, you will explicitly verify and select all participating employees before creating this batch.
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700">Payrun Batch Name</label>
                <input
                  type="text"
                  required
                  className="field-input text-xs"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. September 2026 Regular Payrun"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Period Label</label>
                <input
                  type="text"
                  required
                  className="field-input text-xs"
                  value={periodName}
                  onChange={(e) => setPeriodName(e.target.value)}
                  placeholder="e.g. September 2026"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700">Salary Structure</label>
                <select
                  required
                  className="field-input text-xs"
                  value={salaryStructureId}
                  onChange={(e) => setSalaryStructureId(e.target.value)}
                >
                  {salaryStructures.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code})
                    </option>
                  ))}
                </select>
                {selectedStructureObj && (
                  <p className="mt-1 text-[11px] text-slate-500">
                    {selectedStructureObj.ruleIds?.length || 0} active rules attached to this structure.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Cycle Notes</label>
                <input
                  type="text"
                  className="field-input text-xs"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Regular monthly salary run"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700">Period Start Date</label>
                <input
                  type="date"
                  required
                  className="field-input text-xs"
                  value={periodStart}
                  onChange={(e) => setPeriodStart(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Period End Date</label>
                <input
                  type="date"
                  required
                  className="field-input text-xs"
                  value={periodEnd}
                  onChange={(e) => setPeriodEnd(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button type="button" onClick={handleClose} className="btn-secondary">
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                Continue to Employees
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: EMPLOYEE SELECTION */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-900">Eligible Employees</span>
                  <span className="rounded-full bg-brand-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-800">
                    Selected: {selectedEmpIds.length} of {eligibleEmployees.length}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Confirm the individuals whose compensation will be processed in this batch.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-700 hover:bg-slate-50"
                >
                  {selectedEmpIds.length === eligibleEmployees.filter((e) => e.isEligible).length
                    ? 'Deselect All'
                    : 'Select All Eligible'}
                </button>
              </div>
            </div>

            {/* Crucial Notice */}
            <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3 text-[11px] text-amber-900 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">Important Safeguard:</span> The payrun is <span className="font-bold underline">not created</span> until you complete Step 2. Clicking &quot;Create Payrun&quot; will establish the batch in <span className="font-semibold">Draft</span> status, allowing you to review computations and resolve warnings before finalization.
              </div>
            </div>

            {/* Employee Table */}
            <div className="max-h-72 overflow-y-auto rounded-2xl border border-slate-200 bg-white">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 sticky top-0 z-10 text-[10px] font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                  <tr>
                    <th className="px-4 py-2.5 w-10 text-center">
                      <span className="sr-only">Select</span>
                    </th>
                    <th className="px-3 py-2.5">Employee</th>
                    <th className="px-3 py-2.5">Department</th>
                    <th className="px-3 py-2.5">Active Contract</th>
                    <th className="px-3 py-2.5">Bank Details</th>
                    <th className="px-4 py-2.5 text-right">Eligibility</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {eligibleEmployees.map((emp) => {
                    const isSelected = selectedEmpIds.includes(emp.id);
                    return (
                      <tr
                        key={emp.id}
                        onClick={() => emp.isEligible && handleToggleEmployee(emp.id)}
                        className={`transition-colors cursor-pointer ${
                          isSelected ? 'bg-brand-50/50' : 'hover:bg-slate-50/60'
                        } ${!emp.isEligible ? 'opacity-60 cursor-not-allowed bg-slate-50/40' : ''}`}
                      >
                        <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            disabled={!emp.isEligible}
                            checked={isSelected}
                            onChange={() => handleToggleEmployee(emp.id)}
                            className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-400"
                          />
                        </td>
                        <td className="px-3 py-3">
                          <div>
                            <div className="font-semibold text-slate-900 leading-snug">{emp.fullName}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{emp.id}</div>
                          </div>
                        </td>
                        <td className="px-3 py-3 text-slate-600">{emp.department}</td>
                        <td className="px-3 py-3">
                          {emp.activeContract ? (
                            <div>
                              <span className="font-medium text-slate-800">
                                {formatINR(emp.activeContract.wageAmount || 0)}
                              </span>
                              <span className="block text-[10px] text-slate-400">
                                {emp.activeContract.salaryStructureName || 'Structure match'}
                              </span>
                            </div>
                          ) : (
                            <span className="text-rose-600 text-[11px] font-medium">No Active Contract</span>
                          )}
                        </td>
                        <td className="px-3 py-3">
                          {emp.hasBank ? (
                            <span className="inline-flex items-center gap-1 text-emerald-700 font-medium text-[11px]">
                              <ShieldCheck className="h-3.5 w-3.5" />
                              Configured
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-amber-700 font-medium text-[11px]">
                              <AlertCircle className="h-3.5 w-3.5" />
                              Missing
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <StatusBadge
                            status={emp.isEligible ? (isSelected ? 'Selected' : 'Eligible') : 'Ineligible'}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="btn-secondary"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to Scope
              </button>

              <div className="flex items-center gap-2">
                <button type="button" onClick={handleClose} className="btn-ghost">
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={selectedEmpIds.length === 0 || isSubmitting}
                  onClick={handleCreatePayrun}
                  className="btn-primary"
                >
                  <Check className="h-3.5 w-3.5" />
                  {isSubmitting ? 'Creating Payrun...' : `Create Payrun (${selectedEmpIds.length} Staff)`}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
