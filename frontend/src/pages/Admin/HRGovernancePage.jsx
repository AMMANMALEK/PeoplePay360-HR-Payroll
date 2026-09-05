import React, { useState, useMemo } from 'react';
import {
  CalendarCheck,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  UserCheck,
  Search,
  Filter,
  Calendar,
  ChevronRight,
  Shield,
  Edit2,
  Plus,
  FileText,
  User,
  Activity
} from 'lucide-react';
import { useHRData } from '../../context/HRDataContext';
import Modal from '../../components/ui/Modal';
import StatusBadge from '../../components/ui/StatusBadge';

export default function HRGovernancePage() {
  const {
    hrTimeOffRequests,
    hrAttendanceList,
    approveHRLeave,
    refuseHRLeave,
    addHRLeaveRequest,
    adjustHRAttendance,
    addHRAttendanceRecord,
    showToast
  } = useHRData();

  const [activeTab, setActiveTab] = useState('LEAVES'); // 'LEAVES' | 'ATTENDANCE'
  const [roleFilter, setRoleFilter] = useState('ALL'); // 'ALL' | 'HR_MANAGER' | 'HR_PAYROLL_MANAGER'
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Refusal Modal State
  const [refusalTarget, setRefusalTarget] = useState(null);
  const [refusalReason, setRefusalReason] = useState('');

  // Submit Leave on Behalf Modal State
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [leaveForm, setLeaveForm] = useState({
    employeeName: '',
    role: 'HR_MANAGER',
    employeeId: '',
    timeOffType: 'Personal Leave',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    duration: 1,
    reason: '',
    status: 'Approved'
  });

  // Adjust Attendance Timing Modal State
  const [adjustTarget, setAdjustTarget] = useState(null);
  const [timingForm, setTimingForm] = useState({
    checkIn: '09:00',
    checkOut: '17:30',
    status: 'Present',
    notes: ''
  });

  // Record Missing Punch Modal State
  const [isPunchModalOpen, setIsPunchModalOpen] = useState(false);
  const [punchForm, setPunchForm] = useState({
    employeeName: '',
    role: 'HR_MANAGER',
    employeeCode: '',
    date: new Date().toISOString().split('T')[0],
    checkIn: '09:00',
    checkOut: '18:00',
    status: 'Present',
    notes: 'Approved standard attendance'
  });

  // Filtered Leave Requests
  const filteredLeaveRequests = useMemo(() => {
    return hrTimeOffRequests.filter((req) => {
      if (roleFilter !== 'ALL' && req.role !== roleFilter) return false;
      if (statusFilter !== 'ALL' && req.status !== statusFilter) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        req.employeeName.toLowerCase().includes(q) ||
        req.timeOffType.toLowerCase().includes(q) ||
        (req.reason || '').toLowerCase().includes(q)
      );
    });
  }, [hrTimeOffRequests, roleFilter, statusFilter, searchQuery]);

  // Filtered Attendance Records
  const filteredAttendance = useMemo(() => {
    return hrAttendanceList.filter((att) => {
      if (roleFilter !== 'ALL' && att.role !== roleFilter) return false;
      if (statusFilter !== 'ALL' && att.status !== statusFilter) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        att.employeeName.toLowerCase().includes(q) ||
        att.date.includes(q) ||
        (att.notes || '').toLowerCase().includes(q)
      );
    });
  }, [hrAttendanceList, roleFilter, statusFilter, searchQuery]);

  // KPI Calculations
  const pendingLeavesCount = useMemo(() => {
    return hrTimeOffRequests.filter((r) => r.status === 'Pending').length;
  }, [hrTimeOffRequests]);

  const today = new Date().toISOString().split('T')[0];
  const presentTodayCount = useMemo(() => {
    return hrAttendanceList.filter((a) => a.date === today && (a.status === 'Present' || a.status === 'Half-day')).length;
  }, [hrAttendanceList, today]);

  // Handle Refusal
  const handleConfirmRefusal = (e) => {
    e.preventDefault();
    if (!refusalTarget) return;
    if (!refusalReason.trim()) {
      showToast('Please provide a reason for refusal.', 'error');
      return;
    }
    refuseHRLeave(refusalTarget.id, refusalReason.trim());
    setRefusalTarget(null);
    setRefusalReason('');
  };

  // Handle Leave on Behalf Submission
  const handleSaveLeaveOnBehalf = (e) => {
    e.preventDefault();
    const d1 = new Date(leaveForm.startDate);
    const d2 = new Date(leaveForm.endDate);
    const diffDays = Math.max(1, Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24)) + 1);

    addHRLeaveRequest({
      ...leaveForm,
      duration: diffDays
    });
    setIsLeaveModalOpen(false);
  };

  // Handle Timing Adjustment
  const handleOpenAdjust = (rec) => {
    setAdjustTarget(rec);
    setTimingForm({
      checkIn: rec.checkIn && rec.checkIn !== '--:--' ? rec.checkIn : '09:00',
      checkOut: rec.checkOut && rec.checkOut !== '--:--' ? rec.checkOut : '18:00',
      status: rec.status || 'Present',
      notes: rec.notes || ''
    });
  };

  const handleSaveAdjustment = (e) => {
    e.preventDefault();
    if (!adjustTarget) return;
    adjustHRAttendance(adjustTarget.id, timingForm);
    setAdjustTarget(null);
  };

  // Handle Record Missing Punch
  const handleSaveMissingPunch = (e) => {
    e.preventDefault();
    addHRAttendanceRecord(punchForm);
    setIsPunchModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-lg bg-brand-100 px-2.5 py-0.5 text-xs font-bold text-slate-800">
              Executive Governance
            </span>
          </div>
          <h1 className="mt-1 text-xl font-bold tracking-tight text-slate-900">
            HR Leadership Approvals & Timings
          </h1>
          <p className="text-xs text-slate-500">
            Approve leaves, review daily check-in and check-out logs, and adjust timings for HR Managers & HR Payroll Managers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'LEAVES' ? (
            <button
              type="button"
              onClick={() => setIsLeaveModalOpen(true)}
              className="btn-primary flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Record Leave on Behalf</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsPunchModalOpen(true)}
              className="btn-primary flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold"
            >
              <Clock className="h-3.5 w-3.5" />
              <span>Record Missing Punch</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-subtle">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">HR Leaders</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
              <Shield className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">2</div>
          <p className="mt-0.5 text-[11px] text-slate-400">David Kim & Sarah Jenkins</p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-subtle">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Pending Leaves</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <CalendarCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">{pendingLeavesCount}</div>
          <p className="mt-0.5 text-[11px] text-slate-400">Awaiting admin review</p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-subtle">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Present Today</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <UserCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">{presentTodayCount} / 2</div>
          <p className="mt-0.5 text-[11px] text-slate-400">Checked in on schedule</p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-subtle">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Governance Mode</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
              <Activity className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-base font-bold text-slate-900">Direct Admin</div>
          <p className="mt-0.5 text-[11px] text-slate-400">Authoritative audit trail active</p>
        </div>
      </div>

      {/* Tabs & Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => {
              setActiveTab('LEAVES');
              setStatusFilter('ALL');
            }}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
              activeTab === 'LEAVES'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CalendarCheck className="h-3.5 w-3.5" />
            <span>Leave Requests</span>
            {pendingLeavesCount > 0 && (
              <span className="rounded-full bg-amber-400 px-1.5 py-0.2 text-[10px] font-bold text-slate-900">
                {pendingLeavesCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('ATTENDANCE');
              setStatusFilter('ALL');
            }}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
              activeTab === 'ATTENDANCE'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="h-3.5 w-3.5" />
            <span>Attendance & Timings</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-subtle focus:border-brand-400 focus:outline-none"
          >
            <option value="ALL">All HR Roles</option>
            <option value="HR_MANAGER">HR Manager (David Kim)</option>
            <option value="HR_PAYROLL_MANAGER">HR Payroll Manager (Sarah Jenkins)</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-subtle focus:border-brand-400 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            {activeTab === 'LEAVES' ? (
              <>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Refused">Refused</option>
              </>
            ) : (
              <>
                <option value="Present">Present</option>
                <option value="Half-day">Half-day</option>
                <option value="Absent">Absent</option>
                <option value="On Leave">On Leave</option>
              </>
            )}
          </select>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or reason..."
              className="w-44 sm:w-56 rounded-xl border border-slate-200 bg-white pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 shadow-subtle focus:border-brand-400 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* TAB 1: LEAVE REQUESTS APPROVAL TABLE */}
      {activeTab === 'LEAVES' && (
        <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-card">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200/80 bg-slate-50/75 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-3.5">Manager</th>
                <th className="px-4 py-3.5">Assigned Role</th>
                <th className="px-4 py-3.5">Time Off Type</th>
                <th className="px-4 py-3.5">Leave Duration</th>
                <th className="px-4 py-3.5">Reason</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Administrative Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLeaveRequests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-xs text-slate-400">
                    No leave requests found for HR leadership.
                  </td>
                </tr>
              ) : (
                filteredLeaveRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-100 text-xs font-bold text-purple-700">
                          {req.employeeName
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">{req.employeeName}</div>
                          <div className="text-[10px] text-slate-400">Code: {req.employeeId}</div>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <span className="inline-flex rounded-md bg-purple-50 px-2 py-0.5 text-[10px] font-semibold text-purple-700 border border-purple-100">
                        {req.role === 'HR_PAYROLL_MANAGER' ? 'HR Payroll Manager' : 'HR Manager'}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 font-medium text-slate-800">
                      <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[11px]">
                        <Calendar className="h-3 w-3 text-slate-500" />
                        {req.timeOffType}
                      </span>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-slate-800">
                        {req.startDate} → {req.endDate}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {req.duration} {req.duration === 1 ? 'day' : 'days'}
                      </div>
                    </td>

                    <td className="px-4 py-3.5 text-slate-600 max-w-xs">
                      <p className="truncate">{req.reason || 'Personal leave request'}</p>
                      {req.refusalReason && (
                        <p className="text-[10px] text-rose-500 truncate mt-0.5">
                          Refusal reason: {req.refusalReason}
                        </p>
                      )}
                    </td>

                    <td className="px-4 py-3.5">
                      <StatusBadge status={req.status} />
                    </td>

                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      {req.status === 'Pending' ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => approveHRLeave(req.id)}
                            className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 transition-colors"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>Approve</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setRefusalTarget(req);
                              setRefusalReason('');
                            }}
                            className="inline-flex items-center gap-1 rounded-lg bg-rose-50 border border-rose-200 px-2.5 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition-colors"
                          >
                            <XCircle className="h-3.5 w-3.5" />
                            <span>Refuse</span>
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] font-medium text-slate-400">
                          {req.status === 'Approved' ? '✓ Decision Logged' : '✕ Refusal Recorded'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 2: ATTENDANCE & TIMINGS TABLE */}
      {activeTab === 'ATTENDANCE' && (
        <div className="space-y-4">
          <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-card">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200/80 bg-slate-50/75 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-3.5">Date</th>
                  <th className="px-4 py-3.5">HR Leader</th>
                  <th className="px-4 py-3.5">Role</th>
                  <th className="px-4 py-3.5">Check-In Time</th>
                  <th className="px-4 py-3.5">Check-Out Time</th>
                  <th className="px-4 py-3.5">Worked Hours</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Notes</th>
                  <th className="px-5 py-3.5 text-right">Timing Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAttendance.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-5 py-8 text-center text-xs text-slate-400">
                      No attendance timing records found.
                    </td>
                  </tr>
                ) : (
                  filteredAttendance.map((att) => (
                    <tr key={att.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-5 py-3.5 font-semibold text-slate-900">
                        {att.date}
                        {att.date === today && (
                          <span className="ml-1.5 rounded bg-brand-100 px-1 py-0.2 text-[9px] font-bold text-slate-800">
                            Today
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-slate-900">{att.employeeName}</div>
                        <div className="text-[10px] text-slate-400">{att.employeeCode}</div>
                      </td>

                      <td className="px-4 py-3.5">
                        <span className="inline-flex rounded-md bg-purple-50 px-2 py-0.5 text-[10px] font-semibold text-purple-700 border border-purple-100">
                          {att.roleName || (att.role === 'HR_PAYROLL_MANAGER' ? 'HR Payroll Manager' : 'HR Manager')}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 font-mono font-semibold text-slate-800">
                        {att.checkIn || '--:--'}
                      </td>

                      <td className="px-4 py-3.5 font-mono font-semibold text-slate-800">
                        {att.checkOut || '--:--'}
                      </td>

                      <td className="px-4 py-3.5 text-slate-700 font-semibold">
                        {att.workedHours || 0} hrs
                      </td>

                      <td className="px-4 py-3.5">
                        <StatusBadge status={att.status} />
                      </td>

                      <td className="px-4 py-3.5 text-slate-500 max-w-xs truncate">
                        {att.notes || 'Normal daily log'}
                      </td>

                      <td className="px-5 py-3.5 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleOpenAdjust(att)}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-colors"
                        >
                          <Edit2 className="h-3 w-3 text-slate-500" />
                          <span>Adjust Timing</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REFUSAL REASON MODAL */}
      <Modal
        isOpen={Boolean(refusalTarget)}
        onClose={() => setRefusalTarget(null)}
        title="Refuse HR Leave Request"
        subtitle={`Provide administrative explanation for ${refusalTarget?.employeeName}`}
        footer={
          <>
            <button
              type="button"
              onClick={() => setRefusalTarget(null)}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmRefusal}
              className="rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-rose-700"
            >
              Confirm Refusal
            </button>
          </>
        }
      >
        <form onSubmit={handleConfirmRefusal} className="space-y-4">
          <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800">
            <p className="font-semibold">Reviewing Leave Request:</p>
            <p className="mt-1">
              <strong>{refusalTarget?.employeeName}</strong> ({refusalTarget?.timeOffType}) from{' '}
              {refusalTarget?.startDate} to {refusalTarget?.endDate} ({refusalTarget?.duration} days).
            </p>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-700">
              Reason for Refusal <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              required
              value={refusalReason}
              onChange={(e) => setRefusalReason(e.target.value)}
              placeholder="e.g., Unresolved end-of-month payroll audit requires on-site presence..."
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-3 text-xs shadow-subtle focus:border-rose-400 focus:outline-none"
            />
          </div>
        </form>
      </Modal>

      {/* RECORD LEAVE ON BEHALF MODAL */}
      <Modal
        isOpen={isLeaveModalOpen}
        onClose={() => setIsLeaveModalOpen(false)}
        title="Record Leave on Behalf of HR Manager"
        subtitle="Authorize an executive leave record directly in the governance registry"
        footer={
          <>
            <button
              type="button"
              onClick={() => setIsLeaveModalOpen(false)}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveLeaveOnBehalf}
              className="btn-primary px-4 py-2 text-xs font-semibold"
            >
              Submit & Authorize Leave
            </button>
          </>
        }
      >
        <form onSubmit={handleSaveLeaveOnBehalf} className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-[11px] font-medium text-slate-700">Select HR Leader</label>
              <select
                value={leaveForm.employeeName}
                onChange={(e) => {
                  const name = e.target.value;
                  const role = name === 'Sarah Jenkins' ? 'HR_PAYROLL_MANAGER' : 'HR_MANAGER';
                  const employeeId = name === 'Sarah Jenkins' ? 'HRPAYMGR' : 'HRMGR';
                  setLeaveForm({ ...leaveForm, employeeName: name, role, employeeId });
                }}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs shadow-subtle focus:border-brand-400 focus:outline-none"
              >
                <option value="David Kim">David Kim (HR Manager)</option>
                <option value="Sarah Jenkins">Sarah Jenkins (HR Payroll Manager)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-700">Leave Type</label>
              <select
                value={leaveForm.timeOffType}
                onChange={(e) => setLeaveForm({ ...leaveForm, timeOffType: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs shadow-subtle focus:border-brand-400 focus:outline-none"
              >
                <option value="Personal Leave">Personal Leave</option>
                <option value="Sick Leave">Sick Leave</option>
                <option value="Festival Leave">Festival Leave</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-[11px] font-medium text-slate-700">Start Date</label>
              <input
                type="date"
                required
                value={leaveForm.startDate}
                onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs shadow-subtle focus:border-brand-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-700">End Date</label>
              <input
                type="date"
                required
                value={leaveForm.endDate}
                onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs shadow-subtle focus:border-brand-400 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-700">Approval Status</label>
            <select
              value={leaveForm.status}
              onChange={(e) => setLeaveForm({ ...leaveForm, status: e.target.value })}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs shadow-subtle focus:border-brand-400 focus:outline-none"
            >
              <option value="Approved">Directly Approved (Admin Authorization)</option>
              <option value="Pending">Pending Review</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-700">Justification / Remarks</label>
            <textarea
              rows={3}
              value={leaveForm.reason}
              onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
              placeholder="Authorized leave recorded by platform administrator..."
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-3 text-xs shadow-subtle focus:border-brand-400 focus:outline-none"
            />
          </div>
        </form>
      </Modal>

      {/* ADJUST ATTENDANCE TIMING MODAL */}
      <Modal
        isOpen={Boolean(adjustTarget)}
        onClose={() => setAdjustTarget(null)}
        title="Adjust Daily Timing"
        subtitle={`Modifying attendance timestamps for ${adjustTarget?.employeeName} on ${adjustTarget?.date}`}
        footer={
          <>
            <button
              type="button"
              onClick={() => setAdjustTarget(null)}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveAdjustment}
              className="btn-primary px-4 py-2 text-xs font-semibold"
            >
              Save Timing Adjustment
            </button>
          </>
        }
      >
        <form onSubmit={handleSaveAdjustment} className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-[11px] font-medium text-slate-700">Check-In Time</label>
              <input
                type="time"
                value={timingForm.checkIn}
                onChange={(e) => setTimingForm({ ...timingForm, checkIn: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-mono shadow-subtle focus:border-brand-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-700">Check-Out Time</label>
              <input
                type="time"
                value={timingForm.checkOut}
                onChange={(e) => setTimingForm({ ...timingForm, checkOut: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-mono shadow-subtle focus:border-brand-400 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-700">Attendance Status</label>
            <select
              value={timingForm.status}
              onChange={(e) => setTimingForm({ ...timingForm, status: e.target.value })}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs shadow-subtle focus:border-brand-400 focus:outline-none"
            >
              <option value="Present">Present</option>
              <option value="Half-day">Half-day</option>
              <option value="Absent">Absent</option>
              <option value="On Leave">On Leave</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-700">Adjustment Notes & Audit Reason</label>
            <textarea
              rows={3}
              value={timingForm.notes}
              onChange={(e) => setTimingForm({ ...timingForm, notes: e.target.value })}
              placeholder="e.g., Timing calibrated per authorized administrative approval..."
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-3 text-xs shadow-subtle focus:border-brand-400 focus:outline-none"
            />
          </div>
        </form>
      </Modal>

      {/* RECORD MISSING PUNCH MODAL */}
      <Modal
        isOpen={isPunchModalOpen}
        onClose={() => setIsPunchModalOpen(false)}
        title="Record Missing Attendance Punch"
        subtitle="Log historical or missing daily punch record for HR leadership"
        footer={
          <>
            <button
              type="button"
              onClick={() => setIsPunchModalOpen(false)}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveMissingPunch}
              className="btn-primary px-4 py-2 text-xs font-semibold"
            >
              Record Punch
            </button>
          </>
        }
      >
        <form onSubmit={handleSaveMissingPunch} className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-[11px] font-medium text-slate-700">Select HR Leader</label>
              <select
                value={punchForm.employeeName}
                onChange={(e) => {
                  const name = e.target.value;
                  const role = name === 'Sarah Jenkins' ? 'HR_PAYROLL_MANAGER' : 'HR_MANAGER';
                  const employeeCode = name === 'Sarah Jenkins' ? 'HRPAYMGR' : 'HRMGR';
                  setPunchForm({ ...punchForm, employeeName: name, role, employeeCode });
                }}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs shadow-subtle focus:border-brand-400 focus:outline-none"
              >
                <option value="David Kim">David Kim (HR Manager)</option>
                <option value="Sarah Jenkins">Sarah Jenkins (HR Payroll Manager)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-700">Attendance Date</label>
              <input
                type="date"
                required
                value={punchForm.date}
                onChange={(e) => setPunchForm({ ...punchForm, date: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs shadow-subtle focus:border-brand-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-[11px] font-medium text-slate-700">Check-In Time</label>
              <input
                type="time"
                value={punchForm.checkIn}
                onChange={(e) => setPunchForm({ ...punchForm, checkIn: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-mono shadow-subtle focus:border-brand-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-700">Check-Out Time</label>
              <input
                type="time"
                value={punchForm.checkOut}
                onChange={(e) => setPunchForm({ ...punchForm, checkOut: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-mono shadow-subtle focus:border-brand-400 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-700">Status</label>
            <select
              value={punchForm.status}
              onChange={(e) => setPunchForm({ ...punchForm, status: e.target.value })}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs shadow-subtle focus:border-brand-400 focus:outline-none"
            >
              <option value="Present">Present</option>
              <option value="Half-day">Half-day</option>
              <option value="Absent">Absent</option>
              <option value="On Leave">On Leave</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-700">Notes</label>
            <textarea
              rows={3}
              value={punchForm.notes}
              onChange={(e) => setPunchForm({ ...punchForm, notes: e.target.value })}
              placeholder="e.g., Manual check-in punch created by platform administrator..."
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-3 text-xs shadow-subtle focus:border-brand-400 focus:outline-none"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}
