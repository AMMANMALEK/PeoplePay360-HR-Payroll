import React from 'react';
import { AlertTriangle, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ContractConflictAlert({
  message,
  overlappingContract = null,
  onCancel = null
}) {
  const navigate = useNavigate();

  if (!overlappingContract && !message) return null;

  return (
    <div className="rounded-xl border-2 border-rose-300 bg-rose-50/90 p-4 text-rose-950 shadow-sm animate-in fade-in duration-200 space-y-3">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-rose-200 text-rose-800">
          <AlertTriangle className="h-4 w-4" />
        </div>
        <div className="space-y-1">
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-rose-900 flex items-center gap-1.5">
            ⚠ CONTRACT CONFLICT DETECTED
          </h4>
          <p className="text-xs text-rose-800 leading-relaxed font-medium">
            This employee already has an active contract covering the selected period. An employee cannot have multiple concurrent active contracts.
          </p>

          {overlappingContract && (
            <div className="mt-2 rounded-lg border border-rose-200 bg-white/90 p-3 text-xs text-rose-950 space-y-1">
              <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider block">
                Existing Active Contract:
              </span>
              <div className="font-bold text-slate-900 flex items-center justify-between">
                <span>{overlappingContract.id} ({overlappingContract.contractName})</span>
                <span className="font-mono text-[11px] text-rose-700 font-semibold">{overlappingContract.status}</span>
              </div>
              <div className="text-[11px] text-slate-600 font-mono">
                {overlappingContract.startDate} → {overlappingContract.endDate || 'Ongoing'}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 border-t border-rose-200/70 pt-2.5">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-rose-300 bg-white px-3 py-1.5 text-xs font-semibold text-rose-800 hover:bg-rose-100/60 transition-colors"
          >
            Cancel
          </button>
        )}
        {overlappingContract && (
          <button
            type="button"
            onClick={() => navigate(`/employees/${overlappingContract.employeeId}`)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-rose-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-800 transition-colors shadow-sm"
          >
            <span>View Existing Contract</span>
            <ExternalLink className="h-3 w-3" />
          </button>
        )}
      </div>
    </div>
  );
}
