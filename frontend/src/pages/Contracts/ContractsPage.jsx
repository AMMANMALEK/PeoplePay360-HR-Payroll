import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, FileText, AlertTriangle, CheckCircle, Clock, Calendar } from 'lucide-react';
import { useHRData } from '../../context/HRDataContext';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import FilterBar from '../../components/ui/FilterBar';
import ContractFormModal from '../../components/contracts/ContractFormModal';

export default function ContractsPage() {
  const [searchParams] = useSearchParams();
  const filterParam = searchParams.get('filter');
  const searchParam = searchParams.get('search');

  const { contracts, departments } = useHRData();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchParam || '');
  const [activeFilters, setActiveFilters] = useState({
    department: 'All',
    status: filterParam === 'expiring' ? 'Expiring Soon' : 'All'
  });

  const filterDefs = [
    {
      key: 'department',
      label: 'Department',
      options: departments
    },
    {
      key: 'status',
      label: 'Status',
      options: ['Active', 'Expiring Soon', 'Scheduled', 'Expired']
    }
  ];

  const handleFilterChange = (key, value) => {
    setActiveFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleClearAll = () => {
    setActiveFilters({ department: 'All', status: 'All' });
    setSearchQuery('');
  };

  // Helper to calculate computed status
  const getContractStatus = (c) => {
    if (c.endDate) {
      const end = new Date(c.endDate);
      const now = new Date('2026-09-05');
      if (end < now) {
        return 'Expired';
      }
      const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
      if (diff >= 0 && diff <= 45 && c.status === 'Active') return 'Expiring Soon';
    }
    if (c.startDate) {
      const start = new Date(c.startDate);
      const now = new Date('2026-09-05');
      if (start > now) return 'Scheduled';
    }
    return c.status;
  };

  const filteredContracts = useMemo(() => {
    return contracts.filter((c) => {
      const computedStatus = getContractStatus(c);

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          c.id.toLowerCase().includes(q) ||
          c.employeeName.toLowerCase().includes(q) ||
          c.contractName.toLowerCase().includes(q) ||
          c.position.toLowerCase().includes(q);
        if (!matches) return false;
      }

      if (activeFilters.department !== 'All' && c.department !== activeFilters.department) {
        return false;
      }

      if (activeFilters.status !== 'All') {
        if (activeFilters.status === 'Expiring Soon') {
          if (computedStatus !== 'Expiring Soon') return false;
        } else if (activeFilters.status === 'Active') {
          if (c.status !== 'Active') return false;
        } else if (c.status !== activeFilters.status) {
          return false;
        }
      }

      return true;
    });
  }, [contracts, searchQuery, activeFilters]);

  // Check for any potential active contract conflict in the database
  const conflictsDetected = useMemo(() => {
    const activeByEmployee = {};
    const conflicts = [];
    contracts.forEach((c) => {
      if (c.status === 'Active' && c.isCurrent) {
        if (activeByEmployee[c.employeeId]) {
          conflicts.push({ emp: c.employeeName, c1: activeByEmployee[c.employeeId], c2: c });
        } else {
          activeByEmployee[c.employeeId] = c;
        }
      }
    });
    return conflicts;
  }, [contracts]);

  const columns = [
    {
      key: 'id',
      label: 'Contract ID',
      sortable: true,
      render: (id, row) => (
        <div>
          <div className="font-mono font-bold text-slate-900">{id}</div>
          <div className="text-[11px] text-slate-500 font-medium">{row.contractName}</div>
        </div>
      )
    },
    {
      key: 'employeeName',
      label: 'Employee',
      sortable: true,
      render: (name, row) => (
        <div>
          <div className="font-semibold text-slate-900">{name}</div>
          <div className="text-[11px] text-slate-400 font-mono">{row.employeeId}</div>
        </div>
      )
    },
    {
      key: 'position',
      label: 'Role & Department',
      render: (pos, row) => (
        <div>
          <div className="font-medium text-slate-800">{pos}</div>
          <div className="text-[11px] text-slate-500">{row.department}</div>
        </div>
      )
    },
    {
      key: 'startDate',
      label: 'Term Period',
      sortable: true,
      render: (start, row) => (
        <div className="text-xs">
          <span className="font-medium text-slate-800">{start}</span>
          <span className="text-slate-400 mx-1">→</span>
          <span className={`font-medium ${getContractStatus(row) === 'Expiring Soon' ? 'text-amber-700 font-bold' : 'text-slate-800'}`}>
            {row.endDate || 'Open-ended'}
          </span>
        </div>
      )
    },
    {
      key: 'wage',
      label: 'Agreed Wage',
      render: (wage, row) => (
        <div>
          <span className="font-bold text-slate-900">{wage}</span>
          <div className="text-[10px] text-slate-400">{row.salaryStructure}</div>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (_, row) => {
        const computedStatus = getContractStatus(row);
        const isPastEnd = row.endDate && new Date(row.endDate) < new Date('2026-09-05');
        const isCurrentActive = row.isCurrent && row.status === 'Active' && !isPastEnd;

        return (
          <div className="flex items-center gap-1.5 flex-wrap">
            <StatusBadge status={computedStatus} />
            {isCurrentActive ? (
              <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200 shadow-2xs">
                CURRENT ACTIVE
              </span>
            ) : computedStatus === 'Expired' || isPastEnd ? (
              <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 border border-slate-200">
                HISTORICAL
              </span>
            ) : null}
          </div>
        );
      }
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            Contracts
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Manage employee employment terms, legal agreements, and track active vs historical contract history.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-indigo-700 shadow-sm transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>+ New Contract</span>
        </button>
      </div>

      {/* Global Contract Conflict Warning */}
      {conflictsDetected.length > 0 && (
        <div className="rounded-xl border border-rose-300 bg-rose-50 p-4 text-rose-900 space-y-1">
          <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-rose-800">
            <AlertTriangle className="h-4 w-4 text-rose-600" />
            <span>Contract Conflict Detected</span>
          </div>
          <p className="text-xs text-rose-700 leading-relaxed">
            Multiple concurrent active contracts detected for: {conflictsDetected.map((c) => c.emp).join(', ')}. Please review and mark historical terms as expired.
          </p>
        </div>
      )}

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
        emptyTitle="No contracts found"
        emptyDescription="Try clearing active filters or issue a new legal contract."
      />

      {/* Modal */}
      <ContractFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
