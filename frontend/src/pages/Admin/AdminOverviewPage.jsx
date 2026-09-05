import React from 'react';
import { useNavigate } from 'react-router-dom';
import StatCard from '../../components/ui/StatCard';
import StatusBadge from '../../components/ui/StatusBadge';
import { useHRData } from '../../context/HRDataContext';
import {
  ShieldCheck,
  Users,
  KeyRound,
  AlertTriangle,
  Activity,
  ArrowRight,
  Shield,
  Clock,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';

export default function AdminOverviewPage() {
  const navigate = useNavigate();
  const { kpis, users, auditLogs, systemStatus } = useHRData();

  const totalUsers = users.length || 24;
  const activeUsers = users.filter((u) => u.status === 'Active').length || 22;

  // Recent 6 admin actions
  const recentActivity = auditLogs.slice(0, 6);

  return (
    <div className="space-y-6">
      {/* Admin Dashboard Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Good morning, Marcus Vance
          </h1>
          <p className="text-xs text-slate-500">
            Platform administration overview and access governance command.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-800">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Platform Status: Healthy</span>
          </span>
        </div>
      </div>

      {/* PLATFORM SNAPSHOT CARDS */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
          Platform Snapshot
        </h2>
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard
            title="TOTAL USERS"
            value={totalUsers}
            subtext={`${activeUsers} Active accounts`}
            icon="users"
            colorScheme="sky"
            onClick={() => navigate('/admin/users')}
          />

          <StatCard
            title="ACTIVE ROLES"
            value="5"
            subtext="Configured roles"
            icon="present"
            colorScheme="lilac"
            onClick={() => navigate('/admin/roles')}
          />

          <StatCard
            title="PERMISSIONS"
            value="86"
            subtext="Configured permissions"
            icon="contract"
            colorScheme="mint"
            onClick={() => navigate('/admin/roles')}
          />

          <StatCard
            title="ACCESS ALERTS"
            value="2"
            subtext="Requires review"
            icon="alert"
            colorScheme="peach"
            onClick={() => navigate('/admin/users')}
          />

          <StatCard
            title="SYSTEM STATUS"
            value="● Healthy"
            subtext="All core modules operational"
            icon="health"
            colorScheme="lime"
            onClick={() => navigate('/admin/system')}
          />
        </div>
      </div>

      {/* ACCESS GOVERNANCE PROMINENT CARD */}
      <div className="rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-50/90 via-white to-slate-50 p-5 shadow-subtle">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600 text-white">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-bold tracking-tight text-slate-900 uppercase">
                Access Governance
              </h3>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-700">
              <span>{totalUsers} Users</span>
              <span>·</span>
              <span>5 Roles</span>
              <span>·</span>
              <span>86 Permissions</span>
              <span>·</span>
              <span className="inline-flex items-center gap-1 text-emerald-700">
                <CheckCircle2 className="h-3.5 w-3.5" />
                ● No critical permission conflicts
              </span>
            </div>
            <p className="text-xs text-slate-500 max-w-2xl">
              Role-Based Access Control (RBAC Level 3) is active across all 12 modules. User authentication and granular module rights are synchronized with the central governance engine.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => navigate('/admin/users')}
              className="btn-primary"
            >
              <Users className="h-3.5 w-3.5" />
              <span>Manage Users</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin/roles')}
              className="btn-secondary"
            >
              <KeyRound className="h-3.5 w-3.5" />
              <span>Manage Roles</span>
            </button>
          </div>
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
    </div>
  );
}
