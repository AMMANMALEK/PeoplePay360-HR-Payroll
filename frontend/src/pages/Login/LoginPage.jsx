import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Eye, EyeOff, Users, Clock, FileText } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../constants/navigation';

const REMEMBERED_EMAIL_KEY = 'peoplepay.rememberEmail';
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const FEATURES = [
  { icon: Users, label: 'Employee Management' },
  { icon: Clock, label: 'Attendance & Time Off' },
  { icon: FileText, label: 'Contracts & Scheduling' },
];

function BrandMark({ size = 'md' }) {
  const box = size === 'lg' ? 'h-12 w-12 text-base' : 'h-10 w-10 text-sm';
  return (
    <div
      className={`flex ${box} shrink-0 items-center justify-center rounded-2xl bg-brand-400 font-bold text-slate-900`}
      aria-hidden="true"
    >
      P
    </div>
  );
}

function WorkplaceIllustration() {
  return (
    <svg
      viewBox="0 0 420 280"
      className="mx-auto h-auto w-full max-w-md"
      role="img"
      aria-label="People collaborating on HR operations"
    >
      <rect x="48" y="56" width="220" height="148" rx="24" fill="#ffffff" />
      <rect x="48" y="56" width="220" height="148" rx="24" fill="none" stroke="#e2e8f0" />
      <rect x="72" y="80" width="96" height="10" rx="5" fill="#d9f99d" />
      <rect x="72" y="102" width="168" height="8" rx="4" fill="#f1f5f9" />
      <rect x="72" y="118" width="148" height="8" rx="4" fill="#f1f5f9" />
      <rect x="72" y="148" width="52" height="36" rx="12" fill="#ecfccb" />
      <rect x="132" y="148" width="52" height="36" rx="12" fill="#e4f4ea" />
      <rect x="192" y="148" width="52" height="36" rx="12" fill="#e4eefc" />
      <circle cx="312" cy="168" r="54" fill="#a3e635" />
      <circle cx="298" cy="156" r="16" fill="#365314" opacity="0.18" />
      <circle cx="326" cy="156" r="16" fill="#365314" opacity="0.18" />
      <rect x="286" y="178" width="52" height="28" rx="14" fill="#365314" opacity="0.16" />
      <rect x="24" y="214" width="88" height="28" rx="14" fill="#bef264" />
      <rect x="248" y="36" width="64" height="24" rx="12" fill="#ffffff" stroke="#e2e8f0" />
    </svg>
  );
}

export default function LoginPage() {
  const { login, isAuthenticated, isHrManager, isEmployee } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem(REMEMBERED_EMAIL_KEY);
    if (saved) {
      setEmail(saved);
      setRememberMe(true);
    }
  }, []);

  if (isAuthenticated && isHrManager) {
    return <Navigate to="/" replace />;
  }

  if (isAuthenticated && isEmployee) {
    return <Navigate to="/employee" replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setInfo('');

    if (!email.trim() || !password) {
      setError('Email and password are required.');
      return;
    }

    if (!EMAIL_PATTERN.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      const user = await login(email.trim(), password);
      if (rememberMe) {
        window.localStorage.setItem(REMEMBERED_EMAIL_KEY, email.trim().toLowerCase());
      } else {
        window.localStorage.removeItem(REMEMBERED_EMAIL_KEY);
      }

      if (user.role === ROLES.HR_MANAGER) {
        window.location.assign('/');
      } else {
        window.location.assign('/employee');
      }
    } catch (err) {
      if (err.status === 401) {
        setError('Invalid email or password.');
      } else if (err.message === 'Failed to fetch' || err.name === 'TypeError') {
        setError('Unable to reach the server. Please try again.');
      } else {
        setError(err.message || 'Unable to sign in');
      }
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4 py-6 sm:px-6 sm:py-10">
      <div className="grid w-full max-w-6xl overflow-hidden rounded-[18px] border border-slate-200/80 bg-white shadow-card lg:grid-cols-2">
        <section className="relative hidden bg-brand-50 px-8 py-10 lg:flex lg:flex-col lg:justify-between xl:px-12">
          <div className="flex items-center gap-3">
            <BrandMark />
            <div>
              <p className="text-sm font-semibold tracking-tight text-slate-900">PeoplePay360</p>
              <p className="text-[11px] font-medium text-slate-500">HR Operations</p>
            </div>
          </div>

          <div className="py-8">
            <WorkplaceIllustration />
            <h2 className="mt-6 max-w-sm text-3xl font-semibold tracking-tight text-slate-900">
              Manage people.
              <br />
              Build better workplaces.
            </h2>
            <p className="mt-3 max-w-sm text-sm text-slate-500">
              One workspace for employees, attendance, time off, contracts, and schedules.
            </p>
          </div>

          <ul className="space-y-2">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <li
                  key={feature.label}
                  className="flex items-center gap-3 rounded-2xl bg-white/70 px-3 py-2.5 text-sm text-slate-700"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-200 text-slate-800">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  {feature.label}
                </li>
              );
            })}
          </ul>
        </section>

        <section className="flex flex-col justify-center px-5 py-8 sm:px-10 lg:px-12">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <BrandMark />
            <div>
              <p className="text-sm font-semibold tracking-tight text-slate-900">PeoplePay360</p>
              <p className="text-[11px] font-medium text-slate-500">HR Operations</p>
            </div>
          </div>

          <div className="mb-6 lg:hidden">
            <WorkplaceIllustration />
          </div>

          <form onSubmit={handleSubmit} noValidate className="mx-auto w-full max-w-md">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Welcome back</h1>
            <p className="mt-1.5 text-sm text-slate-500">Please log in to your account.</p>

            {error && (
              <p
                role="alert"
                className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700"
              >
                {error}
              </p>
            )}
            {info && !error && (
              <p
                role="status"
                className="mt-4 rounded-xl border border-brand-200 bg-brand-50 px-3 py-2 text-xs text-slate-700"
              >
                {info}
              </p>
            )}

            <label htmlFor="login-email" className="mt-6 block text-xs font-medium text-slate-700">
              Email
              <input
                id="login-email"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="field-input"
                placeholder="you@company.com"
                aria-invalid={Boolean(error)}
              />
            </label>

            <label htmlFor="login-password" className="mt-4 block text-xs font-medium text-slate-700">
              Password
              <span className="relative mt-1 block">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="field-input mt-0 pr-11"
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-100"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showPassword}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </span>
            </label>

            <div className="mt-4 flex items-center justify-between gap-3">
              <label className="flex items-center gap-2 text-xs text-slate-600">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-brand-500 focus:ring-brand-400"
                />
                Remember me
              </label>
              <button
                type="button"
                className="text-xs font-semibold text-slate-600 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-100 rounded-lg px-1"
                onClick={() => {
                  setError('');
                  setInfo(
                    'Password resets are handled by HR. Please contact your HR administrator.'
                  );
                }}
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary mt-6 h-11 w-full text-sm"
            >
              {isSubmitting ? 'Signing in…' : 'Log in'}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
