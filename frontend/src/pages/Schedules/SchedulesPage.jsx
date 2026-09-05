import React, { useState } from 'react';
import { Plus, CalendarDays, Clock, Users, Edit, Trash2 } from 'lucide-react';
import { useHRData } from '../../context/HRDataContext';
import ScheduleEditorModal from '../../components/schedules/ScheduleEditorModal';
import StatusBadge from '../../components/ui/StatusBadge';
import PageHeader from '../../components/ui/PageHeader';
import EmptyState from '../../components/ui/EmptyState';
import ConfirmDialog from '../../components/ui/ConfirmDialog';

const DAY_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DAY_KEYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export default function SchedulesPage() {
  const { schedules, deleteSchedule } = useHRData();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [deletingSchedule, setDeletingSchedule] = useState(null);

  const openCreate = () => {
    setEditingSchedule(null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Working Schedules"
        count={schedules.length}
        subtitle="Weekly patterns, working days, and assigned headcount."
        actions={
          <button type="button" className="btn-primary" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            New Schedule
          </button>
        }
      />

      {schedules.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="No working schedules"
          description="Create a schedule to assign working days and hours."
          action={
            <button type="button" className="btn-primary" onClick={openCreate}>
              <Plus className="h-4 w-4" />
              New Schedule
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {schedules.map((schedule) => {
            const enabledDays = DAY_KEYS.filter((key) => schedule.days?.[key]?.enabled).length;

            return (
              <div key={schedule.id} className="app-card flex flex-col p-5 transition-shadow hover:shadow-md">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-100 text-slate-800">
                      <CalendarDays className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-semibold text-slate-900">{schedule.name}</h3>
                      <p className="mt-0.5 text-[11px] font-medium text-slate-500">{schedule.type}</p>
                    </div>
                  </div>
                  <StatusBadge status={schedule.status || 'Active'} size="sm" />
                </div>

                <div className="mt-4 rounded-2xl bg-[#eef8d8] px-4 py-3">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-600">
                      <Clock className="h-3.5 w-3.5 text-slate-500" />
                      Weekly hours
                    </span>
                    <span className="text-lg font-semibold tracking-tight text-slate-900">
                      {schedule.weeklyHours}
                      <span className="ml-1 text-xs font-medium text-slate-500">hrs</span>
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-500">
                    {enabledDays} working {enabledDays === 1 ? 'day' : 'days'}
                  </p>
                </div>

                <div className="mt-4">
                  <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                    Working days
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {DAY_SHORT.map((dayShort, i) => {
                      const day = schedule.days?.[DAY_KEYS[i]];
                      const isEnabled = day?.enabled;

                      return (
                        <span
                          key={dayShort}
                          title={isEnabled ? `${day.start} – ${day.end}` : 'Rest / Off'}
                          className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                            isEnabled ? 'bg-brand-100 text-slate-800' : 'bg-slate-100 text-slate-400'
                          }`}
                        >
                          {dayShort}
                        </span>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
                  <span className="inline-flex items-center gap-1.5 text-[11px] text-slate-500">
                    <Users className="h-3.5 w-3.5 text-slate-400" />
                    {schedule.employeesCount} employees
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingSchedule(schedule);
                        setIsModalOpen(true);
                      }}
                      className="btn-ghost"
                    >
                      <Edit className="h-3.5 w-3.5" />
                      Edit
                    </button>
                    <button type="button" onClick={() => setDeletingSchedule(schedule)} className="btn-danger">
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ScheduleEditorModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingSchedule(null);
        }}
        initialData={editingSchedule}
      />
      <ConfirmDialog
        isOpen={!!deletingSchedule}
        onClose={() => setDeletingSchedule(null)}
        onConfirm={() => {
          if (deletingSchedule) {
            deleteSchedule(deletingSchedule._id || deletingSchedule.scheduleCode || deletingSchedule.id);
          }
        }}
        title="Delete working schedule"
        message={`Permanently delete "${deletingSchedule?.name}"? Employees assigned to this schedule will lose that assignment until another schedule is set.`}
        confirmLabel="Delete schedule"
        isDestructive
      />
    </div>
  );
}
