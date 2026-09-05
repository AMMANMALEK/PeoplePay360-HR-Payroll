import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, List, LayoutGrid } from 'lucide-react';
import { useHRData } from '../../context/HRDataContext';
import EmployeeListView from '../../components/employees/EmployeeListView';
import EmployeeKanbanView from '../../components/employees/EmployeeKanbanView';
import EmployeeFormModal from '../../components/employees/EmployeeFormModal';
import FilterBar from '../../components/ui/FilterBar';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import PageHeader from '../../components/ui/PageHeader';

export default function EmployeesPage() {
  const [searchParams] = useSearchParams();
  const filterQueryParam = searchParams.get('filter');

  const { employees, contracts, departments, deleteEmployee, isLoadingEmployees } = useHRData();

  const [viewMode, setViewMode] = useState('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState({
    department: 'All',
    status: 'All',
    profile: filterQueryParam === 'incomplete' ? 'Incomplete' : 'All',
  });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [deletingEmployee, setDeletingEmployee] = useState(null);

  const filterDefs = [
    { key: 'department', label: 'Department', options: departments },
    { key: 'status', label: 'Status', options: ['Active', 'On Leave', 'Inactive'] },
    {
      key: 'profile',
      label: 'Profile State',
      options: [
        { label: 'Incomplete Profiles', value: 'Incomplete' },
        { label: 'Complete Profiles', value: 'Complete' },
      ],
    },
  ];

  const handleFilterChange = (key, value) => {
    setActiveFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleClearAll = () => {
    setActiveFilters({ department: 'All', status: 'All', profile: 'All' });
    setSearchQuery('');
  };

  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesSearch =
          (emp.fullName || '').toLowerCase().includes(q) ||
          String(emp.id || '').toLowerCase().includes(q) ||
          (emp.jobPosition || '').toLowerCase().includes(q) ||
          (emp.workEmail || '').toLowerCase().includes(q);
        if (!matchesSearch) return false;
      }
      if (activeFilters.department !== 'All' && emp.department !== activeFilters.department) return false;
      if (activeFilters.status !== 'All' && emp.employmentStatus !== activeFilters.status) return false;
      if (activeFilters.profile === 'Incomplete' && emp.profileComplete) return false;
      if (activeFilters.profile === 'Complete' && !emp.profileComplete) return false;
      return true;
    });
  }, [employees, searchQuery, activeFilters]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Employees"
        count={employees.length}
        subtitle="Search, filter, and maintain employee records."
        actions={
          <button
            type="button"
            className="btn-primary"
            onClick={() => {
              setEditingEmployee(null);
              setIsFormOpen(true);
            }}
          >
            <Plus className="h-4 w-4" />
            Add Employee
          </button>
        }
      />

      <FilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search by name, ID, job position..."
        filters={filterDefs}
        activeFilters={activeFilters}
        onFilterChange={handleFilterChange}
        onClearAll={handleClearAll}
        extraActions={
          <div className="inline-flex rounded-2xl border border-slate-200 bg-white p-1">
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-medium ${
                viewMode === 'list' ? 'bg-brand-400 text-slate-900' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <List className="h-3.5 w-3.5" />
              List
            </button>
            <button
              type="button"
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-medium ${
                viewMode === 'kanban' ? 'bg-brand-400 text-slate-900' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              Board
            </button>
          </div>
        }
      />

      {viewMode === 'list' ? (
        <EmployeeListView
          employees={filteredEmployees}
          contracts={contracts}
          isLoading={isLoadingEmployees}
          onEdit={(emp) => {
            setEditingEmployee(emp);
            setIsFormOpen(true);
          }}
          onDelete={(emp) => setDeletingEmployee(emp)}
        />
      ) : (
        <EmployeeKanbanView employees={filteredEmployees} departments={departments} />
      )}

      <EmployeeFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingEmployee(null);
        }}
        initialData={editingEmployee}
      />

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
