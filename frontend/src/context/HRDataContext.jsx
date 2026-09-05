import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import {
  INITIAL_EMPLOYEES,
  INITIAL_CONTRACTS,
  INITIAL_ATTENDANCE,
  INITIAL_SCHEDULES,
  INITIAL_TIME_OFF_REQUESTS,
  INITIAL_ALLOCATIONS,
  INITIAL_TIME_OFF_TYPES,
  INITIAL_ATTENTION_ITEMS,
  INITIAL_DEPARTMENTS
} from '../data/mockData';
import { employeeService } from '../services/employeeService';
import { attendanceService } from '../services/attendanceService';

const HRDataContext = createContext(null);

export function HRDataProvider({ children }) {
  const [employees, setEmployees] = useState(INITIAL_EMPLOYEES);
  const [contracts, setContracts] = useState(INITIAL_CONTRACTS);
  const [attendance, setAttendance] = useState(INITIAL_ATTENDANCE);
  const [schedules, setSchedules] = useState(INITIAL_SCHEDULES);
  const [timeOffRequests, setTimeOffRequests] = useState(INITIAL_TIME_OFF_REQUESTS);
  const [allocations, setAllocations] = useState(INITIAL_ALLOCATIONS);
  const [timeOffTypes, setTimeOffTypes] = useState(INITIAL_TIME_OFF_TYPES);
  const [departments] = useState(INITIAL_DEPARTMENTS);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast((prev) => (prev?.id ? null : prev));
    }, 4000);
  };

  const closeToast = () => setToast(null);

  // Load live employees from backend on mount (with automatic fallback)
  useEffect(() => {
    let isMounted = true;
    employeeService
      .getEmployees()
      .then((data) => {
        if (isMounted && data && Array.isArray(data) && data.length > 0) {
          setEmployees(data);
        }
      })
      .catch((err) => {
        console.warn('Initial backend employee fetch fallback:', err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Computed dashboard KPIs
  const kpis = useMemo(() => {
    const totalEmployees = employees.length;
    const presentToday = attendance.filter((a) => a.status === 'Present' || a.status === 'Overtime' || a.status === 'Late').length;
    const attendanceExceptions = attendance.filter((a) => a.isException).length;
    const pendingTimeOff = timeOffRequests.filter((r) => r.status === 'Pending').length;
    const activeContracts = contracts.filter((c) => c.status === 'Active').length;
    const expiringContracts = contracts.filter((c) => {
      if (c.status !== 'Active' || !c.endDate) return false;
      const end = new Date(c.endDate);
      const now = new Date('2026-09-05');
      const diffDays = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays <= 45;
    }).length;
    const incompleteProfiles = employees.filter((e) => !e.profileComplete).length;

    return {
      totalEmployees,
      presentToday,
      presentRate: Math.round((presentToday / (totalEmployees || 1)) * 100),
      pendingTimeOff,
      activeContracts,
      expiringContracts,
      attendanceExceptions,
      incompleteProfiles
    };
  }, [employees, attendance, timeOffRequests, contracts]);

  // Actionable Attention Items based on real-time state
  const attentionItems = useMemo(() => {
    const items = [];

    if (kpis.attendanceExceptions > 0) {
      items.push({
        id: 'ATTN-ATTENDANCE',
        type: 'warning',
        icon: 'AlertTriangle',
        title: `${kpis.attendanceExceptions} attendance records need correction`,
        description: 'Missing check-out and unexcused absences recorded today.',
        targetRoute: '/attendance?filter=exceptions',
        actionLabel: 'Review attendance',
        count: kpis.attendanceExceptions
      });
    }

    if (kpis.pendingTimeOff > 0) {
      items.push({
        id: 'ATTN-TIMEOFF',
        type: 'urgent',
        icon: 'Clock',
        title: `${kpis.pendingTimeOff} time-off requests awaiting approval`,
        description: 'Employees waiting on approval for upcoming annual and sick leaves.',
        targetRoute: '/time-off?status=Pending',
        actionLabel: 'Review requests',
        count: kpis.pendingTimeOff
      });
    }

    if (kpis.expiringContracts > 0) {
      items.push({
        id: 'ATTN-CONTRACTS',
        type: 'warning',
        icon: 'FileWarning',
        title: `${kpis.expiringContracts} contracts expire within 45 days`,
        description: 'Fixed term and seasonal agreements requiring renewal or transition.',
        targetRoute: '/contracts?filter=expiring',
        actionLabel: 'View contracts',
        count: kpis.expiringContracts
      });
    }

    if (kpis.incompleteProfiles > 0) {
      items.push({
        id: 'ATTN-PROFILES',
        type: 'info',
        icon: 'UserX',
        title: `${kpis.incompleteProfiles} employees have incomplete profiles`,
        description: 'Emergency contacts or required identity documents are missing.',
        targetRoute: '/employees?filter=incomplete',
        actionLabel: 'Complete employee data',
        count: kpis.incompleteProfiles
      });
    }

    return items;
  }, [kpis]);

  // ----------------- EMPLOYEES CRUD -----------------
  const addEmployee = async (data) => {
    const id = data.id || `EMP-${1000 + employees.length + 1}`;
    const newEmp = {
      id,
      fullName:
        data.firstName && data.lastName
          ? `${data.firstName} ${data.lastName}`
          : data.fullName || 'Employee',
      profileComplete: true,
      joinedDate: data.joinedDate || new Date().toISOString().split('T')[0],
      ...data,
    };

    // Optimistic UI update
    setEmployees((prev) => [newEmp, ...prev]);
    showToast(`Employee ${newEmp.fullName} created successfully.`);

    // Persist to backend API
    try {
      const persisted = await employeeService.createEmployee(newEmp);
      if (persisted && (persisted._id || persisted.id)) {
        setEmployees((prev) =>
          prev.map((emp) =>
            emp.id === newEmp.id ? { ...emp, ...persisted } : emp
          )
        );
      }
    } catch (err) {
      console.warn('Backend sync failed for addEmployee:', err);
    }

    return newEmp;
  };

  const updateEmployee = async (id, data) => {
    const target = employees.find((e) => e.id === id || e._id === id);

    setEmployees((prev) =>
      prev.map((emp) =>
        emp.id === id || emp._id === id
          ? {
              ...emp,
              ...data,
              fullName:
                data.firstName && data.lastName
                  ? `${data.firstName} ${data.lastName}`
                  : emp.fullName,
            }
          : emp
      )
    );
    showToast('Employee information updated.');

    // Persist to backend API
    try {
      await employeeService.updateEmployee(id, data, target?._id);
    } catch (err) {
      console.warn('Backend sync failed for updateEmployee:', err);
    }
  };

  const deleteEmployee = async (id) => {
    const target = employees.find((e) => e.id === id || e._id === id);
    setEmployees((prev) => prev.filter((e) => e.id !== id && e._id !== id));
    showToast(`Employee ${target?.fullName || id} removed permanently.`, 'info');

    // Persist to backend API
    try {
      await employeeService.deleteEmployee(id, target?._id);
    } catch (err) {
      console.warn('Backend sync failed for deleteEmployee:', err);
    }
  };

  // ----------------- CONTRACTS CRUD -----------------
  const addContract = (data) => {
    const id = `CNT-${new Date().getFullYear()}-${String(contracts.length + 1).padStart(3, '0')}`;
    const newContract = {
      id,
      isCurrent: data.status === 'Active',
      ...data
    };

    // If new contract is active, set other contracts for this employee to historical/expired if overlapping
    if (newContract.status === 'Active') {
      setContracts((prev) =>
        [newContract, ...prev.map((c) => (c.employeeId === newContract.employeeId && c.isCurrent ? { ...c, isCurrent: false, status: 'Expired' } : c))]
      );
    } else {
      setContracts((prev) => [newContract, ...prev]);
    }

    showToast(`Contract ${id} created for ${data.employeeName}.`);
    return newContract;
  };

  const updateContract = (id, data) => {
    setContracts((prev) => prev.map((c) => (c.id === id ? { ...c, ...data } : c)));
    showToast(`Contract ${id} updated.`);
  };

  // ----------------- ATTENDANCE ACTIONS -----------------
  const correctAttendance = (attendanceId, { checkIn, checkOut, reason }) => {
    const formattedTimestamp = new Date().toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    let workedHours = 8.0;
    if (checkIn && checkOut && checkIn !== '--:--' && checkOut !== '--:--') {
      const [h1, m1] = checkIn.split(':').map(Number);
      const [h2, m2] = checkOut.split(':').map(Number);
      const mins = h2 * 60 + m2 - (h1 * 60 + m1);
      workedHours = Math.max(0, Number((mins / 60).toFixed(2)));
    }

    setAttendance((prev) =>
      prev.map((record) => {
        if (record.id === attendanceId) {
          return {
            ...record,
            checkIn: checkIn || record.checkIn,
            checkOut: checkOut || record.checkOut,
            workedHours,
            status: 'Present',
            isException: false,
            correction: {
              correctedBy: 'HR Manager (You)',
              correctedAt: formattedTimestamp,
              reason
            }
          };
        }
        return record;
      })
    );

    const record = attendance.find((a) => a.id === attendanceId);
    const empCode = record?.employeeCode || record?.employeeId;
    if (empCode) {
      attendanceService
        .correctAttendance(attendanceId, empCode, { checkIn, checkOut, reason })
        .catch((err) => console.warn('Backend attendance sync error:', err));
    }

    showToast('Attendance corrected successfully.');
  };

  // ----------------- TIME OFF WORKFLOW -----------------
  const approveTimeOff = (requestId) => {
    const req = timeOffRequests.find((r) => r.id === requestId);
    if (!req) return;

    // 1. Update request status to Approved
    setTimeOffRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: 'Approved' } : r))
    );

    // 2. Reduce leave allocation for this employee
    setAllocations((prev) =>
      prev.map((alc) => {
        if (alc.employeeId === req.employeeId && alc.typeName.toLowerCase().includes(req.timeOffType.toLowerCase())) {
          const newRemaining = Math.max(0, alc.remaining - req.duration);
          const newTaken = alc.taken + req.duration;
          return {
            ...alc,
            remaining: newRemaining,
            taken: newTaken
          };
        }
        return alc;
      })
    );

    showToast(`Request ${requestId} approved. Leave balance updated.`);
  };

  const refuseTimeOff = (requestId, refusalReason) => {
    setTimeOffRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: 'Refused', refusalReason } : r))
    );
    showToast(`Request ${requestId} refused with reason logged.`, 'info');
  };

  // ----------------- WORKING SCHEDULES -----------------
  const addSchedule = (data) => {
    const id = `sched-${schedules.length + 1}`;
    const newSchedule = {
      id,
      employeesCount: 0,
      status: 'Active',
      ...data
    };
    setSchedules((prev) => [...prev, newSchedule]);
    showToast(`Schedule "${data.name}" created successfully.`);
    return newSchedule;
  };

  const updateSchedule = (id, data) => {
    setSchedules((prev) => prev.map((s) => (s.id === id ? { ...s, ...data } : s)));
    showToast('Working schedule updated.');
  };

  // ----------------- TIME OFF TYPES -----------------
  const addTimeOffType = (data) => {
    const id = `TOT-${timeOffTypes.length + 1}`;
    const newType = {
      id,
      isSystem: false,
      ...data
    };
    setTimeOffTypes((prev) => [...prev, newType]);
    showToast(`Time off type "${data.name}" added.`);
    return newType;
  };

  const value = {
    employees,
    contracts,
    attendance,
    schedules,
    timeOffRequests,
    allocations,
    timeOffTypes,
    departments,
    kpis,
    attentionItems,
    toast,
    showToast,
    closeToast,
    // Operations
    addEmployee,
    updateEmployee,
    deleteEmployee,
    addContract,
    updateContract,
    correctAttendance,
    approveTimeOff,
    refuseTimeOff,
    addSchedule,
    updateSchedule,
    addTimeOffType
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
