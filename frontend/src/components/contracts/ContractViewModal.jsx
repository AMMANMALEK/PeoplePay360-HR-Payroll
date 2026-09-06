import React from 'react';
import Modal from '../ui/Modal';
import StatusBadge from '../ui/StatusBadge';
import { Calendar, IndianRupee, Briefcase, Building, User, Clock, Edit3, X } from 'lucide-react';
import { formatINR } from '../../utils/formatCurrency';

const getText = (val, fallback = '') => {
  if (val == null) return fallback;
  if (typeof val === 'string' || typeof val === 'number') return String(val);
  if (typeof val === 'object') {
    return val.name || val.title || val.code || val.label || val.contractName || val.id || fallback;
  }
  return fallback;
};

export default function ContractViewModal({ isOpen, onClose, contract, computedStatus, onEdit }) {
  if (!contract) return null;

  const statusToDisplay = computedStatus || contract.status || 'Active';
  const cId = getText(contract.id || contract.contractCode || contract._id, '—');
  const cName = getText(contract.contractName, 'Employment Contract');
  const position = getText(contract.position || contract.jobPosition, 'Role not specified');
  const department = getText(contract.department, 'Department');
  const empName = getText(contract.employeeName, '—');
  const empId = getText(contract.employeeId || contract.employeeCode, '—');
  const startDate = getText(contract.startDate, '—');
  const endDate = getText(contract.endDate, 'Open-ended (No expiry)');
  const structure = getText(contract.salaryStructure || contract.wageType, 'annually');

  const formatWage = (wage, struct) => {
    if (!wage && wage !== 0) return '—';
    const rawWage = typeof wage === 'object' && wage !== null ? wage.amount || wage.wage : wage;
    const num = typeof rawWage === 'number' ? rawWage : Number(String(rawWage).replace(/[^0-9.]/g, ''));
    const formatted = Number.isFinite(num) && num > 0 ? formatINR(num) : getText(rawWage, '—');
    return `${formatted} / ${struct || 'annually'}`;
  };

  const getDaysRemaining = () => {
    if (!contract.endDate || typeof contract.endDate !== 'string') return 'Ongoing open-ended term';
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const end = new Date(contract.endDate);
      if (isNaN(end.getTime())) return 'Ongoing open-ended term';
      end.setHours(0, 0, 0, 0);
      const diff = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      if (diff < 0) return `Term ended ${Math.abs(diff)} day${Math.abs(diff) === 1 ? '' : 's'} ago`;
      if (diff === 0) return 'Term ends today';
      return `Ends in ${diff} day${diff === 1 ? '' : 's'}`;
    } catch {
      return 'Ongoing open-ended term';
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Employment Agreement Details"
      description={`Viewing terms and parameters for contract ${cId}`}
      maxWidth="max-w-xl"
    >
      <div className="space-y-5">
        {/* Top Header Card */}
        <div className="flex items-start justify-between rounded-xl border border-slate-200 bg-slate-50/70 p-4">
          <div className="space-y-1">
            <span className="font-mono text-xs font-bold text-slate-500">{cId}</span>
            <h3 className="text-base font-bold text-slate-900">{cName}</h3>
            <p className="text-xs text-slate-600 flex items-center gap-1.5">
              <Briefcase className="h-3.5 w-3.5 text-slate-400" />
              {position} • {department}
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
              <p className="text-sm font-bold text-slate-900">{empName}</p>
              <p className="text-xs font-mono text-slate-500">ID: {empId}</p>
            </div>
          </div>

          {/* Department */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 space-y-2 shadow-2xs">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <Building className="h-3.5 w-3.5 text-emerald-500" />
              <span>Department & Division</span>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">{department}</p>
              <p className="text-xs text-slate-500">Position: {position}</p>
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
                <span className="font-semibold text-slate-900">Start Date:</span> {startDate}
              </p>
              <p className="text-xs text-slate-700 mt-1">
                <span className="font-semibold text-slate-900">End Date:</span> {endDate}
              </p>
            </div>
          </div>

          {/* Compensation Summary */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 space-y-2 shadow-2xs">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <IndianRupee className="h-3.5 w-3.5 text-amber-500" />
              <span>Gross Compensation</span>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">
                {formatWage(contract.wage ?? contract.wageAmount, structure)}
              </p>
              <p className="text-xs text-slate-500">Structure: <span className="font-semibold text-slate-700">{structure}</span></p>
            </div>
          </div>
        </div>

        {/* Salary Discussion Breakdown Card */}
        <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-indigo-100 pb-2">
            <h4 className="text-xs font-bold text-slate-900">Agreed Salary Discussion Structure</h4>
            <span className="text-[10px] font-bold text-indigo-700 uppercase bg-indigo-100/70 px-2 py-0.5 rounded">
              Monthly Basis
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="rounded-lg bg-white p-2 border border-slate-100 shadow-2xs">
              <span className="text-[10px] text-slate-500 block">Base Salary</span>
              <span className="font-bold text-slate-900">{formatINR(contract.basicSalary || (Number(contract.wageAmount || contract.wage || 0) * 0.5))}</span>
            </div>
            <div className="rounded-lg bg-white p-2 border border-slate-100 shadow-2xs">
              <span className="text-[10px] text-slate-500 block">HRA</span>
              <span className="font-bold text-slate-900">{formatINR(contract.hra || (Number(contract.wageAmount || contract.wage || 0) * 0.25))}</span>
            </div>
            <div className="rounded-lg bg-white p-2 border border-slate-100 shadow-2xs">
              <span className="text-[10px] text-slate-500 block">Allowances</span>
              <span className="font-bold text-slate-900">{formatINR(contract.specialAllowance || (Number(contract.wageAmount || contract.wage || 0) * 0.15))}</span>
            </div>
            <div className="rounded-lg bg-white p-2 border border-slate-100 shadow-2xs">
              <span className="text-[10px] text-slate-500 block">Bonus / Variable</span>
              <span className="font-bold text-slate-900">{formatINR(contract.bonus || 0)}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs pt-1">
            <div className="rounded-lg bg-rose-50/50 p-2 border border-rose-100">
              <span className="text-[10px] text-rose-600 block">Provident Fund (PF)</span>
              <span className="font-bold text-rose-700">- {formatINR(contract.pfDeduction || Math.round((Number(contract.basicSalary || 0) || Number(contract.wageAmount || 0) * 0.5) * 0.12))}</span>
            </div>
            <div className="rounded-lg bg-rose-50/50 p-2 border border-rose-100">
              <span className="text-[10px] text-rose-600 block">Tax Deductions</span>
              <span className="font-bold text-rose-700">- {formatINR((Number(contract.professionalTax) || 200) + (Number(contract.tdsDeduction) || Math.round(Number(contract.wageAmount || 0) * 0.1)))}</span>
            </div>
            <div className="col-span-2 sm:col-span-1 rounded-lg bg-emerald-50 p-2 border border-emerald-200">
              <span className="text-[10px] text-emerald-700 block font-semibold">Net Take-Home Pay</span>
              <span className="font-extrabold text-emerald-800">
                {formatINR(
                  Math.max(
                    0,
                    (Number(contract.wageAmount || contract.wage) ||
                      (Number(contract.basicSalary || 0) + Number(contract.hra || 0) + Number(contract.specialAllowance || 0) + Number(contract.bonus || 0))) -
                    ((Number(contract.pfDeduction) || Math.round((Number(contract.basicSalary || 0) || Number(contract.wageAmount || 0) * 0.5) * 0.12)) +
                     (Number(contract.professionalTax) || 200) +
                     (Number(contract.tdsDeduction) || Math.round(Number(contract.wageAmount || 0) * 0.1)))
                  )
                )}
              </span>
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
