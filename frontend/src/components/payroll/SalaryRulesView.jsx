import React, { useState } from 'react';
import Modal from '../ui/Modal';
import StatusBadge from '../ui/StatusBadge';
import EmptyState from '../ui/EmptyState';
import ConfirmDialog from '../ui/ConfirmDialog';
import { useHRData } from '../../context/HRDataContext';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../constants/navigation';
import { formatINR } from '../../utils/formatCurrency';
import { Plus, Edit, Trash2, Layers, Calculator, HelpCircle, Lock } from 'lucide-react';

const CATEGORIES = ['Basic', 'Allowances', 'Gross', 'Deductions', 'Net'];
const COMPUTATION_TYPES = ['Fixed Amount', 'Percentage', 'Formula'];

export default function SalaryRulesView() {
  const {
    salaryRules,
    salaryStructures,
    addSalaryRule,
    updateSalaryRule,
    deleteSalaryRule,
  } = useHRData();

  const { user } = useAuth();
  const isReadOnly = user?.role === ROLES.HR_PAYROLL_USER;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Form state
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [category, setCategory] = useState('Basic');
  const [sequence, setSequence] = useState(10);
  const [computationType, setComputationType] = useState('Percentage');
  const [amount, setAmount] = useState(50);
  const [formula, setFormula] = useState('contract.wage * 0.50');
  const [description, setDescription] = useState('');
  const [active, setActive] = useState(true);

  const openCreateModal = () => {
    setEditingRule(null);
    setName('');
    setCode('');
    setCategory('Allowances');
    setSequence((salaryRules.length + 1) * 10);
    setComputationType('Percentage');
    setAmount(10);
    setFormula('contract.wage * 0.10');
    setDescription('');
    setActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (rule) => {
    setEditingRule(rule);
    setName(rule.name);
    setCode(rule.code);
    setCategory(rule.category || 'Basic');
    setSequence(rule.sequence || 10);
    setComputationType(rule.computationType || 'Percentage');
    setAmount(rule.amount ?? 0);
    setFormula(rule.formula || '');
    setDescription(rule.description || '');
    setActive(rule.active !== false);
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const payload = {
      name,
      code,
      category,
      sequence: Number(sequence),
      computationType,
      amount: Number(amount) || 0,
      formula,
      description,
      active,
    };
    if (editingRule) {
      await updateSalaryRule(editingRule.id, payload);
    } else {
      await addSalaryRule(payload);
    }
    setIsModalOpen(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteSalaryRule(deleteTarget.id);
    setDeleteTarget(null);
  };

  // Sort rules strictly by sequence
  const sortedRules = [...salaryRules].sort((a, b) => (a.sequence || 0) - (b.sequence || 0));

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Salary Calculation Rules</h3>
          <p className="text-xs text-slate-500">
            Ordered computational algorithms that evaluate earnings, statutory deductions, and net wage.
          </p>
        </div>
        {!isReadOnly && (
          <button type="button" onClick={openCreateModal} className="btn-primary">
            <Plus className="h-4 w-4" />
            <span>Add Rule</span>
          </button>
        )}
      </div>

      {/* Read-Only Banner */}
      {isReadOnly && (
        <div className="flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50/60 px-4 py-2.5">
          <Lock className="h-4 w-4 text-blue-600 shrink-0" />
          <p className="text-xs text-blue-800">
            <strong>Read-only access.</strong> Your role (HR Payroll User) can view salary rules but cannot create, edit, or delete them. Contact an HR Payroll Manager to make changes.
          </p>
        </div>
      )}

      {/* Rules Table */}
      <div className="app-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left text-xs">
            <thead className="bg-slate-50/80 text-[10px] font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-100">
              <tr>
                <th className="px-5 py-3 w-20 text-center">Seq</th>
                <th className="px-3 py-3">Rule Name & Code</th>
                <th className="px-3 py-3">Category</th>
                <th className="px-3 py-3">Method</th>
                <th className="px-3 py-3">Computation Value / Formula</th>
                <th className="px-3 py-3">Used By Structures</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedRules.map((rule) => {
                const usedInStructures = salaryStructures.filter((s) =>
                  (s.ruleIds || []).includes(rule.id)
                );

                return (
                  <tr key={rule.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Visual Sequence Tag */}
                    <td className="px-5 py-3.5 text-center">
                      <span className="inline-flex h-7 w-9 items-center justify-center rounded-lg bg-slate-100 text-xs font-mono font-bold text-slate-800 border border-slate-200">
                        {rule.sequence}
                      </span>
                    </td>
                    <td className="px-3 py-3.5">
                      <div className="font-semibold text-slate-900">{rule.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{rule.code}</div>
                    </td>
                    <td className="px-3 py-3.5">
                      <span
                        className={`inline-flex rounded-md px-2 py-0.5 text-[10px] font-semibold ${
                          rule.category === 'Basic'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : rule.category === 'Allowances'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : rule.category === 'Deductions'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : rule.category === 'Gross'
                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                            : 'bg-brand-50 text-slate-900 border border-brand-200'
                        }`}
                      >
                        {rule.category}
                      </span>
                    </td>
                    <td className="px-3 py-3.5 text-slate-600 font-medium">
                      {rule.computationType}
                    </td>
                    <td className="px-3 py-3.5 font-mono text-[11px] text-slate-800">
                      {rule.computationType === 'Fixed Amount' && formatINR(rule.amount || 0)}
                      {rule.computationType === 'Percentage' && `${rule.amount}% of Base`}
                      {rule.computationType === 'Formula' && (
                        <span className="bg-slate-100 px-1.5 py-0.5 rounded text-[10px] text-slate-700">
                          {rule.formula}
                        </span>
                      )}
                    </td>
                    {/* Used By Structures */}
                    <td className="px-3 py-3.5">
                      <div className="flex flex-wrap items-center gap-1">
                        {usedInStructures.length === 0 ? (
                          <span className="text-[11px] text-slate-400">Unused</span>
                        ) : (
                          usedInStructures.map((s) => (
                            <span
                              key={s.id}
                              className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-700"
                              title={s.name}
                            >
                              {s.code}
                            </span>
                          ))
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-3.5">
                      <StatusBadge status={rule.active ? 'Active' : 'Inactive'} />
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {isReadOnly ? (
                          <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-500">
                            <Lock className="h-3 w-3" />
                            View Only
                          </span>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => openEditModal(rule)}
                              className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100"
                              title="Edit rule"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(rule)}
                              className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                              title="Delete rule"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Salary Rule Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingRule ? 'Edit Salary Rule' : 'Create Salary Rule'}
        maxWidth="max-w-xl sm:max-w-2xl"
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
              form="salary-rule-form"
              className="btn-primary"
            >
              {editingRule ? 'Save Changes' : 'Create Rule'}
            </button>
          </>
        )}
      >
        <form id="salary-rule-form" onSubmit={handleSave} className="space-y-3.5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700">Rule Name</label>
              <input
                type="text"
                required
                className="field-input text-xs py-1.5"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. House Rent Allowance"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700">Rule Code</label>
              <input
                type="text"
                required
                className="field-input text-xs uppercase py-1.5"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. HRA"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700">Category</label>
              <select
                className="field-input text-xs py-1.5"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Sequence Order (Execution)
              </label>
              <input
                type="number"
                required
                className="field-input text-xs py-1.5"
                value={sequence}
                onChange={(e) => setSequence(e.target.value)}
                placeholder="e.g. 10, 20, 30"
              />
              <p className="mt-0.5 text-[10px] text-slate-400">
                Lower numbers execute first in calculation order.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700">Computation Method</label>
              <select
                className="field-input text-xs py-1.5"
                value={computationType}
                onChange={(e) => setComputationType(e.target.value)}
              >
                {COMPUTATION_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                {computationType === 'Percentage' ? 'Percentage (%)' : 'Fixed Amount (₹)'}
              </label>
              <input
                type="number"
                step="any"
                className="field-input text-xs py-1.5"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={computationType === 'Formula'}
                placeholder={
                  computationType === 'Percentage'
                    ? 'e.g. 40'
                    : computationType === 'Formula'
                    ? ''
                    : 'e.g. 15,000'
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Formula Expression
              </label>
              <input
                type="text"
                className="field-input text-xs font-mono py-1.5"
                value={formula}
                onChange={(e) => setFormula(e.target.value)}
                placeholder="e.g. BASIC + HRA + TRANS"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Description</label>
              <input
                type="text"
                className="field-input text-xs py-1.5"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Regulatory basis, exemption..."
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="activeRuleCheck"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-400 cursor-pointer"
            />
            <label htmlFor="activeRuleCheck" className="text-xs font-medium text-slate-700 cursor-pointer">
              Active rule in salary calculations
            </label>
          </div>

        </form>
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Delete Salary Rule"
        message={`Are you sure you want to remove salary rule "${deleteTarget?.name}"?`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
