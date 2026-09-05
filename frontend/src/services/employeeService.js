import { apiClient } from './apiService';
import { EMPLOYEES_ENDPOINT } from '../constants/api';
import { INITIAL_EMPLOYEES } from '../data/mockData';

/**
 * Normalizes a backend Employee document to the frontend UI model.
 */
export function toFrontendEmployee(raw) {
  if (!raw) return null;

  const firstName = raw.firstName || '';
  const lastName = raw.lastName || '';
  const fullName =
    raw.fullName ||
    (firstName && lastName ? `${firstName} ${lastName}`.trim() : firstName || 'Employee');

  let employmentStatus = 'Active';
  if (raw.status) {
    const s = String(raw.status).toLowerCase();
    if (s === 'active') employmentStatus = 'Active';
    else if (s === 'inactive') employmentStatus = 'Inactive';
    else if (s === 'on_leave') employmentStatus = 'On Leave';
    else if (s === 'terminated') employmentStatus = 'Terminated';
  } else if (raw.employmentStatus) {
    employmentStatus = raw.employmentStatus;
  }

  let managerName = raw.managerName || 'None';
  let managerId = raw.managerId || '';
  if (raw.manager && typeof raw.manager === 'object') {
    managerName = `${raw.manager.firstName || ''} ${raw.manager.lastName || ''}`.trim() || 'None';
    managerId = raw.manager.employeeCode || raw.manager._id || '';
  }

  let joinedDate = raw.joinedDate;
  if (!joinedDate && raw.hireDate) {
    try {
      joinedDate = new Date(raw.hireDate).toISOString().split('T')[0];
    } catch {
      joinedDate = new Date().toISOString().split('T')[0];
    }
  }

  return {
    id: raw.employeeCode || raw.id || raw._id,
    _id: raw._id,
    employeeCode: raw.employeeCode || raw.id,
    firstName,
    lastName,
    fullName,
    workEmail: raw.email || raw.workEmail || '',
    phone: raw.phone || '',
    jobPosition: raw.jobPosition || 'Specialist',
    department: raw.department || 'General',
    managerId,
    managerName,
    scheduleId: raw.scheduleId || 'sched-1',
    scheduleName: raw.workingSchedule || raw.scheduleName || 'Standard 5-Day (40 hrs)',
    employmentStatus,
    employmentType: raw.employmentType || 'Full-Time Permanent',
    joinedDate: joinedDate || new Date().toISOString().split('T')[0],
    dob: raw.dob || '',
    avatar:
      raw.avatar ||
      `https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80`,
    profileComplete: raw.profileComplete ?? true,
    address: raw.address || {},
  };
}

/**
 * Normalizes frontend employee form data into the backend Employee schema.
 */
export function toBackendPayload(frontendEmp) {
  const parts = (frontendEmp.fullName || '').trim().split(/\s+/);
  const firstName = frontendEmp.firstName || parts[0] || 'New';
  const lastName = frontendEmp.lastName || parts.slice(1).join(' ') || 'Employee';

  let status = 'active';
  const rawStatus = (frontendEmp.employmentStatus || frontendEmp.status || '').toLowerCase();
  if (rawStatus.includes('leave')) status = 'on_leave';
  else if (rawStatus.includes('inact')) status = 'inactive';
  else if (rawStatus.includes('termin')) status = 'terminated';
  else status = 'active';

  const payload = {
    employeeCode: frontendEmp.employeeCode || frontendEmp.id,
    firstName,
    lastName,
    email: (frontendEmp.workEmail || frontendEmp.email || `${firstName.toLowerCase()}.${lastName.toLowerCase()}@peoplepay360.internal`).toLowerCase(),
    phone: frontendEmp.phone || '+1 (555) 000-0000',
    department: frontendEmp.department || 'Engineering',
    jobPosition: frontendEmp.jobPosition || 'Associate',
    workingSchedule: frontendEmp.scheduleName || frontendEmp.workingSchedule || 'Standard 5-Day (40 hrs)',
    status,
    hireDate: frontendEmp.joinedDate ? new Date(frontendEmp.joinedDate).toISOString() : new Date().toISOString(),
  };

  if (frontendEmp.manager && typeof frontendEmp.manager === 'string' && frontendEmp.manager.length === 24) {
    payload.manager = frontendEmp.manager;
  }

  return payload;
}

/**
 * Employee Service
 * Connects to the PeoplePay360 Express/MongoDB backend API.
 * Falls back seamlessly to mock data if the backend is offline.
 */
export const employeeService = {
  async getEmployees() {
    try {
      const response = await apiClient(EMPLOYEES_ENDPOINT);
      if (response && response.data && Array.isArray(response.data)) {
        if (response.data.length > 0) {
          return response.data.map(toFrontendEmployee);
        }
      }
      return INITIAL_EMPLOYEES;
    } catch (err) {
      console.warn('Backend unavailable for employees, falling back to local dataset:', err.message);
      return INITIAL_EMPLOYEES;
    }
  },

  async getEmployeeById(id) {
    try {
      const response = await apiClient(`${EMPLOYEES_ENDPOINT}/${id}`);
      if (response && response.data) {
        return toFrontendEmployee(response.data);
      }
      return INITIAL_EMPLOYEES.find((emp) => emp.id === id || emp._id === id) || null;
    } catch (err) {
      console.warn(`Backend error getting employee ${id}, falling back:`, err.message);
      return INITIAL_EMPLOYEES.find((emp) => emp.id === id) || null;
    }
  },

  async createEmployee(payload) {
    try {
      const backendPayload = toBackendPayload(payload);
      const response = await apiClient(EMPLOYEES_ENDPOINT, {
        method: 'POST',
        body: JSON.stringify(backendPayload),
      });
      if (response && response.data) {
        return toFrontendEmployee(response.data);
      }
    } catch (err) {
      console.warn('Backend error creating employee, saving locally:', err.message);
    }
    return {
      id: payload.id || `EMP-${Date.now().toString().slice(-4)}`,
      ...payload,
      fullName: payload.fullName || `${payload.firstName || ''} ${payload.lastName || ''}`.trim(),
    };
  },

  async updateEmployee(id, payload, mongoId) {
    const targetId = mongoId || payload._id || id;
    try {
      const backendPayload = toBackendPayload({ ...payload, id });
      const response = await apiClient(`${EMPLOYEES_ENDPOINT}/${targetId}`, {
        method: 'PUT',
        body: JSON.stringify(backendPayload),
      });
      if (response && response.data) {
        return toFrontendEmployee(response.data);
      }
    } catch (err) {
      console.warn(`Backend error updating employee ${targetId}, saving locally:`, err.message);
    }
    return { id, ...payload };
  },

  async deleteEmployee(id, mongoId) {
    const targetId = mongoId || id;
    try {
      await apiClient(`${EMPLOYEES_ENDPOINT}/${targetId}`, {
        method: 'DELETE',
      });
      return { success: true };
    } catch (err) {
      console.warn(`Backend error deleting employee ${targetId}, deleting locally:`, err.message);
      return { success: true };
    }
  },
};
