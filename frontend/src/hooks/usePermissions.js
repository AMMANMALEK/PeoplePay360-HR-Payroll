import { useAuth } from '../context/AuthContext';
import { canCreate, canDelete, canUpdate, hasPermission } from '../constants/rbac';

export function usePermissions() {
  const { user } = useAuth();
  const role = user?.role;
  const flags = user?.permissions || {};

  return {
    role,
    flags,
    can: (moduleId, action = 'read') => hasPermission(role, moduleId, action),
    canCreate: (moduleId) => canCreate(role, moduleId),
    canUpdate: (moduleId) => canUpdate(role, moduleId),
    canDelete: (moduleId) => canDelete(role, moduleId),
    canAccessPayroll: Boolean(flags.canAccessPayroll),
    canManagePayroll: Boolean(flags.canManagePayroll),
    canComputePayrun: Boolean(flags.canComputePayrun),
    canValidatePayrun: Boolean(flags.canValidatePayrun),
    canManageSalaryConfig: Boolean(flags.canManageSalaryConfig),
    canDeletePayrun: Boolean(flags.canDeletePayrun),
    canDeletePayslip: Boolean(flags.canDeletePayslip),
    canUpdatePayslip: Boolean(flags.canUpdatePayslip),
    canApproveTimeOff: Boolean(flags.canApproveTimeOff),
  };
}
