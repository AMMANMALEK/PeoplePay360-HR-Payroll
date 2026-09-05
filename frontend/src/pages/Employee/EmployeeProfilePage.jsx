import React, { useState, useEffect } from 'react';
import {
  User,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  Calendar,
  Clock,
  UserCheck,
  ShieldCheck,
  Edit2,
  Check,
  X,
  Building,
  Hash,
} from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import StatusBadge from '../../components/ui/StatusBadge';
import SkeletonLoader from '../../components/ui/SkeletonLoader';
import { useEmployeeData } from '../../context/EmployeeDataContext';

export default function EmployeeProfilePage() {
  const { profile, isLoading, error, updateProfile } = useEmployeeData();

  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [phoneInput, setPhoneInput] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [isSavingPhone, setIsSavingPhone] = useState(false);

  useEffect(() => {
    if (profile?.phone) {
      setPhoneInput(profile.phone);
    }
  }, [profile?.phone]);

  if (isLoading) return <SkeletonLoader />;
  if (error) return <div className="app-card p-6 text-sm text-rose-600">{error}</div>;
  if (!profile) {
    return (
      <div className="app-card p-6 text-sm text-slate-500">
        No employee record is linked to this account.
      </div>
    );
  }

  const address = [
    profile.address?.street,
    profile.address?.city,
    profile.address?.state,
    profile.address?.zipCode,
    profile.address?.country,
  ]
    .filter(Boolean)
    .join(', ');

  const handleStartEditPhone = () => {
    setPhoneInput(profile.phone || '');
    setPhoneError('');
    setIsEditingPhone(true);
  };

  const handleCancelEditPhone = () => {
    setPhoneInput(profile.phone || '');
    setPhoneError('');
    setIsEditingPhone(false);
  };

  const handlePhoneChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPhoneInput(val);
    if (val.length > 0 && val.length !== 10) {
      setPhoneError('Phone number must be exactly 10 digits');
    } else {
      setPhoneError('');
    }
  };

  const handleSavePhone = async (e) => {
    e.preventDefault();
    if (phoneInput.length > 0 && phoneInput.length !== 10) {
      setPhoneError('Phone number must be exactly 10 digits');
      return;
    }

    setIsSavingPhone(true);
    try {
      await updateProfile({ phone: phoneInput });
      setIsEditingPhone(false);
    } catch (err) {
      setPhoneError(err.message || 'Failed to update phone number');
    } finally {
      setIsSavingPhone(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Profile"
        subtitle="View your employee credentials and manage your contact details."
      />

      {/* Hero Profile Banner */}
      <div className="relative overflow-hidden rounded-[22px] border border-slate-200/80 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6 text-white shadow-xl sm:p-8">
        <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-5">
            <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-300 to-brand-100 text-2xl font-bold tracking-wider text-slate-900 shadow-inner">
              {(profile.firstName || 'E').slice(0, 1)}
              {(profile.lastName || '').slice(0, 1)}
              <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 ring-4 ring-slate-900">
                <Check className="h-3.5 w-3.5 text-white" />
              </span>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
                  {profile.fullName}
                </h2>
                <StatusBadge status={profile.employmentStatus || 'active'} size="sm" />
              </div>
              <p className="mt-1 text-sm font-medium text-slate-300">
                {profile.jobPosition || 'Employee'}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-lg bg-white/10 px-2.5 py-1 text-xs font-medium text-slate-200 backdrop-blur-sm">
                  <Hash className="h-3 w-3 text-brand-300" />
                  {profile.employeeCode}
                </span>
                {profile.department && (
                  <span className="inline-flex items-center gap-1 rounded-lg bg-white/10 px-2.5 py-1 text-xs font-medium text-slate-200 backdrop-blur-sm">
                    <Building className="h-3 w-3 text-brand-300" />
                    {profile.department}
                  </span>
                )}
                {profile.joinedDate && (
                  <span className="inline-flex items-center gap-1 rounded-lg bg-white/10 px-2.5 py-1 text-xs font-medium text-slate-200 backdrop-blur-sm">
                    <Calendar className="h-3 w-3 text-brand-300" />
                    Joined {profile.joinedDate}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Details Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Contact Information Card (with Editable Mobile Phone) */}
        <section className="app-card rounded-[20px] p-6 lg:col-span-1">
          <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-50 text-sky-600">
                <Phone className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Contact Details</h3>
            </div>
          </div>

          <div className="space-y-4">
            {/* Editable Mobile Phone Section */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Mobile Number
                </span>
                {!isEditingPhone && (
                  <button
                    type="button"
                    onClick={handleStartEditPhone}
                    className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-200"
                  >
                    <Edit2 className="h-3 w-3" />
                    Edit
                  </button>
                )}
              </div>

              {isEditingPhone ? (
                <form onSubmit={handleSavePhone} className="mt-2.5 space-y-2">
                  <div className="relative">
                    <Phone className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      autoFocus
                      maxLength={10}
                      inputMode="numeric"
                      placeholder="10-digit phone"
                      value={phoneInput}
                      onChange={handlePhoneChange}
                      className="field-input pl-9 text-sm font-medium"
                      disabled={isSavingPhone}
                    />
                  </div>
                  {phoneError && (
                    <p className="text-xs font-medium text-rose-600">{phoneError}</p>
                  )}
                  <p className="text-[11px] text-slate-400">Enter up to 10 numerical digits.</p>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="submit"
                      disabled={isSavingPhone || Boolean(phoneError)}
                      className="btn-primary py-1.5 text-xs"
                    >
                      {isSavingPhone ? 'Saving…' : 'Save'}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelEditPhone}
                      disabled={isSavingPhone}
                      className="btn-secondary py-1.5 text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <p className="mt-1.5 text-base font-semibold text-slate-900">
                  {profile.phone || <span className="font-normal text-slate-400">No phone provided</span>}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="rounded-xl border border-slate-100 bg-white p-3.5 shadow-sm">
              <div className="flex items-center gap-2 text-slate-500">
                <Mail className="h-3.5 w-3.5" />
                <span className="text-[11px] font-semibold uppercase tracking-wider">Work Email</span>
              </div>
              <p className="mt-1 truncate text-sm font-medium text-slate-900">{profile.workEmail || '—'}</p>
            </div>

            {/* Address */}
            <div className="rounded-xl border border-slate-100 bg-white p-3.5 shadow-sm">
              <div className="flex items-center gap-2 text-slate-500">
                <MapPin className="h-3.5 w-3.5" />
                <span className="text-[11px] font-semibold uppercase tracking-wider">Address</span>
              </div>
              <p className="mt-1 text-sm font-medium leading-relaxed text-slate-900">
                {address || <span className="font-normal text-slate-400">No address recorded</span>}
              </p>
            </div>
          </div>
        </section>

        {/* Personal & Employment Information (2 Columns) */}
        <div className="space-y-6 lg:col-span-2">
          {/* Employment Information */}
          <section className="app-card rounded-[20px] p-6">
            <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                  <Briefcase className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Employment Information</h3>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                {profile.employmentType || 'Contract Based'}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-slate-50/70 p-3.5">
                <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                  Department
                </span>
                <p className="mt-1 text-sm font-semibold text-slate-900">{profile.department || '—'}</p>
              </div>

              <div className="rounded-xl bg-slate-50/70 p-3.5">
                <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                  Job Position
                </span>
                <p className="mt-1 text-sm font-semibold text-slate-900">{profile.jobPosition || '—'}</p>
              </div>

              <div className="rounded-xl bg-slate-50/70 p-3.5">
                <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                  Working Schedule
                </span>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {profile.scheduleName || 'Standard 40h/week'}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50/70 p-3.5">
                <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                  Manager
                </span>
                <p className="mt-1 text-sm font-semibold text-slate-900">{profile.managerName || '—'}</p>
              </div>

              <div className="rounded-xl bg-slate-50/70 p-3.5">
                <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                  Date Joined
                </span>
                <p className="mt-1 text-sm font-semibold text-slate-900">{profile.joinedDate || '—'}</p>
              </div>

              <div className="rounded-xl bg-slate-50/70 p-3.5">
                <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                  Employment Status
                </span>
                <div className="mt-1">
                  <StatusBadge status={profile.employmentStatus || 'active'} size="sm" />
                </div>
              </div>
            </div>
          </section>

          {/* Personal Information */}
          <section className="app-card rounded-[20px] p-6">
            <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                  <User className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Personal Details</h3>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-slate-50/70 p-3.5">
                <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                  First Name
                </span>
                <p className="mt-1 text-sm font-semibold text-slate-900">{profile.firstName || '—'}</p>
              </div>

              <div className="rounded-xl bg-slate-50/70 p-3.5">
                <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                  Last Name
                </span>
                <p className="mt-1 text-sm font-semibold text-slate-900">{profile.lastName || '—'}</p>
              </div>

              <div className="rounded-xl bg-slate-50/70 p-3.5">
                <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                  Date of Birth
                </span>
                <p className="mt-1 text-sm font-semibold text-slate-900">{profile.dob || '—'}</p>
              </div>

              <div className="rounded-xl bg-slate-50/70 p-3.5">
                <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                  Employee Code
                </span>
                <p className="mt-1 text-sm font-semibold text-slate-900">{profile.employeeCode || '—'}</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
