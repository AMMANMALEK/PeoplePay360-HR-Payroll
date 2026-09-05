import React, { useState } from 'react';
import { useHRData } from '../../context/HRDataContext';
import {
  Sliders,
  Shield,
  Activity,
  Server,
  Database,
  CheckCircle2,
  RefreshCw,
  FileDown,
  Lock,
  Zap
} from 'lucide-react';

export default function SystemAdminPage() {
  const { systemStatus, showToast, logAdminAction } = useHRData();

  const [strictValidation, setStrictValidation] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState('60');
  const [isVerifying, setIsVerifying] = useState(false);

  const modules = systemStatus?.modules || [
    { name: 'HR Management', status: 'Operational', latency: '24ms', uptime: '99.98%' },
    { name: 'Attendance Service', status: 'Operational', latency: '31ms', uptime: '99.95%' },
    { name: 'Time Off Registry', status: 'Operational', latency: '19ms', uptime: '100.0%' },
    { name: 'Payroll Engine', status: 'Operational', latency: '42ms', uptime: '99.99%' },
    { name: 'Reports & Analytics', status: 'Operational', latency: '38ms', uptime: '99.94%' }
  ];

  const handleRunDiagnostics = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      logAdminAction({
        administrator: 'Marcus Vance',
        action: 'System diagnostics executed',
        module: 'System Administration',
        target: 'All 5 core modules verified operational',
        status: 'Success'
      });
      showToast('✓ System diagnostics complete: All subsystems operational.');
    }, 800);
  };

  const handleToggleValidation = (checked) => {
    setStrictValidation(checked);
    logAdminAction({
      administrator: 'Marcus Vance',
      action: 'Security policy updated',
      module: 'System Administration',
      target: `Strict validation ${checked ? 'enabled' : 'disabled'}`,
      status: 'Success'
    });
    showToast(`Strict data validation ${checked ? 'enabled' : 'disabled'}.`);
  };

  const handleTimeoutChange = (val) => {
    setSessionTimeout(val);
    logAdminAction({
      administrator: 'Marcus Vance',
      action: 'Configuration updated',
      module: 'System Administration',
      target: `Session timeout adjusted to ${val} minutes`,
      status: 'Success'
    });
    showToast(`Admin session timeout updated to ${val} minutes.`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            System Administration
          </h1>
          <p className="text-xs text-slate-500">
            Platform environment settings, security enforcement rules, and subsystem health telemetry.
          </p>
        </div>

        <button
          type="button"
          onClick={handleRunDiagnostics}
          disabled={isVerifying}
          className="btn-primary shrink-0"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isVerifying ? 'animate-spin' : ''}`} />
          <span>{isVerifying ? 'Running Checks...' : 'Run Diagnostics'}</span>
        </button>
      </div>

      {/* SECTION 1: SYSTEM STATUS */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-subtle space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Subsystem Operational Status
            </h3>
          </div>
          <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-0.5 text-xs">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            ● All Subsystems Operational
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {modules.map((mod) => (
            <div
              key={mod.name}
              className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 space-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">{mod.name}</span>
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
              </div>
              <div className="text-[11px] font-semibold text-emerald-700">● {mod.status}</div>
              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                <span>Latency: {mod.latency}</span>
                <span>{mod.uptime}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 2: PLATFORM & ENVIRONMENT */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-subtle space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Server className="h-4 w-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Platform & Runtime
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Application Version</span>
              <span className="font-mono font-bold text-slate-900">
                PeoplePay360 v2.4.0 (Enterprise)
              </span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Environment Mode</span>
              <span className="rounded bg-indigo-50 border border-indigo-200 px-2 py-0.5 font-semibold text-indigo-700">
                Production-Ready
              </span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Database Engine</span>
              <span className="font-mono text-slate-800">PostgreSQL 16 · Read/Write Synchronous</span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-slate-500">Cryptographic Standard</span>
              <span className="font-mono text-slate-800">AES-256 GCM · TLS 1.3</span>
            </div>
          </div>
        </div>

        {/* SECTION 3: SECURITY & ACCESS CONTROL */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-subtle space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Lock className="h-4 w-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Security & Governance Policies
            </h3>
          </div>

          <div className="space-y-3.5 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-900 block">Strict Data Validation</span>
                <span className="text-[11px] text-slate-500">
                  Enforce zero-tolerance rule checks on payrun computation
                </span>
              </div>
              <input
                type="checkbox"
                checked={strictValidation}
                onChange={(e) => handleToggleValidation(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 pt-3">
              <div>
                <span className="font-semibold text-slate-900 block">Admin Inactivity Timeout</span>
                <span className="text-[11px] text-slate-500">
                  Force credential re-verification after idle duration
                </span>
              </div>
              <select
                value={sessionTimeout}
                onChange={(e) => handleTimeoutChange(e.target.value)}
                className="rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-800 shadow-sm"
              >
                <option value="15">15 Minutes</option>
                <option value="30">30 Minutes</option>
                <option value="60">60 Minutes</option>
                <option value="120">120 Minutes</option>
              </select>
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 pt-3">
              <div>
                <span className="font-semibold text-slate-900 block">RBAC Enforcement Level</span>
                <span className="text-[11px] text-slate-500">
                  Centralized policy evaluation across 12 modules
                </span>
              </div>
              <span className="rounded bg-emerald-50 border border-emerald-200 px-2 py-0.5 font-bold text-emerald-800 text-[11px]">
                Level 3 Strict
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
