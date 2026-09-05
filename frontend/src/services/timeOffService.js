import { apiClient } from './apiService';
import {
  TIME_OFF_TYPES_ENDPOINT,
  TIME_OFF_ALLOCATIONS_ENDPOINT,
  TIME_OFF_REQUESTS_ENDPOINT,
} from '../constants/api';

function titleCase(value) {
  if (!value) return '';
  return String(value).charAt(0).toUpperCase() + String(value).slice(1);
}

export function toFrontendTimeOffType(raw) {
  if (!raw) return null;
  return {
    id: raw.typeCode || raw._id,
    _id: raw._id,
    typeCode: raw.typeCode,
    name: raw.name || '',
    unit: raw.unit === 'hours' ? 'Hours' : 'Days',
    allocationRequired: Boolean(raw.requiresAllocation),
    approvalWorkflow: raw.requiresApproval ? 'Manager + HR Approval' : 'Automatically approved',
    isActive: raw.isActive !== false,
  };
}

export function toFrontendAllocation(raw) {
  if (!raw) return null;
  const employee = raw.employee && typeof raw.employee === 'object' ? raw.employee : {};
  const type = raw.timeOffType && typeof raw.timeOffType === 'object' ? raw.timeOffType : {};
  return {
    id: raw._id,
    _id: raw._id,
    employeeId: employee.employeeCode || '',
    employeeName:
      `${employee.firstName || ''} ${employee.lastName || ''}`.trim() || employee.fullName || '',
    typeName: type.name || type.typeCode || '',
    allocated: raw.allocated ?? 0,
    taken: raw.taken ?? 0,
    remaining: raw.remaining ?? 0,
    validity: raw.validTo ? new Date(raw.validTo).toISOString().split('T')[0] : '',
    status: titleCase(raw.status),
  };
}

export function toFrontendRequest(raw) {
  if (!raw) return null;
  const employee = raw.employee && typeof raw.employee === 'object' ? raw.employee : {};
  const type = raw.timeOffType && typeof raw.timeOffType === 'object' ? raw.timeOffType : {};
  return {
    id: raw._id,
    _id: raw._id,
    employeeId: employee.employeeCode || '',
    employeeName:
      `${employee.firstName || ''} ${employee.lastName || ''}`.trim() || employee.fullName || '',
    jobPosition: employee.jobPosition || '',
    department: employee.department || '',
    timeOffType: type.name || type.typeCode || '',
    startDate: raw.startDate ? new Date(raw.startDate).toISOString().split('T')[0] : '',
    endDate: raw.endDate ? new Date(raw.endDate).toISOString().split('T')[0] : '',
    duration: raw.duration ?? 0,
    durationUnit: raw.unit === 'hours' ? 'hours' : 'days',
    status: titleCase(raw.status),
    remaining:
      raw.allocation && typeof raw.allocation === 'object' && raw.allocation.remaining != null
        ? raw.allocation.remaining
        : undefined,
    reason: raw.reason || '',
    refusalReason: raw.reviewNotes || '',
    appliedDate: raw.createdAt ? new Date(raw.createdAt).toISOString().split('T')[0] : '',
  };
}

export const timeOffService = {
  async getRequests() {
    const response = await apiClient(TIME_OFF_REQUESTS_ENDPOINT);
    return Array.isArray(response?.data) ? response.data.map(toFrontendRequest) : [];
  },

  async getAllocations() {
    const response = await apiClient(TIME_OFF_ALLOCATIONS_ENDPOINT);
    return Array.isArray(response?.data) ? response.data.map(toFrontendAllocation) : [];
  },

  async getTypes() {
    const response = await apiClient(`${TIME_OFF_TYPES_ENDPOINT}?isActive=true`);
    return Array.isArray(response?.data) ? response.data.map(toFrontendTimeOffType) : [];
  },

  async createType(form) {
    const typeCode =
      form.typeCode ||
      `T${Date.now().toString(36).toUpperCase()}`.slice(0, 12);
    const response = await apiClient(TIME_OFF_TYPES_ENDPOINT, {
      method: 'POST',
      body: JSON.stringify({
        typeCode,
        name: form.name,
        unit: String(form.unit || 'Days').toLowerCase() === 'hours' ? 'hours' : 'days',
        requiresAllocation: Boolean(form.allocationRequired),
        requiresApproval: true,
        isPaid: true,
      }),
    });
    return toFrontendTimeOffType(response.data);
  },

  async approveRequest(id) {
    const response = await apiClient(`${TIME_OFF_REQUESTS_ENDPOINT}/${id}/approve`, {
      method: 'PUT',
      body: JSON.stringify({}),
    });
    return toFrontendRequest(response.data);
  },

  async refuseRequest(id, reason) {
    const response = await apiClient(`${TIME_OFF_REQUESTS_ENDPOINT}/${id}/refuse`, {
      method: 'PUT',
      body: JSON.stringify({ reviewNotes: reason }),
    });
    return toFrontendRequest(response.data);
  },
};
