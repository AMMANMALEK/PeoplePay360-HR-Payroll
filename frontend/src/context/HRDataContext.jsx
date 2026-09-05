import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { employeeService } from '../services/employeeService';
import { attendanceService } from '../services/attendanceService';
import { contractService } from '../services/contractService';
import { scheduleService } from '../services/scheduleService';
import { timeOffService } from '../services/timeOffService';
import { adminService } from '../services/adminService';
import { setApiErrorHandler } from '../services/apiService';
import { useAuth } from './AuthContext';
import { ROLES } from '../constants/navigation';
import { payrollService, evaluatePayrollWarnings } from '../services/payrollService';
import {
  INITIAL_PAYRUNS,
  INITIAL_PAYSLIPS,
  INITIAL_SALARY_RULES,
  INITIAL_SALARY_STRUCTURES,
} from '../data/mockData';

const HRDataContext = createContext(null);

export const DEFAULT_DEPARTMENTS = [
  { id: 'dept-1', name: 'Engineering', code: 'ENG', manager: 'David Kim', description: 'Software engineering, DevOps, infrastructure, and QA', floor: 'Floor 4' },
  { id: 'dept-2', name: 'Human Resources', code: 'HR', manager: 'Sarah Jenkins', description: 'People operations, talent acquisition, culture & payroll', floor: 'Floor 3' },
  { id: 'dept-3', name: 'Finance', code: 'FIN', manager: 'Elena Rostova', description: 'Financial planning, accounting, treasury, and tax operations', floor: 'Floor 3' },
  { id: 'dept-4', name: 'Product', code: 'PRD', manager: 'Lucas Dupont', description: 'Product strategy, roadmap management, and UX design', floor: 'Floor 4' },
  { id: 'dept-5', name: 'Sales', code: 'SLS', manager: 'Ethan Cole', description: 'Enterprise sales, account executives, and client partnerships', floor: 'Floor 2' },
  { id: 'dept-6', name: 'Marketing', code: 'MKT', manager: 'Daniel Brooks', description: 'Growth marketing, brand, content, and communications', floor: 'Floor 2' },
  { id: 'dept-7', name: 'Operations', code: 'OPS', manager: 'Sophia Al-Mansoor', description: 'Business operations, facilities, logistics, and compliance', floor: 'Floor 1' },
  { id: 'dept-8', name: 'Legal', code: 'LGL', manager: 'Victor Vance', description: 'Corporate law, contracts, regulatory compliance & IP', floor: 'Floor 3' },
];

export const DEFAULT_JOB_POSITIONS = [
  { id: 'pos-1', title: 'Senior Software Engineer', department: 'Engineering', level: 'Senior', status: 'Active', description: 'Full stack development with Node.js and React' },
  { id: 'pos-2', title: 'Staff Software Engineer', department: 'Engineering', level: 'Lead', status: 'Active', description: 'Architecture, technical direction, and team leadership' },
  { id: 'pos-3', title: 'Junior Frontend Developer', department: 'Engineering', level: 'Entry', status: 'Active', description: 'UI implementation and component maintenance' },
  { id: 'pos-4', title: 'DevOps Engineer', department: 'Engineering', level: 'Mid', status: 'Active', description: 'CI/CD pipelines, Kubernetes, and cloud infrastructure' },
  { id: 'pos-5', title: 'QA Test Engineer', department: 'Engineering', level: 'Mid', status: 'Active', description: 'Automation and quality assurance verification' },
  { id: 'pos-6', title: 'HR Manager', department: 'Human Resources', level: 'Executive', status: 'Active', description: 'Workforce oversight, employee relations, and HR policies' },
  { id: 'pos-7', title: 'HR Payroll Manager', department: 'Human Resources', level: 'Executive', status: 'Active', description: 'Compensation, benefits, and payroll management' },
  { id: 'pos-8', title: 'Talent Acquisition Lead', department: 'Human Resources', level: 'Lead', status: 'Active', description: 'Sourcing, technical hiring, and candidate experience' },
  { id: 'pos-9', title: 'HR Payroll User', department: 'Finance', level: 'Mid', status: 'Active', description: 'Payroll calculations, timesheets, and pay run validation' },
  { id: 'pos-10', title: 'Senior Accountant', department: 'Finance', level: 'Senior', status: 'Active', description: 'Financial ledger, audit reporting, and taxation' },
  { id: 'pos-11', title: 'Senior Product Designer', department: 'Product', level: 'Senior', status: 'Active', description: 'UI/UX design systems, user journey maps, and wireframing' },
  { id: 'pos-12', title: 'Product Manager', department: 'Product', level: 'Senior', status: 'Active', description: 'Sprint prioritization, requirements, and user research' },
  { id: 'pos-13', title: 'Enterprise Sales Director', department: 'Sales', level: 'Lead', status: 'Active', description: 'Key accounts, enterprise revenue, and business development' },
  { id: 'pos-14', title: 'Account Executive', department: 'Sales', level: 'Mid', status: 'Active', description: 'Outbound sales, contract negotiation, and deals' },
  { id: 'pos-15', title: 'Marketing Specialist', department: 'Marketing', level: 'Mid', status: 'Active', description: 'Campaigns, digital media, and social analytics' },
  { id: 'pos-16', title: 'Operations Analyst', department: 'Operations', level: 'Mid', status: 'Active', description: 'Workflow optimization, vendor management, and reporting' },
  { id: 'pos-17', title: 'Legal Counsel', department: 'Legal', level: 'Senior', status: 'Active', description: 'Employment agreements, NDA governance, and legal review' },
];

export function HRDataProvider({ children }) {
  const [employees, setEmployees] = useState([]);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(true);
  const [contracts, setContracts] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [timeOffRequests, setTimeOffRequests] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [timeOffTypes, setTimeOffTypes] = useState([]);
  const [users, setUsers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [systemStatus, setSystemStatus] = useState(null);
  const [toast, setToast] = useState(null);
  const { user } = useAuth();

  // Payroll States
  const [payruns, setPayruns] = useState(() => {
    try {
      const saved = localStorage.getItem('peoplepay_payruns');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_PAYRUNS;
  });

  const [payslips, setPayslips] = useState(() => {
    try {
      const saved = localStorage.getItem('peoplepay_payslips');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_PAYSLIPS;
  });

  const [salaryStructures, setSalaryStructures] = useState(() => {
    try {
      const saved = localStorage.getItem('peoplepay_salary_structures');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_SALARY_STRUCTURES;
  });

  const [salaryRules, setSalaryRules] = useState(() => {
    try {
      const saved = localStorage.getItem('peoplepay_salary_rules');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_SALARY_RULES;
  });

  const [activeRoleOverride, setActiveRoleOverride] = useState(null);

  useEffect(() => {
    try {
      localStorage.setItem('peoplepay_payruns', JSON.stringify(payruns));
    } catch {}
  }, [payruns]);

  useEffect(() => {
    try {
      localStorage.setItem('peoplepay_payslips', JSON.stringify(payslips));
    } catch {}
  }, [payslips]);

  useEffect(() => {
    try {
      localStorage.setItem('peoplepay_salary_structures', JSON.stringify(salaryStructures));
    } catch {}
  }, [salaryStructures]);

  useEffect(() => {
    try {
      localStorage.setItem('peoplepay_salary_rules', JSON.stringify(salaryRules));
    } catch {}
  }, [salaryRules]);

  // Managed Departments State with Local Persistence
  const [departmentsList, setDepartmentsList] = useState(() => {
    try {
      const saved = localStorage.getItem('peoplepay_departments');
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_DEPARTMENTS;
  });

  // Managed Job Positions State with Local Persistence
  const [jobPositionsList, setJobPositionsList] = useState(() => {
    try {
      const saved = localStorage.getItem('peoplepay_job_positions');
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_JOB_POSITIONS;
  });

  // HR Manager & HR Payroll Manager Leave Requests
  const [hrTimeOffRequests, setHrTimeOffRequests] = useState(() => {
    try {
      const saved = localStorage.getItem('peoplepay_hr_timeoff');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 'REQ-HR-101',
        employeeId: 'HRMGR',
        employeeName: 'David Kim',
        role: 'HR_MANAGER',
        roleName: 'HR Manager',
        department: 'Human Resources',
        jobPosition: 'HR Manager',
        timeOffType: 'Personal Leave',
        startDate: '2026-09-15',
        endDate: '2026-09-17',
        duration: 3,
        durationUnit: 'days',
        status: 'Pending',
        reason: 'Family event and personal commitments',
        appliedDate: '2026-09-04',
      },
      {
        id: 'REQ-HR-102',
        employeeId: 'HRPAYMGR',
        employeeName: 'Sarah Jenkins',
        role: 'HR_PAYROLL_MANAGER',
        roleName: 'HR Payroll Manager',
        department: 'Human Resources',
        jobPosition: 'HR Payroll Manager',
        timeOffType: 'Sick Leave',
        startDate: '2026-09-22',
        endDate: '2026-09-23',
        duration: 2,
        durationUnit: 'days',
        status: 'Pending',
        reason: 'Medical checkup and doctor prescribed rest',
        appliedDate: '2026-09-05',
      },
      {
        id: 'REQ-HR-103',
        employeeId: 'HRMGR',
        employeeName: 'David Kim',
        role: 'HR_MANAGER',
        roleName: 'HR Manager',
        department: 'Human Resources',
        jobPosition: 'HR Manager',
        timeOffType: 'Festival Leave',
        startDate: '2026-08-10',
        endDate: '2026-08-12',
        duration: 3,
        durationUnit: 'days',
        status: 'Approved',
        reason: 'Annual cultural festival celebration',
        appliedDate: '2026-08-01',
      }
    ];
  });

  // HR Manager & HR Payroll Manager Daily Attendance Timing Logs
  const [hrAttendanceList, setHrAttendanceList] = useState(() => {
    try {
      const saved = localStorage.getItem('peoplepay_hr_attendance');
      if (saved) return JSON.parse(saved);
    } catch {}
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const dayBefore = new Date(Date.now() - 172800000).toISOString().split('T')[0];

    return [
      {
        id: 'att-hr-1',
        date: today,
        employeeCode: 'HRMGR',
        employeeName: 'David Kim',
        role: 'HR_MANAGER',
        roleName: 'HR Manager',
        department: 'Human Resources',
        checkIn: '09:02',
        checkOut: '--:--',
        workedHours: 0,
        status: 'Present',
        notes: 'Active today via HR Portal',
      },
      {
        id: 'att-hr-2',
        date: today,
        employeeCode: 'HRPAYMGR',
        employeeName: 'Sarah Jenkins',
        role: 'HR_PAYROLL_MANAGER',
        roleName: 'HR Payroll Manager',
        department: 'Human Resources',
        checkIn: '08:55',
        checkOut: '17:30',
        workedHours: 8.5,
        status: 'Present',
        notes: 'Standard workday shift',
      },
      {
        id: 'att-hr-3',
        date: yesterday,
        employeeCode: 'HRMGR',
        employeeName: 'David Kim',
        role: 'HR_MANAGER',
        roleName: 'HR Manager',
        department: 'Human Resources',
        checkIn: '09:10',
        checkOut: '18:15',
        workedHours: 9.0,
        status: 'Present',
        notes: 'Completed full workday',
      },
      {
        id: 'att-hr-4',
        date: yesterday,
        employeeCode: 'HRPAYMGR',
        employeeName: 'Sarah Jenkins',
        role: 'HR_PAYROLL_MANAGER',
        roleName: 'HR Payroll Manager',
        department: 'Human Resources',
        checkIn: '09:00',
        checkOut: '13:00',
        workedHours: 4.0,
        status: 'Half-day',
        notes: 'Authorized half day',
      },
      {
        id: 'att-hr-5',
        date: dayBefore,
        employeeCode: 'HRMGR',
        employeeName: 'David Kim',
        role: 'HR_MANAGER',
        roleName: 'HR Manager',
        department: 'Human Resources',
        checkIn: '08:50',
        checkOut: '17:50',
        workedHours: 9.0,
        status: 'Present',
        notes: 'On time',
      }
    ];
  });

  // Local storage auto-sync
  useEffect(() => {
    try {
      localStorage.setItem('peoplepay_departments', JSON.stringify(departmentsList));
      window.dispatchEvent(new CustomEvent('peoplepay_departments_updated', { detail: departmentsList }));
    } catch {}
  }, [departmentsList]);

  useEffect(() => {
    try {
      localStorage.setItem('peoplepay_job_positions', JSON.stringify(jobPositionsList));
      window.dispatchEvent(new CustomEvent('peoplepay_job_positions_updated', { detail: jobPositionsList }));
    } catch {}
  }, [jobPositionsList]);

  useEffect(() => {
    try {
      localStorage.setItem('peoplepay_hr_timeoff', JSON.stringify(hrTimeOffRequests));
      window.dispatchEvent(new CustomEvent('peoplepay_hr_timeoff_updated', { detail: hrTimeOffRequests }));
    } catch {}
  }, [hrTimeOffRequests]);

  useEffect(() => {
    try {
      localStorage.setItem('peoplepay_hr_attendance', JSON.stringify(hrAttendanceList));
      window.dispatchEvent(new CustomEvent('peoplepay_hr_attendance_updated', { detail: hrAttendanceList }));
    } catch {}
  }, [hrAttendanceList]);

  // Managed Fixed Leave Allowances (Admin can edit number of fixed leaves for all leave types)
  const [fixedLeaveAllowances, setFixedLeaveAllowances] = useState(() => {
    try {
      const saved = localStorage.getItem('peoplepay_fixed_leaves');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      'Personal Leave': 15,
      'Sick Leave': 10,
      'Festival Leave': 5,
    };
  });

  useEffect(() => {
    try {
      localStorage.setItem('peoplepay_fixed_leaves', JSON.stringify(fixedLeaveAllowances));
      window.dispatchEvent(new CustomEvent('peoplepay_fixed_leaves_updated', { detail: fixedLeaveAllowances }));
    } catch {}
  }, [fixedLeaveAllowances]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast((prev) => (prev?.id ? null : prev));
    }, 4000);
  };

  const closeToast = () => setToast(null);

  useEffect(() => {
    setApiErrorHandler((error) => {
      if (error?.status !== 401) {
        showToast(error.message || 'Request failed', 'error');
      }
    });
    return () => setApiErrorHandler(null);
  }, []);

  const loadAll = async () => {
    const [
      employeeRows,
      contractRows,
      attendanceRows,
      scheduleRows,
      requestRows,
      allocationRows,
      typeRows,
      userRows,
      auditRows,
      statusRow,
    ] = await Promise.all([
      employeeService.getEmployees().catch(() => []),
      contractService.getContracts().catch(() => []),
      attendanceService.getAttendance().catch(() => []),
      scheduleService.getSchedules().catch(() => []),
      timeOffService.getRequests().catch(() => []),
      timeOffService.getAllocations().catch(() => []),
      timeOffService.getTypes().catch(() => []),
      adminService.getUsers().catch(() => []),
      adminService.getAuditLogs().catch(() => []),
      adminService.getSystemStatus().catch(() => null),
    ]);

    setEmployees(Array.isArray(employeeRows) ? employeeRows : []);
    let resolvedContracts = Array.isArray(contractRows) && contractRows.length > 0 ? contractRows : [];
    try {
      const savedContracts = localStorage.getItem('peoplepay_contracts');
      if (savedContracts) {
        const parsed = JSON.parse(savedContracts);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const map = new Map(resolvedContracts.map((c) => [c.id || c._id, c]));
          parsed.forEach((c) => map.set(c.id || c._id, c));
          resolvedContracts = Array.from(map.values());
        }
      }
    } catch {}
    setContracts(resolvedContracts);
    setAttendance(Array.isArray(attendanceRows) ? attendanceRows : []);
    setSchedules(Array.isArray(scheduleRows) ? scheduleRows : []);
    const syncedAllocations = (Array.isArray(allocationRows) ? allocationRows : []).map((a) => {
      const configured = fixedLeaveAllowances[a.typeName];
      if (configured != null) {
        return {
          ...a,
          allocated: configured,
          remaining: Math.max(0, configured - (a.taken || 0)),
        };
      }
      return a;
    });
    setAllocations(syncedAllocations);

    let statusOverrides = {};
    try {
      const saved = localStorage.getItem('peoplepay_timeoff_status_overrides');
      if (saved) statusOverrides = JSON.parse(saved);
    } catch {}

    const combinedRequests = [
      ...hrTimeOffRequests,
      ...(Array.isArray(requestRows) ? requestRows : []).filter(
        (r) => !hrTimeOffRequests.some((hr) => hr.id === r.id || hr.id === r._id)
      ),
    ].map((r) => {
      const override = statusOverrides[r.id] || statusOverrides[r._id];
      return override ? { ...r, status: override } : r;
    });

    setTimeOffRequests(combinedRequests);
    setTimeOffTypes(Array.isArray(typeRows) ? typeRows : []);
    setUsers(Array.isArray(userRows) ? userRows : []);
    setAuditLogs(Array.isArray(auditRows) ? auditRows : []);
    setSystemStatus(statusRow);
  };

  useEffect(() => {
    let isMounted = true;
    setIsLoadingEmployees(true);
    loadAll()
      .catch(() => {
        if (isMounted) {
          setEmployees([]);
          setContracts([]);
          setAttendance([]);
          setSchedules([]);
          setTimeOffRequests([]);
          setAllocations([]);
          setTimeOffTypes([]);
          setUsers([]);
          setAuditLogs([]);
          setSystemStatus(null);
        }
      })
      .finally(() => {
        if (isMounted) setIsLoadingEmployees(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const departments = useMemo(() => {
    const fromList = departmentsList.map((d) => d.name).filter(Boolean);
    const fromEmployees = employees.map((e) => e.department).filter(Boolean);
    return Array.from(new Set([...fromList, ...fromEmployees])).sort();
  }, [departmentsList, employees]);

  const jobPositions = useMemo(() => {
    const fromList = jobPositionsList.map((p) => p.title).filter(Boolean);
    const fromEmployees = employees.map((e) => e.jobPosition).filter(Boolean);
    return Array.from(new Set([...fromList, ...fromEmployees])).sort();
  }, [jobPositionsList, employees]);

  const kpis = useMemo(() => {
    const totalEmployees = employees.length;
    const today = new Date().toISOString().split('T')[0];
    const presentToday = attendance.filter((a) => {
      if (a.date !== today) return false;
      return a.status === 'Present' || a.status === 'Overtime' || a.status === 'Late';
    }).length;
    const attendanceExceptions = attendance.filter((a) => a.isException).length;
    const pendingTimeOff = timeOffRequests.filter((r) => r.status === 'Pending').length;
    const activeContracts = contracts.filter((c) => c.status === 'Active').length;
    const now = new Date();
    const expiringContracts = contracts.filter((c) => {
      if (c.status !== 'Active' || !c.endDate) return false;
      const end = new Date(c.endDate);
      const diffDays = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays <= 45;
    }).length;
    const incompleteProfiles = employees.filter((e) => !e.profileComplete).length;
    const payslipsGenerated = payslips.length;
    const totalPayrollCost = payruns.reduce(
      (acc, p) => acc + (p.totalNet || p.netSalary || p.totalNetSalary || 0),
      0
    );
    const totalGrossPayroll = payruns.reduce(
      (acc, p) => acc + (p.totalGross || p.grossSalary || 0),
      0
    );
    const pendingPayruns = payruns.filter(
      (p) => p.status === 'Draft' || p.status === 'Computed' || p.status === 'Validation Required'
    ).length;
    const missingBankEmployeesCount = employees.filter(
      (e) => !e.bankDetails?.accountNumber && !e.bankDetails?.accountNo
    ).length;

    return {
      totalEmployees,
      presentToday,
      pendingTimeOff,
      activeContracts,
      expiringContracts,
      attendanceExceptions,
      incompleteProfiles,
      payslipsGenerated,
      totalPayrollCost,
      totalGrossPayroll,
      pendingPayruns,
      missingBankEmployeesCount,
    };
  }, [employees, attendance, timeOffRequests, contracts, payruns, payslips]);

  const attentionItems = useMemo(() => {
    const items = [];

    if (kpis.attendanceExceptions > 0) {
      items.push({
        id: 'ATTN-ATTENDANCE',
        type: 'danger',
        icon: 'AlertTriangle',
        badgeText: 'Action Required',
        title: `${kpis.attendanceExceptions} attendance records need correction`,
        description: 'Exception attendance records from the database.',
        targetRoute: '/attendance?filter=exceptions',
        actionLabel: 'Review attendance',
        count: kpis.attendanceExceptions,
      });
    }

    if (kpis.pendingTimeOff > 0) {
      items.push({
        id: 'ATTN-TIMEOFF',
        type: 'urgent',
        icon: 'Clock',
        badgeText: 'Pending Approval',
        title: `${kpis.pendingTimeOff} time-off requests awaiting approval`,
        description: 'Pending leave requests loaded from the database.',
        targetRoute: '/time-off?status=Pending',
        actionLabel: 'Review requests',
        count: kpis.pendingTimeOff,
      });
    }

    if (kpis.expiringContracts > 0) {
      items.push({
        id: 'ATTN-CONTRACTS',
        type: 'contract',
        icon: 'FileWarning',
        badgeText: 'Expiring Soon',
        title: `${kpis.expiringContracts} contracts expire within 45 days`,
        description: 'Active contracts with an end date in the next 45 days.',
        targetRoute: '/contracts?filter=expiring',
        actionLabel: 'View contracts',
        count: kpis.expiringContracts,
      });
    }

    if (kpis.incompleteProfiles > 0) {
      items.push({
        id: 'ATTN-PROFILES',
        type: 'info',
        icon: 'UserX',
        badgeText: 'Incomplete Data',
        title: `${kpis.incompleteProfiles} employees have incomplete profiles`,
        description: 'Required employee fields are missing in the database.',
        targetRoute: '/employees?filter=incomplete',
        actionLabel: 'Complete employee data',
        count: kpis.incompleteProfiles,
      });
    }

    return items;
  }, [kpis]);

  const addEmployee = async (data) => {
    const persisted = await employeeService.createEmployee(data);
    setEmployees((prev) => [persisted, ...prev]);
    showToast(`Employee ${persisted.fullName} created successfully.`);
    return persisted;
  };

  const updateEmployee = async (id, data) => {
    const persisted = await employeeService.updateEmployee(id, data);
    setEmployees((prev) =>
      prev.map((emp) => (emp.id === id || emp.employeeCode === id ? persisted : emp))
    );
    showToast('Employee information updated.');
    return persisted;
  };

  const deleteEmployee = async (id) => {
    const target = employees.find((e) => e.id === id || e.employeeCode === id);
    await employeeService.deleteEmployee(id);
    setEmployees((prev) => prev.filter((e) => e.id !== id && e.employeeCode !== id));
    showToast(`Employee ${target?.fullName || id} removed permanently.`, 'info');
  };

  const addContract = async (data) => {
    const employee = employees.find((e) => e.id === data.employeeId || e._id === data.employeeId || e.employeeCode === data.employeeId);
    let persisted = null;
    try {
      persisted = await contractService.createContract(data.employeeId, data, employee);
    } catch (err) {
      console.warn('Backend contract create fallback', err);
    }
    const newContract = persisted || {
      id: `CTR-${Date.now().toString().slice(-4)}`,
      _id: `ctr-${Date.now()}`,
      contractCode: `CTR-${Date.now().toString().slice(-4)}`,
      contractName: data.contractName,
      employeeId: data.employeeId,
      employeeName: employee?.fullName || data.employeeName || 'Employee',
      department: employee?.department || data.department || 'Engineering',
      position: employee?.jobPosition || data.position || 'Staff',
      startDate: data.startDate,
      endDate: data.endDate || null,
      wage: Number(data.wage) || 0,
      wageAmount: Number(data.wage) || 0,
      wageType: data.salaryStructure === 'hourly' ? 'hourly' : 'annually',
      salaryStructure: data.salaryStructure || 'annually',
      status: 'Active',
      isCurrent: true,
      notes: data.notes || '',
    };
    setContracts((prev) => {
      const next = [newContract, ...prev];
      try {
        localStorage.setItem('peoplepay_contracts', JSON.stringify(next));
      } catch {}
      return next;
    });
    showToast(`Contract ${newContract.id} created for ${newContract.employeeName}.`);
    return newContract;
  };

  const updateContract = async (id, data) => {
    const existing = contracts.find((c) => c.id === id || c._id === id);
    const employee = employees.find((e) => e.id === (data.employeeId || existing?.employeeId) || e._id === (data.employeeId || existing?.employeeId) || e.employeeCode === (data.employeeId || existing?.employeeId));
    let persisted = null;
    try {
      persisted = await contractService.updateContract(existing?._id || id, {
        ...existing,
        ...data,
      }, employee);
    } catch (err) {
      console.warn('Backend contract update fallback', err);
    }
    const updated = {
      ...existing,
      ...(persisted || {}),
      ...data,
      employeeName: employee?.fullName || existing?.employeeName || data.employeeName,
      department: employee?.department || existing?.department || data.department,
      position: employee?.jobPosition || existing?.position || data.position,
      wage: Number(data.wage) || data.wage || existing?.wage,
      wageAmount: Number(data.wage) || data.wageAmount || existing?.wageAmount,
      salaryStructure: data.salaryStructure || existing?.salaryStructure || 'annually',
      status: data.status || existing?.status || 'Active',
      isCurrent: (data.status || existing?.status) === 'Active',
    };
    setContracts((prev) => {
      const next = prev.map((c) => (c.id === id || c._id === id ? updated : c));
      try {
        localStorage.setItem('peoplepay_contracts', JSON.stringify(next));
      } catch {}
      return next;
    });
    showToast(`Contract ${updated.id || id} updated.`);
    return updated;
  };

  const deleteContract = async (id) => {
    const target = contracts.find((c) => c.id === id || c._id === id);
    const apiId = target?._id || id;
    await contractService.deleteContract(apiId);
    setContracts((prev) => {
      const next = prev.filter((c) => c.id !== id && c._id !== id && c._id !== apiId);
      try {
        localStorage.setItem('peoplepay_contracts', JSON.stringify(next));
      } catch {}
      return next;
    });
    showToast(`Contract ${target?.id || id} deleted.`, 'info');
  };

  const correctAttendance = async (attendanceId, { checkIn, checkOut, reason }) => {
    const record = attendance.find((a) => a.id === attendanceId || a._id === attendanceId);
    const empCode = record?.employeeCode || record?.employeeId;
    if (!empCode) {
      showToast('Attendance employee code is missing.', 'error');
      return;
    }
    const persisted = await attendanceService.correctAttendance(attendanceId, empCode, {
      checkIn,
      checkOut,
      reason,
      date: record.date,
    });
    setAttendance((prev) =>
      prev.map((row) => (row.id === attendanceId || row._id === attendanceId ? persisted : row))
    );
    showToast('Attendance corrected successfully.');
    return persisted;
  };

  const approveTimeOff = async (requestId) => {
    const target = timeOffRequests.find((r) => r.id === requestId || r._id === requestId);
    const apiId = target?._id || target?.id || requestId;
    let persisted = null;
    try {
      persisted = await timeOffService.approveRequest(apiId);
    } catch (err) {
      console.warn('Backend time-off approval fallback:', err);
    }

    const updated = {
      ...(target || {}),
      ...(persisted || {}),
      status: 'Approved',
      approvedAt: new Date().toISOString(),
    };

    setTimeOffRequests((prev) => {
      const next = prev.map((r) =>
        r.id === requestId || r._id === requestId || (target && (r.id === target.id || r._id === target._id))
          ? { ...r, ...updated, status: 'Approved' }
          : r
      );
      try {
        const overrides = JSON.parse(localStorage.getItem('peoplepay_timeoff_status_overrides') || '{}');
        overrides[requestId] = 'Approved';
        if (target?._id) overrides[target._id] = 'Approved';
        if (target?.id) overrides[target.id] = 'Approved';
        localStorage.setItem('peoplepay_timeoff_status_overrides', JSON.stringify(overrides));
      } catch {}
      return next;
    });

    setAllocations((prev) =>
      prev.map((a) => {
        if (target && (a.typeName === target.timeOffType || a.typeCode === target.timeOffType)) {
          const dur = target.duration || 1;
          const newTaken = (a.taken || 0) + dur;
          return {
            ...a,
            taken: newTaken,
            remaining: Math.max(0, (a.allocated || 0) - newTaken),
          };
        }
        return a;
      })
    );

    showToast(`Time-off request for ${target?.employeeName || 'employee'} approved.`);
    return updated;
  };

  const refuseTimeOff = async (requestId, refusalReason) => {
    const target = timeOffRequests.find((r) => r.id === requestId || r._id === requestId);
    const apiId = target?._id || target?.id || requestId;
    let persisted = null;
    try {
      persisted = await timeOffService.refuseRequest(apiId, refusalReason);
    } catch (err) {
      console.warn('Backend time-off refuse fallback:', err);
    }

    const updated = {
      ...(target || {}),
      ...(persisted || {}),
      status: 'Refused',
      refusalReason,
      refusedAt: new Date().toISOString(),
    };

    setTimeOffRequests((prev) => {
      const next = prev.map((r) =>
        r.id === requestId || r._id === requestId || (target && (r.id === target.id || r._id === target._id))
          ? { ...r, ...updated, status: 'Refused', refusalReason }
          : r
      );
      try {
        const overrides = JSON.parse(localStorage.getItem('peoplepay_timeoff_status_overrides') || '{}');
        overrides[requestId] = 'Refused';
        if (target?._id) overrides[target._id] = 'Refused';
        if (target?.id) overrides[target.id] = 'Refused';
        localStorage.setItem('peoplepay_timeoff_status_overrides', JSON.stringify(overrides));
      } catch {}
      return next;
    });

    showToast('Request refused with reason logged.', 'info');
    return updated;
  };

  const addSchedule = async (data) => {
    const persisted = await scheduleService.createSchedule(data);
    setSchedules((prev) => [...prev, persisted]);
    showToast(`Schedule "${persisted.name}" created successfully.`);
    return persisted;
  };

  const updateSchedule = async (id, data) => {
    const existing = schedules.find((s) => s.id === id || s._id === id);
    const persisted = await scheduleService.updateSchedule(existing?._id || id, {
      ...existing,
      ...data,
    });
    setSchedules((prev) =>
      prev.map((s) => (s.id === id || s._id === id ? persisted : s))
    );
    showToast('Working schedule updated.');
    return persisted;
  };

  const deleteSchedule = async (id) => {
    const target = schedules.find((s) => s.id === id || s._id === id);
    const apiId = target?._id || target?.scheduleCode || id;
    await scheduleService.deleteSchedule(apiId);
    setSchedules((prev) => prev.filter((s) => s.id !== id && s._id !== id && s._id !== apiId));
    showToast(`Schedule "${target?.name || id}" deleted.`, 'info');
  };

  const addTimeOffType = async (data) => {
    const persisted = await timeOffService.createType(data);
    setTimeOffTypes((prev) => [...prev, persisted]);
    showToast(`Time off type "${persisted.name}" added.`);
    return persisted;
  };

  const hrCheckIn = async (employeeCode = 'HRMGR') => {
    const today = new Date().toISOString().split('T')[0];
    const nowIso = new Date().toISOString();
    const nowClock = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
    const nowClock12 = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

    try {
      localStorage.setItem(`hr_checkin_time_${today}`, String(Date.now()));
    } catch {}

    try {
      const persisted = await attendanceService.recordAttendance(employeeCode, {
        attendanceDate: today,
        checkIn: nowIso,
        status: 'present',
      });
      const recordWithTimestamps = {
        ...persisted,
        rawCheckIn: nowIso,
        checkInTimeMs: Date.now(),
      };
      setAttendance((prev) => {
        const existingIdx = prev.findIndex(
          (a) => a.date === today && (a.employeeCode === employeeCode || a.employeeId === employeeCode)
        );
        if (existingIdx >= 0) {
          const copy = [...prev];
          copy[existingIdx] = recordWithTimestamps;
          return copy;
        }
        return [recordWithTimestamps, ...prev];
      });
      showToast('Checked in successfully!');
      return recordWithTimestamps;
    } catch {
      const fallback = {
        id: `att-hr-${Date.now()}`,
        _id: `att-hr-${Date.now()}`,
        employeeId: employeeCode,
        employeeCode: employeeCode,
        employeeName: 'HR Manager',
        department: 'Human Resources',
        date: today,
        checkIn: nowClock,
        checkOut: '--:--',
        checkInDisplay: nowClock12,
        checkOutDisplay: '--',
        rawCheckIn: nowIso,
        checkInTimeMs: Date.now(),
        hasCheckIn: true,
        hasCheckOut: false,
        workedHours: 0,
        status: 'Present',
        correction: null,
      };
      setAttendance((prev) => [
        fallback,
        ...prev.filter((a) => !(a.date === today && (a.employeeCode === employeeCode || a.employeeId === employeeCode))),
      ]);
      showToast('Checked in successfully!');
      return fallback;
    }
  };

  const hrCheckOut = async (employeeCode = 'HRMGR') => {
    const today = new Date().toISOString().split('T')[0];
    const existing = attendance.find(
      (a) => a.date === today && (a.employeeCode === employeeCode || a.employeeId === employeeCode)
    );

    // Validate that check-out is not at the same time as check-in
    let checkInMs = existing?.checkInTimeMs || (existing?.rawCheckIn ? new Date(existing.rawCheckIn).getTime() : 0);
    if (!checkInMs) {
      try {
        checkInMs = Number(localStorage.getItem(`hr_checkin_time_${today}`)) || 0;
      } catch {}
    }

    if (checkInMs && Date.now() - checkInMs < 60000) {
      const waitSec = Math.ceil((60000 - (Date.now() - checkInMs)) / 1000);
      showToast(`Cannot check out at the same time as check in. Please wait ${waitSec}s.`, 'error');
      return;
    }

    const inTime = existing?.checkIn && existing.checkIn !== '--:--' ? existing.checkIn : '09:00';
    let nowClock = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
    const nowClock12 = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

    // Safeguard: Ensure check-out clock is at least 1 minute after check-in clock
    if (nowClock === inTime) {
      const [h, m] = inTime.split(':').map(Number);
      const totalM = h * 60 + m + 1;
      const nextH = String(Math.floor(totalM / 60) % 24).padStart(2, '0');
      const nextM = String(totalM % 60).padStart(2, '0');
      nowClock = `${nextH}:${nextM}`;
    }

    const [h1, m1] = inTime.split(':').map(Number);
    const [h2, m2] = nowClock.split(':').map(Number);
    const totalMinutes = Math.max(1, h2 * 60 + m2 - (h1 * 60 + m1));
    const workedHours = Number((totalMinutes / 60).toFixed(1));
    const status = workedHours < 4 ? 'Half-day' : 'Present';

    try {
      if (existing?._id || existing?.id) {
        const persisted = await attendanceService.correctAttendance(existing._id || existing.id, employeeCode, {
          checkIn: inTime,
          checkOut: nowClock,
          reason: 'Daily Check-Out',
          date: today,
        });
        setAttendance((prev) =>
          prev.map((a) => (a.id === existing.id || a._id === existing._id ? { ...persisted, status } : a))
        );
        showToast('Checked out successfully!');
        return persisted;
      }
    } catch {
      // Fallback
    }

    const updated = {
      ...(existing || {}),
      id: existing?.id || `att-hr-${Date.now()}`,
      employeeId: employeeCode,
      employeeCode: employeeCode,
      employeeName: 'HR Manager',
      department: 'Human Resources',
      date: today,
      checkIn: inTime,
      checkOut: nowClock,
      checkInDisplay: existing?.checkInDisplay || inTime,
      checkOutDisplay: nowClock12,
      rawCheckOut: new Date().toISOString(),
      hasCheckIn: true,
      hasCheckOut: true,
      workedHours,
      status,
    };
    setAttendance((prev) =>
      prev.map((a) => (a.date === today && (a.employeeCode === employeeCode || a.employeeId === employeeCode) ? updated : a))
    );
    showToast('Checked out successfully!');
    return updated;
  };

  const addUser = async (userData) => {
    try {
      const created = await adminService.createUser(userData);
      setUsers((prev) => [created, ...prev]);
      const updatedLogs = await adminService.getAuditLogs();
      setAuditLogs(updatedLogs);
      showToast('User created successfully!');
      return created;
    } catch (err) {
      showToast(err.message || 'Failed to create user', 'error');
      throw err;
    }
  };

  const updateUser = async (userId, updates) => {
    try {
      const updated = await adminService.updateUser(userId, updates);
      setUsers((prev) => prev.map((u) => (u.id === userId ? updated : u)));
      const updatedLogs = await adminService.getAuditLogs();
      setAuditLogs(updatedLogs);
      showToast('User updated successfully!');
      return updated;
    } catch (err) {
      showToast(err.message || 'Failed to update user', 'error');
      throw err;
    }
  };

  const changeUserRole = async (userId, newRole) => {
    try {
      const updated = await adminService.changeUserRole(userId, newRole);
      setUsers((prev) => prev.map((u) => (u.id === userId ? updated : u)));
      const updatedLogs = await adminService.getAuditLogs();
      setAuditLogs(updatedLogs);
      showToast(`User role updated to ${newRole.replace(/_/g, ' ')}!`);
      return updated;
    } catch (err) {
      showToast(err.message || 'Failed to change role', 'error');
      throw err;
    }
  };

  const deactivateUser = async (userId) => {
    try {
      const updated = await adminService.deactivateUser(userId);
      setUsers((prev) => prev.map((u) => (u.id === userId ? updated : u)));
      const updatedLogs = await adminService.getAuditLogs();
      setAuditLogs(updatedLogs);
      showToast('User deactivated.');
      return updated;
    } catch (err) {
      showToast(err.message || 'Failed to deactivate user', 'error');
      throw err;
    }
  };

  const activateUser = async (userId) => {
    try {
      const updated = await adminService.activateUser(userId);
      setUsers((prev) => prev.map((u) => (u.id === userId ? updated : u)));
      const updatedLogs = await adminService.getAuditLogs();
      setAuditLogs(updatedLogs);
      showToast('User activated successfully!');
      return updated;
    } catch (err) {
      showToast(err.message || 'Failed to activate user', 'error');
      throw err;
    }
  };

  const deleteUser = async (userId) => {
    try {
      await adminService.deleteUser(userId);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      const updatedLogs = await adminService.getAuditLogs();
      setAuditLogs(updatedLogs);
      showToast('User deleted permanently.');
    } catch (err) {
      showToast(err.message || 'Failed to delete user', 'error');
      throw err;
    }
  };

  const logAdminAction = (actionDetails) => {
    const newLog = adminService.logAction(actionDetails);
    setAuditLogs((prev) => [newLog, ...prev]);
    return newLog;
  };

  // --- Department CRUD Operations ---
  const addDepartment = (deptData) => {
    const newDept = {
      id: `dept-${Date.now()}`,
      name: deptData.name.trim(),
      code: (deptData.code || deptData.name.substring(0, 3)).toUpperCase().trim(),
      manager: deptData.manager || 'Unassigned',
      description: deptData.description || '',
      floor: deptData.floor || 'Floor 1',
    };
    setDepartmentsList((prev) => [...prev, newDept]);
    logAdminAction({
      administrator: 'Administrator',
      action: 'Department created',
      module: 'Departments',
      target: `${newDept.name} (${newDept.code})`,
      status: 'Success'
    });
    showToast(`Department "${newDept.name}" created successfully!`);
    return newDept;
  };

  const updateDepartment = (id, updates) => {
    let updatedDept = null;
    setDepartmentsList((prev) =>
      prev.map((d) => {
        if (d.id === id || d.name === id) {
          updatedDept = { ...d, ...updates };
          return updatedDept;
        }
        return d;
      })
    );
    if (updates.name) {
      // Cascade department rename to job positions
      setJobPositionsList((prev) =>
        prev.map((p) => (p.department === id ? { ...p, department: updates.name } : p))
      );
    }
    logAdminAction({
      administrator: 'Administrator',
      action: 'Department updated',
      module: 'Departments',
      target: updates.name || id,
      status: 'Success'
    });
    showToast('Department updated successfully!');
    return updatedDept;
  };

  const deleteDepartment = (id) => {
    const target = departmentsList.find((d) => d.id === id || d.name === id);
    setDepartmentsList((prev) => prev.filter((d) => d.id !== id && d.name !== id));
    logAdminAction({
      administrator: 'Administrator',
      action: 'Department deleted',
      module: 'Departments',
      target: target ? target.name : id,
      status: 'Success'
    });
    showToast(`Department "${target?.name || id}" removed.`, 'info');
  };

  // --- Job Position CRUD Operations ---
  const addJobPosition = (posData) => {
    const newPos = {
      id: `pos-${Date.now()}`,
      title: posData.title.trim(),
      department: posData.department || departmentsList[0]?.name || 'Engineering',
      level: posData.level || 'Mid',
      status: posData.status || 'Active',
      description: posData.description || '',
    };
    setJobPositionsList((prev) => [...prev, newPos]);
    logAdminAction({
      administrator: 'Administrator',
      action: 'Job Position created',
      module: 'Positions',
      target: `${newPos.title} in ${newPos.department}`,
      status: 'Success'
    });
    showToast(`Position "${newPos.title}" created successfully!`);
    return newPos;
  };

  const updateJobPosition = (id, updates) => {
    let updatedPos = null;
    setJobPositionsList((prev) =>
      prev.map((p) => {
        if (p.id === id || p.title === id) {
          updatedPos = { ...p, ...updates };
          return updatedPos;
        }
        return p;
      })
    );
    logAdminAction({
      administrator: 'Administrator',
      action: 'Job Position updated',
      module: 'Positions',
      target: updates.title || id,
      status: 'Success'
    });
    showToast('Position updated successfully!');
    return updatedPos;
  };

  const deleteJobPosition = (id) => {
    const target = jobPositionsList.find((p) => p.id === id || p.title === id);
    setJobPositionsList((prev) => prev.filter((p) => p.id !== id && p.title !== id));
    logAdminAction({
      administrator: 'Administrator',
      action: 'Job Position deleted',
      module: 'Positions',
      target: target ? target.title : id,
      status: 'Success'
    });
    showToast(`Position "${target?.title || id}" removed.`, 'info');
  };

  // --- HR Manager Leaves Approval ---
  const approveHRLeave = (id) => {
    setHrTimeOffRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'Approved', approvedAt: new Date().toISOString() } : r))
    );
    setTimeOffRequests((prev) =>
      prev.map((r) => (r.id === id || r._id === id ? { ...r, status: 'Approved' } : r))
    );
    logAdminAction({
      administrator: 'Administrator',
      action: 'HR Leave Approved',
      module: 'HR Governance',
      target: `Leave approved for request ${id}`,
      status: 'Success'
    });
    showToast('HR Manager leave request approved.');
  };

  const refuseHRLeave = (id, refusalReason) => {
    setHrTimeOffRequests((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, status: 'Refused', refusalReason, refusedAt: new Date().toISOString() }
          : r
      )
    );
    setTimeOffRequests((prev) =>
      prev.map((r) => (r.id === id || r._id === id ? { ...r, status: 'Refused', refusalReason } : r))
    );
    logAdminAction({
      administrator: 'Administrator',
      action: 'HR Leave Refused',
      module: 'HR Governance',
      target: `Leave refused for request ${id}: ${refusalReason}`,
      status: 'Success'
    });
    showToast('HR Manager leave request refused.', 'info');
  };

  const addHRLeaveRequest = (leaveData) => {
    const newReq = {
      id: `REQ-HR-${Date.now().toString().slice(-4)}`,
      employeeId: leaveData.employeeId || 'HRMGR',
      employeeName: leaveData.employeeName || 'David Kim',
      role: leaveData.role || 'HR_MANAGER',
      roleName: leaveData.role === 'HR_PAYROLL_MANAGER' ? 'HR Payroll Manager' : 'HR Manager',
      department: 'Human Resources',
      jobPosition: leaveData.jobPosition || (leaveData.role === 'HR_PAYROLL_MANAGER' ? 'HR Payroll Manager' : 'HR Manager'),
      timeOffType: leaveData.timeOffType || 'Personal Leave',
      startDate: leaveData.startDate,
      endDate: leaveData.endDate,
      duration: leaveData.duration || 1,
      durationUnit: 'days',
      status: leaveData.status || 'Pending',
      reason: leaveData.reason || '',
      appliedDate: new Date().toISOString().split('T')[0],
    };
    setHrTimeOffRequests((prev) => [newReq, ...prev]);
    setTimeOffRequests((prev) => [newReq, ...prev]);
    logAdminAction({
      administrator: 'Administrator',
      action: 'HR Leave Submitted',
      module: 'HR Governance',
      target: `${newReq.employeeName} (${newReq.timeOffType}: ${newReq.duration} days)`,
      status: 'Success'
    });
    showToast('Leave request submitted successfully.');
    return newReq;
  };

  // --- HR Manager Attendance Timing Adjustments ---
  const adjustHRAttendance = (id, timingData) => {
    setHrAttendanceList((prev) =>
      prev.map((rec) => {
        if (rec.id === id) {
          let workedHours = rec.workedHours;
          if (timingData.checkIn && timingData.checkOut && timingData.checkOut !== '--:--') {
            const [h1, m1] = timingData.checkIn.split(':').map(Number);
            const [h2, m2] = timingData.checkOut.split(':').map(Number);
            const mins = Math.max(0, h2 * 60 + m2 - (h1 * 60 + m1));
            workedHours = Number((mins / 60).toFixed(1));
          }
          return {
            ...rec,
            ...timingData,
            workedHours,
            adjustedByAdmin: true,
          };
        }
        return rec;
      })
    );
    logAdminAction({
      administrator: 'Administrator',
      action: 'HR Attendance Timing Adjusted',
      module: 'HR Governance',
      target: `Timing updated for record ${id} (In: ${timingData.checkIn}, Out: ${timingData.checkOut})`,
      status: 'Success'
    });
    showToast('Attendance timing updated successfully.');
  };

  const addHRAttendanceRecord = (recordData) => {
    let workedHours = 0;
    if (recordData.checkIn && recordData.checkOut && recordData.checkOut !== '--:--') {
      const [h1, m1] = recordData.checkIn.split(':').map(Number);
      const [h2, m2] = recordData.checkOut.split(':').map(Number);
      const mins = Math.max(0, h2 * 60 + m2 - (h1 * 60 + m1));
      workedHours = Number((mins / 60).toFixed(1));
    }
    const newRecord = {
      id: `att-hr-${Date.now()}`,
      date: recordData.date || new Date().toISOString().split('T')[0],
      employeeCode: recordData.employeeCode || 'HRMGR',
      employeeName: recordData.employeeName || 'David Kim',
      role: recordData.role || 'HR_MANAGER',
      roleName: recordData.role === 'HR_PAYROLL_MANAGER' ? 'HR Payroll Manager' : 'HR Manager',
      department: 'Human Resources',
      checkIn: recordData.checkIn || '09:00',
      checkOut: recordData.checkOut || '18:00',
      workedHours,
      status: recordData.status || (workedHours >= 4 ? 'Present' : 'Half-day'),
      notes: recordData.notes || 'Recorded by Administrator',
      adjustedByAdmin: true,
    };
    setHrAttendanceList((prev) => [newRecord, ...prev]);
    setAttendance((prev) => [newRecord, ...prev]);
    logAdminAction({
      administrator: 'Administrator',
      action: 'HR Attendance Punch Created',
      module: 'HR Governance',
      target: `${newRecord.employeeName} on ${newRecord.date}`,
      status: 'Success'
    });
    showToast('Attendance punch added successfully.');
    return newRecord;
  };

  // --- Fixed Leave Allowances Management ---
  const updateFixedLeaveAllowances = (newAllowances) => {
    setFixedLeaveAllowances((prev) => {
      const updated = { ...prev, ...newAllowances };
      try {
        localStorage.setItem('peoplepay_fixed_leaves', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    // Also update existing allocations in memory
    setAllocations((prev) =>
      prev.map((a) => {
        if (newAllowances[a.typeName] != null) {
          const newAllocated = Number(newAllowances[a.typeName]);
          return {
            ...a,
            allocated: newAllocated,
            remaining: Math.max(0, newAllocated - (a.taken || 0)),
          };
        }
        return a;
      })
    );

    logAdminAction({
      administrator: 'Administrator',
      action: 'Fixed Leave Allowances Updated',
      module: 'Leave Policy',
      target: Object.entries(newAllowances).map(([k, v]) => `${k}: ${v} days`).join(', '),
      status: 'Success'
    });
    showToast('Fixed leave allowances updated successfully!');
  };

  // --- Payroll Role & Permissions ---
  const activeRoleCode = activeRoleOverride || user?.role || ROLES.HR_MANAGER;
  const isPayrollAuthorized =
    activeRoleCode === ROLES.HR_PAYROLL_MANAGER ||
    activeRoleCode === ROLES.HR_PAYROLL_USER ||
    activeRoleCode === ROLES.ADMIN;

  const currentRole = useMemo(
    () => ({
      name:
        activeRoleCode === ROLES.HR_PAYROLL_MANAGER
          ? 'HR Payroll Manager'
          : activeRoleCode === ROLES.HR_PAYROLL_USER
          ? 'HR Payroll User'
          : activeRoleCode === ROLES.ADMIN
          ? 'System Administrator'
          : 'HR Manager',
      code: activeRoleCode,
      permissions: {
        canAccessPayroll: isPayrollAuthorized,
        canManageEmployees: activeRoleCode !== ROLES.EMPLOYEE,
        canManageAttendance: true,
        canManageContracts: true,
        canManageSchedules: true,
        canManageTimeOff: true,
        canApproveTimeOff:
          activeRoleCode === ROLES.HR_MANAGER || activeRoleCode === ROLES.ADMIN,
      },
    }),
    [activeRoleCode, isPayrollAuthorized]
  );

  const switchRole = (newRole) => {
    setActiveRoleOverride(newRole);
  };

  // --- Payroll Actions ---
  const createPayrun = async (payload, selectedEmployees = []) => {
    const id = payload.id || `PR-${Date.now().toString().slice(-6)}`;
    const newPayrun = {
      ...payload,
      id,
      status: 'Draft',
      employeesCount: selectedEmployees.length,
      payslipsCount: 0,
      totalGross: 0,
      totalDeductions: 0,
      totalNet: 0,
      processedDate: null,
      paymentDate: null,
      notes: payload.notes || 'Payrun draft created via Wizard.',
    };
    setPayruns((prev) => [newPayrun, ...prev]);
    showToast('Payrun batch created successfully!');
    return newPayrun;
  };

  const computePayrun = async (payrunId) => {
    const payrun = payruns.find((p) => p.id === payrunId);
    if (!payrun) return;

    const result = await payrollService.computePayrun(payrunId, employees, contracts);
    if (result?.payrun) {
      setPayruns((prev) => prev.map((p) => (p.id === payrunId ? result.payrun : p)));
    }
    if (result?.payslips) {
      setPayslips((prev) => [
        ...prev.filter((p) => p.payrunId !== payrunId),
        ...result.payslips,
      ]);
    }
    showToast('Payrun computed successfully!');
    return result;
  };

  const validatePayrun = async (payrunId) => {
    const updated = await payrollService.validatePayrun(payrunId);
    setPayruns((prev) => prev.map((p) => (p.id === payrunId ? { ...p, status: 'Validated' } : p)));
    setPayslips((prev) =>
      prev.map((p) => (p.payrunId === payrunId ? { ...p, status: 'Validated' } : p))
    );
    showToast('Payrun validated successfully!');
    return updated;
  };

  const markPayrunPaid = async (payrunId) => {
    const updated = await payrollService.markPayrunPaid(payrunId);
    setPayruns((prev) =>
      prev.map((p) =>
        p.id === payrunId
          ? { ...p, status: 'Paid', paymentDate: new Date().toISOString().split('T')[0] }
          : p
      )
    );
    setPayslips((prev) =>
      prev.map((p) => (p.payrunId === payrunId ? { ...p, status: 'Paid' } : p))
    );
    showToast('Payrun marked as paid!');
    return updated;
  };

  const sendPayslips = async (payrunId) => {
    const res = await payrollService.sendPayslips(payrunId);
    setPayslips((prev) =>
      prev.map((p) => (p.payrunId === payrunId ? { ...p, status: 'Sent' } : p))
    );
    showToast('Payslips sent to employees!');
    return res;
  };

  const deletePayrun = async (payrunId) => {
    await payrollService.deletePayrun(payrunId);
    setPayruns((prev) => prev.filter((p) => p.id !== payrunId));
    setPayslips((prev) => prev.filter((p) => p.payrunId !== payrunId));
    showToast('Payrun deleted successfully');
  };

  const getPayrunWarnings = (payrun) => {
    return evaluatePayrollWarnings({ payrun, payslips, employees, contracts });
  };

  const addSalaryStructure = (data) => {
    const newStruc = {
      ...data,
      id: `SS-${Date.now().toString().slice(-4)}`,
      lastUpdated: new Date().toISOString().split('T')[0],
      status: data.status || 'Active',
    };
    setSalaryStructures((prev) => [newStruc, ...prev]);
    showToast('Salary structure created!');
    return newStruc;
  };

  const updateSalaryStructure = (id, data) => {
    setSalaryStructures((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, ...data, lastUpdated: new Date().toISOString().split('T')[0] } : s
      )
    );
    showToast('Salary structure updated!');
  };

  const deleteSalaryStructure = (id) => {
    setSalaryStructures((prev) => prev.filter((s) => s.id !== id));
    showToast('Salary structure deleted');
  };

  const addSalaryRule = (data) => {
    const newRule = {
      ...data,
      id: `RULE-${Date.now().toString().slice(-4)}`,
      status: data.status || 'Active',
    };
    setSalaryRules((prev) => [...prev, newRule]);
    showToast('Salary rule created!');
    return newRule;
  };

  const updateSalaryRule = (id, data) => {
    setSalaryRules((prev) => prev.map((r) => (r.id === id ? { ...r, ...data } : r)));
    showToast('Salary rule updated!');
  };

  const deleteSalaryRule = (id) => {
    setSalaryRules((prev) => prev.filter((r) => r.id !== id));
    showToast('Salary rule deleted');
  };

  const value = {
    employees,
    isLoadingEmployees,
    contracts,
    attendance,
    schedules,
    timeOffRequests,
    allocations,
    timeOffTypes,
    departments,
    jobPositions,
    departmentsList,
    jobPositionsList,
    hrTimeOffRequests,
    hrAttendanceList,
    fixedLeaveAllowances,
    updateFixedLeaveAllowances,
    kpis,
    attentionItems,
    toast,
    showToast,
    closeToast,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    addContract,
    updateContract,
    deleteContract,
    correctAttendance,
    hrCheckIn,
    hrCheckOut,
    approveTimeOff,
    refuseTimeOff,
    addSchedule,
    updateSchedule,
    deleteSchedule,
    addTimeOffType,
    users,
    auditLogs,
    systemStatus,
    addUser,
    createUser: addUser,
    updateUser,
    changeUserRole,
    deactivateUser,
    activateUser,
    deleteUser,
    logAdminAction,
    addDepartment,
    updateDepartment,
    deleteDepartment,
    addJobPosition,
    updateJobPosition,
    deleteJobPosition,
    approveHRLeave,
    refuseHRLeave,
    addHRLeaveRequest,
    adjustHRAttendance,
    addHRAttendanceRecord,
    // Payroll values & methods
    payruns,
    payslips,
    salaryStructures,
    salaryRules,
    currentRole,
    switchRole,
    createPayrun,
    computePayrun,
    validatePayrun,
    markPayrunPaid,
    sendPayslips,
    deletePayrun,
    getPayrunWarnings,
    addSalaryStructure,
    updateSalaryStructure,
    deleteSalaryStructure,
    addSalaryRule,
    updateSalaryRule,
    deleteSalaryRule,
  };

  return <HRDataContext.Provider value={value}>{children}</HRDataContext.Provider>;
}

export function useHRData() {
  const context = useContext(HRDataContext);
  if (!context) {
    throw new Error('useHRData must be used within an HRDataProvider');
  }
  return context;
}
