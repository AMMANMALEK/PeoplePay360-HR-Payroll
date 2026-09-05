import React, { useState, useMemo, useEffect } from 'react';
import Modal from '../ui/Modal';
import { useHRData } from '../../context/HRDataContext';
import { Clock, AlertCircle } from 'lucide-react';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const BREAK_OPTIONS = [
  { value: 0, label: '0 min' },
  { value: 0.5, label: '30 min' },
  { value: 1.0, label: '60 min' },
  { value: 1.5, label: '90 min' },
];

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
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      const rawType = String(initialData.type || 'Full-Time');
      setType(rawType.toLowerCase().includes('part') ? 'Part-Time' : 'Full-Time');
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
    setIsSubmitting(false);
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

    setIsSubmitting(true);
    const request = initialData?.id
      ? updateSchedule(initialData.id, payload)
      : addSchedule(payload);

    request
      .then(() => onClose())
      .catch(() => {})
      .finally(() => setIsSubmitting(false));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      layout="panel"
      maxWidth="max-w-3xl"
      title={initialData ? 'Edit Working Schedule' : 'Create Working Schedule'}
      description="Configure working days, shifts and weekly hours."
      footer={
        <>
          <button type="button" onClick={onClose} className="btn-secondary" disabled={isSubmitting}>
            Cancel
          </button>
          <button type="submit" form="schedule-editor-form" className="btn-primary" disabled={isSubmitting}>
            {isSubmitting
              ? initialData
                ? 'Saving…'
                : 'Creating…'
              : initialData
                ? 'Save Schedule'
                : 'Create Schedule'}
          </button>
        </>
      }
    >
      <form id="schedule-editor-form" onSubmit={handleSubmit} className="space-y-6">
        {validationError && (
          <div className="flex items-start gap-2.5 rounded-2xl border border-rose-200 bg-rose-50 px-3.5 py-3 text-xs text-rose-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
            <span>{validationError}</span>
          </div>
        )}

        <section>
          <h4 className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
            Basic information
          </h4>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-[11px] font-medium text-slate-700">
                Schedule Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Standard 5-Day (40h)"
                className="field-input"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-700">Schedule Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="field-input"
              >
                <option value="Full-Time">Full-Time</option>
                <option value="Part-Time">Part-Time</option>
              </select>
            </div>
          </div>
        </section>

        <section className="rounded-[18px] bg-[#eef8d8] px-5 py-4">
          <p className="text-[11px] font-medium text-slate-600">Weekly Hours</p>
          <p className="mt-1 text-[28px] font-semibold tracking-tight text-slate-900">
            {totalWeeklyHours.toFixed(1)}
            <span className="ml-1.5 text-sm font-medium text-slate-600">hrs / week</span>
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {activeWorkingDays} working days × {avgHoursPerDay} hrs/day
          </p>
        </section>

        <section>
          <div className="mb-3">
            <h4 className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
              Working days
            </h4>
            <p className="mt-1 text-xs text-slate-500">
              Select working days and configure their shift timings.
            </p>
          </div>

          <div className="space-y-2">
            {DAYS.map((day) => {
              const config = days[day];
              const dayHours = calculateDailyHours(config);

              return (
                <div
                  key={day}
                  className={`rounded-2xl border px-3.5 py-3 transition-colors ${
                    config.enabled
                      ? 'border-slate-200/80 bg-white hover:border-brand-200'
                      : 'border-transparent bg-slate-50'
                  }`}
                >
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                    <label
                      htmlFor={`check-${day}`}
                      className="flex w-full cursor-pointer items-center gap-3 lg:w-36"
                    >
                      <input
                        type="checkbox"
                        id={`check-${day}`}
                        checked={config.enabled}
                        onChange={(e) => handleDayChange(day, 'enabled', e.target.checked)}
                        className="h-4 w-4 rounded border-slate-300 text-brand-500 accent-brand-400 focus:ring-brand-400"
                      />
                      <span
                        className={`text-sm font-semibold capitalize ${
                          config.enabled ? 'text-slate-900' : 'text-slate-500'
                        }`}
                      >
                        {day}
                      </span>
                    </label>

                    {config.enabled ? (
                      <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto_auto] lg:items-end">
                        <div>
                          <span className="mb-1 block text-[10px] font-medium uppercase tracking-wide text-slate-400">
                            Start
                          </span>
                          <div className="relative">
                            <Clock className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                            <input
                              type="time"
                              value={config.start}
                              onChange={(e) => handleDayChange(day, 'start', e.target.value)}
                              className="field-input mt-0 pl-9"
                            />
                          </div>
                        </div>
                        <div>
                          <span className="mb-1 block text-[10px] font-medium uppercase tracking-wide text-slate-400">
                            End
                          </span>
                          <div className="relative">
                            <Clock className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                            <input
                              type="time"
                              value={config.end}
                              onChange={(e) => handleDayChange(day, 'end', e.target.value)}
                              className="field-input mt-0 pl-9"
                            />
                          </div>
                        </div>
                        <div>
                          <span className="mb-1 block text-[10px] font-medium uppercase tracking-wide text-slate-400">
                            Break
                          </span>
                          <select
                            value={config.breakHours}
                            onChange={(e) => handleDayChange(day, 'breakHours', Number(e.target.value))}
                            className="field-input mt-0 min-w-[108px]"
                          >
                            {BREAK_OPTIONS.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="flex items-end justify-between pb-2 lg:block lg:pb-2.5 lg:text-right">
                          <span className="text-[10px] font-medium uppercase tracking-wide text-slate-400 lg:hidden">
                            Total
                          </span>
                          <span className="text-sm font-semibold text-slate-900">{dayHours} hrs</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-1 items-center justify-between lg:justify-end">
                        <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-slate-500">
                          Rest / Off
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </form>
    </Modal>
  );
}
