import React from 'react';
import Modal from '../ui/Modal';
import { ShieldAlert, ArrowRight } from 'lucide-react';
import { PLATFORM_ROLES } from '../../constants/rbac';

export default function RoleChangeDialog({
  isOpen,
  onClose,
  user,
  newRoleCode,
  onConfirm,
  isProcessing = false
}) {
  if (!user || !newRoleCode) return null;

  const previousRole = PLATFORM_ROLES[user.role] || { name: user.role };
  const targetRole = PLATFORM_ROLES[newRoleCode] || { name: newRoleCode };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Change Role?"
      description="Administrative permission modification confirmation"
      maxWidth="max-w-md"
      isDialog={true}
    >
      <div className="space-y-4">
        <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 text-xs">
          <div className="flex items-center gap-2 font-bold text-amber-900 mb-2">
            <ShieldAlert className="h-4 w-4 text-amber-600 shrink-0" />
            <span>Role Reassignment Governance</span>
          </div>
          <p className="text-amber-800 leading-relaxed">
            <strong className="text-slate-900">{user.name}</strong> will change from:
          </p>

          <div className="my-3 flex items-center justify-center gap-3 rounded-lg bg-white/90 border border-amber-200/80 py-2.5 px-3">
            <span className="font-semibold text-slate-700 text-xs">{previousRole.name}</span>
            <ArrowRight className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span className="font-bold text-indigo-700 text-xs">{targetRole.name}</span>
          </div>

          <p className="text-amber-800 leading-relaxed text-[11px]">
            This will change the platform permissions, module rights, and administrative capabilities available to this user immediately.
          </p>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            disabled={isProcessing}
            onClick={onClose}
            className="rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isProcessing}
            onClick={onConfirm}
            className="btn-primary"
          >
            {isProcessing ? 'Updating...' : 'Confirm Role Change'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
