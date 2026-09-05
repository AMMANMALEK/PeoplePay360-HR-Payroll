import { apiClient } from './apiService';
import { EMPLOYEES_ENDPOINT } from '../constants/api';

const OBJECT_ID_PATTERN = /^[a-fA-F0-9]{24}$/;

export function toFrontendEmployee(raw) {
  if (!raw) return null;

  const firstName = typeof raw.firstName === 'string' ? raw.firstName : '';
  const lastName = typeof raw.lastName === 'string' ? raw.lastName : '';
  const fullName =
    raw.fullName ||
    [firstName, lastName].filter(Boolean).join(' ').trim() ||
    'Employee';

  let employmentStatus = 'Active';
  const rawStatus = String(raw.status || '').toLowerCase();
  if (rawStatus === 'inactive') employmentStatus = 'Inactive';
  else if (rawStatus === 'on_leave') employmentStatus = 'On Leave';
  else if (rawStatus === 'terminated') employmentStatus = 'Terminated';
  else if (rawStatus === 'active') employmentStatus = 'Active';

  let managerName = 'None';
  let managerId = '';
  if (raw.manager && typeof raw.manager === 'object') {
    managerName =
      `${raw.manager.firstName || ''} ${raw.manager.lastName || ''}`.trim() ||
      raw.manager.fullName ||
      'None';
    managerId = raw.manager.employeeCode || '';
  }

  let scheduleName = '';
  let scheduleId = '';
  if (raw.workingSchedule && typeof raw.workingSchedule === 'object') {
    scheduleName = raw.workingSchedule.name || raw.workingSchedule.scheduleCode || '';
    scheduleId = raw.workingSchedule.scheduleCode || raw.workingSchedule._id || '';
  }

  let joinedDate = '';
  if (raw.hireDate) {
    joinedDate = new Date(raw.hireDate).toISOString().split('T')[0];
  }

  const profileComplete = Boolean(
    raw.employeeCode && firstName && lastName && raw.email && raw.department && raw.jobPosition
  );

  return {
    id: raw.employeeCode,
    _id: raw._id,
    employeeCode: raw.employeeCode,
    firstName,
    lastName,
    fullName,
    workEmail: raw.email || '',
    phone: raw.phone || '',
    jobPosition: raw.jobPosition || '',
    department: raw.department || '',
    managerId,
    managerName,
    scheduleId,
    scheduleName,
    schedule: typeof raw.workingSchedule === 'object' ? raw.workingSchedule : null,
    employmentStatus,
    joinedDate,
    dob: raw.dob ? new Date(raw.dob).toISOString().split('T')[0] : '',
    employmentType: raw.employmentType || '',
    avatar: '',
    profileComplete,
    address: raw.address || {},
  };
}

function generateEmployeeCode(frontendEmp) {
  if (frontendEmp.employeeCode) {
    return String(frontendEmp.employeeCode).trim().toUpperCase();
  }
  if (frontendEmp.id && !OBJECT_ID_PATTERN.test(String(frontendEmp.id))) {
    return String(frontendEmp.id).trim().toUpperCase();
  }
  const initials = `${(frontendEmp.firstName || 'E')[0]}${(frontendEmp.lastName || 'M')[0]}`.toUpperCase();
  return `EMP-${initials}${Date.now().toString().slice(-4)}`;
}

export function toBackendPayload(frontendEmp) {
  const firstName = frontendEmp.firstName || 'New';
  const lastName = frontendEmp.lastName || 'Employee';

  let status = 'active';
  const rawStatus = (frontendEmp.employmentStatus || '').toLowerCase();
  if (rawStatus.includes('leave')) status = 'on_leave';
  else if (rawStatus.includes('inact')) status = 'inactive';
  else if (rawStatus.includes('termin')) status = 'terminated';

  const payload = {
    employeeCode: generateEmployeeCode(frontendEmp),
    firstName,
    lastName,
    email: (frontendEmp.workEmail || frontendEmp.email || '').toLowerCase(),
    phone: frontendEmp.phone || '',
    department: frontendEmp.department,
    jobPosition: frontendEmp.jobPosition,
    status,
  };

  if (frontendEmp.joinedDate) {
    payload.hireDate = frontendEmp.joinedDate;
  }

  if (frontendEmp.dob) {
    payload.dob = frontendEmp.dob;
  }

  if (frontendEmp.employmentType) {
    payload.employmentType = frontendEmp.employmentType;
  }

  if (frontendEmp.avatar) {
    payload.avatar = frontendEmp.avatar;
  }

  if (frontendEmp.managerId) {
    payload.manager = frontendEmp.managerId;
  }

  if (frontendEmp.scheduleId) {
    payload.workingSchedule = frontendEmp.scheduleId;
  }

  if (frontendEmp.address && typeof frontendEmp.address === 'object') {
    payload.address = frontendEmp.address;
  }

  return payload;
}

export const employeeService = {
  async getEmployees() {
    const response = await apiClient(EMPLOYEES_ENDPOINT);
    const rows = response?.data;
    if (!Array.isArray(rows)) {
      throw new Error('Unexpected employee list response');
    }
    return rows.map(toFrontendEmployee);
  },

  async getEmployeeById(employeeCode) {
    const response = await apiClient(`${EMPLOYEES_ENDPOINT}/${employeeCode}`);
    if (!response?.data) {
      throw new Error('Employee not found');
    }
    return toFrontendEmployee(response.data);
  },

  async createEmployee(payload) {
    const response = await apiClient(EMPLOYEES_ENDPOINT, {
      method: 'POST',
      body: JSON.stringify(toBackendPayload(payload)),
    });
    if (!response?.data) {
      throw new Error('Employee was not created');
    }
    return toFrontendEmployee(response.data);
  },

  async updateEmployee(employeeCode, payload) {
    const response = await apiClient(`${EMPLOYEES_ENDPOINT}/${employeeCode}`, {
      method: 'PUT',
      body: JSON.stringify(toBackendPayload({ ...payload, employeeCode })),
    });
    if (!response?.data) {
      throw new Error('Employee was not updated');
    }
    return toFrontendEmployee(response.data);
  },

  async deleteEmployee(employeeCode) {
    await apiClient(`${EMPLOYEES_ENDPOINT}/${employeeCode}`, {
      method: 'DELETE',
    });
    return { success: true };
  },
};
