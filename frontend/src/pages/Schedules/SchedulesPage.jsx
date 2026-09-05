import React, { useState } from 'react';
import { Plus, CalendarDays, Clock, Users, Edit } from 'lucide-react';
import { useHRData } from '../../context/HRDataContext';
import ScheduleEditorModal from '../../components/schedules/ScheduleEditorModal';
import StatusBadge from '../../components/ui/StatusBadge';

export default function SchedulesPage() {
  const { schedules } = useHRData();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            Working Schedules
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Define organizational working patterns, daily shift blocks, and automated weekly hours calculation.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingSchedule(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-medium text-white hover:bg-indigo-700 shadow-sm transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>+ New Schedule</span>
        </button>
      </div>

      {/* Schedules Cards Grid */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {schedules.map((schedule) => (
          <div
            key={schedule.id}
            className="flex flex-col justify-between rounded-xl border border-slate-200/90 bg-white p-5 shadow-subtle hover:border-indigo-200 transition-all"
          >
            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100">
                    <CalendarDays className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{schedule.name}</h3>
                    <span className="text-[11px] font-medium text-slate-500">{schedule.type}</span>
                  </div>
                </div>
                <StatusBadge status={schedule.status || 'Active'} size="sm" />
              </div>

              {/* Weekly hours highlight */}
              <div className="mt-4 rounded-lg bg-slate-50 p-3 border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-slate-600">
                  <Clock className="h-3.5 w-3.5 text-indigo-500" />
                  <span>Calculated Hours:</span>
                </div>
                <div className="text-sm font-extrabold text-indigo-700">
                  {schedule.weeklyHours} hrs / week
                </div>
              </div>

              {/* Active days badges */}
              <div className="mt-4">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Active Shift Days
                </span>
                <div className="flex flex-wrap gap-1">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((dayShort, i) => {
                    const dayKeys = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
                    const isEnabled = schedule.days?.[dayKeys[i]]?.enabled;

                    return (
                      <span
                        key={dayShort}
                        className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                          isEnabled
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
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

            {/* Footer */}
            <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
              <span className="flex items-center gap-1 text-slate-500 text-[11px]">
                <Users className="h-3 w-3 text-slate-400" />
                <span>{schedule.employeesCount} employees assigned</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  setEditingSchedule(schedule);
                  setIsModalOpen(true);
                }}
                className="inline-flex items-center gap-1 font-semibold text-indigo-600 hover:text-indigo-800"
              >
                <Edit className="h-3 w-3" />
                <span>Edit</span>
              </button>
            </div>
          </div>
        ))}
      </div>

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
