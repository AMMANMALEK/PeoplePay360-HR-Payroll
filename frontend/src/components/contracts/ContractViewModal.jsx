import React from 'react';
import Modal from '../ui/Modal';
import StatusBadge from '../ui/StatusBadge';
import { Calendar, IndianRupee, Briefcase, Building, User, Clock, Edit3, X } from 'lucide-react';
import { formatINR } from '../../utils/formatCurrency';

export default function ContractViewModal({ isOpen, onClose, contract, computedStatus, onEdit }) {
  if (!contract) return null;

  const statusToDisplay = computedStatus || contract.status || 'Active';

  const formatWage = (wage, structure) => {
    if (!wage && wage !== 0) return '—';
    const num = typeof wage === 'number' ? wage : Number(String(wage).replace(/[^0-9.]/g, ''));
    const formatted = Number.isFinite(num) && num > 0 ? formatINR(num) : wage;
    return `${formatted} / ${structure || 'annually'}`;
  };

  const getDaysRemaining = () => {
    if (!contract.endDate) return 'Ongoing open-ended term';
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const end = new Date(contract.endDate);
    end.setHours(0, 0, 0, 0);
    const diff = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diff < 0) return `Term ended ${Math.abs(diff)} day${Math.abs(diff) === 1 ? '' : 's'} ago`;
    if (diff === 0) return 'Term ends today';
    return `Ends in ${diff} day${diff === 1 ? '' : 's'}`;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Employment Agreement Details"
      description={`Viewing terms and parameters for contract ${contract.id || contract.contractCode}`}
      maxWidth="max-w-xl"
    >
      <div className="space-y-5">
        {/* Top Header Card */}
        <div className="flex items-start justify-between rounded-xl border border-slate-200 bg-slate-50/70 p-4">
          <div className="space-y-1">
            <span className="font-mono text-xs font-bold text-slate-500">{contract.id || contract.contractCode}</span>
            <h3 className="text-base font-bold text-slate-900">{contract.contractName || 'Employment Contract'}</h3>
            <p className="text-xs text-slate-600 flex items-center gap-1.5">
              <Briefcase className="h-3.5 w-3.5 text-slate-400" />
              {contract.position || contract.jobPosition || 'Role not specified'} • {contract.department || 'Department'}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <StatusBadge status={statusToDisplay} size="md" />
            <span className="text-[11px] font-medium text-slate-500">{getDaysRemaining()}</span>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Employee Info */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 space-y-2 shadow-2xs">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <User className="h-3.5 w-3.5 text-indigo-500" />
              <span>Assigned Employee</span>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">{contract.employeeName || '—'}</p>
              <p className="text-xs font-mono text-slate-500">ID: {contract.employeeId || '—'}</p>
            </div>
          </div>

          {/* Department */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 space-y-2 shadow-2xs">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <Building className="h-3.5 w-3.5 text-emerald-500" />
              <span>Department & Division</span>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">{contract.department || '—'}</p>
              <p className="text-xs text-slate-500">Position: {contract.position || contract.jobPosition || '—'}</p>
            </div>
          </div>

          {/* Term Period */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 space-y-2 shadow-2xs">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <Calendar className="h-3.5 w-3.5 text-sky-500" />
              <span>Term Period</span>
            </div>
            <div>
              <p className="text-xs text-slate-700">
                <span className="font-semibold text-slate-900">Start Date:</span> {contract.startDate || '—'}
              </p>
              <p className="text-xs text-slate-700 mt-1">
                <span className="font-semibold text-slate-900">End Date:</span> {contract.endDate || 'Open-ended (No expiry)'}
              </p>
            </div>
          </div>

          {/* Compensation */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 space-y-2 shadow-2xs">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <IndianRupee className="h-3.5 w-3.5 text-amber-500" />
              <span>Compensation</span>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">
                {formatWage(contract.wage ?? contract.wageAmount, contract.salaryStructure || contract.wageType)}
              </p>
              <p className="text-xs text-slate-500">Structure: <span className="font-semibold text-slate-700">{contract.salaryStructure || 'annually'}</span></p>
            </div>
          </div>
        </div>

        {/* Contract Notes */}
        {contract.notes && (
          <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 space-y-1 shadow-2xs">
            <p className="text-xs font-semibold text-slate-700">Contract Stipulations & Notes</p>
            <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">{contract.notes}</p>
          </div>
        )}

        {/* Modal Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Close
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              if (onEdit) onEdit(contract);
            }}
            className="btn-primary flex items-center gap-1.5"
          >
            <Edit3 className="h-3.5 w-3.5" />
            Edit Contract
          </button>
        </div>
      </div>
    </Modal>
  );
}
