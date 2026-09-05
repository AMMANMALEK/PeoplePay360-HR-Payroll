import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  FileText, 
  Clock, 
  CalendarCheck, 
  PieChart, 
  Plus, 
  Mail, 
  Phone, 
  Calendar, 
  Building, 
  ShieldAlert,
  MoreHorizontal,
  FileDown,
  UserX
} from 'lucide-react';
import { useHRData } from '../../context/HRDataContext';
import EmployeeAvatar from '../../components/ui/EmployeeAvatar';
import StatusBadge from '../../components/ui/StatusBadge';
import SmartNavCard from '../../components/employees/SmartNavCard';
import AllocationCard from '../../components/timeoff/AllocationCard';
import EmployeeFormModal from '../../components/employees/EmployeeFormModal';
import ContractFormModal from '../../components/contracts/ContractFormModal';
import AttendanceCorrectionModal from '../../components/attendance/AttendanceCorrectionModal';
import TimeOffReviewModal from '../../components/timeoff/TimeOffReviewModal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';

export default function EmployeeDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { 
    employees, 
    contracts, 
    attendance, 
    timeOffRequests, 
    allocations,
    deleteEmployee,
    showToast 
  } = useHRData();

  const employee = employees.find((e) => e.id === id);

  // Active tab state: 'overview' | 'employment' | 'attendance' | 'timeoff'
  const [activeTab, setActiveTab] = useState('overview');
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  // Modals
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [selectedAttendanceRecord, setSelectedAttendanceRecord] = useState(null);
  const [selectedTimeOffRecord, setSelectedTimeOffRecord] = useState(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  // Employee-specific linked records
  const empContracts = useMemo(() => {
    return contracts.filter((c) => c.employeeId === id);
  }, [contracts, id]);

  const activeContract = useMemo(() => {
    return empContracts.find((c) => {
      const isPastEnd = c.endDate && new Date(c.endDate) < new Date();
      return c.isCurrent && c.status === 'Active' && !isPastEnd;
    });
  }, [empContracts]);

  const historicalContracts = useMemo(() => {
    return empContracts.filter((c) => {
      const isPastEnd = c.endDate && new Date(c.endDate) < new Date();
      return !c.isCurrent || c.status !== 'Active' || isPastEnd;
    });
  }, [empContracts]);

  const empAttendance = useMemo(() => {
    return attendance.filter((a) => a.employeeId === id);
  }, [attendance, id]);

  const empExceptionsCount = useMemo(() => {
    return empAttendance.filter((a) => a.isException).length;
  }, [empAttendance]);

  const empTimeOff = useMemo(() => {
    return timeOffRequests.filter((t) => t.employeeId === id);
  }, [timeOffRequests, id]);

  const empAllocations = useMemo(() => {
    return allocations.filter((a) => a.employeeId === id);
  }, [allocations, id]);

  const totalRemainingLeave = useMemo(() => {
    return empAllocations.reduce((acc, curr) => acc + curr.remaining, 0);
  }, [empAllocations]);

  const pendingLeavesCount = useMemo(() => {
    return empTimeOff.filter((t) => t.status === 'Pending').length;
  }, [empTimeOff]);

  if (!employee) {
    return (
      <div className="py-16 text-center">
        <h2 className="text-lg font-bold text-slate-800">Employee record not found</h2>
        <p className="mt-1 text-xs text-slate-500">The requested employee ID does not exist.</p>
        <button
          type="button"
          onClick={() => navigate('/employees')}
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-brand-400 px-4 py-2 text-xs font-medium text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Return to Employee Directory</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back to Employees breadcrumb link */}
      <div>
        <button
          type="button"
          onClick={() => navigate('/employees')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>← Employees</span>
        </button>
      </div>

      {/* Main Operational Command Header */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-subtle">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <EmployeeAvatar name={employee.fullName} src={employee.avatar} size="lg" />
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-bold tracking-tight text-slate-900">
                  {employee.fullName}
                </h1>
                <StatusBadge status={employee.employmentStatus} />
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span className="font-semibold text-slate-800">{employee.jobPosition}</span>
                <span>·</span>
                <span>{employee.department}</span>
                <span>·</span>
                <span className="font-mono text-slate-400 font-medium">{employee.id}</span>
              </div>
            </div>
          </div>

          {/* Header Actions: [ Edit Employee ] [•••] */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand-400 px-4 py-2 text-xs font-semibold text-slate-900 hover:bg-brand-500 shadow-sm transition-colors"
            >
              <Edit className="h-3.5 w-3.5" />
              <span>Edit Employee</span>
            </button>

            {/* More Menu [•••] */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowMoreMenu(!showMoreMenu)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 transition-colors"
                aria-label="More actions"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>

              {showMoreMenu && (
                <div className="absolute right-0 mt-2 w-48 rounded-xl border border-slate-200 bg-white p-1.5 shadow-dropdown z-20 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setShowMoreMenu(false);
                      showToast(`Downloading complete employee dossier for ${employee.fullName}...`);
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-slate-700 hover:bg-slate-100 transition-colors"
                  >
                    <FileDown className="h-3.5 w-3.5 text-slate-500" />
                    <span>Export Profile Dossier</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowMoreMenu(false);
                      setIsContractModalOpen(true);
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-slate-700 hover:bg-slate-100 transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5 text-slate-500" />
                    <span>Issue New Contract</span>
                  </button>
                  <div className="my-1 border-t border-slate-100" />
                  <button
                    type="button"
                    onClick={() => {
                      setShowMoreMenu(false);
                      setIsDeleteConfirmOpen(true);
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Delete Employee</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Smart Summary: 4 Contextual Navigation Buttons */}
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <SmartNavCard
            type="contracts"
            label="Contracts"
            primaryValue={`${empContracts.length} records`}
            secondaryValue={activeContract ? '1 active' : '0 active'}
            isActive={activeTab === 'employment'}
            onClick={() => setActiveTab('employment')}
          />
          <SmartNavCard
            type="attendance"
            label="Attendance"
            primaryValue={`${empAttendance.length} records`}
            secondaryValue={empExceptionsCount > 0 ? `${empExceptionsCount} exceptions` : '0 exceptions'}
            isActive={activeTab === 'attendance'}
            onClick={() => setActiveTab('attendance')}
          />
          <SmartNavCard
            type="timeoff"
            label="Time Off"
            primaryValue={`${empTimeOff.length} requests`}
            secondaryValue={`${pendingLeavesCount} pending`}
            isActive={activeTab === 'timeoff'}
            onClick={() => setActiveTab('timeoff')}
          />
          <SmartNavCard
            type="allocations"
            label="Allocations"
            primaryValue={`${totalRemainingLeave} days remaining`}
            secondaryValue="Current leave balance"
            isActive={activeTab === 'timeoff'}
            onClick={() => setActiveTab('timeoff')}
          />
        </div>
      </div>

      {/* Tabs Navigation: Overview · Employment · Attendance · Time Off */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-6 text-xs font-semibold">
          {[
            { key: 'overview', label: 'Overview' },
            { key: 'employment', label: `Employment (${empContracts.length})` },
            { key: 'attendance', label: `Attendance (${empAttendance.length})` },
            { key: 'timeoff', label: `Time Off (${empTimeOff.length})` }
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`border-b-2 pb-3 transition-colors ${
                activeTab === tab.key
                  ? 'border-brand-400 text-brand-700'
                  : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* SECTION 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-subtle space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Personal Information
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-xs">
                <div>
                  <span className="text-slate-400 font-medium">Full Legal Name</span>
                  <p className="font-semibold text-slate-900 mt-0.5">{employee.fullName}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Work Email</span>
                  <p className="font-semibold text-slate-900 mt-0.5 flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-slate-400" />
                    {employee.workEmail}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Phone Number</span>
                  <p className="font-semibold text-slate-900 mt-0.5 flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-slate-400" />
                    {employee.phone || '—'}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Date of Birth</span>
                  <p className="font-semibold text-slate-900 mt-0.5 flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                    {employee.dob || '—'}
                  </p>
                </div>
              </div>
            </div>

            {/* Work Information */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-subtle space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Work Information
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-xs">
                <div>
                  <span className="text-slate-400 font-medium">Job Position</span>
                  <p className="font-semibold text-slate-900 mt-0.5">{employee.jobPosition}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Department</span>
                  <p className="font-semibold text-slate-900 mt-0.5 flex items-center gap-1.5">
                    <Building className="h-3.5 w-3.5 text-slate-400" />
                    {employee.department}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Reports To</span>
                  <p className="font-semibold text-slate-900 mt-0.5">
                    {employee.managerName || 'Executive Board'}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Assigned Working Schedule</span>
                  <p className="font-semibold text-slate-900 mt-0.5">
                    {typeof employee.scheduleName === 'object' && employee.scheduleName !== null
                      ? (employee.scheduleName.name || employee.scheduleName.scheduleCode || 'Standard')
                      : (employee.scheduleName || 'Standard')}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Employment Status</span>
                  <div className="mt-1">
                    <StatusBadge status={employee.employmentStatus} size="sm" />
                  </div>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Organization Joining Date</span>
                  <p className="font-semibold text-slate-900 mt-0.5">{employee.joinedDate}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Current Employment Summary */}
          <div className="space-y-6">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-subtle space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Current Employment
                </h3>
                {activeContract && <StatusBadge status="Active" size="sm" />}
              </div>

              {activeContract ? (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 space-y-3">
                  <div className="font-bold text-sm text-emerald-950">{activeContract.contractName}</div>
                  <div className="text-xs space-y-1.5 text-slate-700">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Contract ID:</span>
                      <span className="font-mono font-bold text-slate-800">{activeContract.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Agreed Wage:</span>
                      <span className="font-bold text-emerald-800">{activeContract.wage}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Term:</span>
                      <span className="font-medium">{activeContract.startDate} → {activeContract.endDate}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('employment')}
                    className="w-full mt-2 rounded-lg bg-emerald-600/10 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-600/20 transition-colors"
                  >
                    View Contract Terms →
                  </button>
                </div>
              ) : (
                <div className="py-6 text-center text-xs text-slate-400 border border-dashed rounded-lg">
                  No active contract registered.
                  <div className="mt-2">
                    <button
                      type="button"
                      onClick={() => setIsContractModalOpen(true)}
                      className="text-brand-700 font-semibold hover:underline"
                    >
                      + Create Contract
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Leave Allocations Snapshot */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-subtle space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Leave Balance Snapshot
                </h3>
                <span className="text-xs font-bold text-brand-700">{totalRemainingLeave}d Total</span>
              </div>
              <div className="space-y-2.5">
                {empAllocations.map((alc) => (
                  <AllocationCard key={alc.id} allocation={alc} />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: EMPLOYMENT (CURRENT + HISTORICAL CONTRACTS) */}
      {activeTab === 'employment' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Employment Contracts</h3>
              <p className="text-xs text-slate-500">
                Visual separation of current active employment terms from past historical agreements.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsContractModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand-400 px-3.5 py-2 text-xs font-medium text-slate-900 hover:bg-brand-500 shadow-sm transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>+ New Contract</span>
            </button>
          </div>

          {/* Current Active Contract */}
          <div>
            <div className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span>Current Active Contract</span>
            </div>
            {activeContract ? (
              <div className="rounded-xl border-2 border-emerald-300 bg-emerald-50/40 p-5 shadow-subtle">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-emerald-800 bg-white px-2 py-0.5 rounded border border-emerald-200">
                        {activeContract.id}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900">{activeContract.contractName}</h4>
                      <StatusBadge status="Active" size="sm" />
                    </div>
                    <p className="mt-1 text-xs text-slate-600">{activeContract.notes}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-base font-extrabold text-emerald-800">{activeContract.wage}</div>
                    <div className="text-[11px] text-slate-500">{activeContract.salaryStructure}</div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2 border-t border-emerald-200/60 pt-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Start Date</span>
                    <span className="font-semibold text-slate-800">{activeContract.startDate}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">End Date</span>
                    <span className="font-semibold text-slate-800">{activeContract.endDate}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Position Band</span>
                    <span className="font-semibold text-slate-800">{activeContract.position}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-5 rounded-xl border border-dashed text-center text-xs text-slate-400">
                No active contract registered.
              </div>
            )}
          </div>

          {/* Historical Contracts */}
          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Historical & Expired Contracts
            </div>
            {historicalContracts.length === 0 ? (
              <div className="p-4 rounded-xl border border-slate-200 bg-white text-center text-xs text-slate-400">
                No previous historical agreements recorded for this employee.
              </div>
            ) : (
              <div className="space-y-2">
                {historicalContracts.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/70 p-4 text-xs opacity-80 hover:opacity-100 transition-opacity"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] text-slate-500 font-semibold">{c.id}</span>
                        <span className="font-semibold text-slate-900">{c.contractName}</span>
                        <StatusBadge status={c.status} size="sm" />
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1">
                        Term: {c.startDate} to {c.endDate} • {c.wage}
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-white px-2 py-0.5 rounded border border-slate-200">
                      Historical
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SECTION 3: ATTENDANCE */}
      {activeTab === 'attendance' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Employee Attendance Logs</h3>
              <p className="text-xs text-slate-500">
                Shift check-ins, recorded hours, and HR compliance corrections.
              </p>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-subtle">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold uppercase text-slate-500">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Check In</th>
                  <th className="py-3 px-4">Check Out</th>
                  <th className="py-3 px-4">Worked Hours</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Audit Note</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {empAttendance.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-semibold text-slate-900">{record.date}</td>
                    <td className="py-3 px-4 font-mono">{record.checkIn}</td>
                    <td className="py-3 px-4 font-mono">{record.checkOut}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{record.workedHours}h</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <StatusBadge status={record.status} size="sm" />
                        {record.isException && (
                          <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1 py-0.5 rounded border border-rose-200">
                            ⚠ Exception
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {record.correction ? (
                        <div className="text-[10px] text-brand-700 bg-brand-50 p-1.5 rounded border border-indigo-100">
                          <span className="font-semibold">Corrected:</span> {record.correction.reason}
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px]">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedAttendanceRecord(record);
                          setIsAttendanceModalOpen(true);
                        }}
                        className="text-xs font-semibold text-brand-700 hover:text-brand-800"
                      >
                        Correct
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECTION 4: TIME OFF & ALLOCATIONS */}
      {activeTab === 'timeoff' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Time-Off Requests & Allocations</h3>
              <p className="text-xs text-slate-500">
                Review pending requests and available quota balances.
              </p>
            </div>
          </div>

          {/* Allocation Progress Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {empAllocations.map((alc) => (
              <AllocationCard key={alc.id} allocation={alc} />
            ))}
          </div>

          {/* Requests Table */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-subtle overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Leave Requests ({empTimeOff.length})
              </h4>
            </div>
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-[11px] font-semibold uppercase text-slate-500">
                <tr>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Dates</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Stated Reason</th>
                  <th className="py-3 px-4 text-right">Review</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {empTimeOff.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-semibold text-slate-900">{req.timeOffType}</td>
                    <td className="py-3 px-4">{req.startDate} → {req.endDate}</td>
                    <td className="py-3 px-4 font-bold text-brand-700">{req.duration} days</td>
                    <td className="py-3 px-4">
                      <StatusBadge status={req.status} size="sm" />
                    </td>
                    <td className="py-3 px-4 truncate max-w-xs text-slate-500 italic">
                      "{req.reason}"
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedTimeOffRecord(req)}
                        className={`rounded px-2.5 py-1 text-xs font-semibold transition-colors ${
                          req.status === 'Pending'
                            ? 'bg-brand-400 text-slate-900 hover:bg-brand-500 shadow-sm'
                            : 'text-brand-700 hover:bg-brand-50'
                        }`}
                      >
                        {req.status === 'Pending' ? 'Review & Decision' : 'View Detail'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Employee Modal */}
      <EmployeeFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        initialData={employee}
      />

      {/* New Contract Modal */}
      <ContractFormModal
        isOpen={isContractModalOpen}
        onClose={() => setIsContractModalOpen(false)}
        initialEmployeeId={employee.id}
      />

      {/* Attendance Correction Modal */}
      <AttendanceCorrectionModal
        isOpen={isAttendanceModalOpen}
        onClose={() => {
          setIsAttendanceModalOpen(false);
          setSelectedAttendanceRecord(null);
        }}
        record={selectedAttendanceRecord}
      />

      {/* Time Off Review Modal */}
      <TimeOffReviewModal
        isOpen={!!selectedTimeOffRecord}
        onClose={() => setSelectedTimeOffRecord(null)}
        request={selectedTimeOffRecord}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={() => {
          deleteEmployee(employee.id);
          navigate('/employees');
        }}
        title="Delete Employee Record"
        message={`Are you sure you want to permanently delete ${employee.fullName}? All associated operational records will be archived.`}
        confirmLabel="Delete Employee"
        isDestructive={true}
      />
    </div>
  );
}
