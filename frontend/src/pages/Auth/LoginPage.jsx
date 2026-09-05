import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, Mail, ArrowRight, UserCheck, KeyRound } from 'lucide-react';
import { useHRData } from '../../context/HRDataContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { setCurrentRole, showToast } = useHRData();

  const [email, setEmail] = useState('payroll.user@peoplepay360.com');
  const [password, setPassword] = useState('Password123!');
  const [selectedRole, setSelectedRole] = useState('HR_PAYROLL_USER');

  const handleQuickLogin = (roleCode) => {
    if (roleCode === 'HR_MANAGER') {
      setEmail('hr.manager@peoplepay360.com');
      setPassword('Password123!');
      setSelectedRole('HR_MANAGER');
      setCurrentRole('HR_MANAGER');
      showToast('Logged in as HR Manager');
      navigate('/');
    } else {
      setEmail('payroll.user@peoplepay360.com');
      setPassword('Password123!');
      setSelectedRole('HR_PAYROLL_USER');
      setCurrentRole('HR_PAYROLL_USER');
      showToast('Logged in as HR Payroll User');
      navigate('/payroll/dashboard');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setCurrentRole(selectedRole);
    showToast(`Signed in successfully as ${selectedRole === 'HR_MANAGER' ? 'HR Manager' : 'HR Payroll User'}`);
    if (selectedRole === 'HR_PAYROLL_USER') {
      navigate('/payroll/dashboard');
    } else {
      navigate('/');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 px-4 py-12">
      <div className="w-full max-w-md space-y-8 rounded-3xl bg-white p-8 shadow-2xl">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-400 font-extrabold text-2xl text-slate-900 shadow-md">
            P
          </div>
          <h2 className="mt-4 text-2xl font-black text-slate-900 tracking-tight">PeoplePay360</h2>
          <p className="mt-1 text-xs text-slate-500 font-medium">Enterprise HR & Payroll Portal</p>
        </div>

        {/* Quick Demo Role Selection Buttons */}
        <div className="rounded-2xl bg-slate-50 p-3 border border-slate-100 space-y-2">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block px-1">
            ⚡ Quick Demo Login Credentials
          </span>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('HR_MANAGER')}
              className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all ${
                selectedRole === 'HR_MANAGER'
                  ? 'border-brand-400 bg-brand-50/60 ring-2 ring-brand-400/20'
                  : 'border-slate-200 bg-white hover:bg-slate-100/80'
              }`}
            >
              <span className="text-xs font-bold text-slate-900">HR Manager</span>
              <span className="text-[10px] text-slate-500 mt-0.5">hr.manager@peoplepay360.com</span>
              <span className="mt-2 inline-flex items-center text-[10px] font-bold text-brand-700">
                Click to Sign In
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('HR_PAYROLL_USER')}
              className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all ${
                selectedRole === 'HR_PAYROLL_USER'
                  ? 'border-brand-400 bg-brand-50/60 ring-2 ring-brand-400/20'
                  : 'border-slate-200 bg-white hover:bg-slate-100/80'
              }`}
            >
              <span className="text-xs font-bold text-slate-900">HR Payroll User</span>
              <span className="text-[10px] text-slate-500 mt-0.5">payroll.user@peoplepay360.com</span>
              <span className="mt-2 inline-flex items-center text-[10px] font-bold text-brand-700">
                Click to Sign In
              </span>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:border-brand-400 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:border-brand-400 focus:outline-hidden"
              />
            </div>
          </div>

          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-400 py-3 text-xs font-bold text-slate-900 shadow-md hover:bg-brand-500 transition-colors"
          >
            <span>Sign In to Workspace</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
