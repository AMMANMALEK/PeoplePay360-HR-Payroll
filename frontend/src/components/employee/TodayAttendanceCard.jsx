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
    <section className="app-card p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Left: Title & Status */}
        <div className="flex items-center gap-3">
          <div>
            <h3 className="text-base font-semibold text-slate-900">Today's attendance</h3>
            <p className="mt-0.5 text-xs text-slate-500">{localToday()}</p>
          </div>
          <StatusBadge status={todayRecord?.status || 'Not recorded'} />
        </div>

        {/* Center: Check-in & Check-out displays */}
        {isLoading ? (
          <p className="text-sm text-slate-500">Loading today's record…</p>
        ) : (
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-2.5">
              <span className="text-xs font-medium text-slate-500">Check in</span>
              <span className="text-base font-bold text-slate-900">
                {todayRecord?.checkInDisplay || '--'}
              </span>
            </div>
            <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-2.5">
              <span className="text-xs font-medium text-slate-500">Check out</span>
              <span className="text-base font-bold text-slate-900">
                {todayRecord?.checkOutDisplay || '--'}
              </span>
            </div>
          </div>
        )}

        {/* Right: Actions */}
        {!isLoading && (
          <div className="flex flex-col items-start gap-1.5 sm:items-end">
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
              <div className="flex flex-col items-start gap-1.5 sm:items-end">
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
                    Cannot check out at the same time as check in ({cooldownSeconds}s).
                  </p>
                )}
              </div>
            )}

            {todayRecord?.hasCheckIn && todayRecord?.hasCheckOut && (
              <p className="flex items-center gap-1.5 text-xs text-slate-500">
                <Clock className="h-3.5 w-3.5 text-emerald-600" />
                Completed ({todayRecord?.workedHours || 0} hrs logged)
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
