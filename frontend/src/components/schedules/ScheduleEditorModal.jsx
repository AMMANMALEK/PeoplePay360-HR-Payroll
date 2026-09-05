import React, { useState, useMemo, useEffect } from 'react';
import Modal from '../ui/Modal';
import { useHRData } from '../../context/HRDataContext';
import { Clock, Calculator, AlertCircle } from 'lucide-react';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export default function ScheduleEditorModal({ isOpen, onClose, initialData = null }) {
  const { addSchedule, updateSchedule } = useHRData();

  const [name, setName] = useState('');
  const [type, setType] = useState('Full-Time');
  const [days, setDays] = useState({
    monday: { enabled: true, start: '09:00', end: '17:30', breakHours: 0.5 },
    tuesday: { enabled: true, start: '09:00', end: '17:30', breakHours: 0.5 },
    wednesday: { enabled: true, start: '09:00', end: '17:30', breakHours: 0.5 },
    thursday: { enabled: true, start: '09:00', end: '17:30', breakHours: 0.5 },
    friday: { enabled: true, start: '09:00', end: '17:30', breakHours: 0.5 },
    saturday: { enabled: false, start: '09:00', end: '17:00', breakHours: 1.0 },
    sunday: { enabled: false, start: '09:00', end: '17:00', breakHours: 1.0 }
  });

  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setType(initialData.type || 'Full-Time');
      if (initialData.days) setDays(initialData.days);
    } else {
      setName('');
      setType('Full-Time');
      setDays({
        monday: { enabled: true, start: '09:00', end: '17:30', breakHours: 0.5 },
        tuesday: { enabled: true, start: '09:00', end: '17:30', breakHours: 0.5 },
        wednesday: { enabled: true, start: '09:00', end: '17:30', breakHours: 0.5 },
        thursday: { enabled: true, start: '09:00', end: '17:30', breakHours: 0.5 },
        friday: { enabled: true, start: '09:00', end: '17:30', breakHours: 0.5 },
        saturday: { enabled: false, start: '09:00', end: '17:00', breakHours: 1.0 },
        sunday: { enabled: false, start: '09:00', end: '17:00', breakHours: 1.0 }
      });
    }
    setValidationError('');
  }, [initialData, isOpen]);

  // Compute daily hours helper with validation
  const calculateDailyHours = (dayConfig) => {
    if (!dayConfig.enabled || !dayConfig.start || !dayConfig.end) return 0;
    const [h1, m1] = dayConfig.start.split(':').map(Number);
    const [h2, m2] = dayConfig.end.split(':').map(Number);
    const totalMinutes = h2 * 60 + m2 - (h1 * 60 + m1);
    if (totalMinutes <= 0) return 0;
    const grossHours = totalMinutes / 60;
    const netHours = Math.max(0, grossHours - (Number(dayConfig.breakHours) || 0));
    return Number(netHours.toFixed(2));
  };

  // Automatically calculate weekly hours
  const totalWeeklyHours = useMemo(() => {
    return Object.values(days).reduce((acc, curr) => acc + calculateDailyHours(curr), 0);
  }, [days]);

  // Active working days count and average
  const activeWorkingDays = useMemo(() => {
    return Object.values(days).filter((d) => d.enabled).length;
  }, [days]);

  const avgHoursPerDay = activeWorkingDays > 0 ? (totalWeeklyHours / activeWorkingDays).toFixed(1) : '0';

  const handleDayChange = (dayName, field, value) => {
    setDays((prev) => ({
      ...prev,
      [dayName]: {
        ...prev[dayName],
        [field]: value
      }
    }));
    setValidationError('');
  };

  const validate = () => {
    for (const day of DAYS) {
      const cfg = days[day];
      if (cfg.enabled) {
        if (!cfg.start || !cfg.end) {
          setValidationError(`Please enter both start and end times for ${day}.`);
          return false;
        }
        const [h1, m1] = cfg.start.split(':').map(Number);
        const [h2, m2] = cfg.end.split(':').map(Number);
        const diffMinutes = h2 * 60 + m2 - (h1 * 60 + m1);
        if (diffMinutes <= 0) {
          setValidationError(`End time must be after Start time for ${day.toUpperCase()}.`);
          return false;
        }
        if ((Number(cfg.breakHours) || 0) * 60 >= diffMinutes) {
          setValidationError(`Break duration cannot exceed or equal working shift on ${day.toUpperCase()}.`);
          return false;
        }
      }
    }
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setValidationError('Schedule name is required.');
      return;
    }
    if (!validate()) return;

    const payload = {
      name: name.trim(),
      type,
      days,
      weeklyHours: Number(totalWeeklyHours.toFixed(1))
    };

    if (initialData?.id) {
      updateSchedule(initialData.id, payload).then(() => onClose()).catch(() => {});
    } else {
      addSchedule(payload).then(() => onClose()).catch(() => {});
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? `Edit Schedule: ${initialData.name}` : 'New Working Schedule'}
      description="Configure weekly shifts. Total weekly hours are automatically computed from shift intervals."
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Validation error notice */}
        {validationError && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Header fields */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="block text-[11px] font-semibold text-slate-700">
              Schedule Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Standard 5-Day (40h)"
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700">Schedule Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="Full-Time">Full-Time (Standard)</option>
              <option value="Compressed">Compressed Work Week</option>
              <option value="Part-Time">Part-Time</option>
              <option value="Shift Rotation">Shift Rotation</option>
            </select>
          </div>
        </div>

        {/* Real-time Calculated Total Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between rounded-xl border border-indigo-200 bg-indigo-50/90 p-3.5 text-indigo-950 shadow-sm gap-2">
          <div className="flex items-center gap-2">
            <Calculator className="h-4 w-4 text-indigo-600 shrink-0" />
            <div>
              <span className="text-xs font-bold block">Calculated Weekly Hours</span>
              <span className="text-[11px] text-indigo-700 font-medium">
                {activeWorkingDays} working days × {avgHoursPerDay} hrs/day
              </span>
            </div>
          </div>
          <div className="flex items-baseline gap-1 self-end sm:self-auto">
            <span className="text-2xl font-extrabold text-indigo-700">{totalWeeklyHours.toFixed(1)}</span>
            <span className="text-xs font-bold text-indigo-600">hrs / week</span>
          </div>
        </div>

        {/* Monday - Sunday Daily Editor */}
        <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50/50 p-3">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
            Weekly Daily Hours Configuration
          </div>

          {DAYS.map((day) => {
            const config = days[day];
            const dayHours = calculateDailyHours(config);

            return (
              <div
                key={day}
                className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-lg border p-2.5 transition-colors ${
                  config.enabled ? 'border-slate-200 bg-white' : 'border-slate-200/50 bg-slate-100/50 opacity-60'
                }`}
              >
                <div className="flex items-center gap-2.5 w-32">
                  <input
                    type="checkbox"
                    id={`check-${day}`}
                    checked={config.enabled}
                    onChange={(e) => handleDayChange(day, 'enabled', e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                  <label
                    htmlFor={`check-${day}`}
                    className="text-xs font-semibold capitalize text-slate-800 cursor-pointer"
                  >
                    {day}
                  </label>
                </div>

                {config.enabled ? (
                  <div className="flex flex-1 flex-wrap items-center gap-2 text-xs">
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-slate-400 font-medium">Start:</span>
                      <input
                        type="time"
                        value={config.start}
                        onChange={(e) => handleDayChange(day, 'start', e.target.value)}
                        className="rounded border border-slate-300 px-2 py-1 text-xs"
                      />
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-slate-400 font-medium">End:</span>
                      <input
                        type="time"
                        value={config.end}
                        onChange={(e) => handleDayChange(day, 'end', e.target.value)}
                        className="rounded border border-slate-300 px-2 py-1 text-xs"
                      />
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-slate-400 font-medium">Break:</span>
                      <select
                        value={config.breakHours}
                        onChange={(e) => handleDayChange(day, 'breakHours', Number(e.target.value))}
                        className="rounded border border-slate-300 px-1.5 py-1 text-xs font-medium"
                      >
                        <option value={0}>0h</option>
                        <option value={0.5}>0.5h (30m)</option>
                        <option value={1.0}>1.0h (60m)</option>
                        <option value={1.5}>1.5h</option>
                      </select>
                    </div>
                    <div className="ml-auto text-xs font-bold text-slate-800">
                      {dayHours} hrs
                    </div>
                  </div>
                ) : (
                  <span className="text-xs italic text-slate-400 font-medium">Rest / Off</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary"
          >
            {initialData ? 'Save Schedule' : 'Create Schedule'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
