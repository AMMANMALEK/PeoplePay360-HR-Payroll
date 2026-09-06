import React, { useState } from 'react';
import { X, Check, AlertTriangle, Users, Calendar, ArrowRight, ArrowLeft, Layers, ShieldCheck, Info } from 'lucide-react';
import { useHRData, DEFAULT_SALARY_STRUCTURES, DEFAULT_SALARY_RULES } from '../../context/HRDataContext';
import { evaluateEmployeeEligibility } from '../../services/payrollComputeEngine';

export default function PayrunWizard({ isOpen, onClose, onCreated }) {
  const { employees, contracts, salaryStructures, salaryRules, createPayrun, departments } = useHRData();

  const availableStructures =
    salaryStructures && salaryStructures.length > 0 ? salaryStructures : DEFAULT_SALARY_STRUCTURES;
  const availableRules =
    salaryRules && salaryRules.length > 0 ? salaryRules : DEFAULT_SALARY_RULES;

  const todayStr = new Date().toISOString().split('T')[0];

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: 'September 2026 Regular Payrun',
    periodMonth: 'September 2026',
    salaryStructureId: availableStructures?.[0]?.id || 'STRUC-ENG-01',
    startDate: '2026-09-01',
    endDate: '2026-09-30',
    paymentDate: '2026-10-01',
    notes: 'Regular monthly salary run',
  });

  const selectedStructure =
    availableStructures.find((s) => s.id === formData.salaryStructureId) || availableStructures[0];

  const structureRules = (
    selectedStructure?.ruleIds ||
    selectedStructure?.rules ||
    []
  )
    .map((rId) => availableRules.find((r) => r.id === rId || r.code === rId))
    .filter(Boolean);

  const [selectedEmpIds, setSelectedEmpIds] = useState(
    employees.map((e) => e.id || e._id || e.employeeCode)
  );

  const [deptFilter, setDeptFilter] = useState('ALL');

  if (!isOpen) return null;

  const handleSelectAll = () => {
    setSelectedEmpIds(employees.map((e) => e.id || e._id || e.employeeCode));
  };

  const handleDeselectAll = () => {
    setSelectedEmpIds([]);
  };

  const toggleEmployee = (id) => {
    setSelectedEmpIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const filteredEmployees = employees.filter((e) =>
    deptFilter === 'ALL' ? true : e.department === deptFilter
  );

  const handleSubmit = async () => {
    const selectedEmployeesList = employees.filter((e) =>
      selectedEmpIds.includes(e.id || e._id || e.employeeCode)
    );
    const newRun = await createPayrun(
      {
        name: formData.name,
        periodName: formData.periodMonth,
        periodStart: formData.startDate,
        periodEnd: formData.endDate,
        paymentDate: formData.paymentDate,
        salaryStructureId: selectedStructure?.id || formData.salaryStructureId,
        salaryStructureName: selectedStructure?.name || 'Standard Structure',
        selectedEmployeeIds: selectedEmpIds,
        notes: formData.notes || 'Payrun draft created via Wizard.',
      },
      selectedEmployeesList
    );
    if (onCreated) onCreated(newRun);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs transition-opacity">
      <div className="flex h-full w-full max-w-2xl flex-col bg-white shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-brand-700">Step {step} of 2</span>
            <h2 className="text-lg font-bold text-slate-900">
              {step === 1 ? 'Create New Payrun' : 'Select Employees for Payrun'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {step === 1 ? (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Payrun Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-medium text-slate-900 focus:border-brand-400 focus:outline-hidden"
                  placeholder="e.g. September 2026 Regular Payrun"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Pay Period Month
                  </label>
                  <input
                    type="text"
                    value={formData.periodMonth}
                    onChange={(e) => setFormData({ ...formData, periodMonth: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-medium text-slate-900 focus:border-brand-400 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Salary Structure
                  </label>
                  <select
                    value={formData.salaryStructureId}
                    onChange={(e) => setFormData({ ...formData, salaryStructureId: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-medium text-slate-900 focus:border-brand-400 focus:outline-hidden bg-white"
                  >
                    {availableStructures.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Selected Structure Full Details Card */}
              {selectedStructure && (
                <div className="rounded-2xl border border-indigo-100 bg-indigo-50/40 p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="rounded-xl bg-indigo-100 p-2 text-indigo-700">
                        <Layers className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">
                          {selectedStructure.name} <span className="text-slate-400 font-mono font-normal">({selectedStructure.code})</span>
                        </h4>
                        <p className="text-[11px] text-slate-600 mt-0.5">
                          {selectedStructure.description || 'Configured compensation blueprint'}
                        </p>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                      <ShieldCheck className="h-3 w-3" />
                      Verified Blueprint
                    </span>
                  </div>

                  {structureRules.length > 0 && (
                    <div className="border-t border-indigo-100/70 pt-2.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
                        Blueprint Rules Sequence ({structureRules.length}):
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {structureRules.map((r, idx) => (
                          <span
                            key={r.id || r.code}
                            className={`inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[11px] font-medium border ${
                              r.category === 'Deduction'
                                ? 'bg-rose-50 border-rose-200 text-rose-800'
                                : 'bg-white border-indigo-200 text-indigo-900 shadow-2xs'
                            }`}
                          >
                            <span className="text-[9px] font-mono font-bold opacity-60">#{idx + 1}</span>
                            <span className="font-bold">{r.code}</span>
                            <span className="text-[10px] text-slate-500">({r.name})</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Start Date
                  </label>
                  <input
                    type="date"
                    min={todayStr}
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-900 focus:border-brand-400 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    End Date
                  </label>
                  <input
                    type="date"
                    min={formData.startDate || todayStr}
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-900 focus:border-brand-400 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Payment Date
                  </label>
                  <input
                    type="date"
                    min={formData.endDate || todayStr}
                    value={formData.paymentDate}
                    onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-900 focus:border-brand-400 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="rounded-2xl bg-amber-50/70 border border-amber-200/80 p-4">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
                  <div>
                    <h4 className="text-xs font-bold text-amber-900">Automatic Contract Validation</h4>
                    <p className="text-xs text-amber-800 mt-1">
                      During computation, active contracts will be validated against this date range ({formData.startDate} to {formData.endDate}). Employees without active contracts will trigger payroll warnings.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-slate-500">Filter Department:</span>
                  <select
                    value={deptFilter}
                    onChange={(e) => setDeptFilter(e.target.value)}
                    className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700"
                  >
                    <option value="ALL">All Departments</option>
                    {departments.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-2 text-xs">
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className="font-semibold text-brand-700 hover:underline"
                  >
                    Select All
                  </button>
                  <span className="text-slate-300">|</span>
                  <button
                    type="button"
                    onClick={handleDeselectAll}
                    className="font-semibold text-slate-500 hover:underline"
                  >
                    Deselect All
                  </button>
                </div>
              </div>

              <div className="text-xs font-semibold text-slate-500">
                {selectedEmpIds.length} of {employees.length} employees selected
              </div>

              <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 max-h-[380px] overflow-y-auto">
                {filteredEmployees.map((emp) => {
                  const empId = emp.id || emp._id || emp.employeeCode;
                  const isChecked = selectedEmpIds.includes(empId);
                  const eligibility = evaluateEmployeeEligibility(
                    emp,
                    contracts,
                    formData.startDate,
                    formData.endDate
                  );

                  return (
                    <div
                      key={empId}
                      onClick={() => toggleEmployee(empId)}
                      className={`flex items-center justify-between p-3.5 cursor-pointer transition-colors ${
                        isChecked ? 'bg-brand-50/30' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="h-4 w-4 rounded-md border-slate-300 text-brand-600 focus:ring-brand-400"
                        />
                        <div>
                          <p className="text-xs font-bold text-slate-900">
                            {emp.name || `${emp.firstName} ${emp.lastName}`}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            {emp.employeeCode} • {emp.department || 'General'}
                            {contracts.find(
                              (c) =>
                                (c.employeeId === empId || c.employeeCode === empId || c.employeeId === emp.employeeCode) &&
                                c.status === 'Active'
                            )?.wageAmount ? (
                              <span className="ml-1.5 font-semibold text-emerald-700">
                                • Salary: ₹{Number(contracts.find(
                                  (c) =>
                                    (c.employeeId === empId || c.employeeCode === empId || c.employeeId === emp.employeeCode) &&
                                    c.status === 'Active'
                                )?.wageAmount).toLocaleString('en-IN')}/mo
                              </span>
                            ) : null}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {eligibility.isEligible ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                            <Check className="h-3 w-3" />
                            Eligible & Configured
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                            <AlertTriangle className="h-3 w-3" />
                            Issue Detected
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4 bg-slate-50/50">
          {step === 2 ? (
            <button
              type="button"
              onClick={() => setStep(1)}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100"
            >
              Cancel
            </button>
          )}

          {step === 1 ? (
            <button
              type="button"
              onClick={() => setStep(2)}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-400 px-5 py-2 text-xs font-bold text-slate-900 hover:bg-brand-500 shadow-sm"
            >
              Next: Select Employees
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              disabled={selectedEmpIds.length === 0}
              onClick={handleSubmit}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-400 px-5 py-2 text-xs font-bold text-slate-900 hover:bg-brand-500 disabled:opacity-50 shadow-sm"
            >
              Create Draft Payrun ({selectedEmpIds.length})
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
