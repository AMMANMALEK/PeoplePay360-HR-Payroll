import React, { useState, useMemo } from 'react';
import StatusBadge from '../ui/StatusBadge';
import FilterBar from '../ui/FilterBar';
import EmptyState from '../ui/EmptyState';
import ConfirmDialog from '../ui/ConfirmDialog';
import { useHRData } from '../../context/HRDataContext';
import { formatINR } from '../../utils/formatCurrency';
import {
  Plus,
  Play,
  Trash2,
  Calendar,
  Layers,
  Search,
  SlidersHorizontal,
  ChevronRight,
  Calculator,
  CreditCard,
  Send,
  AlertCircle
} from 'lucide-react';

export default function PayrunListView({ onOpenWizard, onOpenProcess }) {
  const { payruns, deletePayrun } = useHRData();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [structureFilter, setStructureFilter] = useState('All');
  const [deleteTarget, setDeleteTarget] = useState(null);

  const structuresList = useMemo(() => {
    return [...new Set(payruns.map((p) => p.salaryStructureName).filter(Boolean))];
  }, [payruns]);

  const filteredPayruns = useMemo(() => {
    return payruns.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.periodName.toLowerCase().includes(search.toLowerCase()) ||
        p.id.toLowerCase().includes(search.toLowerCase());

      const matchStatus =
        statusFilter === 'All' || p.status.toLowerCase() === statusFilter.toLowerCase();

      const matchStructure =
        structureFilter === 'All' || p.salaryStructureName === structureFilter;

      return matchSearch && matchStatus && matchStructure;
    });
  }, [payruns, search, statusFilter, structureFilter]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deletePayrun(deleteTarget.id);
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-4">
      {/* Action and Filter Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Input */}
          <div className="relative min-w-[220px]">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              className="field-input pl-8 py-1.5 text-xs"
              placeholder="Search payrun batches..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Status Filter */}
          <select
            className="field-input py-1.5 text-xs w-auto min-w-[130px]"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Draft">Draft</option>
            <option value="Computed">Computed</option>
            <option value="Validated">Validated</option>
            <option value="Paid">Paid</option>
          </select>

          {/* Structure Filter */}
          {structuresList.length > 0 && (
            <select
              className="field-input py-1.5 text-xs w-auto min-w-[150px]"
              value={structureFilter}
              onChange={(e) => setStructureFilter(e.target.value)}
            >
              <option value="All">All Structures</option>
              {structuresList.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Primary Action Button */}
        <button
          type="button"
          onClick={onOpenWizard}
          className="btn-primary shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>New Payrun</span>
        </button>
      </div>

      {/* Payrun Table */}
      <div className="app-card overflow-hidden">
        {filteredPayruns.length === 0 ? (
          <EmptyState
            title="No payruns found"
            description="No payrun batches match your current search or filter criteria."
            actionLabel="Create Payrun"
            onAction={onOpenWizard}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left text-xs">
              <thead className="bg-slate-50/80 text-[10px] font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3">Payrun Batch</th>
                  <th className="px-3 py-3">Salary Structure</th>
                  <th className="px-3 py-3">Accounting Period</th>
                  <th className="px-3 py-3 text-center">Employees</th>
                  <th className="px-3 py-3 text-center">Payslips</th>
                  <th className="px-3 py-3 text-right">Net Salary</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPayruns.map((payrun) => (
                  <tr
                    key={payrun.id}
                    className="hover:bg-slate-50/70 transition-colors cursor-pointer group"
                    onClick={() => onOpenProcess(payrun)}
                  >
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-slate-900 group-hover:text-brand-900">
                        {payrun.name}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">{payrun.id}</div>
                    </td>
                    <td className="px-3 py-3.5 text-slate-700">
                      <div className="flex items-center gap-1.5">
                        <Layers className="h-3 w-3 text-slate-400 shrink-0" />
                        <span>{payrun.salaryStructureName || 'Standard'}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3.5 text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3 w-3 text-slate-400 shrink-0" />
                        <span>{payrun.periodName}</span>
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {payrun.periodStart} to {payrun.periodEnd}
                      </div>
                    </td>
                    <td className="px-3 py-3.5 text-center font-medium text-slate-800">
                      {payrun.employeesCount}
                    </td>
                    <td className="px-3 py-3.5 text-center font-medium text-slate-800">
                      {payrun.payslipsCount}
                    </td>
                    <td className="px-3 py-3.5 text-right font-bold text-slate-900">
                      {formatINR(payrun.totalNet || 0)}
                    </td>
                    <td className="px-3 py-3.5">
                      <StatusBadge status={payrun.status} />
                    </td>
                    <td
                      className="px-5 py-3.5 text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => onOpenProcess(payrun)}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 shadow-subtle"
                        >
                          <span>Process</span>
                          <ChevronRight className="h-3.5 w-3.5" />
                        </button>
                        {payrun.status === 'Draft' && (
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(payrun)}
                            className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                            title="Delete draft payrun"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Delete Payrun Batch"
        message={`Are you sure you want to permanently delete payrun "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel="Delete Payrun"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
