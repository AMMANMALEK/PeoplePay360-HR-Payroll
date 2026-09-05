import React, { useState, useMemo } from 'react';
import Modal from '../../components/ui/Modal';
import {
  PLATFORM_ROLES,
  MODULES,
  ROLE_PERMISSIONS_MATRIX,
  getPermissionMatrix
} from '../../constants/rbac';
import {
  ShieldCheck,
  KeyRound,
  Users,
  CheckCircle2,
  MinusCircle,
  Eye,
  Layers,
  ArrowRight,
  Shield,
  FileCheck,
  Check
} from 'lucide-react';

export default function RolesPermissionsPage() {
  const [activeTab, setActiveTab] = useState('roles'); // 'roles' | 'matrix'
  const [selectedRoleForDetail, setSelectedRoleForDetail] = useState(null);

  const permissionMatrix = useMemo(() => {
    return getPermissionMatrix();
  }, []);

  const rolesList = Object.values(PLATFORM_ROLES);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Roles & Permissions
          </h1>
          <p className="text-xs text-slate-500">
            Enterprise RBAC governance, module authorization levels, and platform access matrix.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center rounded-2xl bg-slate-100 p-1 border border-slate-200/80 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('roles')}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
              activeTab === 'roles'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <KeyRound className="h-3.5 w-3.5" />
            <span>Configured Roles (5)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('matrix')}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
              activeTab === 'matrix'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Permission Matrix</span>
          </button>
        </div>
      </div>

      {/* TAB 1: CONFIGURED ROLES CARDS */}
      {activeTab === 'roles' && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {rolesList.map((role) => {
            const isManager = role.code.includes('MANAGER');
            const isAdmin = role.code === 'ADMIN';

            return (
              <div
                key={role.code}
                className="app-card p-5 flex flex-col justify-between hover:border-slate-300 transition-all shadow-subtle"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-slate-900">{role.name}</h3>
                        <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-mono font-bold text-slate-600">
                          {role.badge}
                        </span>
                      </div>
                      <span className="inline-block mt-1 text-[11px] font-semibold text-indigo-700">
                        Scope: {role.scope}
                      </span>
                    </div>

                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-700">
                      {role.userCount} users
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 mt-2.5 leading-relaxed line-clamp-2">
                    {role.description}
                  </p>

                  {/* Permission Summary Breakdown */}
                  <div className="mt-4 border-t border-slate-100 pt-3 space-y-2 text-xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Permission Summary
                    </span>

                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div className="rounded-lg bg-slate-50 p-2">
                        <span className="text-slate-400 block text-[10px]">Workforce (HR)</span>
                        <span className="font-semibold text-slate-800">
                          {isAdmin || isManager ? 'Full access' : role.code === 'HR_PAYROLL_USER' ? 'Read-only' : 'Self-service'}
                        </span>
                      </div>
                      <div className="rounded-lg bg-slate-50 p-2">
                        <span className="text-slate-400 block text-[10px]">Payroll Engine</span>
                        <span className="font-semibold text-slate-800">
                          {isAdmin || role.code === 'HR_PAYROLL_MANAGER'
                            ? 'Full access'
                            : role.code === 'HR_PAYROLL_USER'
                            ? 'Run & Draft'
                            : '— No access'}
                        </span>
                      </div>
                      <div className="rounded-lg bg-slate-50 p-2">
                        <span className="text-slate-400 block text-[10px]">Salary Rules</span>
                        <span className="font-semibold text-slate-800">
                          {isAdmin || role.code === 'HR_PAYROLL_MANAGER' ? 'Full access' : '— No access'}
                        </span>
                      </div>
                      <div className="rounded-lg bg-slate-50 p-2">
                        <span className="text-slate-400 block text-[10px]">System Admin</span>
                        <span className="font-semibold text-slate-800">
                          {isAdmin ? 'Full control' : '— Restricted'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-mono">
                    Policy: {role.code}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedRoleForDetail(role)}
                    className="btn-secondary py-1 text-xs"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span>View Permissions</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: INTERACTIVE PERMISSION MATRIX */}
      {activeTab === 'matrix' && (
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-subtle">
          <div className="border-b border-slate-100 px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Enterprise Permission Matrix
              </h3>
              <p className="text-xs text-slate-500">
                Derived directly from centralized <code className="font-mono text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">src/constants/rbac.js</code> source of truth.
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1 font-bold text-emerald-700">
                <Check className="h-3.5 w-3.5 text-emerald-600" />
                <span>Allowed Action</span>
              </span>
              <span>·</span>
              <span className="flex items-center gap-1 text-slate-400">
                <span>— Denied</span>
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-[10px] font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3 w-56">Module</th>
                  {rolesList.map((role) => (
                    <th key={role.code} className="px-4 py-3 text-center min-w-[130px]">
                      <div className="font-bold text-slate-900">{role.name}</div>
                      <span className="text-[10px] font-mono text-slate-400 font-normal">
                        ({role.badge})
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {permissionMatrix.map(({ module: mod, permissions }) => (
                  <tr key={mod.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-slate-900">
                      <div className="font-bold text-slate-900">{mod.label}</div>
                      <div className="text-[10px] text-slate-400 line-clamp-1">{mod.description}</div>
                    </td>

                    {rolesList.map((role) => {
                      const rights = permissions[role.code];
                      const hasAny = rights.actions.length > 0;

                      return (
                        <td key={role.code} className="px-4 py-3.5 text-center whitespace-nowrap">
                          {hasAny ? (
                            <div className="inline-flex flex-wrap items-center justify-center gap-1">
                              {rights.canRead && (
                                <span className="rounded bg-slate-100 border border-slate-200 px-1 py-0.2 text-[9px] font-mono font-semibold text-slate-700" title="Read permission">
                                  R
                                </span>
                              )}
                              {rights.canCreate && (
                                <span className="rounded bg-emerald-50 border border-emerald-200 px-1 py-0.2 text-[9px] font-mono font-semibold text-emerald-700" title="Create permission">
                                  C
                                </span>
                              )}
                              {rights.canUpdate && (
                                <span className="rounded bg-indigo-50 border border-indigo-200 px-1 py-0.2 text-[9px] font-mono font-semibold text-indigo-700" title="Update permission">
                                  U
                                </span>
                              )}
                              {rights.canDelete && (
                                <span className="rounded bg-rose-50 border border-rose-200 px-1 py-0.2 text-[9px] font-mono font-semibold text-rose-700" title="Delete permission">
                                  D
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-300 font-bold">—</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ROLE DETAIL DRAWER */}
      {selectedRoleForDetail && (
        <Modal
          isOpen={Boolean(selectedRoleForDetail)}
          onClose={() => setSelectedRoleForDetail(null)}
          title={`Role Details: ${selectedRoleForDetail.name}`}
          description={`Scope: ${selectedRoleForDetail.scope} · ${selectedRoleForDetail.userCount} assigned users`}
          maxWidth="max-w-2xl"
          footer={(
            <div className="flex items-center justify-end w-full">
              <button
                type="button"
                onClick={() => setSelectedRoleForDetail(null)}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Close
              </button>
            </div>
          )}
        >
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Role Purpose
              </span>
              <p className="text-xs text-slate-700 leading-relaxed">
                {selectedRoleForDetail.description}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
              <div className="bg-slate-50/80 px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Module Action Capabilities
                </span>
                <span className="font-mono text-[11px] text-slate-500">
                  Policy: {selectedRoleForDetail.code}
                </span>
              </div>

              <div className="divide-y divide-slate-100 text-xs">
                {Object.values(MODULES).map((mod) => {
                  const allowedActions =
                    ROLE_PERMISSIONS_MATRIX[selectedRoleForDetail.code]?.[mod.id] || [];

                  return (
                    <div key={mod.id} className="px-4 py-2.5 flex items-center justify-between">
                      <div>
                        <span className="font-semibold text-slate-800">{mod.label}</span>
                        <span className="text-[10px] text-slate-400 block">{mod.category}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {allowedActions.length === 0 ? (
                          <span className="text-slate-400 italic text-[11px]">No access</span>
                        ) : (
                          ['create', 'read', 'update', 'delete'].map((act) => {
                            const isAllowed = allowedActions.includes(act);
                            return (
                              <span
                                key={act}
                                className={`inline-flex items-center gap-0.5 rounded px-2 py-0.5 text-[10px] font-semibold uppercase ${
                                  isAllowed
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold'
                                    : 'bg-slate-100 text-slate-400'
                                }`}
                              >
                                {isAllowed ? '✓ ' : '— '}
                                {act}
                              </span>
                            );
                          })
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
