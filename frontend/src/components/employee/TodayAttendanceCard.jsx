import React, { useState } from 'react';
import StatusBadge from '../ui/StatusBadge';
import { useEmployeeData } from '../../context/EmployeeDataContext';
import { localToday } from '../../services/meService';

export default function TodayAttendanceCard() {
  const { todayRecord, isLoading, checkIn, checkOut } = useEmployeeData();
  const [isSaving, setIsSaving] = useState(false);

  const handleAction = async (action) => {
    setIsSaving(true);
    try {
      await action();
    } catch {
      /* toast handled by API/context */
    } finally {
      setIsSaving(false);
    }
  };

  const canCheckIn = !todayRecord?.hasCheckIn;
  const canCheckOut = Boolean(todayRecord?.hasCheckIn && !todayRecord?.hasCheckOut);

  return (
    <section className="app-card p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-slate-900">Today's attendance</h3>
          <p className="mt-0.5 text-xs text-slate-500">{localToday()}</p>
        </div>
        <StatusBadge status={todayRecord?.status || 'Not recorded'} />
      </div>

      {isLoading ? (
        <p className="text-sm text-slate-500">Loading today's record…</p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-slate-50 px-4 py-3">
              <p className="text-[11px] font-medium text-slate-500">Check in</p>
              <p className="mt-1 text-lg font-semibold text-slate-900">
                {todayRecord?.checkInDisplay || '--'}
              </p>
            </div>
            <div className="rounded-2xl bg-slate-50 px-4 py-3">
              <p className="text-[11px] font-medium text-slate-500">Check out</p>
              <p className="mt-1 text-lg font-semibold text-slate-900">
                {todayRecord?.checkOutDisplay || '--'}
              </p>
            </div>
          </div>
          <div className="mt-4">
            {canCheckIn && (
              <button
                type="button"
                className="btn-primary"
                disabled={isSaving}
                onClick={() => handleAction(checkIn)}
              >
                {isSaving ? 'Saving…' : 'Check in'}
              </button>
            )}
            {canCheckOut && (
              <button
                type="button"
                className="btn-primary"
                disabled={isSaving}
                onClick={() => handleAction(checkOut)}
              >
                {isSaving ? 'Saving…' : 'Check out'}
              </button>
            )}
            {todayRecord?.hasCheckIn && todayRecord?.hasCheckOut && (
              <p className="text-xs text-slate-500">Today's attendance is complete.</p>
            )}
          </div>
        </>
      )}
    </section>
  );
}
