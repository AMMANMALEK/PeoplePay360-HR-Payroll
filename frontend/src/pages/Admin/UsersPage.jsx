import React, { useState, useMemo } from 'react';
import FilterBar from '../../components/ui/FilterBar';
import StatusBadge from '../../components/ui/StatusBadge';
import EmptyState from '../../components/ui/EmptyState';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import UserFormModal from '../../components/admin/UserFormModal';
import UserDetailDrawer from '../../components/admin/UserDetailDrawer';
import RoleChangeDialog from '../../components/admin/RoleChangeDialog';
import { useHRData } from '../../context/HRDataContext';
import { PLATFORM_ROLES } from '../../constants/rbac';
import {
  UserPlus,
  Eye,
  Edit2,
  Shield,
  UserX,
  UserCheck,
  Building,
  Mail,
  ShieldAlert,
  ArrowRight,
  Trash2
} from 'lucide-react';

export default function UsersPage() {
  const { users, departments, deactivateUser, activateUser, changeUserRole, deleteUser } = useHRData();

  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState({
    role: 'All',
    status: 'All',
    department: 'All'
  });

  // Modal and Drawer States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [viewingUser, setViewingUser] = useState(null);

  // Role Change Confirmation Dialog
  const [roleChangeTarget, setRoleChangeTarget] = useState(null);
  const [targetNewRole, setTargetNewRole] = useState(null);

  // Deactivate Confirmation Dialog
  const [deactivateTarget, setDeactivateTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFilterChange = (key, value) => {
    setActiveFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleClearAll = () => {
    setSearchQuery('');
    setActiveFilters({ role: 'All', status: 'All', department: 'All' });
  };

  // Filter Configuration
  const filterConfig = [
    {
      key: 'role',
      label: 'Role',
      options: [
        { label: 'Employee', value: 'EMPLOYEE' },
        { label: 'HR Manager', value: 'HR_MANAGER' },
        { label: 'HR Payroll User', value: 'HR_PAYROLL_USER' },
        { label: 'HR Payroll Manager', value: 'HR_PAYROLL_MANAGER' },
        { label: 'Admin', value: 'ADMIN' }
      ]
    },
    {
      key: 'status',
      label: 'Status',
      options: [
        { label: 'Active', value: 'Active' },
        { label: 'Inactive', value: 'Inactive' }
      ]
    },
    {
      key: 'department',
      label: 'Department',
      options: departments.map((d) => ({ label: d, value: d }))
    }
  ];

  // Filtered Users List
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      // Search matching
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = u.name.toLowerCase().includes(q);
        const matchesEmail = u.email.toLowerCase().includes(q);
        const matchesDept = u.department?.toLowerCase().includes(q);
        if (!matchesName && !matchesEmail && !matchesDept) return false;
      }

      // Role Filter
      if (activeFilters.role !== 'All' && u.role !== activeFilters.role) {
        return false;
      }

      // Status Filter
      if (activeFilters.status !== 'All' && u.status !== activeFilters.status) {
        return false;
      }

      // Department Filter
      if (activeFilters.department !== 'All' && u.department !== activeFilters.department) {
        return false;
      }

      return true;
    });
  }, [users, searchQuery, activeFilters]);

  const handleOpenCreateModal = () => {
    setEditingUser(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (user) => {
    setEditingUser(user);
    setIsFormModalOpen(true);
  };

  const handleDeactivateConfirm = async () => {
    if (!deactivateTarget) return;
    setIsProcessing(true);
    try {
      if (deactivateTarget.status === 'Active') {
        await deactivateUser(deactivateTarget.id);
      } else {
        await activateUser(deactivateTarget.id);
      }
      setDeactivateTarget(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmRoleChange = async () => {
    if (!roleChangeTarget || !targetNewRole) return;
    setIsProcessing(true);
    try {
      await changeUserRole(roleChangeTarget.id, targetNewRole);
      setRoleChangeTarget(null);
      setTargetNewRole(null);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Users</h1>
          <p className="text-xs text-slate-500">
            Manage platform users, authorization credentials, and assigned organizational roles.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreateModal}
          className="btn-primary shrink-0"
        >
          <UserPlus className="h-4 w-4" />
          <span>New User</span>
        </button>
      </div>

      {/* Filter Bar */}
      <FilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search users by name, email, or department..."
        filters={filterConfig}
        activeFilters={activeFilters}
        onFilterChange={handleFilterChange}
        onClearAll={handleClearAll}
      />

      {/* Users Data Table */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-subtle">
        {filteredUsers.length === 0 ? (
          <EmptyState
            title="No matching users found"
            description="Try clearing your search query or adjusting role and department filters."
            actionLabel="Clear Filters"
            onAction={handleClearAll}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-[10px] font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3">User</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Last Active</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((user) => {
                  const roleObj = PLATFORM_ROLES[user.role] || { name: user.role };
                  return (
                    <tr key={user.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* User Avatar + Name */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 border border-indigo-100 text-xs font-bold text-indigo-700">
                            {user.avatarInitials || user.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-900 block">{user.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{user.id}</span>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-4 py-3.5 text-slate-600 font-mono text-[11px]">
                        {user.email}
                      </td>

                      {/* Role Badge */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold border ${
                            user.role === 'ADMIN'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : user.role === 'HR_PAYROLL_MANAGER'
                              ? 'bg-purple-50 text-purple-800 border-purple-200'
                              : user.role === 'HR_MANAGER'
                              ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
                              : user.role === 'HR_PAYROLL_USER'
                              ? 'bg-blue-50 text-blue-800 border-blue-200'
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          <Shield className="h-3 w-3" />
                          <span>{roleObj.name}</span>
                        </span>
                      </td>

                      {/* Department */}
                      <td className="px-4 py-3.5 text-slate-700 font-medium whitespace-nowrap">
                        {user.department}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <StatusBadge status={user.status} />
                      </td>

                      {/* Last Active */}
                      <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap">
                        {user.lastActive}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => setViewingUser(user)}
                            className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                            title="View access profile"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(user)}
                            className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                            title="Edit user"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>

                          {/* Quick Role Switch Option */}
                          <button
                            type="button"
                            onClick={() => {
                              setRoleChangeTarget(user);
                              setTargetNewRole(
                                user.role === 'EMPLOYEE'
                                  ? 'HR_MANAGER'
                                  : user.role === 'HR_MANAGER'
                                  ? 'HR_PAYROLL_MANAGER'
                                  : 'EMPLOYEE'
                              );
                            }}
                            className="flex h-7 w-7 items-center justify-center rounded-lg text-indigo-600 hover:bg-indigo-50"
                            title="Change role"
                          >
                            <ShieldAlert className="h-3.5 w-3.5" />
                          </button>

                          {/* Deactivate/Activate Toggle */}
                          <button
                            type="button"
                            onClick={() => setDeactivateTarget(user)}
                            className={`flex h-7 w-7 items-center justify-center rounded-lg ${
                              user.status === 'Active'
                                ? 'text-slate-400 hover:bg-rose-50 hover:text-rose-600'
                                : 'text-emerald-600 hover:bg-emerald-50'
                            }`}
                            title={user.status === 'Active' ? 'Deactivate user' : 'Activate user'}
                          >
                            {user.status === 'Active' ? (
                              <UserX className="h-3.5 w-3.5" />
                            ) : (
                              <UserCheck className="h-3.5 w-3.5" />
                            )}
                          </button>

                          {/* Delete User Button */}
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(user)}
                            className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer"
                            title="Delete user permanently"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* User Form Drawer Modal */}
      <UserFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        initialData={editingUser}
      />

      {/* User Detail & Access Summary Drawer */}
      <UserDetailDrawer
        isOpen={Boolean(viewingUser)}
        onClose={() => setViewingUser(null)}
        user={viewingUser}
        onEditUser={(u) => handleOpenEditModal(u)}
      />

      {/* Role Change Confirmation Dialog */}
      <RoleChangeDialog
        isOpen={Boolean(roleChangeTarget && targetNewRole)}
        onClose={() => {
          setRoleChangeTarget(null);
          setTargetNewRole(null);
        }}
        user={roleChangeTarget}
        newRoleCode={targetNewRole}
        onConfirm={handleConfirmRoleChange}
        isProcessing={isProcessing}
      />

      {/* Deactivate Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deactivateTarget)}
        title={deactivateTarget?.status === 'Active' ? 'Deactivate User?' : 'Activate User?'}
        message={
          deactivateTarget?.status === 'Active'
            ? `${deactivateTarget?.name} will no longer be able to access PeoplePay360.`
            : `Restore access for ${deactivateTarget?.name} to log into PeoplePay360.`
        }
        confirmLabel={deactivateTarget?.status === 'Active' ? 'Deactivate User' : 'Activate User'}
        confirmVariant={deactivateTarget?.status === 'Active' ? 'danger' : 'primary'}
        onConfirm={handleDeactivateConfirm}
        onCancel={() => setDeactivateTarget(null)}
      />

      {/* Delete User Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Delete User Account"
        message={`Are you sure you want to permanently delete user "${deleteTarget?.name}" (${deleteTarget?.email})? All platform access credentials will be immediately revoked.`}
        confirmLabel="Delete User"
        isDestructive={true}
        onConfirm={async () => {
          if (deleteTarget) {
            await deleteUser(deleteTarget.id);
            setDeleteTarget(null);
          }
        }}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
