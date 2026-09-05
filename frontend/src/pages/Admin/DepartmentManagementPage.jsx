import React, { useState, useMemo } from 'react';
import {
  Building2,
  Briefcase,
  Plus,
  Edit2,
  Trash2,
  Users,
  Search,
  CheckCircle2,
  ChevronRight,
  Shield,
  Layers,
  MapPin,
  FileText,
  AlertCircle
} from 'lucide-react';
import { useHRData } from '../../context/HRDataContext';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import StatusBadge from '../../components/ui/StatusBadge';

export default function DepartmentManagementPage() {
  const {
    departmentsList,
    jobPositionsList,
    employees,
    addDepartment,
    updateDepartment,
    deleteDepartment,
    addJobPosition,
    updateJobPosition,
    deleteJobPosition,
    showToast
  } = useHRData();

  // Selected Department for deep inspection & scoped positions
  const [selectedDeptId, setSelectedDeptId] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('DEPARTMENTS'); // 'DEPARTMENTS' | 'POSITIONS'

  // Department Modal State
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [deptForm, setDeptForm] = useState({
    name: '',
    code: '',
    manager: '',
    description: '',
    floor: 'Floor 1'
  });
  const [deptErrors, setDeptErrors] = useState({});

  // Position Modal State
  const [isPosModalOpen, setIsPosModalOpen] = useState(false);
  const [editingPos, setEditingPos] = useState(null);
  const [posForm, setPosForm] = useState({
    title: '',
    department: '',
    level: 'Mid',
    status: 'Active',
    description: ''
  });
  const [posErrors, setPosErrors] = useState({});

  // Confirm Delete Dialog State
  const [deleteTarget, setDeleteTarget] = useState(null); // { type: 'DEPT' | 'POS', item: any }

  // Department employee counts
  const employeeCountByDept = useMemo(() => {
    const counts = {};
    (employees || []).forEach((e) => {
      if (e.department) {
        counts[e.department] = (counts[e.department] || 0) + 1;
      }
    });
    return counts;
  }, [employees]);

  // Position employee counts
  const employeeCountByPos = useMemo(() => {
    const counts = {};
    (employees || []).forEach((e) => {
      if (e.jobPosition) {
        counts[e.jobPosition] = (counts[e.jobPosition] || 0) + 1;
      }
    });
    return counts;
  }, [employees]);

  // Filtered Departments
  const filteredDepartments = useMemo(() => {
    return departmentsList.filter((d) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        d.name.toLowerCase().includes(q) ||
        d.code.toLowerCase().includes(q) ||
        (d.manager || '').toLowerCase().includes(q) ||
        (d.description || '').toLowerCase().includes(q)
      );
    });
  }, [departmentsList, searchQuery]);

  // Filtered Job Positions
  const filteredPositions = useMemo(() => {
    return jobPositionsList.filter((p) => {
      if (selectedDeptId !== 'ALL') {
        const deptObj = departmentsList.find((d) => d.id === selectedDeptId);
        if (deptObj && p.department !== deptObj.name) return false;
      }
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        p.title.toLowerCase().includes(q) ||
        p.department.toLowerCase().includes(q) ||
        (p.level || '').toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q)
      );
    });
  }, [jobPositionsList, selectedDeptId, departmentsList, searchQuery]);

  // Selected Department Details
  const activeDepartment = useMemo(() => {
    if (selectedDeptId === 'ALL') return null;
    return departmentsList.find((d) => d.id === selectedDeptId) || null;
  }, [selectedDeptId, departmentsList]);

  // Handlers for Department Form
  const handleOpenCreateDept = () => {
    setEditingDept(null);
    setDeptForm({
      name: '',
      code: '',
      manager: '',
      description: '',
      floor: 'Floor 1'
    });
    setDeptErrors({});
    setIsDeptModalOpen(true);
  };

  const handleOpenEditDept = (dept) => {
    setEditingDept(dept);
    setDeptForm({
      name: dept.name,
      code: dept.code,
      manager: dept.manager || '',
      description: dept.description || '',
      floor: dept.floor || 'Floor 1'
    });
    setDeptErrors({});
    setIsDeptModalOpen(true);
  };

  const handleSaveDept = (e) => {
    e.preventDefault();
    const errs = {};
    if (!deptForm.name.trim()) errs.name = 'Department name is required.';
    if (!deptForm.code.trim()) errs.code = 'Department code is required.';
    if (Object.keys(errs).length > 0) {
      setDeptErrors(errs);
      return;
    }

    if (editingDept) {
      updateDepartment(editingDept.id, deptForm);
    } else {
      addDepartment(deptForm);
    }
    setIsDeptModalOpen(false);
  };

  // Handlers for Position Form
  const handleOpenCreatePos = (defaultDeptName = '') => {
    setEditingPos(null);
    const assignedDept =
      defaultDeptName ||
      (activeDepartment ? activeDepartment.name : departmentsList[0]?.name || 'Engineering');
    setPosForm({
      title: '',
      department: assignedDept,
      level: 'Mid',
      status: 'Active',
      description: ''
    });
    setPosErrors({});
    setIsPosModalOpen(true);
  };

  const handleOpenEditPos = (pos) => {
    setEditingPos(pos);
    setPosForm({
      title: pos.title,
      department: pos.department,
      level: pos.level || 'Mid',
      status: pos.status || 'Active',
      description: pos.description || ''
    });
    setPosErrors({});
    setIsPosModalOpen(true);
  };

  const handleSavePos = (e) => {
    e.preventDefault();
    const errs = {};
    if (!posForm.title.trim()) errs.title = 'Position title is required.';
    if (!posForm.department.trim()) errs.department = 'Department assignment is required.';
    if (Object.keys(errs).length > 0) {
      setPosErrors(errs);
      return;
    }

    if (editingPos) {
      updateJobPosition(editingPos.id, posForm);
    } else {
      addJobPosition(posForm);
    }
    setIsPosModalOpen(false);
  };

  // Confirm Delete Handler
  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === 'DEPT') {
      deleteDepartment(deleteTarget.item.id);
      if (selectedDeptId === deleteTarget.item.id) {
        setSelectedDeptId('ALL');
      }
    } else if (deleteTarget.type === 'POS') {
      deleteJobPosition(deleteTarget.item.id);
    }
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Departments & Job Positions
          </h1>
          <p className="text-xs text-slate-500">
            Manage your organization's structural hierarchy. All changes instantly reflect across employee directories, user profiles, and filters.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleOpenCreateDept}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"
          >
            <Building2 className="h-3.5 w-3.5 text-slate-500" />
            <span>New Department</span>
          </button>

          <button
            type="button"
            onClick={() => handleOpenCreatePos()}
            className="btn-primary flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold"
          >
            <Briefcase className="h-3.5 w-3.5" />
            <span>New Job Position</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-subtle">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Departments</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
              <Building2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">{departmentsList.length}</div>
          <p className="mt-0.5 text-[11px] text-slate-400">Total active business units</p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-subtle">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Job Positions</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
              <Briefcase className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">{jobPositionsList.length}</div>
          <p className="mt-0.5 text-[11px] text-slate-400">Standardized role titles</p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-subtle">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total Staff</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">{employees.length}</div>
          <p className="mt-0.5 text-[11px] text-slate-400">Assigned across units</p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-subtle">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Avg Unit Size</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Layers className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">
            {departmentsList.length > 0 ? (employees.length / departmentsList.length).toFixed(1) : 0}
          </div>
          <p className="mt-0.5 text-[11px] text-slate-400">Employees per unit</p>
        </div>
      </div>

      {/* Tabs and Department Selector */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab('DEPARTMENTS')}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
              activeTab === 'DEPARTMENTS'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="h-3.5 w-3.5" />
            <span>Departments ({departmentsList.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('POSITIONS')}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
              activeTab === 'POSITIONS'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Briefcase className="h-3.5 w-3.5" />
            <span>Job Positions ({jobPositionsList.length})</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Department Filter Selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-medium text-slate-500 hidden sm:inline">Scope:</span>
            <select
              value={selectedDeptId}
              onChange={(e) => setSelectedDeptId(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-subtle focus:border-brand-400 focus:outline-none"
            >
              <option value="ALL">All Departments</option>
              {departmentsList.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.code})
                </option>
              ))}
            </select>
          </div>

          {/* Quick Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="w-40 sm:w-56 rounded-xl border border-slate-200 bg-white pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 shadow-subtle focus:border-brand-400 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* TAB 1: DEPARTMENTS VIEW */}
      {activeTab === 'DEPARTMENTS' && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredDepartments.map((dept) => {
            const assignedPositions = jobPositionsList.filter((p) => p.department === dept.name);
            const staffCount = employeeCountByDept[dept.name] || 0;
            const isSelected = selectedDeptId === dept.id;

            return (
              <div
                key={dept.id}
                className={`relative flex flex-col justify-between rounded-2xl border bg-white p-5 shadow-card transition-all ${
                  isSelected ? 'border-brand-400 ring-2 ring-brand-100' : 'border-slate-200/90 hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-100/60 font-bold text-slate-800">
                        {dept.code}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 leading-tight">
                          {dept.name}
                        </h3>
                        <span className="inline-block mt-0.5 rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">
                          {dept.floor || 'Floor 1'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleOpenEditDept(dept)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-800 transition-colors"
                        title="Edit Department"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget({ type: 'DEPT', item: dept })}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                        title="Delete Department"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="mt-3 text-xs text-slate-500 line-clamp-2 min-h-[32px]">
                    {dept.description || 'No description provided.'}
                  </p>

                  <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl bg-slate-50 p-2.5 text-xs">
                    <div>
                      <span className="block text-[10px] font-medium text-slate-400">Head of Dept</span>
                      <span className="font-semibold text-slate-800 truncate block">
                        {dept.manager || 'Unassigned'}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-medium text-slate-400">Active Staff</span>
                      <span className="font-semibold text-slate-800">{staffCount} members</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] font-medium text-slate-500">
                    {assignedPositions.length} Job Positions
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenCreatePos(dept.name)}
                      className="text-[11px] font-semibold text-brand-700 hover:underline"
                    >
                      + Add Position
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedDeptId(dept.id);
                        setActiveTab('POSITIONS');
                      }}
                      className="flex items-center text-[11px] font-medium text-slate-600 hover:text-slate-900"
                    >
                      <span>Inspect</span>
                      <ChevronRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: JOB POSITIONS VIEW */}
      {activeTab === 'POSITIONS' && (
        <div className="space-y-4">
          {activeDepartment && (
            <div className="flex items-center justify-between rounded-xl bg-brand-50/70 border border-brand-200/70 px-4 py-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-900">Filtered by:</span>
                <span className="rounded-md bg-white px-2 py-0.5 font-bold text-slate-800 shadow-sm">
                  {activeDepartment.name} ({activeDepartment.code})
                </span>
                <span className="text-slate-500">({filteredPositions.length} positions)</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDeptId('ALL')}
                className="text-xs font-semibold text-slate-600 hover:text-slate-900 underline"
              >
                Clear department filter
              </button>
            </div>
          )}

          <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-card">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200/80 bg-slate-50/75 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-3.5">Position Title</th>
                  <th className="px-4 py-3.5">Department</th>
                  <th className="px-4 py-3.5">Level / Tier</th>
                  <th className="px-4 py-3.5">Assigned Staff</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Description</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPositions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-8 text-center text-xs text-slate-400">
                      No job positions found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  filteredPositions.map((pos) => {
                    const staffCount = employeeCountByPos[pos.title] || 0;
                    return (
                      <tr key={pos.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-5 py-3.5 font-semibold text-slate-900">
                          {pos.title}
                        </td>
                        <td className="px-4 py-3.5 font-medium text-slate-700">
                          <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] text-slate-700">
                            <Building2 className="h-3 w-3 text-slate-500" />
                            {pos.department}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-700 border border-indigo-100">
                            {pos.level || 'Mid'}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-slate-600 font-medium">
                          {staffCount} {staffCount === 1 ? 'employee' : 'employees'}
                        </td>
                        <td className="px-4 py-3.5">
                          <StatusBadge status={pos.status || 'Active'} />
                        </td>
                        <td className="px-4 py-3.5 text-slate-500 max-w-xs truncate">
                          {pos.description || '—'}
                        </td>
                        <td className="px-5 py-3.5 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => handleOpenEditPos(pos)}
                              className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-800 transition-colors"
                              title="Edit Position"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteTarget({ type: 'POS', item: pos })}
                              className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                              title="Delete Position"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DEPARTMENT MODAL */}
      <Modal
        isOpen={isDeptModalOpen}
        onClose={() => setIsDeptModalOpen(false)}
        title={editingDept ? 'Edit Department' : 'Create New Department'}
        subtitle="Manage organizational departments and business units"
        footer={
          <>
            <button
              type="button"
              onClick={() => setIsDeptModalOpen(false)}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveDept}
              className="btn-primary px-4 py-2 text-xs font-semibold"
            >
              {editingDept ? 'Save Changes' : 'Create Department'}
            </button>
          </>
        }
      >
        <form onSubmit={handleSaveDept} className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-[11px] font-medium text-slate-700">
                Department Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={deptForm.name}
                onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
                placeholder="e.g., Engineering"
                className={`mt-1 w-full rounded-xl border bg-white px-3 py-2 text-xs shadow-subtle focus:outline-none ${
                  deptErrors.name ? 'border-rose-300 ring-2 ring-rose-100' : 'border-slate-200 focus:border-brand-400'
                }`}
              />
              {deptErrors.name && <p className="mt-1 text-[11px] text-rose-500">{deptErrors.name}</p>}
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-700">
                Department Code <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                maxLength={6}
                value={deptForm.code}
                onChange={(e) => setDeptForm({ ...deptForm, code: e.target.value.toUpperCase() })}
                placeholder="e.g., ENG"
                className={`mt-1 w-full rounded-xl border bg-white px-3 py-2 text-xs shadow-subtle uppercase focus:outline-none ${
                  deptErrors.code ? 'border-rose-300 ring-2 ring-rose-100' : 'border-slate-200 focus:border-brand-400'
                }`}
              />
              {deptErrors.code && <p className="mt-1 text-[11px] text-rose-500">{deptErrors.code}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-[11px] font-medium text-slate-700">Head of Department / Manager</label>
              <input
                type="text"
                value={deptForm.manager}
                onChange={(e) => setDeptForm({ ...deptForm, manager: e.target.value })}
                placeholder="e.g., David Kim"
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs shadow-subtle focus:border-brand-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-700">Office Location / Floor</label>
              <input
                type="text"
                value={deptForm.floor}
                onChange={(e) => setDeptForm({ ...deptForm, floor: e.target.value })}
                placeholder="e.g., Floor 4"
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs shadow-subtle focus:border-brand-400 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-700">Description & Mission</label>
            <textarea
              rows={3}
              value={deptForm.description}
              onChange={(e) => setDeptForm({ ...deptForm, description: e.target.value })}
              placeholder="Describe the responsibilities and scope of this department..."
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-3 text-xs shadow-subtle focus:border-brand-400 focus:outline-none"
            />
          </div>
        </form>
      </Modal>

      {/* JOB POSITION MODAL */}
      <Modal
        isOpen={isPosModalOpen}
        onClose={() => setIsPosModalOpen(false)}
        title={editingPos ? 'Edit Job Position' : 'Create New Job Position'}
        subtitle="Define position titles, levels, and department linkages"
        footer={
          <>
            <button
              type="button"
              onClick={() => setIsPosModalOpen(false)}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSavePos}
              className="btn-primary px-4 py-2 text-xs font-semibold"
            >
              {editingPos ? 'Save Position' : 'Create Position'}
            </button>
          </>
        }
      >
        <form onSubmit={handleSavePos} className="space-y-4">
          <div>
            <label className="block text-[11px] font-medium text-slate-700">
              Position Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={posForm.title}
              onChange={(e) => setPosForm({ ...posForm, title: e.target.value })}
              placeholder="e.g., Senior Full Stack Engineer"
              className={`mt-1 w-full rounded-xl border bg-white px-3 py-2 text-xs shadow-subtle focus:outline-none ${
                posErrors.title ? 'border-rose-300 ring-2 ring-rose-100' : 'border-slate-200 focus:border-brand-400'
              }`}
            />
            {posErrors.title && <p className="mt-1 text-[11px] text-rose-500">{posErrors.title}</p>}
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-700">
                Department <span className="text-rose-500">*</span>
              </label>
              <select
                value={posForm.department}
                onChange={(e) => setPosForm({ ...posForm, department: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs shadow-subtle focus:border-brand-400 focus:outline-none"
              >
                {departmentsList.map((d) => (
                  <option key={d.id} value={d.name}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-700">Seniority Level</label>
              <select
                value={posForm.level}
                onChange={(e) => setPosForm({ ...posForm, level: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs shadow-subtle focus:border-brand-400 focus:outline-none"
              >
                <option value="Entry">Entry Level</option>
                <option value="Mid">Mid Level</option>
                <option value="Senior">Senior</option>
                <option value="Lead">Team Lead / Staff</option>
                <option value="Executive">Director / Executive</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-700">Status</label>
              <select
                value={posForm.status}
                onChange={(e) => setPosForm({ ...posForm, status: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs shadow-subtle focus:border-brand-400 focus:outline-none"
              >
                <option value="Active">Active</option>
                <option value="Archived">Archived</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-700">Position Scope / Responsibilities</label>
            <textarea
              rows={3}
              value={posForm.description}
              onChange={(e) => setPosForm({ ...posForm, description: e.target.value })}
              placeholder="Brief summary of required skills and responsibilities..."
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-3 text-xs shadow-subtle focus:border-brand-400 focus:outline-none"
            />
          </div>
        </form>
      </Modal>

      {/* CONFIRM DELETE DIALOG */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title={deleteTarget?.type === 'DEPT' ? 'Delete Department?' : 'Delete Job Position?'}
        message={
          deleteTarget?.type === 'DEPT'
            ? `Are you sure you want to delete department "${deleteTarget?.item.name}"? This department will be removed from navigation, Kanban views, and selection menus.`
            : `Are you sure you want to delete job position "${deleteTarget?.item.title}"?`
        }
        confirmLabel={deleteTarget?.type === 'DEPT' ? 'Delete Department' : 'Delete Position'}
        isDestructive={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
