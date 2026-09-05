import React, { useState, useEffect } from 'react';
import { AlertCircle, Clock } from 'lucide-react';
import StatusBadge from '../ui/StatusBadge';
import { useEmployeeData } from '../../context/EmployeeDataContext';
import { localToday } from '../../services/meService';

export default function TodayAttendanceCard() {
  const { todayRecord, isLoading, checkIn, checkOut } = useEmployeeData();
  const [isSaving, setIsSaving] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  useEffect(() => {
    if (!todayRecord?.checkIn || todayRecord?.hasCheckOut) {
      setCooldownSeconds(0);
      return;
    }

    const checkInMs = new Date(todayRecord.checkIn).getTime();
    const updateCooldown = () => {
      const diffMs = Date.now() - checkInMs;
      if (diffMs < 60000) {
        setCooldownSeconds(Math.ceil((60000 - diffMs) / 1000));
      } else {
        setCooldownSeconds(0);
      }
    };

    updateCooldown();
    const interval = setInterval(updateCooldown, 1000);
    return () => clearInterval(interval);
  }, [todayRecord?.checkIn, todayRecord?.hasCheckOut]);

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
  const isCheckOutDisabled = isSaving || cooldownSeconds > 0;

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
              <div className="space-y-2">
                <button
                  type="button"
                  className={`btn-primary ${
                    isCheckOutDisabled ? 'cursor-not-allowed opacity-60' : ''
                  }`}
                  disabled={isCheckOutDisabled}
                  onClick={() => handleAction(checkOut)}
                >
                  {isSaving ? 'Saving…' : cooldownSeconds > 0 ? `Wait ${cooldownSeconds}s` : 'Check out'}
                </button>
                {cooldownSeconds > 0 && (
                  <p className="flex items-center gap-1.5 text-xs font-medium text-amber-600">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    Cannot check out at the same time as check in. Available in {cooldownSeconds}s.
                  </p>
                )}
              </div>
            )}
            {todayRecord?.hasCheckIn && todayRecord?.hasCheckOut && (
              <p className="flex items-center gap-1.5 text-xs text-slate-500">
                <Clock className="h-3.5 w-3.5 text-emerald-600" />
                Today's attendance is complete ({todayRecord?.workedHours || 0} hrs logged).
              </p>
            )}
          </div>
        </>
      )}
    </section>
  );
}
