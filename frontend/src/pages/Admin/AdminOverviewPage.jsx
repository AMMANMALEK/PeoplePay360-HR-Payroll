import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StatCard from '../../components/ui/StatCard';
import StatusBadge from '../../components/ui/StatusBadge';
import Modal from '../../components/ui/Modal';
import { useHRData } from '../../context/HRDataContext';
import { useAuth } from '../../context/AuthContext';
import { getGreeting, getHRDisplayName } from '../../utils/greeting';
import {
  Users,
  KeyRound,
  CalendarCheck,
  Edit2,
  Clock,
  ArrowRight
} from 'lucide-react';

export default function AdminOverviewPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    users,
    employees,
    auditLogs,
    fixedLeaveAllowances,
    updateFixedLeaveAllowances
  } = useHRData();

  const greeting = getGreeting();
  const adminName = getHRDisplayName(user, employees);

  const totalUsers = users?.length || 0;
  const activeUsers = users?.filter((u) => u.status === 'ACTIVE' || u.status === 'Active' || !u.status).length || 0;

  // Recent 6 admin actions
  const recentActivity = (auditLogs || []).slice(0, 6);

  // Edit Fixed Leaves Modal State
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [leaveForm, setLeaveForm] = useState({});

  const handleOpenEditLeaves = () => {
    setLeaveForm({
      'Personal Leave': fixedLeaveAllowances?.['Personal Leave'] ?? 15,
      'Sick Leave': fixedLeaveAllowances?.['Sick Leave'] ?? 10,
      'Festival Leave': fixedLeaveAllowances?.['Festival Leave'] ?? 5,
    });
    setIsLeaveModalOpen(true);
  };

  const handleSaveLeaves = async (e) => {
    e.preventDefault();
    await updateFixedLeaveAllowances(leaveForm);
    setIsLeaveModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Admin Dashboard Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            {greeting}, {adminName}
          </h1>
          <p className="text-xs text-slate-500">
            Platform administration overview and access governance command.
          </p>
        </div>
      </div>

      {/* PLATFORM SNAPSHOT CARDS WITH TOP-LEFT ACTION BUTTONS */}
      <div className="space-y-3">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => navigate('/admin/users')}
            className="btn-primary flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold"
          >
            <Users className="h-3.5 w-3.5" />
            <span>Manage Users</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/roles')}
            className="btn-secondary flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold"
          >
            <KeyRound className="h-3.5 w-3.5" />
            <span>Manage Roles</span>
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="TOTAL USERS"
            value={totalUsers}
            subtext={`${activeUsers} Active accounts`}
            icon="users"
            colorScheme="sky"
          />

          <StatCard
            title="ACTIVE ROLES"
            value="5"
            subtext="Configured roles"
            icon="present"
            colorScheme="lilac"
          />

          <StatCard
            title="PERMISSIONS"
            value="86"
            subtext="Configured permissions"
            icon="contract"
            colorScheme="mint"
          />

          <StatCard
            title="ACCESS ALERTS"
            value="2"
            subtext="Requires review"
            icon="alert"
            colorScheme="peach"
          />
        </div>
      </div>

      {/* FIXED LEAVE POLICY & ALLOWANCES SECTION */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-100/70 text-slate-800">
              <CalendarCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                Fixed Leave Policy & Annual Allowances
              </h2>
              <p className="text-xs text-slate-500">
                Configure the baseline fixed annual leaves allocated across all leave types.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleOpenEditLeaves}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-colors shrink-0"
          >
            <Edit2 className="h-3.5 w-3.5 text-slate-500" />
            <span>Edit Fixed Leaves</span>
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {Object.entries(fixedLeaveAllowances || {
            'Personal Leave': 15,
            'Sick Leave': 10,
            'Festival Leave': 5,
          }).map(([typeName, days]) => {
            const isPersonal = typeName === 'Personal Leave';
            const isSick = typeName === 'Sick Leave';
            const bgClass = isPersonal
              ? 'bg-[#e4f4ea] border-emerald-200/90 text-emerald-950'
              : isSick
              ? 'bg-[#fde9d8] border-amber-200/90 text-amber-950'
              : 'bg-[#eee8fb] border-purple-200/90 text-purple-950';

            return (
              <div
                key={typeName}
                className={`flex items-center justify-between rounded-xl border p-4 shadow-subtle ${bgClass}`}
              >
                <div>
                  <span className="text-xs font-bold block">{typeName}</span>
                  <span className="text-[11px] opacity-75">Annual Fixed Allowance</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black">{days}</span>
                  <span className="text-xs font-semibold opacity-75">Days</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RECENT ADMIN ACTIVITY TABLE */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-subtle">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Recent Admin Activity</h3>
            <p className="text-xs text-slate-500">
              Audit record of administrative changes, security modifications, and role reassignments.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/admin/audit')}
            className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
          >
            <span>View Full Audit Log</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-[10px] font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-100">
              <tr>
                <th className="px-5 py-3">Time</th>
                <th className="px-4 py-3">Administrator</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Target</th>
                <th className="px-4 py-3">Module</th>
                <th className="px-5 py-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentActivity.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-5 py-3.5 text-slate-500 font-medium whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-slate-400" />
                      <span>{log.timestamp}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 font-semibold text-slate-900 whitespace-nowrap">
                    {log.administrator}
                  </td>
                  <td className="px-4 py-3.5 text-slate-800 font-medium whitespace-nowrap">
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-slate-600">
                    <span className="line-clamp-1">{log.target}</span>
                  </td>
                  <td className="px-4 py-3.5 text-slate-500 font-medium whitespace-nowrap">
                    {log.module}
                  </td>
                  <td className="px-5 py-3.5 text-right whitespace-nowrap">
                    <span className="inline-flex rounded-md bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* EDIT FIXED LEAVES MODAL */}
      <Modal
        isOpen={isLeaveModalOpen}
        onClose={() => setIsLeaveModalOpen(false)}
        title="Edit Fixed Leave Allowances"
        subtitle="Set the annual baseline quota of fixed leaves for each leave category"
        footer={
          <>
            <button
              type="button"
              onClick={() => setIsLeaveModalOpen(false)}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveLeaves}
              className="btn-primary px-4 py-2 text-xs font-semibold"
            >
              Save Allowances
            </button>
          </>
        }
      >
        <form onSubmit={handleSaveLeaves} className="space-y-4">
          <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-3 text-xs text-slate-600">
            Modifying these values updates the fixed leave allocations across the platform for employees and HR staff.
          </div>

          <div className="space-y-3">
            {Object.keys(fixedLeaveAllowances || {
              'Personal Leave': 15,
              'Sick Leave': 10,
              'Festival Leave': 5,
            }).map((typeName) => (
              <div
                key={typeName}
                className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-3 shadow-subtle"
              >
                <div>
                  <label className="text-xs font-bold text-slate-900 block">{typeName}</label>
                  <span className="text-[11px] text-slate-400">Fixed days allocated per year</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="365"
                    required
                    value={leaveForm[typeName] ?? fixedLeaveAllowances[typeName] ?? 0}
                    onChange={(e) =>
                      setLeaveForm({
                        ...leaveForm,
                        [typeName]: Math.max(0, parseInt(e.target.value, 10) || 0),
                      })
                    }
                    className="w-20 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-center text-xs font-bold text-slate-900 shadow-subtle focus:border-brand-400 focus:outline-none"
                  />
                  <span className="text-xs font-medium text-slate-500">Days</span>
                </div>
              </div>
            ))}
          </div>
        </form>
      </Modal>
    </div>
  );
}
