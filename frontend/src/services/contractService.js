import { apiClient } from './apiService';
import { CONTRACTS_ENDPOINT } from '../constants/api';
import { INITIAL_CONTRACTS } from '../data/mockData';

export function toFrontendContract(raw) {
  if (!raw) return null;
  let employeeName = 'Employee';
  let employeeId = '';
  let department = 'General';
  let position = 'Specialist';

  if (raw.employee && typeof raw.employee === 'object') {
    const fn = raw.employee.firstName || '';
    const ln = raw.employee.lastName || '';
    employeeName = (fn && ln ? `${fn} ${ln}` : fn || raw.employee.fullName || 'Employee').trim();
    employeeId = raw.employee.employeeCode || raw.employee._id || '';
    department = raw.employee.department || 'General';
    position = raw.employee.jobPosition || 'Specialist';
  } else {
    employeeName = raw.employeeName || 'Employee';
    employeeId = raw.employeeId || (typeof raw.employee === 'string' ? raw.employee : '');
    department = raw.department || 'General';
    position = raw.position || 'Specialist';
  }

  let scheduleName = 'Standard 5-Day (40 hrs)';
  if (raw.workingSchedule && typeof raw.workingSchedule === 'object') {
    scheduleName = raw.workingSchedule.name || raw.workingSchedule.scheduleCode || 'Standard Schedule';
  } else if (raw.workingSchedule) {
    scheduleName = String(raw.workingSchedule);
  }

  let status = 'Active';
  if (raw.status) {
    const s = String(typeof raw.status === 'object' ? (raw.status.name || raw.status.code || 'active') : raw.status).toLowerCase();
    if (s === 'active') status = 'Active';
    else if (s === 'expired') status = 'Expired';
    else if (s === 'draft') status = 'Draft';
    else if (s === 'terminated') status = 'Terminated';
    else status = raw.status;
  }

  const startDate = raw.startDate ? new Date(raw.startDate).toISOString().split('T')[0] : '';
  const endDate = raw.endDate ? new Date(raw.endDate).toISOString().split('T')[0] : '';

  return {
    id: raw.contractCode || raw._id || raw.id,
    _id: raw._id,
    contractCode: raw.contractCode,
    contractName: raw.contractName || `${employeeName} Agreement`,
    employeeId,
    employeeName,
    department,
    position,
    startDate,
    endDate,
    wage: raw.wage ? (typeof raw.wage === 'number' ? `$${raw.wage.toLocaleString()} / yr` : String(raw.wage)) : '$100,000 / yr',
    salaryStructure: raw.salaryStructure || 'Standard Tech Band',
    status,
    isCurrent: raw.isCurrent ?? (status === 'Active'),
    notes: raw.notes || '',
    workingSchedule: scheduleName,
  };
}

export const contractService = {
  async getContracts() {
    try {
      const response = await apiClient(CONTRACTS_ENDPOINT);
      if (response && response.data && Array.isArray(response.data) && response.data.length > 0) {
        return response.data.map(toFrontendContract);
      }
      if (Array.isArray(response) && response.length > 0) {
        return response.map(toFrontendContract);
      }
      return INITIAL_CONTRACTS;
    } catch {
      return INITIAL_CONTRACTS;
    }
  },

  async createContract(payload) {
    try {
      const response = await apiClient(CONTRACTS_ENDPOINT, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      if (response && response.data) return toFrontendContract(response.data);
      return response || payload;
    } catch {
      return payload;
    }
  }
};
