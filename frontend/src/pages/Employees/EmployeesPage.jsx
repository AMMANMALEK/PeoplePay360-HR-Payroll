import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Download, Upload, List, LayoutGrid } from 'lucide-react';
import { useHRData } from '../../context/HRDataContext';
import EmployeeListView from '../../components/employees/EmployeeListView';
import EmployeeKanbanView from '../../components/employees/EmployeeKanbanView';
import EmployeeFormModal from '../../components/employees/EmployeeFormModal';
import FilterBar from '../../components/ui/FilterBar';
import ConfirmDialog from '../../components/ui/ConfirmDialog';

export default function EmployeesPage() {
  const [searchParams] = useSearchParams();
  const filterQueryParam = searchParams.get('filter');

  const { employees, contracts, departments, deleteEmployee, showToast } = useHRData();

  const [viewMode, setViewMode] = useState('list'); // 'list' | 'kanban'
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState({
    department: 'All',
    status: 'All',
    profile: filterQueryParam === 'incomplete' ? 'Incomplete' : 'All'
  });

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [deletingEmployee, setDeletingEmployee] = useState(null);

  // Filter configuration
  const filterDefs = [
    {
      key: 'department',
      label: 'Department',
      options: departments
    },
    {
      key: 'status',
      label: 'Status',
      options: ['Active', 'On Leave', 'Inactive']
    },
    {
      key: 'profile',
      label: 'Profile State',
      options: [
        { label: 'Incomplete Profiles', value: 'Incomplete' },
        { label: 'Complete Profiles', value: 'Complete' }
      ]
    }
  ];

  const handleFilterChange = (key, value) => {
    setActiveFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleClearAll = () => {
    setActiveFilters({
      department: 'All',
      status: 'All',
      profile: 'All'
    });
    setSearchQuery('');
  };

  // Filtered employees list
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesSearch =
          emp.fullName.toLowerCase().includes(q) ||
          emp.id.toLowerCase().includes(q) ||
          emp.jobPosition.toLowerCase().includes(q) ||
          emp.workEmail.toLowerCase().includes(q);
        if (!matchesSearch) return false;
      }

      // Department filter
      if (activeFilters.department !== 'All' && emp.department !== activeFilters.department) {
        return false;
      }

      // Status filter
      if (activeFilters.status !== 'All' && emp.employmentStatus !== activeFilters.status) {
        return false;
      }

      // Profile state filter
      if (activeFilters.profile === 'Incomplete' && emp.profileComplete) return false;
      if (activeFilters.profile === 'Complete' && !emp.profileComplete) return false;

      return true;
    });
  }, [employees, searchQuery, activeFilters]);

  const handleExport = () => {
    showToast('Exporting employee directory report (CSV)...');
  };

  const handleImport = () => {
    showToast('Employee CSV import wizard opened.');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            Employees
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Manage your organization's people and employment information.
          </p>
        </div>

        {/* Primary & Secondary Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleImport}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-subtle"
          >
            <Upload className="h-3.5 w-3.5 text-slate-500" />
            <span>Import</span>
          </button>
          <button
            type="button"
            onClick={handleExport}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-subtle"
          >
            <Download className="h-3.5 w-3.5 text-slate-500" />
            <span>Export</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setEditingEmployee(null);
              setIsFormOpen(true);
            }}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-medium text-white hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <Plus className="h-4 w-4" />
            <span>+ Add Employee</span>
          </button>
        </div>
      </div>

      {/* Filter and View Mode Switcher */}
      <FilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search by name, ID, job position..."
        filters={filterDefs}
        activeFilters={activeFilters}
        onFilterChange={handleFilterChange}
        onClearAll={handleClearAll}
        extraActions={
          <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5 shadow-subtle">
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
                viewMode === 'list'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Table List View"
            >
              <List className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">List</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
                viewMode === 'kanban'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Kanban Board View"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Kanban</span>
            </button>
          </div>
        }
      />

      {/* Content Rendering: List vs Kanban */}
      {viewMode === 'list' ? (
        <EmployeeListView
          employees={filteredEmployees}
          contracts={contracts}
          onEdit={(emp) => {
            setEditingEmployee(emp);
            setIsFormOpen(true);
          }}
          onDelete={(emp) => setDeletingEmployee(emp)}
        />
      ) : (
        <EmployeeKanbanView
          employees={filteredEmployees}
          departments={departments}
        />
      )}

      {/* Add / Edit Employee Modal Form */}
      <EmployeeFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingEmployee(null);
        }}
        initialData={editingEmployee}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={!!deletingEmployee}
        onClose={() => setDeletingEmployee(null)}
        onConfirm={() => {
          if (deletingEmployee) deleteEmployee(deletingEmployee.id);
        }}
        title="Delete Employee Record"
        message={`Are you sure you want to permanently remove ${deletingEmployee?.fullName} (${deletingEmployee?.id})? This action cannot be undone.`}
        confirmLabel="Delete Record"
        isDestructive={true}
      />
    </div>
  );
}
