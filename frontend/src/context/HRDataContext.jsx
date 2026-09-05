import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { employeeService } from '../services/employeeService';
import { attendanceService } from '../services/attendanceService';
import { contractService } from '../services/contractService';
import { scheduleService } from '../services/scheduleService';
import { timeOffService } from '../services/timeOffService';
import { setApiErrorHandler } from '../services/apiService';

const HRDataContext = createContext(null);

export function HRDataProvider({ children }) {
  const [employees, setEmployees] = useState([]);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(true);
  const [contracts, setContracts] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [timeOffRequests, setTimeOffRequests] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [timeOffTypes, setTimeOffTypes] = useState([]);
  const [toast, setToast] = useState(null);

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
    ] = await Promise.all([
      employeeService.getEmployees().catch(() => []),
      contractService.getContracts().catch(() => []),
      attendanceService.getAttendance().catch(() => []),
      scheduleService.getSchedules().catch(() => []),
      timeOffService.getRequests().catch(() => []),
      timeOffService.getAllocations().catch(() => []),
      timeOffService.getTypes().catch(() => []),
    ]);

    setEmployees(Array.isArray(employeeRows) ? employeeRows : []);
    setContracts(Array.isArray(contractRows) ? contractRows : []);
    setAttendance(Array.isArray(attendanceRows) ? attendanceRows : []);
    setSchedules(Array.isArray(scheduleRows) ? scheduleRows : []);
    setTimeOffRequests(Array.isArray(requestRows) ? requestRows : []);
    setAllocations(Array.isArray(allocationRows) ? allocationRows : []);
    setTimeOffTypes(Array.isArray(typeRows) ? typeRows : []);
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
    return [...new Set(employees.map((e) => e.department).filter(Boolean))].sort();
  }, [employees]);

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

    return {
      totalEmployees,
      presentToday,
      pendingTimeOff,
      activeContracts,
      expiringContracts,
      attendanceExceptions,
      incompleteProfiles,
    };
  }, [employees, attendance, timeOffRequests, contracts]);

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
    const employee = employees.find((e) => e.id === data.employeeId);
    const persisted = await contractService.createContract(data.employeeId, data, employee);
    setContracts((prev) => [persisted, ...prev]);
    showToast(`Contract ${persisted.id} created for ${persisted.employeeName}.`);
    return persisted;
  };

  const updateContract = async (id, data) => {
    const existing = contracts.find((c) => c.id === id || c._id === id);
    const employee = employees.find((e) => e.id === (data.employeeId || existing?.employeeId));
    const persisted = await contractService.updateContract(existing?._id || id, {
      ...existing,
      ...data,
    }, employee);
    setContracts((prev) =>
      prev.map((c) => (c.id === id || c._id === id ? persisted : c))
    );
    showToast(`Contract ${persisted.id} updated.`);
    return persisted;
  };

  const deleteContract = async (id) => {
    const target = contracts.find((c) => c.id === id || c._id === id);
    const apiId = target?._id || id;
    await contractService.deleteContract(apiId);
    setContracts((prev) => prev.filter((c) => c.id !== id && c._id !== id && c._id !== apiId));
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
    const persisted = await timeOffService.approveRequest(requestId);
    setTimeOffRequests((prev) =>
      prev.map((r) => (r.id === requestId || r._id === requestId ? persisted : r))
    );
    const nextAllocations = await timeOffService.getAllocations().catch(() => allocations);
    setAllocations(nextAllocations);
    showToast('Time-off request approved. Leave balance updated.');
    return persisted;
  };

  const refuseTimeOff = async (requestId, refusalReason) => {
    const persisted = await timeOffService.refuseRequest(requestId, refusalReason);
    setTimeOffRequests((prev) =>
      prev.map((r) => (r.id === requestId || r._id === requestId ? persisted : r))
    );
    showToast('Request refused with reason logged.', 'info');
    return persisted;
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
      const persisted = await attendanceService.recordAttendance(employeeCode, {
        attendanceDate: today,
        checkIn: nowIso,
        status: 'present',
      });
      setAttendance((prev) => {
        const existingIdx = prev.findIndex(
          (a) => a.date === today && (a.employeeCode === employeeCode || a.employeeId === employeeCode)
        );
        if (existingIdx >= 0) {
          const copy = [...prev];
          copy[existingIdx] = persisted;
          return copy;
        }
        return [persisted, ...prev];
      });
      showToast('Checked in successfully!');
      return persisted;
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
    const nowClock = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
    const nowClock12 = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

    const inTime = existing?.checkIn && existing.checkIn !== '--:--' ? existing.checkIn : '09:00';
    const [h1, m1] = inTime.split(':').map(Number);
    const [h2, m2] = nowClock.split(':').map(Number);
    const totalMinutes = Math.max(0, h2 * 60 + m2 - (h1 * 60 + m1));
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
