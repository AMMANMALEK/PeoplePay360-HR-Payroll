import React, { useState } from 'react';
import Modal from '../ui/Modal';
import StatusBadge from '../ui/StatusBadge';
import EmptyState from '../ui/EmptyState';
import ConfirmDialog from '../ui/ConfirmDialog';
import { useHRData } from '../../context/HRDataContext';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../constants/navigation';
import { Plus, Edit, Trash2, Layers, Check, ArrowRight, ListOrdered, Lock, Info } from 'lucide-react';

export default function SalaryStructuresView() {
  const {
    salaryStructures,
    salaryRules,
    employees,
    addSalaryStructure,
    updateSalaryStructure,
    deleteSalaryStructure,
  } = useHRData();

  const { user } = useAuth();
  const isReadOnly = user?.role === ROLES.HR_PAYROLL_USER;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStructure, setEditingStructure] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Form State
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [active, setActive] = useState(true);
  const [selectedRuleIds, setSelectedRuleIds] = useState([]);

  const openCreateModal = () => {
    setEditingStructure(null);
    setName('');
    setCode('');
    setDescription('');
    setActive(true);
    setSelectedRuleIds(salaryRules.map((r) => r.id));
    setIsModalOpen(true);
  };

  const openEditModal = (structure) => {
    setEditingStructure(structure);
    setName(structure.name);
    setCode(structure.code);
    setDescription(structure.description || '');
    setActive(structure.active !== false);
    setSelectedRuleIds(structure.ruleIds || []);
    setIsModalOpen(true);
  };

  const handleToggleRule = (ruleId) => {
    setSelectedRuleIds((prev) =>
      prev.includes(ruleId) ? prev.filter((id) => id !== ruleId) : [...prev, ruleId]
    );
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const payload = {
      name,
      code,
      description,
      active,
      ruleIds: selectedRuleIds,
    };
    if (editingStructure) {
      await updateSalaryStructure(editingStructure.id, payload);
    } else {
      await addSalaryStructure(payload);
    }
    setIsModalOpen(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteSalaryStructure(deleteTarget.id);
    setDeleteTarget(null);
  };

  // Sort rules in sequence order
  const orderedRules = [...salaryRules].sort((a, b) => (a.sequence || 0) - (b.sequence || 0));

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Configured Salary Structures</h3>
          <p className="text-xs text-slate-500">
            Compensation blueprints that govern automated payslip calculations.
          </p>
        </div>
        {!isReadOnly && (
          <button type="button" onClick={openCreateModal} className="btn-primary">
            <Plus className="h-4 w-4" />
            <span>Add Structure</span>
          </button>
        )}
      </div>

      {/* Read-Only Banner */}
      {isReadOnly && (
        <div className="flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50/60 px-4 py-2.5">
          <Lock className="h-4 w-4 text-blue-600 shrink-0" />
          <p className="text-xs text-blue-800">
            <strong>Read-only access.</strong> Your role (HR Payroll User) can view salary structures but cannot create, edit, or delete them. Contact an HR Payroll Manager to make changes.
          </p>
        </div>
      )}

      {/* Grid of Structure Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {salaryStructures.map((structure) => {
          const assignedEmployeesCount = employees.filter(
            (e) => e.salaryStructureId === structure.id
          ).length;
          const rulesInThisStructure = orderedRules.filter((r) =>
            (structure.ruleIds || []).includes(r.id)
          );

          return (
            <div
              key={structure.id}
              className="app-card p-5 flex flex-col justify-between hover:border-slate-300 transition-all shadow-subtle"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900">{structure.name}</h4>
                      <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-mono font-semibold text-slate-600">
                        {structure.code}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                      {structure.description || 'Standard compensation structure'}
                    </p>
                  </div>
                  <StatusBadge status={structure.active ? 'Active' : 'Inactive'} />
                </div>

                {/* Metrics */}
                <div className="mt-4 grid grid-cols-2 gap-2 border-y border-slate-100 py-3 text-xs">
                  <div>
                    <span className="text-[10px] font-medium text-slate-400">Rules Applied</span>
                    <p className="font-bold text-slate-800">
                      {structure.ruleIds?.length || 0} rules
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] font-medium text-slate-400">Assigned Staff</span>
                    <p className="font-bold text-slate-800">
                      {assignedEmployeesCount} employees
                    </p>
                  </div>
                </div>

                {/* Execution Order Rules Preview */}
                <div className="mt-3">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">
                    Execution Order
                  </span>
                  <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                    {rulesInThisStructure.map((rule, idx) => (
                      <div
                        key={rule.id}
                        className="flex items-center justify-between rounded-lg bg-slate-50 px-2 py-1 text-[11px]"
                      >
                        <span className="flex items-center gap-1.5 text-slate-700">
                          <span className="text-[10px] font-bold text-slate-400 w-4">
                            {idx + 1}
                          </span>
                          <span>{rule.name}</span>
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          Seq {rule.sequence}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card Actions */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                {isReadOnly ? (
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-500">
                    <Lock className="h-3 w-3" />
                    View Only
                  </span>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => openEditModal(structure)}
                      className="btn-secondary py-1 text-[11px]"
                    >
                      <Edit className="h-3.5 w-3.5" />
                      Edit Structure
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(structure)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                      title="Delete structure"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Structure Editor Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingStructure ? 'Edit Salary Structure' : 'Create Salary Structure'}
        maxWidth="max-w-2xl sm:max-w-3xl"
        footer={(
          <>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="salary-structure-form"
              className="btn-primary"
            >
              {editingStructure ? 'Save Changes' : 'Create Structure'}
            </button>
          </>
        )}
      >
        <form id="salary-structure-form" onSubmit={handleSave} className="space-y-3.5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700">Structure Name</label>
              <input
                type="text"
                required
                className="field-input text-xs py-1.5"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Executive Management Structure"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700">Code</label>
              <input
                type="text"
                required
                className="field-input text-xs uppercase py-1.5"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. EXEC-MGMT"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:items-end">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700">Description</label>
              <input
                type="text"
                className="field-input text-xs py-1.5"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Target department, employment class, or purpose..."
              />
            </div>

            <div className="flex items-center gap-2 pb-1.5">
              <input
                type="checkbox"
                id="activeStructureCheck"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-400 cursor-pointer"
              />
              <label htmlFor="activeStructureCheck" className="text-xs font-medium text-slate-700 cursor-pointer">
                Active for assignments
              </label>
            </div>
          </div>

          {/* Rules Selection & Ordering */}
          <div className="border-t border-slate-100 pt-3">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-slate-700">
                Included Salary Rules (Execution Sequence)
              </label>
              <span className="text-[11px] text-slate-500">
                {selectedRuleIds.length} rules included
              </span>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto rounded-xl border border-slate-200 p-2.5 bg-slate-50/50">
              {orderedRules.map((rule) => {
                const isSelected = selectedRuleIds.includes(rule.id);
                return (
                  <label
                    key={rule.id}
                    className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors border ${
                      isSelected
                        ? 'bg-white border-brand-300 shadow-subtle'
                        : 'bg-transparent border-transparent hover:bg-white/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleRule(rule.id)}
                        className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-400"
                      />
                      <div>
                        <div className="text-xs font-semibold text-slate-900">{rule.name}</div>
                        <div className="text-[10px] text-slate-400">{rule.category} · {rule.computationType}</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      Seq {rule.sequence}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

        </form>
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Delete Salary Structure"
        message={`Are you sure you want to remove structure "${deleteTarget?.name}"?`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
