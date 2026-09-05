import React from 'react';
import PageHeader from '../../components/ui/PageHeader';
import StatusBadge from '../../components/ui/StatusBadge';
import SkeletonLoader from '../../components/ui/SkeletonLoader';
import { useEmployeeData } from '../../context/EmployeeDataContext';

function Field({ label, value }) {
  return (
    <div>
      <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className="mt-1 text-sm text-slate-900">{value || '—'}</dd>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <section className="app-card p-5 sm:p-6">
      <h3 className="mb-4 text-sm font-semibold text-slate-900">{title}</h3>
      <dl className="grid gap-4 sm:grid-cols-2">{children}</dl>
    </section>
  );
}

export default function EmployeeProfilePage() {
  const { profile, isLoading, error } = useEmployeeData();

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

  return (
    <div className="space-y-6">
      <PageHeader
        title="My profile"
        subtitle="Read-only view of your employee record."
      />

      <div className="app-card flex flex-wrap items-center gap-4 p-5">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-200 text-sm font-bold text-slate-800">
          {(profile.firstName || 'E').slice(0, 1)}
          {(profile.lastName || '').slice(0, 1)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-lg font-semibold text-slate-900">{profile.fullName}</p>
          <p className="text-xs text-slate-500">
            {profile.jobPosition} · {profile.employeeCode}
          </p>
        </div>
        <StatusBadge status={profile.employmentStatus} />
      </div>

      <Section title="Personal information">
        <Field label="First name" value={profile.firstName} />
        <Field label="Last name" value={profile.lastName} />
        <Field label="Date of birth" value={profile.dob} />
        <Field label="Employee code" value={profile.employeeCode} />
      </Section>

      <Section title="Contact information">
        <Field label="Work email" value={profile.workEmail} />
        <Field label="Phone" value={profile.phone} />
        <Field label="Address" value={address} />
      </Section>

      <Section title="Employment information">
        <Field label="Department" value={profile.department} />
        <Field label="Job position" value={profile.jobPosition} />
        <Field label="Employment type" value={profile.employmentType} />
        <Field label="Hire date" value={profile.joinedDate} />
        <Field label="Manager" value={profile.managerName} />
        <Field label="Working schedule" value={profile.scheduleName} />
        <Field label="Status" value={profile.employmentStatus} />
      </Section>
    </div>
  );
}
