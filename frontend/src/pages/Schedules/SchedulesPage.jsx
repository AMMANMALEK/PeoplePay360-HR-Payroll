import React, { useState } from 'react';
import { Plus, CalendarDays, Clock, Users, Edit } from 'lucide-react';
import { useHRData } from '../../context/HRDataContext';
import ScheduleEditorModal from '../../components/schedules/ScheduleEditorModal';
import StatusBadge from '../../components/ui/StatusBadge';
import PageHeader from '../../components/ui/PageHeader';
import EmptyState from '../../components/ui/EmptyState';

export default function SchedulesPage() {
  const { schedules } = useHRData();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Working Schedules"
        count={schedules.length}
        subtitle="Weekly patterns, working days, and assigned headcount."
        actions={
          <button
            type="button"
            className="btn-primary"
            onClick={() => {
              setEditingSchedule(null);
              setIsModalOpen(true);
            }}
          >
            <Plus className="h-4 w-4" />
            New Schedule
          </button>
        }
      />

      {/* Schedules Cards Grid */}
      {schedules.length === 0 ? (
        <EmptyState title="No working schedules" description="Create a schedule to assign working days and hours." />
      ) : (
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {schedules.map((schedule) => (
          <div
            key={schedule.id}
            className="app-card flex flex-col justify-between p-5"
          >
            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-100 text-slate-800">
                    <CalendarDays className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">{schedule.name}</h3>
                    <span className="text-[11px] font-medium text-slate-500">{schedule.type}</span>
                  </div>
                </div>
                <StatusBadge status={schedule.status || 'Active'} size="sm" />
              </div>

              <div className="mt-4 flex items-center justify-between rounded-2xl bg-slate-50 p-3">
                <div className="flex items-center gap-1.5 text-xs text-slate-600">
                  <Clock className="h-3.5 w-3.5 text-brand-600" />
                  Weekly hours
                </div>
                <div className="text-sm font-semibold text-slate-900">
                  {schedule.weeklyHours} hrs
                </div>
              </div>

              <div className="mt-4">
                <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Working days
                </span>
                <div className="flex flex-wrap gap-1">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((dayShort, i) => {
                    const dayKeys = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
                    const day = schedule.days?.[dayKeys[i]];
                    const isEnabled = day?.enabled;

                    return (
                      <span
                        key={dayShort}
                        title={isEnabled ? `${day.start} – ${day.end}` : undefined}
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          isEnabled
                            ? 'bg-brand-100 text-slate-800'
                            : 'bg-slate-100 text-slate-400'
                        }`}
                      >
                        {dayShort}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
              <span className="flex items-center gap-1 text-[11px] text-slate-500">
                <Users className="h-3 w-3 text-slate-400" />
                {schedule.employeesCount} employees
              </span>
              <button
                type="button"
                onClick={() => {
                  setEditingSchedule(schedule);
                  setIsModalOpen(true);
                }}
                className="inline-flex items-center gap-1 font-semibold text-slate-700 hover:text-slate-900"
              >
                <Edit className="h-3 w-3" />
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>
      )}

      {/* Editor Modal */}
      <ScheduleEditorModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingSchedule(null);
        }}
        initialData={editingSchedule}
      />
    </div>
  );
}
