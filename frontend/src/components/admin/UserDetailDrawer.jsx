import React, { useState } from 'react';
import Modal from '../ui/Modal';
import StatusBadge from '../ui/StatusBadge';
import ConfirmDialog from '../ui/ConfirmDialog';
import RoleChangeDialog from './RoleChangeDialog';
import { useHRData } from '../../context/HRDataContext';
import { PLATFORM_ROLES, getRoleAccessSummary } from '../../constants/rbac';
import {
  User,
  Mail,
  Building,
  Shield,
  Clock,
  CheckCircle2,
  MinusCircle,
  AlertTriangle,
  Edit2,
  UserX,
  UserCheck,
  Trash2
} from 'lucide-react';

export default function UserDetailDrawer({
  isOpen,
  onClose,
  user,
  onEditUser
}) {
  const { changeUserRole, deactivateUser, activateUser, deleteUser } = useHRData();

  const [selectedRole, setSelectedRole] = useState(user?.role || 'EMPLOYEE');
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [pendingRoleCode, setPendingRoleCode] = useState(null);
  const [isDeactivateConfirmOpen, setIsDeactivateConfirmOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  React.useEffect(() => {
    if (user) {
      setSelectedRole(user.role);
    }
  }, [user]);

  if (!user) return null;

  const currentRoleInfo = PLATFORM_ROLES[user.role] || { name: user.role, scope: 'User' };
  const accessSummary = getRoleAccessSummary(user.role);

  const handleRoleSelectChange = (e) => {
    const newRole = e.target.value;
    if (newRole !== user.role) {
      setPendingRoleCode(newRole);
      setIsRoleDialogOpen(true);
    }
  };

  const handleConfirmRoleChange = async () => {
    if (!pendingRoleCode) return;
    setIsProcessing(true);
    try {
      await changeUserRole(user.id, pendingRoleCode);
      setSelectedRole(pendingRoleCode);
      setIsRoleDialogOpen(false);
      setPendingRoleCode(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleToggleStatus = async () => {
    setIsProcessing(true);
    try {
      if (user.status === 'Active') {
        await deactivateUser(user.id);
      } else {
        await activateUser(user.id);
      }
      setIsDeactivateConfirmOpen(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteUser = async () => {
    setIsProcessing(true);
    try {
      await deleteUser(user.id);
      setIsDeleteConfirmOpen(false);
      onClose();
    } finally {
      setIsProcessing(false);
    }
  };

  const drawerFooter = (
    <div className="flex w-full items-center justify-between">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setIsDeactivateConfirmOpen(true)}
          disabled={isProcessing}
          className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
            user.status === 'Active'
              ? 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100'
              : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
          }`}
        >
          {user.status === 'Active' ? (
            <>
              <UserX className="h-3.5 w-3.5" />
              <span>Deactivate Account</span>
            </>
          ) : (
            <>
              <UserCheck className="h-3.5 w-3.5" />
              <span>Activate Account</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={() => setIsDeleteConfirmOpen(true)}
          disabled={isProcessing}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
          title="Permanently delete user"
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span>Delete</span>
        </button>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => {
            onClose();
            if (onEditUser) onEditUser(user);
          }}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
        >
          <Edit2 className="h-3.5 w-3.5 text-slate-500" />
          <span>Edit Profile</span>
        </button>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
        >
          Close
        </button>
      </div>
    </div>
  );

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="User Profile & Access Governance"
        description="Comprehensive role capabilities and administrative authorization breakdown"
        maxWidth="max-w-xl sm:max-w-2xl"
        footer={drawerFooter}
      >
        <div className="space-y-4">
          {/* User Profile Card */}
          <div className="rounded-2xl border border-slate-200/90 bg-slate-50/70 p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3.5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 font-bold text-white shadow-sm text-base">
                  {user.avatarInitials || user.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">{user.name}</h3>
                    <StatusBadge status={user.status} />
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Mail className="h-3.5 w-3.5 text-slate-400" />
                      {user.email}
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Building className="h-3.5 w-3.5 text-slate-400" />
                      {user.department}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-right text-xs">
                <span className="text-[10px] text-slate-400 block font-medium">Last Active</span>
                <span className="font-semibold text-slate-700">{user.lastActive}</span>
              </div>
            </div>
          </div>

          {/* Role Governance & Reassignment Bar */}
          <div className="rounded-xl border border-indigo-200 bg-indigo-50/60 p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-indigo-950 block">Assigned Platform Role</span>
                <p className="text-[11px] text-indigo-700 mt-0.5">
                  Scope: <strong className="text-slate-900">{currentRoleInfo.scope}</strong> — {currentRoleInfo.description}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <label htmlFor="role-select" className="sr-only">Change Role</label>
                <select
                  id="role-select"
                  value={user.role}
                  onChange={handleRoleSelectChange}
                  className="rounded-lg border border-indigo-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-900 shadow-sm focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 cursor-pointer"
                >
                  {Object.values(PLATFORM_ROLES).map((r) => (
                    <option key={r.code} value={r.code}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Centralized Dynamic Access Summary */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-3">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Access Summary
                </h4>
                <p className="text-[11px] text-slate-400">
                  Computed dynamically from centralized RBAC policy engine
                </p>
              </div>
              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-mono font-semibold text-slate-600">
                Policy: {user.role}
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {accessSummary.map((item) => (
                <div key={item.name} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-slate-800 block">{item.name}</span>
                    <span className="text-[11px] text-slate-400">{item.description}</span>
                  </div>
                  <div>
                    {item.granted ? (
                      <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded px-2 py-0.5 text-[11px]">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                        <span>✓ Allowed</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 font-medium text-slate-400 bg-slate-100 border border-slate-200 rounded px-2 py-0.5 text-[11px]">
                        <MinusCircle className="h-3.5 w-3.5 text-slate-400" />
                        <span>— Not allowed</span>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Governance Notice */}
          <div className="flex items-start gap-2.5 rounded-xl border border-slate-200 bg-slate-50 p-3 text-[11px] text-slate-600">
            <Shield className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong className="text-slate-900">RBAC Governance:</strong> Role updates take effect on the user&apos;s next session token exchange. All role modifications are cryptographically signed and logged in the immutable Audit Log.
            </p>
          </div>
        </div>
      </Modal>

      {/* Confirmation Dialog for Role Modification */}
      <RoleChangeDialog
        isOpen={isRoleDialogOpen}
        onClose={() => {
          setIsRoleDialogOpen(false);
          setPendingRoleCode(null);
        }}
        user={user}
        newRoleCode={pendingRoleCode}
        onConfirm={handleConfirmRoleChange}
        isProcessing={isProcessing}
      />

      {/* Confirmation Dialog for Deactivate / Activate */}
      <ConfirmDialog
        isOpen={isDeactivateConfirmOpen}
        onClose={() => setIsDeactivateConfirmOpen(false)}
        title={user.status === 'Active' ? 'Deactivate User Account?' : 'Activate User Account?'}
        message={
          user.status === 'Active'
            ? `${user.name} will immediately lose authorization to log in and access system services.`
            : `Restore platform access authorization for ${user.name}.`
        }
        confirmLabel={user.status === 'Active' ? 'Deactivate User' : 'Activate User'}
        confirmVariant={user.status === 'Active' ? 'danger' : 'primary'}
        onConfirm={handleToggleStatus}
      />

      {/* Confirmation Dialog for User Deletion */}
      <ConfirmDialog
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        title="Delete User Account"
        message={`Are you sure you want to permanently delete user "${user.name}" (${user.email})? This action cannot be undone.`}
        confirmLabel="Delete User"
        isDestructive={true}
        onConfirm={handleDeleteUser}
      />
    </>
  );
}
