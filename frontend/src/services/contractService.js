import { apiClient } from './apiService';
import { formatINR } from '../utils/formatCurrency';
import { CONTRACTS_ENDPOINT, employeeContractsPath } from '../constants/api';

function titleStatus(status) {
  const map = {
    active: 'Active',
    expired: 'Expired',
    'expiring soon': 'Expiring Soon',
    draft: 'Draft',
    terminated: 'Terminated',
  };
  const key = String(status || '').toLowerCase();
  return map[key] || status || '';
}

export function toFrontendContract(raw) {
  if (!raw) return null;
  const employee = raw.employee && typeof raw.employee === 'object' ? raw.employee : {};
  const status = titleStatus(raw.status);
  const startDate = raw.startDate ? new Date(raw.startDate).toISOString().split('T')[0] : '';
  const endDate = raw.endDate ? new Date(raw.endDate).toISOString().split('T')[0] : '';
  const employeeName =
    `${employee.firstName || ''} ${employee.lastName || ''}`.trim() || employee.fullName || '';

  return {
    id: raw.contractCode || raw._id,
    _id: raw._id,
    contractCode: raw.contractCode || '',
    contractName: raw.notes || `${employeeName} Agreement`.trim(),
    employeeId: employee.employeeCode || '',
    employeeName,
    department: raw.department || employee.department || '',
    position: raw.jobPosition || employee.jobPosition || '',
    startDate,
    endDate,
    wage:
      raw.wageAmount != null
        ? `${formatINR(raw.wageAmount)} / ${raw.wageType === 'hourly' ? 'hr' : 'yr'}`
        : '',
    wageAmount: raw.wageAmount,
    wageType: raw.wageType || 'monthly',
    salaryStructure: raw.salaryStructure || '',
    status,
    isCurrent: status === 'Active',
    notes: raw.notes || '',
    workingSchedule:
      raw.workingSchedule && typeof raw.workingSchedule === 'object'
        ? raw.workingSchedule.name || raw.workingSchedule.scheduleCode || ''
        : '',
  };
}

function parseWageAmount(wage) {
  if (typeof wage === 'number') return wage;
  const n = Number(String(wage || '').replace(/[^0-9.]/g, ''));
  return Number.isFinite(n) ? n : 0;
}

export function toBackendContract(form, employee) {
  const wageType = String(form.wage || '').includes('/ hr') ? 'hourly' : 'monthly';
  const payload = {
    startDate: form.startDate,
    endDate: form.endDate || null,
    department: form.department || employee?.department,
    jobPosition: form.position || employee?.jobPosition,
    wageType,
    wageAmount: parseWageAmount(form.wage),
    salaryStructure: form.salaryStructure || '',
    status: String(form.status || 'Active').toLowerCase(),
    notes: form.notes || form.contractName || '',
  };

  if (form.contractCode) {
    payload.contractCode = form.contractCode;
  }

  return payload;
}

export const contractService = {
  async getContracts() {
    const response = await apiClient(CONTRACTS_ENDPOINT);
    return Array.isArray(response?.data) ? response.data.map(toFrontendContract) : [];
  },

  async createContract(employeeCode, form, employee) {
    const response = await apiClient(employeeContractsPath(employeeCode), {
      method: 'POST',
      body: JSON.stringify(toBackendContract(form, employee)),
    });
    return toFrontendContract(response.data);
  },

  async updateContract(contractId, form, employee) {
    const response = await apiClient(`${CONTRACTS_ENDPOINT}/${contractId}`, {
      method: 'PUT',
      body: JSON.stringify(toBackendContract(form, employee)),
    });
    return toFrontendContract(response.data);
  },

  async deleteContract(contractId) {
    await apiClient(`${CONTRACTS_ENDPOINT}/${contractId}`, {
      method: 'DELETE',
    });
    return { success: true };
  },
};
