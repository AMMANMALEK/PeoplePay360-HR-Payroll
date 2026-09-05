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
    if (todayRecord && !todayRecord.hasCheckIn) {
      await meService.updateAttendance(todayRecord.id, { checkIn: now });
    } else {
      await meService.createAttendance({
        attendanceDate: localToday(),
        status: 'present',
        checkIn: now,
      });
    }
    showToast('Checked in');
    await refresh();
  };

  const checkOut = async () => {
    if (!todayRecord?.id) {
      throw new Error('Check in before checking out');
    }
    await meService.updateAttendance(todayRecord.id, { checkOut: new Date().toISOString() });
    showToast('Checked out');
    await refresh();
  };

  const createTimeOffRequest = async (form) => {
    const persisted = await meService.createTimeOffRequest(form);
    showToast(persisted?.message || 'Personal Leave approved successfully.');
    await refresh();
    return persisted;
  };

  const currentYear = new Date().getFullYear();
  const currentPersonalLeave =
    allocations.find(
      (row) =>
        (row.typeName === 'Personal Leave' || row.typeCode === 'PERSONAL') &&
        String(row.validity || '').startsWith(String(currentYear))
    ) ||
    allocations.find((row) => row.typeName === 'Personal Leave') ||
    allocations[0] ||
    null;
  const remainingLeave = Number(currentPersonalLeave?.remaining) || 0;
  const pendingCount = requests.filter((row) => row.status === 'Pending').length;

  return (
    <EmployeeDataContext.Provider
      value={{
        profile,
        attendance,
        allocations,
        requests,
        types,
        todayRecord,
        remainingLeave,
        currentPersonalLeave,
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
