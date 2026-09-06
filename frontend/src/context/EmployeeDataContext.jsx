import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { meService, localToday } from '../services/meService';
import { setApiErrorHandler } from '../services/apiService';

const EmployeeDataContext = createContext(null);

export function EmployeeDataProvider({ children }) {
  const [profile, setProfile] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [requests, setRequests] = useState([]);
  const [types, setTypes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
    window.setTimeout(() => {
      setToast((prev) => (prev?.id ? null : prev));
    }, 4000);
  };

  const loadAll = async () => {
    const [nextProfile, nextAttendance, nextAllocations, nextRequests, nextTypes] = await Promise.all([
      meService.getProfile(),
      meService.getAttendance(),
      meService.getAllocations(),
      meService.getTimeOffRequests(),
      meService.getTimeOffTypes(),
    ]);
    setProfile(nextProfile);
    setAttendance(Array.isArray(nextAttendance) ? nextAttendance : []);
    setAllocations(Array.isArray(nextAllocations) ? nextAllocations : []);
    setRequests(Array.isArray(nextRequests) ? nextRequests : []);
    setTypes(Array.isArray(nextTypes) ? nextTypes : []);
    setError('');
  };

  useEffect(() => {
    setApiErrorHandler((apiError) => {
      if (apiError?.status !== 401) {
        showToast(apiError.message || 'Request failed', 'error');
      }
    });
    return () => setApiErrorHandler(null);
  }, []);

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);
    loadAll()
      .catch((loadError) => {
        if (mounted) setError(loadError.message || 'Unable to load your workspace');
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const refresh = async () => {
    try {
      await loadAll();
    } catch (refreshError) {
      setError(refreshError.message || 'Unable to refresh data');
      throw refreshError;
    }
  };

  const todayRecord = useMemo(
    () => attendance.find((row) => row.date === localToday()) || null,
    [attendance]
  );

  const checkIn = async () => {
    const now = new Date().toISOString();
    let updatedOrCreated;
    if (todayRecord && !todayRecord.hasCheckIn) {
      updatedOrCreated = await meService.updateAttendance(todayRecord.id, { checkIn: now });
    } else {
      updatedOrCreated = await meService.createAttendance({
        attendanceDate: localToday(),
        status: 'present',
        checkIn: now,
      });
    }
    if (updatedOrCreated) {
      setAttendance((prev) => {
        const index = prev.findIndex(
          (r) => r.id === updatedOrCreated.id || r.date === updatedOrCreated.date
        );
        if (index >= 0) {
          const next = [...prev];
          next[index] = updatedOrCreated;
          return next;
        }
        return [updatedOrCreated, ...prev];
      });
    }
    showToast('Checked in');
    await refresh();
  };

  const checkOut = async () => {
    if (!todayRecord?.id) {
      throw new Error('Check in before checking out');
    }
    const checkInVal = todayRecord.rawCheckIn || todayRecord.checkIn;
    if (checkInVal) {
      const checkInMs = new Date(checkInVal).getTime();
      const nowMs = Date.now();
      if (!Number.isNaN(checkInMs) && nowMs - checkInMs < 60000) {
        const remainingSec = Math.max(1, Math.ceil((60000 - (nowMs - checkInMs)) / 1000));
        const error = new Error(
          `Check-out cannot be at the same time as check-in. Please wait ${remainingSec}s before checking out.`
        );
        showToast(error.message, 'error');
        throw error;
      }
    }
    const updated = await meService.updateAttendance(todayRecord.id, { checkOut: new Date().toISOString() });
    if (updated) {
      setAttendance((prev) => {
        const index = prev.findIndex((r) => r.id === updated.id);
        if (index >= 0) {
          const next = [...prev];
          next[index] = updated;
          return next;
        }
        return [updated, ...prev];
      });
    }
    showToast('Checked out successfully');
    await refresh();
  };

  const createTimeOffRequest = async (form) => {
    const persisted = await meService.createTimeOffRequest(form);
    showToast(persisted?.message || 'Time off request approved successfully.');
    await refresh();
    return persisted;
  };

  const updateProfile = async ({ phone }) => {
    const updated = await meService.updateProfile({ phone });
    setProfile(updated);
    showToast('Mobile phone updated successfully');
    await refresh();
    return updated;
  };

  const currentYear = new Date().getFullYear();

  const [fixedLeavesVersion, setFixedLeavesVersion] = useState(0);

  useEffect(() => {
    const handleUpdate = () => setFixedLeavesVersion((v) => v + 1);
    window.addEventListener('storage', handleUpdate);
    window.addEventListener('peoplepay_fixed_leaves_updated', handleUpdate);
    return () => {
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('peoplepay_fixed_leaves_updated', handleUpdate);
    };
  }, []);

  // Read admin-configured fixed leave allowances
  const configuredAllowances = useMemo(() => {
    try {
      const saved = localStorage.getItem('peoplepay_fixed_leaves');
      if (saved) return JSON.parse(saved);
    } catch {}
    return { 'Personal Leave': 15, 'Sick Leave': 10, 'Festival Leave': 5 };
  }, [allocations, fixedLeavesVersion]);

  const syncedAllocations = useMemo(() => {
    const defaultTypes = [
      { typeName: 'Personal Leave', typeCode: 'PERSONAL' },
      { typeName: 'Sick Leave', typeCode: 'SICK' },
      { typeName: 'Festival Leave', typeCode: 'FESTIVAL' },
    ];

    const result = [...allocations];

    defaultTypes.forEach(({ typeName, typeCode }) => {
      const configured = configuredAllowances[typeName];
      if (configured != null) {
        const idx = result.findIndex((a) => a.typeName === typeName || a.typeCode === typeCode);
        if (idx >= 0) {
          const taken = result[idx].taken || 0;
          result[idx] = {
            ...result[idx],
            allocated: configured,
            remaining: Math.max(0, configured - taken),
          };
        } else {
          result.push({
            id: `alloc-${typeCode.toLowerCase()}`,
            typeName,
            typeCode,
            allocated: configured,
            taken: 0,
            remaining: configured,
            validity: `${currentYear}-12-31`,
            status: 'Active',
          });
        }
      }
    });

    return result;
  }, [allocations, configuredAllowances, currentYear]);

  const currentPersonalLeave =
    syncedAllocations.find(
      (row) =>
        (row.typeName === 'Personal Leave' || row.typeCode === 'PERSONAL') &&
        String(row.validity || '').startsWith(String(currentYear))
    ) ||
    syncedAllocations.find((row) => row.typeName === 'Personal Leave') ||
    null;

  const currentSickLeave =
    syncedAllocations.find(
      (row) =>
        (row.typeName === 'Sick Leave' || row.typeCode === 'SICK') &&
        String(row.validity || '').startsWith(String(currentYear))
    ) ||
    syncedAllocations.find((row) => row.typeName === 'Sick Leave') ||
    null;

  const currentFestivalLeave =
    syncedAllocations.find(
      (row) =>
        (row.typeName === 'Festival Leave' || row.typeCode === 'FESTIVAL') &&
        String(row.validity || '').startsWith(String(currentYear))
    ) ||
    syncedAllocations.find((row) => row.typeName === 'Festival Leave') ||
    null;

  const remainingLeave = Number(currentPersonalLeave?.remaining) || 0;
  const totalRemainingLeaves =
    (Number(currentPersonalLeave?.remaining) || 0) +
    (Number(currentSickLeave?.remaining) || 0) +
    (Number(currentFestivalLeave?.remaining) || 0);

  const pendingCount = requests.filter((row) => row.status === 'Pending').length;

  return (
    <EmployeeDataContext.Provider
      value={{
        profile,
        attendance,
        allocations: syncedAllocations,
        requests,
        types,
        todayRecord,
        remainingLeave,
        currentPersonalLeave,
        currentSickLeave,
        currentFestivalLeave,
        totalRemainingLeaves,
        pendingCount,
        isLoading,
        error,
        toast,
        showToast,
        closeToast: () => setToast(null),
        refresh,
        checkIn,
        checkOut,
        createTimeOffRequest,
        updateProfile,
      }}
    >
      {children}
    </EmployeeDataContext.Provider>
  );
}

export function useEmployeeData() {
  const context = useContext(EmployeeDataContext);
  if (!context) {
    throw new Error('useEmployeeData must be used within an EmployeeDataProvider');
  }
  return context;
}
