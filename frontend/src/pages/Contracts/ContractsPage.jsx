import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, AlertTriangle, Trash2, Eye, Edit3, FileText, CheckCircle, Clock, XCircle } from 'lucide-react';
import { formatINR } from '../../utils/formatCurrency';
import { useHRData } from '../../context/HRDataContext';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import FilterBar from '../../components/ui/FilterBar';
import PageHeader from '../../components/ui/PageHeader';
import ContractFormModal from '../../components/contracts/ContractFormModal';
import ContractViewModal from '../../components/contracts/ContractViewModal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';

// Helper to safely extract string value from primitive or object
const getText = (val, fallback = '') => {
  if (val == null) return fallback;
  if (typeof val === 'string' || typeof val === 'number') return String(val);
  if (typeof val === 'object') {
    return val.name || val.title || val.code || val.label || val.contractName || val.id || fallback;
  }
  return fallback;
};

// Normalize status helper to handle case-insensitivity
const normalizeStatus = (status) => {
  const s = getText(status).trim().toLowerCase();
  if (s === 'expired') return 'Expired';
  if (s === 'expiring soon' || s === 'expiring_soon' || s === 'expiring') return 'Expiring Soon';
  return 'Active';
};

// Contract status strictly restricted to: Active, Expiring Soon, and Expired
const getContractStatus = (c) => {
  if (!c) return 'Active';
  const manual = normalizeStatus(c.status);

  // If status was explicitly set via Edit to Expired or Expiring Soon, honor it
  if (manual === 'Expired') return 'Expired';
  if (manual === 'Expiring Soon') return 'Expiring Soon';

  // If date indicates Expired or Expiring Soon within 10 days
  if (c.endDate) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const end = new Date(c.endDate);
      if (!isNaN(end.getTime())) {
        end.setHours(0, 0, 0, 0);
        const diffTime = end.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) {
          return 'Expired';
        }
        // Only when contract will over within 10 days
        if (diffDays <= 10) {
          return 'Expiring Soon';
        }
      }
    } catch {}
  }

  return 'Active';
};

export default function ContractsPage() {
  const [searchParams] = useSearchParams();
  const filterParam = searchParams.get('filter');
  const searchParam = searchParams.get('search');

  const hrData = useHRData() || {};
  const contracts = Array.isArray(hrData.contracts) ? hrData.contracts : [];
  const rawDepartments = Array.isArray(hrData.departments) ? hrData.departments : [];
  const departments = useMemo(() => {
    return rawDepartments.map((d) => getText(d)).filter(Boolean);
  }, [rawDepartments]);
  const deleteContract = hrData.deleteContract || (() => {});

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingContract, setEditingContract] = useState(null);
  const [viewingContract, setViewingContract] = useState(null);
  const [deletingContract, setDeletingContract] = useState(null);

  const [searchQuery, setSearchQuery] = useState(searchParam || '');
  const [activeFilters, setActiveFilters] = useState({
    department: 'All',
    status: filterParam === 'expiring' ? 'Expiring Soon' : 'All',
  });

  const filterDefs = [
    {
      key: 'department',
      label: 'Department',
      options: departments,
    },
    {
      key: 'status',
      label: 'Status',
      // Strictly Active, Expiring Soon, and Expired
      options: ['Active', 'Expiring Soon', 'Expired'],
    },
  ];

  const handleFilterChange = (key, value) => {
    setActiveFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleClearAll = () => {
    setActiveFilters({ department: 'All', status: 'All' });
    setSearchQuery('');
  };

  const filteredContracts = useMemo(() => {
    return contracts.filter((c) => {
      if (!c) return false;
      const computedStatus = getContractStatus(c);
      const cId = getText(c.id || c.contractCode || c._id);
      const cEmp = getText(c.employeeName);
      const cName = getText(c.contractName);
      const cPos = getText(c.position || c.jobPosition);
      const cDept = getText(c.department);

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          cId.toLowerCase().includes(q) ||
          cEmp.toLowerCase().includes(q) ||
          cName.toLowerCase().includes(q) ||
          cPos.toLowerCase().includes(q);
        if (!matches) return false;
      }

      if (activeFilters.department !== 'All' && cDept !== activeFilters.department) {
        return false;
      }

      if (activeFilters.status !== 'All') {
        if (computedStatus !== activeFilters.status) return false;
      }

      return true;
    });
  }, [contracts, searchQuery, activeFilters]);

  // Check for any active contract conflict across employees
  const conflictsDetected = useMemo(() => {
    const activeByEmployee = {};
    const conflicts = [];
    contracts.forEach((c) => {
      if (!c) return;
      const computedStatus = getContractStatus(c);
      if (computedStatus === 'Active' && c.isCurrent) {
        const empId = getText(c.employeeId || c.employeeCode);
        const empName = getText(c.employeeName || empId);
        if (empId && activeByEmployee[empId]) {
          conflicts.push({ emp: empName, c1: activeByEmployee[empId], c2: c });
        } else if (empId) {
          activeByEmployee[empId] = c;
        }
      }
    });
    return conflicts;
  }, [contracts]);

  const activeCount = useMemo(() => contracts.filter((c) => getContractStatus(c) === 'Active').length, [contracts]);
  const expiringCount = useMemo(() => contracts.filter((c) => getContractStatus(c) === 'Expiring Soon').length, [contracts]);
  const expiredCount = useMemo(() => contracts.filter((c) => getContractStatus(c) === 'Expired').length, [contracts]);

  const columns = [
    {
      key: 'id',
      label: 'Contract ID',
      sortable: true,
      render: (id, row) => {
        const cId = getText(id || row.contractCode || row.id || row._id);
        const cName = getText(row.contractName, 'Employment Agreement');
        return (
          <div>
            <div className="font-mono font-bold text-slate-900">{cId}</div>
            <div className="text-[11px] text-slate-500 font-medium">{cName}</div>
          </div>
        );
      },
    },
    {
      key: 'employeeName',
      label: 'Employee',
      sortable: true,
      render: (name, row) => {
        const empName = getText(name || row.employeeName, 'Employee');
        const empId = getText(row.employeeId || row.employeeCode, '—');
        return (
          <div>
            <div className="font-semibold text-slate-900">{empName}</div>
            <div className="text-[11px] text-slate-400 font-mono">{empId}</div>
          </div>
        );
      },
    },
    {
      key: 'position',
      label: 'Role & Department',
      render: (pos, row) => {
        const position = getText(pos || row.jobPosition || row.position, 'Role not specified');
        const dept = getText(row.department, 'Department');
        return (
          <div>
            <div className="font-medium text-slate-800">{position}</div>
            <div className="text-[11px] text-slate-500">{dept}</div>
          </div>
        );
      },
    },
    {
      key: 'startDate',
      label: 'Term Period',
      sortable: true,
      render: (start, row) => {
        const computedStatus = getContractStatus(row);
        const startStr = getText(start || row.startDate, '—');
        const endStr = getText(row.endDate, 'Open-ended');
        return (
          <div className="text-xs">
            <span className="font-medium text-slate-800">{startStr}</span>
            <span className="text-slate-400 mx-1">→</span>
            <span
              className={`font-medium ${
                computedStatus === 'Expiring Soon'
                  ? 'text-amber-700 font-bold'
                  : computedStatus === 'Expired'
                  ? 'text-rose-600'
                  : 'text-slate-800'
              }`}
            >
              {endStr}
            </span>
          </div>
        );
      },
    },
    {
      key: 'wage',
      label: 'Agreed Wage / Rate',
      render: (wage, row) => {
        const rawWage = typeof wage === 'object' && wage !== null ? wage.amount || wage.wage : wage;
        const num = typeof rawWage === 'number' ? rawWage : Number(String(rawWage || '').replace(/[^0-9.]/g, ''));
        const displayWage = Number.isFinite(num) && num > 0 ? formatINR(num) : getText(wage, '—');
        const structure = getText(row.salaryStructure || row.wageType, 'annually');
        return (
          <div>
            <span className="font-bold text-slate-900">{displayWage}</span>
            <div className="text-[10px] font-semibold text-slate-500 capitalize">{structure}</div>
          </div>
        );
      },
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (_, row) => {
        const computedStatus = getContractStatus(row);
        return (
          <div className="flex items-center gap-1.5 flex-wrap">
            <StatusBadge status={computedStatus} size="sm" />
          </div>
        );
      },
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      render: (_, row) => (
        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          {/* View Option */}
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-2xs"
            onClick={() => setViewingContract(row)}
            title="View Contract"
          >
            <Eye className="h-3.5 w-3.5 text-slate-500" />
            <span>View</span>
          </button>

          {/* Edit Option */}
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-lg border border-indigo-200 bg-indigo-50/70 px-2.5 py-1 text-xs font-semibold text-indigo-700 hover:bg-indigo-100/70 transition-colors shadow-2xs"
            onClick={() => setEditingContract(row)}
            title="Edit Contract"
          >
            <Edit3 className="h-3.5 w-3.5 text-indigo-600" />
            <span>Edit</span>
          </button>

          {/* Delete Option */}
          <button
            type="button"
            className="btn-danger p-1 text-xs"
            onClick={() => setDeletingContract(row)}
            title="Delete contract"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Contracts"
        count={contracts.length}
        subtitle="Employment terms, start and end dates, and contract status."
        actions={
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="btn-primary flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4" />
            Create New Employment Contract
          </button>
        }
      />

      {/* Global Contract Conflict Warning */}
      {conflictsDetected.length > 0 && (
        <div className="rounded-[18px] border border-rose-200 bg-rose-50 p-4 text-rose-900 space-y-1">
          <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-rose-800">
            <AlertTriangle className="h-4 w-4 text-rose-600" />
            <span>Contract Conflict Detected</span>
          </div>
          <p className="text-xs text-rose-700 leading-relaxed">
            Multiple concurrent active contracts detected for: {conflictsDetected.map((c) => c.emp).join(', ')}.
            Please review and mark historical terms as expired.
          </p>
        </div>
      )}

      {/* Quick Status Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {[
          { label: 'All Contracts', value: 'All', count: contracts.length },
          { label: 'Active', value: 'Active', count: activeCount },
          { label: 'Expiring Soon', value: 'Expiring Soon', count: expiringCount },
          { label: 'Expired', value: 'Expired', count: expiredCount },
        ].map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setActiveFilters((prev) => ({ ...prev, status: tab.value }))}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeFilters.status === tab.value
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                activeFilters.status === tab.value
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Filter Bar */}
      <FilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search contract ID, employee, position..."
        filters={filterDefs}
        activeFilters={activeFilters}
        onFilterChange={handleFilterChange}
        onClearAll={handleClearAll}
      />

      {/* Table */}
      <DataTable
        columns={columns}
        data={filteredContracts}
        pageSize={8}
        onRowClick={(row) => setViewingContract(row)}
        emptyTitle="No contracts found"
        emptyDescription="Try clearing active filters or issue a new legal contract."
      />

      {/* Create Modal: only shows employees without existing contract */}
      <ContractFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        initialContract={null}
      />

      {/* Edit Modal: editable existing contract with status change */}
      <ContractFormModal
        isOpen={Boolean(editingContract)}
        onClose={() => {
          setEditingContract(null);
          // Set status filter to 'All' so that the modified contract remains immediately visible in the table
          setActiveFilters((prev) => ({ ...prev, status: 'All' }));
        }}
        initialContract={editingContract}
      />

      {/* View Modal: inspect full details */}
      <ContractViewModal
        isOpen={Boolean(viewingContract)}
        onClose={() => setViewingContract(null)}
        contract={viewingContract}
        computedStatus={viewingContract ? getContractStatus(viewingContract) : 'Active'}
        onEdit={(contract) => setEditingContract(contract)}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingContract}
        onClose={() => setDeletingContract(null)}
        onConfirm={() => {
          if (deletingContract) deleteContract(deletingContract._id || deletingContract.id);
        }}
        title="Delete contract"
        message={`Permanently delete contract ${deletingContract?.id || deletingContract?.contractCode} for ${deletingContract?.employeeName}? This cannot be undone.`}
        confirmLabel="Delete contract"
        isDestructive
      />
    </div>
  );
}
