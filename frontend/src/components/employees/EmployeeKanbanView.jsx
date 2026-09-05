import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Mail, Phone, Calendar } from 'lucide-react';
import StatusBadge from '../ui/StatusBadge';

export default function EmployeeKanbanView({ employees, departments }) {
  const navigate = useNavigate();
  const [groupBy, setGroupBy] = useState('department'); // 'department' | 'status'

  const columns =
    groupBy === 'department'
      ? departments
      : ['Active', 'On Leave', 'Inactive'];

  const getEmployeesInGroup = (group) => {
    if (groupBy === 'department') {
      return employees.filter((e) => e.department === group);
    }
    return employees.filter((e) => e.employmentStatus === group);
  };

  return (
    <div className="space-y-4">
      {/* Grouping switcher */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500">
          Showing {employees.length} employees grouped by:
        </span>
        <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1 shadow-subtle">
          <button
            type="button"
            onClick={() => setGroupBy('department')}
            className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
              groupBy === 'department'
                ? 'bg-brand-400 text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Department
          </button>
          <button
            type="button"
            onClick={() => setGroupBy('status')}
            className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
              groupBy === 'status'
                ? 'bg-brand-400 text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Status
          </button>
        </div>
      </div>

      {/* Kanban Columns */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {columns.map((columnName) => {
          const groupEmployees = getEmployeesInGroup(columnName);

          return (
            <div
              key={columnName}
              className="flex flex-col rounded-xl border border-slate-200/90 bg-slate-50/60 p-3.5 shadow-subtle"
            >
              {/* Column Header */}
              <div className="mb-3 flex items-center justify-between border-b border-slate-200/80 pb-2.5">
                <span className="text-xs font-semibold text-slate-900 truncate">
                  {columnName}
                </span>
                <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-bold text-slate-600 border border-slate-200">
                  {groupEmployees.length}
                </span>
              </div>

              {/* Cards Container */}
              <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[600px] pr-1">
                {groupEmployees.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-lg">
                    No employees
                  </div>
                ) : (
                  groupEmployees.map((emp) => (
                    <div
                      key={emp.id}
                      onClick={() => navigate(`/employees/${emp.id}`)}
                      className="group cursor-pointer rounded-xl border border-slate-200 bg-white p-3.5 shadow-subtle hover:border-brand-300 hover:shadow-hover transition-all"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-slate-900 group-hover:text-brand-700 transition-colors">
                            {emp.fullName}
                          </div>
                          <div className="text-[11px] font-mono text-slate-400">{emp.id}</div>
                        </div>
                        {groupBy === 'department' && (
                          <StatusBadge status={emp.employmentStatus} size="sm" />
                        )}
                      </div>

                      <div className="mt-2.5 text-xs font-medium text-slate-700">
                        {emp.jobPosition}
                      </div>

                      <div className="mt-2 space-y-1 border-t border-slate-100 pt-2 text-[11px] text-slate-500">
                        <div className="flex items-center gap-1.5 truncate">
                          <Mail className="h-3 w-3 text-slate-400 shrink-0" />
                          <span className="truncate">{emp.workEmail}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3 w-3 text-slate-400 shrink-0" />
                          <span>Joined {emp.joinedDate}</span>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2 text-[11px]">
                        <span className="font-medium text-slate-600 truncate">
                          {typeof emp.scheduleName === 'object' && emp.scheduleName !== null
                            ? (emp.scheduleName.name || emp.scheduleName.scheduleCode || 'Standard')
                            : (emp.scheduleName || 'Standard')}
                        </span>
                        <span className="flex items-center font-semibold text-brand-700 opacity-0 group-hover:opacity-100 transition-opacity">
                          Profile <ArrowRight className="ml-1 h-3 w-3" />
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
