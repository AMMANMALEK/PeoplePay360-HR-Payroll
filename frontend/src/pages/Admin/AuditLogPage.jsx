import React, { useState, useMemo } from 'react';
import FilterBar from '../../components/ui/FilterBar';
import EmptyState from '../../components/ui/EmptyState';
import { useHRData } from '../../context/HRDataContext';
import {
  History,
  Clock,
  Shield,
  Search,
  CheckCircle2,
  AlertTriangle,
  Download,
  Filter,
  RefreshCw
} from 'lucide-react';

export default function AuditLogPage() {
  const { auditLogs } = useHRData();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState({
    module: 'All',
    action: 'All',
    status: 'All'
  });

  const handleFilterChange = (key, value) => {
    setActiveFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleClearAll = () => {
    setSearchQuery('');
    setActiveFilters({ module: 'All', action: 'All', status: 'All' });
  };

  const filterConfig = [
    {
      key: 'module',
      label: 'Module',
      options: [
        { label: 'Users', value: 'Users' },
        { label: 'Roles', value: 'Roles' },
        { label: 'System Administration', value: 'System Administration' },
        { label: 'Payroll', value: 'Payroll' }
      ]
    },
    {
      key: 'action',
      label: 'Action',
      options: [
        { label: 'Role changed', value: 'Role changed' },
        { label: 'Permission updated', value: 'Permission updated' },
        { label: 'User activated', value: 'User activated' },
        { label: 'User deactivated', value: 'User deactivated' },
        { label: 'Configuration updated', value: 'Configuration updated' }
      ]
    },
    {
      key: 'status',
      label: 'Status',
      options: [
        { label: 'Success', value: 'Success' },
        { label: 'Warning', value: 'Warning' },
        { label: 'Failed', value: 'Failed' }
      ]
    }
  ];

  const filteredLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTarget = log.target?.toLowerCase().includes(q);
        const matchesAdmin = log.administrator?.toLowerCase().includes(q);
        const matchesAction = log.action?.toLowerCase().includes(q);
        if (!matchesTarget && !matchesAdmin && !matchesAction) return false;
      }

      if (activeFilters.module !== 'All' && log.module !== activeFilters.module) {
        return false;
      }

      if (activeFilters.action !== 'All' && log.action !== activeFilters.action) {
        return false;
      }

      if (activeFilters.status !== 'All' && log.status !== activeFilters.status) {
        return false;
      }

      return true;
    });
  }, [auditLogs, searchQuery, activeFilters]);

  const handleExportAudit = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(auditLogs, null, 2)
    )}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `peoplepay360_audit_log_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Audit Log</h1>
          <p className="text-xs text-slate-500">
            Historical visibility into security modifications, role assignments, and platform administrative actions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportAudit}
            className="btn-secondary"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export Log JSON</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <FilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Filter audit records by target, administrator, or action..."
        filters={filterConfig}
        activeFilters={activeFilters}
        onFilterChange={handleFilterChange}
        onClearAll={handleClearAll}
      />

      {/* Audit Log Table */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-subtle">
        {filteredLogs.length === 0 ? (
          <EmptyState
            title="No audit log entries found"
            description="No administrative actions match the active filter criteria."
            actionLabel="Reset Filters"
            onAction={handleClearAll}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-[10px] font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3">Timestamp</th>
                  <th className="px-4 py-3">Administrator</th>
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3">Module</th>
                  <th className="px-4 py-3">Target Details</th>
                  <th className="px-5 py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.map((log) => (
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

                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-800 border border-slate-200">
                        {log.action}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-slate-600 font-medium whitespace-nowrap">
                      {log.module}
                    </td>

                    <td className="px-4 py-3.5 text-slate-700">
                      <span className="font-mono text-[11px] text-slate-800">{log.target}</span>
                    </td>

                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold border ${
                          log.status === 'Success'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : log.status === 'Warning'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-rose-50 text-rose-800 border-rose-200'
                        }`}
                      >
                        <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                        <span>{log.status}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
