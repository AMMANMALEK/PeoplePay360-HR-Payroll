import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit2, Trash2, FileText, ArrowRight } from 'lucide-react';
import DataTable from '../ui/DataTable';
import StatusBadge from '../ui/StatusBadge';
import EmployeeAvatar from '../ui/EmployeeAvatar';

export default function EmployeeListView({
  employees,
  contracts,
  isLoading = false,
  onEdit,
  onDelete
}) {
  const navigate = useNavigate();

  const columns = [
    {
      key: 'fullName',
      label: 'Employee',
      sortable: true,
      render: (name, row) => (
        <div className="flex items-center gap-3">
          <EmployeeAvatar name={name} src={row.avatar} size="md" />
          <div className="min-w-0">
            <div className="font-semibold text-slate-900 truncate hover:text-brand-700 transition-colors">
              {name}
            </div>
            <div className="text-[11px] text-slate-400 font-mono">{row.id}</div>
          </div>
        </div>
      )
    },
    {
      key: 'id',
      label: 'Employee ID',
      sortable: true,
      render: (id) => <span className="font-mono text-[11px] text-slate-500">{id}</span>
    },
    {
      key: 'department',
      label: 'Department',
      sortable: true,
      render: (dept) => <span className="text-slate-600">{dept || '—'}</span>
    },
    {
      key: 'jobPosition',
      label: 'Position',
      sortable: true,
      render: (pos) => <span className="font-medium text-slate-800">{pos}</span>
    },
    {
      key: 'employmentStatus',
      label: 'Status',
      sortable: true,
      render: (status) => <StatusBadge status={status} />
    },
    {
      key: 'contract',
      label: 'Active Contract',
      render: (_, row) => {
        const activeContract = contracts.find((c) => c.employeeId === row.id && c.isCurrent && c.status === 'Active');
        return activeContract ? (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            <FileText className="h-3 w-3 text-emerald-600" />
            <span>{activeContract.id}</span>
          </span>
        ) : (
          <span className="text-slate-400 italic text-[11px]">None active</span>
        );
      }
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      render: (_, row) => (
        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => navigate(`/employees/${row.id}`)}
            className="inline-flex items-center gap-1 rounded-xl px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-brand-50"
            title="Open Employee Command Center"
            aria-label={`View ${row.fullName}`}
          >
            <span>View</span>
            <ArrowRight className="h-3 w-3" />
          </button>
          <button
            type="button"
            onClick={() => onEdit(row)}
            className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
            title="Edit Employee"
            aria-label={`Edit ${row.fullName}`}
          >
            <Edit2 className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(row)}
            className="rounded p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
            title="Delete Employee"
            aria-label={`Delete ${row.fullName}`}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      )
    }
  ];

  return (
    <DataTable
      columns={columns}
      data={employees}
      isLoading={isLoading}
      onRowClick={(row) => navigate(`/employees/${row.id}`)}
      pageSize={8}
      emptyTitle="No employees found"
      emptyDescription="Try adjusting active filter criteria or register a new employee record."
    />
  );
}
